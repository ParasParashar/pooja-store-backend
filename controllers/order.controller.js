import prisma from "../prisma/prisma.js";
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {},
      include: {
        shippingAddress: true,
        orderItems: true,
      },
    });
    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "Currently you don't have any orders available",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Orders found successfully",
      data: orders,
    });
  } catch (error) {
    console.log("Error getting Orders: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Error getting Orders" });
  }
};
export const updateOrderDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.findUnique({
      where: {
        id: id,
      },
      include: {
        orderItems: true,
      },
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        deliveryStatus: status,
      },
    });

    if (status === "DELIVERED") {
      // TODO UPDATE PRODUCT STOCK STATE
    }
    return res.status(200).json({
      success: true,
      message: "Orders updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("rror updating Deliver status of  Orders ", error);
    return res.status(500).json({
      success: false,
      message: "Error updating Deliver status of  Orders",
    });
  }
};
