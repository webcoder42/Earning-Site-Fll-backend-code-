import slugify from "slugify";
import PackagesModel from "../models/PackagesModel.js";

const calculateRemainingPrice = (price, discount) => {
  const remainingPrice = price - discount;
  return remainingPrice;
};

export const createPackageController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      earningRate,
      numOfAds,
      commissionRate,
      discount,
    } = req.body;

    // Validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is required" });
      case !description:
        return res.status(400).send({ error: "Description is required" });
      case !price:
        return res.status(400).send({ error: "Price is required" });
      case !duration:
        return res.status(400).send({ error: "Duration is required" });
      case !earningRate:
        return res.status(400).send({ error: "EarningRate is required" });

      case !commissionRate:
        return res.status(400).send({ error: "commissionRate is required" });
    }

    // Calculate remaining price
    const remainingPrice = calculateRemainingPrice(price, discount);

    const Packages = new PackagesModel({
      ...req.body,
      slug: slugify(name),
      price: remainingPrice,
    });

    await Packages.save();
    res.status(201).send({
      success: true,
      message: "Package created successfully",
      Packages,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in creating package",
      error,
    });
  }
};

// Get all packages
export const getAllPackageController = async (req, res) => {
  try {
    const packages = await PackagesModel.find({});
    res.status(200).send({
      success: true,
      totalPackages: packages.length,
      message: "All packages list",
      packages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in getting packages",
    });
  }
};

// Delete package
export const deletePackageController = async (req, res) => {
  try {
    await PackagesModel.findByIdAndDelete(req.params.pid);

    res.status(200).send({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in deleting the package",
    });
  }
};

// Update package
export const updatePackageController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      earningRate,
      isActive,
      discount,
      commissionRate,
    } = req.body;

    // Validation
    switch (true) {
      case !name:
        return res.status(400).send({ error: "Name is required" });
      case !description:
        return res.status(400).send({ error: "Description is required" });
      case !price:
        return res.status(400).send({ error: "Price is required" });
      case !duration:
        return res.status(400).send({ error: "Duration is required" });
      case !earningRate:
        return res.status(400).send({ error: "EarningRate is required" });
      case !commissionRate:
        return res.status(400).send({ error: "commissionRate is required" });
    }

    // Calculate remaining price
    const remainingPrice = calculateRemainingPrice(price, discount);

    const Packages = await PackagesModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.body, slug: slugify(name), price: remainingPrice },
      { new: true, runValidators: true }
    );

    if (!Packages) {
      return res.status(404).send({ error: "Package not found" });
    }

    res.status(200).send({
      success: true,
      message: "Package updated successfully",
      Packages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in updating package",
    });
  }
};

// Get single package
export const singlePackageController = async (req, res) => {
  try {
    const { slug } = req.params;
    const getPackage = await PackagesModel.findOne({ slug });

    if (!getPackage) {
      return res.status(404).send({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get single package",
      getPackage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in getting single package",
    });
  }
};
