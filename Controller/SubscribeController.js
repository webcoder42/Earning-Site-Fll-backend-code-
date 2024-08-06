import SubscribeModel from "../models/SubscribeModel.js";

// Add a new link
export const addLink = async (req, res) => {
  try {
    const { subscribechannallink } = req.body;

    const newLink = new SubscribeModel({ subscribechannallink });
    await newLink.save();
    res.status(201).json({
      success: true,
      message: "Link added successfully",
      link: newLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding link",
      error,
    });
  }
};

// Get all links
export const getLink = async (req, res) => {
  try {
    const links = await SubscribeModel.find({});
    res.status(200).json({ success: true, links });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching links",
      error,
    });
  }
};

// Delete a link
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID is required",
      });
    }

    const deletedLink = await SubscribeModel.findByIdAndDelete(id);

    if (!deletedLink) {
      return res.status(404).json({
        success: false,
        message: "Link not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Link deleted successfully",
      link: deletedLink,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting link",
      error,
    });
  }
};
