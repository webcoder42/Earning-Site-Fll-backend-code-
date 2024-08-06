import AdvertisementModel from "../models/AdvertisementModel.js";

//create ads
export const createAdvertisement = async (req, res) => {
  const { title, description, videoLink, duration, earningRate } = req.body;

  try {
    const newAd = new AdvertisementModel({
      title,
      description,
      videoLink,
      duration,
      earningRate,
    });

    // Validation
    switch (true) {
      case !title:
        return res.status(400).send({ message: "Name is required" });
      case !description:
        return res.status(400).send({ message: "Description is required" });
      case !videoLink:
        return res.status(400).send({ message: "Price is required" });
      case !duration:
        return res.status(400).send({ message: "Duration is required" });
      case !duration:
        return res.status(400).send({ message: "EarningRate is required" });

      case !earningRate:
        return res.status(400).send({ message: "commissionRate is required" });
    }
    await newAd.save();
    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all advertisements with embedded video
export const getAdvertisements = async (req, res) => {
  try {
    const ads = await AdvertisementModel.find({});
    const adsWithEmbeddedVideos = ads.map((ad) => ({
      ...ad.toObject(),
      embeddedVideo: `<iframe width="560" height="315" src="${ad.videoLink}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    }));

    res.status(200).send({
      success: true,
      totalAds: ads.length,
      message: "All Ads list",
      ads: adsWithEmbeddedVideos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error: error.message,
      message: "Error in getting Ads",
    });
  }
};

// Get single advertisement by ID with embedded video
export const getAdvertisementById = async (req, res) => {
  const { adId } = req.params;

  try {
    const ad = await AdvertisementModel.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    const adWithEmbeddedVideo = {
      ...ad.toObject(),
      embeddedVideo: `<iframe width="560" height="315" src="${ad.videoLink}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    };

    res.status(200).send({
      success: true,
      message: "Get single Ad",
      ad: adWithEmbeddedVideo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update
export const updateAdvertisement = async (req, res) => {
  const { adId } = req.params;
  const { title, description, videoLink, duration, earningRate } = req.body;

  try {
    const updatedAd = await AdvertisementModel.findByIdAndUpdate(
      adId,
      { title, description, videoLink, duration, earningRate },
      { new: true }
    );
    if (!updatedAd) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).send({
      success: true,
      message: "Update Ads",
      updatedAd,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete
export const deleteAdvertisement = async (req, res) => {
  const { adId } = req.params;

  try {
    const deletedAd = await AdvertisementModel.findByIdAndDelete(adId);
    if (!deletedAd) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
