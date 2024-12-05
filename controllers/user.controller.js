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
