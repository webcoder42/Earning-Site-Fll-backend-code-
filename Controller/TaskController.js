import TaskModel from "../models/TaskModel.js";
import UserModel from "../models/UserModel.js"; // Assuming user schema is in UserModel

// Create a new task (Admin only)
export const createTaskController = async (req, res) => {
  try {
    const {
      taskType,
      accountType,
      referralRequirement,
      offerDay,
      Links, // For link type tasks
      price,
      reward,
      followLink,
    } = req.body;

    // Validation
    if (!taskType) {
      return res.status(400).json({ error: "Task type is required." });
    }

    if (!accountType) {
      return res.status(400).json({ error: "Account type is required." });
    }

    if (
      taskType === "referral" &&
      (!referralRequirement || referralRequirement < 1)
    ) {
      return res.status(400).json({
        error: "Referral requirement must be at least 1 for referral tasks.",
      });
    }

    if (taskType === "sundayOffer" && !offerDay) {
      return res
        .status(400)
        .json({ error: "Offer day is required for Sunday offers." });
    }

    if (taskType === "link" && !Links) {
      return res
        .status(400)
        .json({ error: "A valid link is required for link tasks." });
    }

    if (price < 0) {
      return res
        .status(400)
        .json({ error: "Price must be a non-negative number." });
    }

    if (!reward) {
      return res.status(400).json({ error: "Reward description is required." });
    }

    // Create new task
    const newTask = new TaskModel({
      taskType,
      accountType,
      referralRequirement:
        taskType === "referral" ? referralRequirement : undefined,
      offerDay: taskType === "sundayOffer" ? offerDay : undefined,
      Links: taskType === "link" ? Links : undefined,
      price,
      reward,
      followLink, // Optional field
    });

    // Save task to the database
    await newTask.save();

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//get
export const getTaskController = async (req, res) => {
  try {
    const tasks = await TaskModel.find();
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a task by ID
// Delete a task by ID
export const deleteTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskModel.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    await TaskModel.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
