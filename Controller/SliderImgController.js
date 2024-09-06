import fs from "fs";
import SliderImgModels from "../models/SliderImgModels";

export const imageController = async (req, res) => {
  try {
    const { photo } = req.files;

    if (photo && photo.size > 1000000) {
      return res.status(400).send({ error: "Photo should be less than 1 MB" });
    }
    const newImg = new SliderImgModels({});

    if (photo) {
      newImg.photo.data = fs.readFileSync(photo.path);
      newImg.photo.contentType = photo.type;
    }

    await newImg.save();
    res.status(201).send({
      success: true,
      message: "Image  created successfully",
      img: newImg,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in creating img ",
      error,
    });
  }
};
