import prisma from "../prisma/prisma.js";

import prisma from "../prisma/prisma.js";

export const getProductDetails = async (req, res) => {
  try {
    const { slug } = req.params;
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

export const getCollections = async (req, res) => {
  try {
    const collections = [
      {
        id: crypto.randomUUID(),
        name: "Featured Products",
        image: "https://images.unsplash.com/photo-1523359346063-d879354c0ea5",
        products: await prisma.product.findMany({
          where: { isDeleted: false, isPublished: true, status: "active" },
          take: 10,
        }),
      },
      {
        id: crypto.randomUUID(),
        name: "New Arrivals",
        image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3",
        products: await prisma.product.findMany({
          where: {
            isDeleted: false,
            isPublished: true,
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
          take: 10,
        }),
      },
      {
        id: crypto.randomUUID(),
        name: "Top Sellers",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
        products: await prisma.product.findMany({
          where: { isDeleted: false, isPublished: true },
          orderBy: { totalQuantity: "desc" },
          take: 10,
        }),
      },
    ];

    res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch collections." });
  }
};
