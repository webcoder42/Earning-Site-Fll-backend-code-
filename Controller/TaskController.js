import TaskModel from "../models/TaskModel.js";
import UserModel from "../models/UserModel.js"; // Assuming user schema is in UserModel

// Create a new task (Admin only)
// Create a new task (Admin only)
export const createTaskController = async (req, res) => {
  try {
    const {
      taskType,
      referralRequirement,
      offerDay,
      Links,
      monthlyDay,
      price,
      reward,
      followLink,
      currency, // Currency field added
    } = req.body;

    // Validation
    if (!taskType) {
      return res.status(400).json({ error: "Task type is required." });
    }

    if (!currency || !["USD", "PKR"].includes(currency)) {
      return res
        .status(400)
        .json({ error: "Currency must be either USD or PKR." });
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

    if (taskType === "monthlyOffer" && !monthlyDay) {
      return res
        .status(400)
        .json({ error: "Monthly day is required for month offers." });
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
      referralRequirement:
        taskType === "referral" ? referralRequirement : undefined,
      offerDay: taskType === "sundayOffer" ? offerDay : undefined,
      monthlyDay: taskType === "monthlyOffer" ? monthlyDay : undefined,
      Links: taskType === "link" ? Links : undefined,
      price,
      reward,
      followLink,
      currency, // Currency included in new task creation
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
// Get all tasks
export const getTaskController = async (req, res) => {
  try {
    const tasks = await TaskModel.find();
    if (!tasks.length) {
      return res.status(404).json({ error: "No tasks found." });
    }

    // Map tasks to include currency in the response
    const tasksWithCurrency = tasks.map((task) => ({
      id: task._id,
      taskType: task.taskType,
      referralRequirement: task.referralRequirement,
      offerDay: task.offerDay,
      monthlyDay: task.monthlyDay,
      Links: task.Links,
      price: task.price,
      reward: task.reward,
      followLink: task.followLink,
      currency: task.currency, // Include currency in the response
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }));

    return res.status(200).json({ success: true, tasks: tasksWithCurrency });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res
      .status(500)
      .json({ error: "Internal server error while fetching tasks" });
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
