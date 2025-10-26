import { Hono } from "hono";
import { producer } from "../utils/kafka";

const webhookRoute = new Hono();

webhookRoute.get("/", (c) => {
  return c.json({
    status: "ok webhook",
    message: "Cash on Delivery - No webhooks needed",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Mock webhook for Cash on Delivery orders
// This can be called manually to simulate order confirmation
webhookRoute.post("/cod-confirm", async (c) => {
  try {
    const body = await c.req.json();
    const { sessionId, userId, email, amount, products } = body;

    if (!sessionId || !userId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Send Kafka message for order creation
    await producer.send("payment.successful", {
      value: {
        userId: userId,
        email: email,
        amount: amount,
        status: "pending", // COD orders start as pending until delivery
        paymentMethod: "cash_on_delivery",
        products: products || [],
      },
    });

    return c.json({ 
      success: true,
      message: "Cash on Delivery order confirmed",
      sessionId: sessionId
    });
  } catch (error) {
    console.log("COD confirmation failed!", error);
    return c.json({ error: "COD confirmation failed!" }, 500);
  }
});

export default webhookRoute;
