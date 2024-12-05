import prisma from "../prisma/prisma.js";

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
      stock,
      imageUrl,
    } = req.body;

    // Validate required fields
    if (!name || !price || !category || !stock) {
      return res.status(400).json({
        success: false,
        message: "Name, price, category, and stock are required fields.",
      });
    }

    // Generate slug for the product
    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        description: description,
        price: parseFloat(price),
        discountPercent: discountPercent
          ? parseFloat(discountPercent)
          : undefined,
        stock: parseInt(stock, 10),
        category,
        slug,
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

// Get All Products
export const getAllProducts = async (req, res) => {
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

// Get Specific Product
export const getSpecificProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

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

// Update Product
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
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const slug = name ? generateSlug(name) : undefined;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(stock && { stock: parseInt(stock, 10) }),
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
      message: "An error occurred while updating the product.",
      error: error.message,
    });
  }
};

// Delete Product Permanently
export const deleteProductPermanently = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete associated order items
    await prisma.orderItem.deleteMany({
      where: { productId: id },
    });

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted permanently.",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product.",
      error: error.message,
    });
  }
};
