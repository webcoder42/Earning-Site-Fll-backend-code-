import slugify from "slugify";
import PackagesModel from "../models/PackagesModel.js";
import UserModel from "../models/UserModel.js";

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
      Packagecurrency, // Now including currency in the request body
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
        return res.status(400).send({ error: "CommissionRate is required" });
      case !Packagecurrency: // Check if currency is provided
        return res.status(400).send({ error: "Package currency is required" });
      case !["USD", "PKR"].includes(Packagecurrency): // Ensure valid currency
        return res
          .status(400)
          .send({ error: "Invalid currency, must be USD or PKR" });
    }

    // Calculate remaining price after discount
    const remainingPrice = calculateRemainingPrice(price, discount);

    // Create new package with the given currency
    const newPackage = new PackagesModel({
      ...req.body,
      slug: slugify(name),
      price: remainingPrice,
      Packagecurrency, // Store the currency in the package
    });

    await newPackage.save();

    res.status(201).send({
      success: true,
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.error(error);
    res.status(400).send({
      success: false,
      message: "Error in creating package",
      error,
    });
  }
};
// Get all packages
// Get all packages and separate by currency
export const getAllPackageController = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated
    const user = await UserModel.findById(userId);

    // Default to PKR if no currency is set for the user
    const userCurrency = user.currency || "PKR";

    // Get USD packages
    const usdPackages = await PackagesModel.find({ Packagecurrency: "USD" });

    // Get PKR packages
    const pkrPackages = await PackagesModel.find({
      Packagecurrency: { $ne: "USD" }, // Everything that's not USD, assuming PKR by default
    });

    res.status(200).send({
      success: true,
      totalUsdPackages: usdPackages.length,
      totalPkrPackages: pkrPackages.length,
      message: "Packages filtered by currency",
      usdPackages,
      pkrPackages,
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

//get package usd/pkr
// Get all packages and separate by currency
export const getPackage = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated
    const user = await UserModel.findById(userId);

    // Default to PKR if no currency is set for the user
    const userCurrency = user.currency || "PKR";

    // Get all packages
    const allPackages = await PackagesModel.find({});

    // Filter packages based on user's currency
    let filteredPackages = [];
    if (userCurrency === "USD") {
      // Show only packages with USD currency
      filteredPackages = allPackages.filter(
        (pkg) => pkg.Packagecurrency === "USD"
      );
    } else {
      // Show only packages with PKR currency
      filteredPackages = allPackages.filter(
        (pkg) =>
          pkg.Packagecurrency === "PKR" || pkg.Packagecurrency === undefined
      );
    }

    res.status(200).send({
      success: true,
      totalPackages: filteredPackages.length,
      message: "Packages filtered by currency",
      packages: filteredPackages,
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
