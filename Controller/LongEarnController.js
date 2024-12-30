import LongEarnModel from "../models/LongEarnModel.js";

//create ads
export const createLongearn = async (req, res) => {
  const { videotitle, Link, code } = req.body;

  try {
    const newAd = new LongEarnModel({
      videotitle,
      Link,
      code,
    });

    // Validation
    switch (true) {
      case !videotitle:
        return res.status(400).send({ message: "Name is required" });
      case !Link:
        return res.status(400).send({ message: "link is required" });
      case !code:
        return res.status(400).send({ message: "code is required" });
    }
    await newAd.save();
    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all advertisements with embedded video
export const getlongearn = async (req, res) => {
  try {
    const ads = await LongEarnModel.find({});
    const adsWithEmbeddedVideos = ads.map((ad) => ({
      ...ad.toObject(),
      embeddedVideo: `<iframe width="560" height="315" src="${ad.Link}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
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
export const getlongearnById = async (req, res) => {
  const { adId } = req.params;

  try {
    const ad = await LongEarnModel.findById(adId);
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
export const updateLongearn = async (req, res) => {
  const { adId } = req.params;
  const { videotitle, Link, code } = req.body;

  try {
    const updatedAd = await LongEarnModel.findByIdAndUpdate(
      adId,
      { videotitle, Link, code },
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
export const deleteLongearn = async (req, res) => {
  const { adId } = req.params;

  try {
    const deletedAd = await LongEarnModel.findByIdAndDelete(adId);
    if (!deletedAd) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    res.status(200).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
