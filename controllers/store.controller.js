import prisma from "../prisma/prisma.js";
// display all products of the user
export const getProductDetails = async (req, res) => {
  try {
    const { id: slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discountPercent: true,
        stock: true,
        imageUrl: true,
        isPublished: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching product details.",
    });
  }
};

// get specific product details
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        isPublished: true,
        discountPercent: true,
        category: true,
        slug: true,
        imageUrl: true,
      },
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching products.",
      error: error.message,
    });
  }
};
