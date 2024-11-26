import LevelCreateModel from "../models/LevelCreateModel.js";

// Create a new level
export const createLevel = async (req, res) => {
  try {
    const {
      Level,
      upgradeCommision,
      MonthlySalary,
      MinAmount,
      MinActiveRef,
      currency,
      salarydays,
    } = req.body;

    // Validation
    if (
      !Level ||
      !upgradeCommision ||
      !MonthlySalary ||
      !MinAmount ||
      !MinActiveRef ||
      !currency ||
      !salarydays // Corrected validation for salarydays
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate currency
    if (!["USD", "PKR"].includes(currency)) {
      return res
        .status(400)
        .json({ message: "Invalid currency, must be USD or PKR." });
    }

    // Create new level
    const newLevel = new LevelCreateModel({
      Level,
      upgradeCommision,
      MonthlySalary,
      MinAmount,
      MinActiveRef,
      currency, // Include currency field here
      salarydays, // Add salarydays to the level data
    });

    // Save level to database
    const savedLevel = await newLevel.save();
    res
      .status(201)
      .json({ message: "Level created successfully.", data: savedLevel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating level.", error: error.message });
  }
};

// Get all levels
export const getAllLevels = async (req, res) => {
  try {
    const levels = await LevelCreateModel.find();
    res.status(200).json({
      message: "Levels fetched successfully.",
      TotalLevel: levels.length,
      data: levels,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching levels.", error: error.message });
  }
};

// Get a single level by ID
export const getLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const level = await LevelCreateModel.findById(id);

    if (!level) {
      return res.status(404).json({ message: "Level not found." });
    }

    res
      .status(200)
      .json({ message: "Level fetched successfully.", data: level });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching level.", error: error.message });
  }
};

// Update a level
export const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedLevel = await LevelCreateModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedLevel) {
      return res.status(404).json({ message: "Level not found." });
    }

    res
      .status(200)
      .json({ message: "Level updated successfully.", data: updatedLevel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating level.", error: error.message });
  }
};

// Delete a level
export const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLevel = await LevelCreateModel.findByIdAndDelete(id);

    if (!deletedLevel) {
      return res.status(404).json({ message: "Level not found." });
    }

    res.status(200).json({ message: "Level deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting level.", error: error.message });
  }
};
