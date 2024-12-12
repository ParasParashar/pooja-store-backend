import prisma from "../prisma/prisma.js";
export const getAllOrders = async (req, res) => {
  try {
    // Extract page and size from query parameters
    const { page = 1, size = 10 } = req.query;

    // Parse and ensure the page and size are integers
    const currentPage = parseInt(page, 10);
    const pageSize = parseInt(size, 10);

    // Calculate skip and take values for pagination
    const skip = (currentPage - 1) * pageSize;
    const take = pageSize;

    // Fetch total count of orders for pagination metadata
    const totalOrders = await prisma.order.count();

    // Fetch paginated orders
    const orders = await prisma.order.findMany({
      where: {},
      include: {
        user: true,
        shippingAddress: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take,
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders available for the requested page.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Orders found successfully",
      data: orders,
      pagination: {
        currentPage,
        pageSize,
        totalOrders,
        totalPages: Math.ceil(totalOrders / pageSize),
      },
    });
  } catch (error) {
    console.error("Error getting Orders: ", error);
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
