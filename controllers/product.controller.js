import prisma from "../prisma/prisma.js";
import cloudinary from "../config/cloudinary.js";
// Utility function to generate a slug
const generateSlug = (name) => {
  return `${name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "")}-${Date.now()}`;
};

// Create Product Controller
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      discountPercent,
      isFeatured,
      stock,
      imageUrl,
    } = req.body;
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and categoryId are required fields.",
      });
    }

    // Create a unique slug for the product
    const slug = generateSlug(name);

    // create a product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        category,
        slug,
        discountPercent: parseFloat(discountPercent),
        sellerId: req.user.id,
        stock: stock,
        imageUrl: imageUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the product.",
      error: error.message,
    });
  }
};

// get all products
export const getSellerAllProducts = async (req, res) => {
  try {
    const { id: sellerId } = req.user;
    // Validate seller ID
    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized",
      });
    }

    // Fetch all products for the seller with basic details
    const products = await prisma.product.findMany({
      where: {},
      select: {
        id: true,
        name: true,
        price: true,
        isPublished: true,
        discountPercent: true,
        stock: true,
        slug: true,
      },
    });
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for the seller.",
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
// get specific product
export const getSpecificProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // Validate product ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    // Fetch the product with details
    const product = await prisma.product.findUnique({
      where: { id, isPublished: true },
    });

    // Check if the product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product retrieved successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product.",
      error: error.message,
    });
  }
};

// edit product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    category,
    stock,
    imageUrl,
    isPublished,
    discountPercent,
  } = req.body;
  try {
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required fields.",
      });
    }
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    const slug = generateSlug(name);
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(stock && { stock }),
        ...(description && { description }),
        ...(imageUrl && { imageUrl }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(discountPercent !== undefined && {
          discountPercent: parseFloat(discountPercent),
        }),
        ...(category && { category }),
        ...(typeof isPublished === "boolean" && { isPublished }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export const publishUnpublishProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        isPublished: product.isPublished ? false : true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product is available to sell",
    });
  } catch (error) {
    console.error("Error publishing product", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to publish Product Please try again later.",
    });
  }
};

// delete product permanently and delete all images uploaded in the cloudinary
export const deleteProductPermanently = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the product exists
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }
    // delete product uploaded on the cloudinary
    for (const variants of product.variants) {
      for (const image of variants.images) {
        await cloudinary.uploader.destroy(image.split("/").pop().split(".")[0]);
      }
      await prisma.attribute.deleteMany({
        where: {
          variantId: variants.id,
        },
      });
    }
    await prisma.variant.deleteMany({
      where: {
        productId: id,
      },
    });
    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted permanently successfully.",
    });
  } catch (error) {
    console.error("Error publishing product", error.message);
    return res.status(500).json({
      success: false,
      message:
        "Failed to delete the  Product permanently ,Please try again later.",
    });
  }
};
