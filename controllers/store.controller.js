import prisma from "../prisma/prisma.js";
import { razorpay } from "../config/razorpay.config.js";
// display all products of the user
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

// create order
export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, paymentMethod } = req.body;

    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !totalAmount ||
      !paymentMethod
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order data" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    let razorpayOrderId = null;

    // Create Razorpay order for online payments
    if (paymentMethod === "ONLINE") {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // Razorpay amount in paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
      });
      razorpayOrderId = razorpayOrder.id;

      if (!razorpayOrderId) {
        return res.status(500).json({
          success: false,
          message: "Failed to create Razorpay order.",
        });
      }
    }

    // Create a new shipping address from user details
    const newAddress = await prisma.shippingAddress.create({
      data: {
        street: user.street,
        city: user.city,
        state: user.state,
        postalCode: user.postalCode,
        country: user.country,
        phonenumber: user.phonenumber,
      },
    });
    const shippingAddressId = newAddress.id;

    // Create the order
    const order = await prisma.order.create({
      data: {
        userId,
        paymentMethod,
        razorpayOrderId,
        totalAmount,
        status: "PENDING",
        deliveryStatus: "PENDING",
        shippingAddressId,
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Order created successfully!",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create order." });
  }
};

// frontend to handle razorpay

// const handlePayment = async () => {
//   const response = await fetch("/api/order", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ userId, items, totalAmount }),
//   });
//   const { razorpayOrderId, order } = await response.json();

//   const options = {
//     key: process.env.RAZORPAY_KEY_ID,
//     amount: totalAmount * 100,
//     currency: "INR",
//     name: "ShopHub",
//     description: "Test Transaction",
//     order_id: razorpayOrderId,
//     handler: async (response) => {
//       // Verify payment success
//       console.log("Payment Successful!", response);
//     },
//     prefill: {
//       name: user.name,
//       email: user.email,
//     },
//   };

//   const rzp = new window.Razorpay(options);
//   rzp.open();
// };
