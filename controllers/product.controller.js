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
      isPublished = true,
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
    const dp =
      discountPercent > 0 ? price - price * (discountPercent / 100) : 0;
    const product = await prisma.product.create({
      data: {
        name,
        description: description,
        price: parseFloat(price),
        discountPercent: discountPercent ? parseFloat(discountPercent) : 0,
        stock: parseInt(stock, 10),
        category,
        slug,
        imageUrl: imageUrl,
        isPublished,
        discountPrice: parseFloat(dp),
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
      where: { slug: id },
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
      where: { id: id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const slug = name ? generateSlug(name) : existingProduct.slug;

    const discountPrice =
      discountPercent > 0 ? price - price * (discountPercent / 100) : 0;

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
        ...(discountPrice && { discountPrice: parseFloat(discountPrice) }),
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

    // TODO: delete image of the product also

    // delete associated order items
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

// publish and unpublish products

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
