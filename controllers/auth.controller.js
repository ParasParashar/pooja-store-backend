import prisma from "../prisma/prisma.js";

export const getSellerDetails = async (req, res) => {
  console.log(req.isAuthenticated(), "currently again this is come false");
  if (req.isAuthenticated()) {
    try {
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
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err)
      return res.status(500).json({ message: "Logout failed", success: false });
    return res
      .status(200)
      .json({ message: "Logout Successfully", success: true });
  });
};
