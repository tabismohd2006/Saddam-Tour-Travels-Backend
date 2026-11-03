
import crypto from "crypto";

export const verifyCronSecret = (req, res, next) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const requestSecret = req.headers["x-cron-secret"];

    if (!cronSecret || !requestSecret) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized cron request",
      });
    }

    const expected = Buffer.from(cronSecret);
    const received = Buffer.from(requestSecret);

    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid cron secret",
      });
    }

    next();
  } catch (error) {
    console.error("Cron authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Cron authentication failed",
    });
  }
};
