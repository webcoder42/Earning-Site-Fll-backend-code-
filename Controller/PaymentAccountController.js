import { message } from "antd";
import PaymentAccountModel from "../models/PaymentAccountModel.js";

export const accountController = async (req, res) => {
  try {
    const { accountType, accountName, accountNumber } = req.body;

    const paymentAccount = new PaymentAccountModel({
      accountType,
      accountName,
      accountNumber,
    });

    await paymentAccount.save();

    res.status(201).json({
      message: "Payment account created successfully",
      paymentAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//get single account
export const getAccountController = async (req, res) => {
  try {
    const accountId = req.params.id;
    const paymentAccount = await PaymentAccountModel.findById(accountId);

    if (!paymentAccount) {
      return res.status(404).json({ message: "Payment account not found" });
    }

    res.status(200).json({
      success: true,
      message: "Account get",
      paymentAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//get all
export const getAllAccountController = async (req, res) => {
  try {
    const paymentAccounts = await PaymentAccountModel.find({});
    res.status(200).send({
      message: "All Account  ",
      totalAccount: paymentAccounts.length,
      paymentAccounts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

//update account
export const updateAccountController = async (req, res) => {
  try {
    const updatedPaymentAccount = await PaymentAccountModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Account status Update successfully",
      updatedPaymentAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//delete account
export const deleteAccountController = async (req, res) => {
  try {
    await PaymentAccountModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Payment account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
