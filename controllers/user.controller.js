import prisma from "../prisma/prisma.js";

export const upsertUserAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { street, city, name, state, postalCode, country, phonenumber } =
      req.body;
    if (!street || !city || !state || !postalCode || !country || !phonenumber) {
      return res.status(400).json({
        success: false,
        message:
          "All address fields are required: street, city, state, postalCode, country, and phonenumber.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        street,
        city,
        state,
        postalCode,
        country,
        phonenumber,
        name,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User delivery address updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the user delivery address.",
      error: error.message,
    });
  }
};

// get user data of order and profile
export const getUserData = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        Orders: {
          orderBy: {
            // createdAt: "desc",
            updatedAt: "desc",
          },
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User data fetch successfully.",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user address:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching user data",
      error: error.message,
    });
  }
};

// getting cart data according to user
export const getCartData = async (req, res) => {
  try {
    const productIds = req.body;
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ message: "Products not found", success: false });
    }

    return res.status(200).json({
      message: "Products Data get successfully.",
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error getting cart data", error);
    return res
      .status(500)
      .json({ message: "Error getting the cart data.", success: false });
  }
};
