import { createRazorpayInstance } from "../config/razorpay.config.js";
import prisma from "../prisma/prisma.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const razorPay = createRazorpayInstance();

// creating order
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
      const razorpayOrder = await razorPay.orders.create(
        {
          amount: totalAmount * 100, // Razorpay amount in paise
          currency: "INR",
          receipt: `order_${Date.now()}`,
        },
        (err, orders) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Error in processing payment from razorpay.",
            });
          }
        }
      );
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
            price: item.price, // TODO UPDATE THE PRODUCT PRICE ACCORDING TO PRODUCT ID AND DISCOUNT
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

export const verifyPayment = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify the webhook signature
    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }
    const { event, payload } = req.body;
    if (event === "payment.captured") {
      const paymentId = payload.payment.entity.id;
      const orderId = payload.payment.entity.order_id;

      // Update the order status in your database
      await prisma.order.update({
        where: { razorpayOrderId: orderId },
        data: {
          status: "COMPLETED", // Directly mark as completed after payment capture
          razorpayPaymentId: paymentId,
        },
      });
    } else if (event === "payment.failed") {
      const orderId = payload.payment.entity.order_id;

      // handle update failurr
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          status: "CANCELLED",
        },
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.log("Error in verifyPayment", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify" });
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
