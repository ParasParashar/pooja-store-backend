import prisma from "../prisma/prisma.js";

export const getSellerDetails = async (req, res) => {
  try {
    console.log("data of the user details", req.user);
    const userId = req.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      street: user.street,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country,
      state: user.state,
      phonenumber: user.phonenumber,
    });
  } catch (error) {
    console.log("Error in getting user", error.message);
    res.status(500).json({ error: "Server Error " + error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    if (req.logout) {
      req.logout((err) => {
        if (err) {
          console.error("Error in req.logout:", err);
          return res
            .status(500)
            .json({ success: false, message: "Logout failed" });
        }
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
};
