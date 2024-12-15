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
    res.cookie("jwt", "", { maxAge: 0 });
    return res
      .status(200)
      .json({ success: true, message: "Logout Successfully" });
  } catch (error) {
    console.log("Error in logout", error.message);
    res
      .status(500)
      .json({ success: false, message: "Server Error " + error.message });
  }
};
