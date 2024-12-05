import { Router } from "express";

const router = Router();

router.post("/upload", async (req, res) => {
  try {
    const { img } = req.body;
    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      img: imgUrl,
    });
  } catch (error) {
    console.log("Error in uploading image: " + error.message);
    return res.status(500).json({
      success: false,
      error: "Image not uploaded",
    });
  }
});
router.post("/destroy", async (req, res) => {
  try {
    const { imageToRemove } = req.body;
    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log("Error in uploading image: " + error.message);
    return res.status(500).json({
      success: false,
      error: "Image not deleted",
    });
  }
});

export default router;
