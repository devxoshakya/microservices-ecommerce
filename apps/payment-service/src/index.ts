import { serve } from "@hono/node-server";
import { Hono } from "hono";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import webhookRoute from "./routes/webhooks.route.js";

const app = new Hono();
// Removed Clerk middleware - not needed for COD payments
app.use("*", cors({ origin: ["http://localhost:3002", "http://localhost:3003"] }));

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "payment-service",
    paymentMethod: "cash_on_delivery",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);

const start = async () => {
  try {
    Promise.all([await producer.connect(), await consumer.connect()]);
    await runKafkaSubscriptions()
    serve(
      {
        fetch: app.fetch,
        port: 8002,
      },
      (info) => {
        console.log(`Payment service is running on port 8002`);
      }
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
start();
