// Controller/UserTaskController.js
import TaskModel from "../models/TaskModel.js";
import UserModel from "../models/UserModel.js";
import UserTaskModel from "../models/UserTaskModel.js";
import PackagePurchaseModel from "../models/PackagePurchaseModel.js"; // Assuming you have this model

export const claimTaskController = async (req, res) => {
  try {
    // Get user ID and task ID from the request body (assuming it's passed from frontend)
    const { taskId } = req.body;
    const userId = req.user._id; // User ID from req.user (authentication middleware)

    // Check if the task exists and is not already claimed
    const task = await TaskModel.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the task is already claimed
    const alreadyClaimed = await UserTaskModel.findOne({ userId, taskId });
    if (alreadyClaimed) {
      return res.status(400).json({ message: "Task already claimed" });
    }

    // Claim the task by creating a new TaskClaim
    const newClaim = new UserTaskModel({
      userId: userId,
      taskId: taskId,
      price: task.price,
      claimed: true,
    });
    await newClaim.save();

    // Disable the claimed task (you can either delete it or set a flag)
    task.isClaimed = true; // Assuming you have an `isClaimed` field in the Task schema
    await task.save();

    // Update user's earnings and total earnings
    const user = await UserModel.findById(userId);
    if (user) {
      user.earnings += task.price; // Increment earnings by the task price
      user.TotalEarnings += task.price; // Increment totalEarnings
      await user.save();
    }

    return res
      .status(200)
      .json({ message: "Task claimed successfully", newClaim });
  } catch (error) {
    console.error("Error claiming task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTasksByUserCurrency = async (req, res) => {
  try {
    console.log("User ID from request:", req.user); // Log the user object
    const userId = req.user._id;

    const user = await UserModel.findById(userId).select("currency");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userCurrency = user.currency;
    console.log("User Currency:", userCurrency); // Log the user currency

    // Find tasks that match the user's currency
    const tasks = await TaskModel.find({ currency: userCurrency });

    console.log("Tasks found:", tasks); // Log the tasks found
    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
