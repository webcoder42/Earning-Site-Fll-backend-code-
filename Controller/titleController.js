import SiteTitleModel from "../models/SiteTitleModel.js";
import slugify from "slugify";

// Create Title Controller
export const titleController = async (req, res) => {
  try {
    const { siteTitle } = req.body;

    // Generate slug from the title
    const slug = slugify(siteTitle, { lower: true });

    // Check if title already exists
    const existingTitle = await SiteTitleModel.findOne({ slug });
    if (existingTitle) {
      return res.status(400).json({
        success: false,
        message: "Title already exists",
      });
    }

    // Create new title
    const newTitle = new SiteTitleModel({ siteTitle, slug });
    await newTitle.save();
    res.status(201).json({
      success: true,
      message: "Title created successfully",
      newTitle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Title creation failed",
      error,
    });
  }
};

// Delete Title Controller
export const deleteTitleController = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTitle = await SiteTitleModel.findByIdAndDelete(id);
    if (!deletedTitle) {
      return res.status(404).json({
        success: false,
        message: "Title not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Title deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Title deletion failed",
      error,
    });
  }
};

// Get All Titles Controller
export const getAllTitlesController = async (req, res) => {
  try {
    const titles = await SiteTitleModel.find();
    res.status(200).json({
      success: true,
      total: titles.length,
      titles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch titles",
      error,
    });
  }
};

// Get Title by Slug Controller
export const getTitleController = async (req, res) => {
  try {
    const { slug } = req.params;
    const title = await SiteTitleModel.findOne({ slug });
    if (!title) {
      return res.status(404).json({
        success: false,
        message: "Title not found",
      });
    }
    res.status(200).json({
      success: true,
      title,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch title",
      error,
    });
  }
};

// Update Title Controller
export const updateTitleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { siteTitle, siteDeacription } = req.body;

    // Check if the updated title already exists
    const existingTitle = await SiteTitleModel.findOne({ siteTitle });
    if (existingTitle && existingTitle._id.toString() !== id) {
      return res.status(400).json({
        success: false,
        message: "Title already exists with a different slug",
      });
    }

    // Update title
    const updatedTitle = await SiteTitleModel.findByIdAndUpdate(
      id,
      { siteTitle, siteDeacription, slug: slugify(siteTitle, { lower: true }) },
      { new: true }
    );
    if (!updatedTitle) {
      return res.status(404).json({
        success: false,
        message: "Title not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Title updated successfully",
      updatedTitle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Title update failed",
      error,
    });
  }
};
