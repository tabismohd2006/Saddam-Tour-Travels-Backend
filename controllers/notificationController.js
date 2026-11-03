
import DeviceToken from "../models/DeviceToken.js";

import admin from "../config/firebaseAdmin.js";


// Register Admin Device
export const registerDevice = async (req, res) => {
  try {
    const { token, deviceType } = req.body;

    if (!token || !deviceType) {
      return res.status(400).json({
        success: false,
        message: "Token and device type are required",
      });
    }

    if (!["android", "ios", "web"].includes(deviceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device type",
      });
    }

    const device = await DeviceToken.findOneAndUpdate(
      { token },
      {
        token,
        deviceType,
        adminId: req.admin._id,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Device registered successfully",
    });
  } catch (error) {
    console.error("Register device error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register device",
    });
  }
};

// Send Test Notification
export const sendTestNotification = async (req, res) => {
  try {
    const devices = await DeviceToken.find({
      adminId: req.admin._id,
    });

    if (!devices.length) {
      return res.status(404).json({
        success: false,
        message: "No registered devices found",
      });
    }

    const results = await Promise.allSettled(
      devices.map((device) =>
        admin.messaging().send({
          token: device.token,
          notification: {
            title: "Saddam Tour & Travels",
            body: "Test notification successful!",
          },
          data: {
            url: "/admin/dashboard",
          },
        })
      )
    );

    let successful = 0;
    let failed = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (result.status === "fulfilled") {
        successful++;
      } else {
        failed++;

        const errorCode = result.reason?.code;

        console.error("FCM send error:", errorCode);

        if (
          errorCode === "messaging/registration-token-not-registered" ||
          errorCode === "messaging/invalid-registration-token"
        ) {
          await DeviceToken.deleteOne({
            _id: devices[i]._id,
            adminId: req.admin._id,
          });
        }
      }
    }

    return res.status(200).json({
      success: successful > 0,
      message: "Notification sending completed",
      successful,
      failed,
      total: devices.length,
    });
  } catch (error) {
    console.error("Test notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
    });
  }
};

import Insurance from "../models/Insurance.js";

// Get today's date in India (YYYY-MM-DD)
const getIndiaDate = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

// Automatic Insurance Expiry Reminders
export const runExpiryReminders = async (req, res) => {
  try {
    const today = getIndiaDate();
    const todayDate = new Date(`${today}T00:00:00+05:30`);

    // Only admin devices receive these notifications
  // Only Saddam's registered Android device will receive reminders
const devices = await DeviceToken.find({
  adminId: process.env.NOTIFICATION_ADMIN_ID,
  deviceType: "android",
});

    if (!devices.length) {
      return res.status(200).json({
        success: true,
        message: "No admin devices registered. Reminders not marked as sent.",
      });
    }

    const insurances = await Insurance.find({
      expiryDate: { $gte: todayDate },
    });

    let notificationsSent = 0;
    let notificationsFailed = 0;

    for (const insurance of insurances) {
      const expiry = new Date(insurance.expiryDate);

      const expiryDateIndia = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(expiry);

      const expiryMidnight = new Date(
        `${expiryDateIndia}T00:00:00+05:30`
      );

      const daysLeft = Math.round(
        (expiryMidnight.getTime() - todayDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let reminderField;
      let reminderLabel;

      if (daysLeft === 15) {
        reminderField = "fifteenDays";
        reminderLabel = "15 days";
      } else if (daysLeft === 7) {
        reminderField = "sevenDays";
        reminderLabel = "7 days";
      } else if (daysLeft === 0) {
        reminderField = "expiryDay";
        reminderLabel = "today";
      } else {
        continue;
      }

      // Atomic claim prevents duplicate sends from overlapping runs
      const claim = await Insurance.updateOne(
        {
          _id: insurance._id,
          [`reminderSent.${reminderField}`]: false,
        },
        {
          $set: {
            [`reminderSent.${reminderField}`]: true,
          },
        }
      );

      if (claim.modifiedCount !== 1) {
        continue;
      }

      const message = {
        notification: {
          title: "Insurance Expiry Reminder",
          body: `${insurance.customerName} - ${insurance.vehicleNumber}: insurance expires ${reminderLabel}.`,
        },
        data: {
          url: "/admin/dashboard",
          insuranceId: String(insurance._id),
          daysLeft: String(daysLeft),
        },
      };

      const results = await Promise.allSettled(
        devices.map((device) =>
          admin.messaging().send({
            ...message,
            token: device.token,
          })
        )
      );

      let successful = 0;

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status === "fulfilled") {
          successful++;
        } else {
          const errorCode = result.reason?.code;

          console.error("Expiry reminder FCM error:", errorCode);

          if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-registration-token"
          ) {
            await DeviceToken.deleteOne({
              _id: devices[i]._id,
            });
          }
        }
      }

      if (successful > 0) {
        notificationsSent += successful;
      } else {
        // Allow retry if every device send failed
        await Insurance.updateOne(
          { _id: insurance._id },
          {
            $set: {
             [`reminderSent.${reminderField}`]: { $ne: true },
            },
          }
        );

        notificationsFailed++;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Insurance expiry reminder check completed",
      notificationsSent,
      notificationsFailed,
    });
  } catch (error) {
    console.error("Expiry reminder scheduler error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process expiry reminders",
    });
  }
};

