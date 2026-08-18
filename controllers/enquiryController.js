import Enquiry from "../models/Enquiry.js";

// Create Enquiry
export const createEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);

    res.status(201).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Enquiries
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      enquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Status
export const updateEnquiryStatus = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    res.status(200).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Enquiry Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};