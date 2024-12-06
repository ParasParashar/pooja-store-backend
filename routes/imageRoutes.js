import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route to upload an image
router.post("/uploadimage", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const backendUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${backendUrl}/${req.file.path.replace(/\\/g, "/")}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: imageUrl,
    });
  } catch (error) {
    console.error("Error in uploading image: " + error.message);
    return res.status(500).json({
      success: false,
      error: "Image not uploaded",
    });
  }
});

// Route to delete an image
router.post("/deleteimage", async (req, res) => {
  try {
    const { imageToRemove } = req.body;
    const imagePath = path.join("./uploads", imageToRemove);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
  } catch (error) {
    console.error("Error in deleting image: " + error.message);
    return res.status(500).json({
      success: false,
      error: "Image not deleted",
    });
  }
});

export default router;

// frntend

// const uploadImage = async (file) => {
//   const formData = new FormData();
//   formData.append("image", file);

//   const response = await fetch("/uploadimage", {
//     method: "POST",
//     body: formData,
//   });

//   const result = await response.json();
//   console.log(result);
// };
