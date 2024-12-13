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
      select: {
        user: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        status: true,
        deliveryStatus: true,
        paymentMethod: true,
        totalAmount: true,
        id: true,
      },
      orderBy: {
        createdAt: "desc",
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

// get paritcular order
export const getParticularOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        user: {
          select: {
            name: true,
          },
        },
        shippingAddress: true,
        orderItems: {
          select: {
            product: {
              select: {
                name: true,
                category: true,
                imageUrl: true,
              },
            },
            quantity: true,
            price: true,
          },
        },
        createdAt: true,
        updatedAt: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        status: true,
        deliveryStatus: true,
        paymentMethod: true,
        totalAmount: true,
        id: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No Order details available .",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order details found successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error getting Order details: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Error getting Order details" });
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
        orderItems: {
          include: {
            product: true,
          },
        },
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
        id: id,
      },
      data: {
        deliveryStatus: status,
      },
    });

    if (status === "DELIVERED") {
      for (const orderItem of order.orderItems) {
        const { product, quantity } = orderItem;
        await prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }
      await prisma.order.update({
        where: {
          id: id,
        },
        data: {
          status: "COMPLETED",
          paymentMethod: "COD",
        },
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("Error updating delivery status of orders: ", error);
    return res.status(500).json({
      success: false,
      message: "Error updating delivery status of orders",
    });
  }
};
