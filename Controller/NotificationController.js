import NotificationModel from "../models/NotificationModel.js";

export const addAnnouncement = async (req, res) => {
  try {
    const { heading, notification } = req.body;

    // Check if a notification already exists
    const existingAnnouncement = await NotificationModel.findOne({});
    if (existingAnnouncement) {
      return res.status(400).json({
        success: false,
        message:
          "A notification already exists. Please delete it before adding a new one.",
      });
    }

    const newAnnouncement = new NotificationModel({ heading, notification });
    await newAnnouncement.save();
    res.status(201).json({
      success: true,
      message: "Announcement added successfully",
      announcement: newAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding announcement",
      error,
    });
  }
};

// Get notifications
export const getNotify = async (req, res) => {
  try {
    const announcements = await NotificationModel.find({});
    res.status(200).json({ success: true, announcements });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error,
    });
  }
};

// Update notification
export const putNotify = async (req, res) => {
  try {
    const { id, notification } = req.body;
    const updatedAnnouncement = await NotificationModel.findByIdAndUpdate(
      id,
      { notification },
      { new: true } // Return the updated document
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating announcement",
      error,
    });
  }
};

// Delete notification
export const deleteNotify = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedAnnouncement = await NotificationModel.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
      announcement: deletedAnnouncement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error,
    });
  }
};
