import { Hono } from "hono";
import { getStripeProductPrice } from "../utils/stripeProduct";
import { randomUUID } from "crypto";

const sessionRoute = new Hono();

// Mock checkout session storage
const sessions = new Map<string, any>();

sessionRoute.post("/create-checkout-session", async (c) => {
  try {
    const body = await c.req.json();
    const { cart, userId } = body;

    if (!cart || !userId) {
      return c.json({ 
        error: "Cart and userId are required" 
      }, 400);
    }

    const lineItems = await Promise.all(
      cart.map(async (item: any) => {
        const unitAmount = await getStripeProductPrice(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: unitAmount as number,
          },
          quantity: item.quantity,
        };
      })
    );

    // Create a mock session for Cash on Delivery
    const sessionId = randomUUID();
    const totalAmount = lineItems.reduce((sum, item) => {
      return sum + (item.price_data.unit_amount * item.quantity);
    }, 0);

    const session = {
      id: sessionId,
      client_reference_id: userId,
      mode: "payment",
      payment_method: "cash_on_delivery",
      status: "complete", // COD orders are immediately "complete" in session
      payment_status: "unpaid", // Payment happens on delivery
      amount_total: totalAmount,
      line_items: lineItems,
      created_at: new Date().toISOString(),
    };

    // Store session in memory
    sessions.set(sessionId, session);

    // Return mock client secret
    return c.json({ 
      checkoutSessionClientSecret: `cod_${sessionId}`,
      sessionId: sessionId,
      message: "Cash on Delivery order created",
      totalAmount: totalAmount / 100, // Convert back to dollars for display
    });
  } catch (error) {
    console.log(error);
    return c.json({ error: "Failed to create checkout session" }, 500);
  }
});

sessionRoute.get("/:session_id", async (c) => {
  const { session_id } = c.req.param();
  
  // Retrieve mock session
  const session = sessions.get(session_id);

  if (!session) {
    return c.json({ 
      status: "not_found",
      paymentStatus: "unknown"
    }, 404);
  }

  return c.json({
    status: session.status,
    paymentStatus: session.payment_status,
    paymentMethod: "cash_on_delivery",
    amount_total: session.amount_total,
  });
});

export default sessionRoute;
