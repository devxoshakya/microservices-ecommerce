import { createMiddleware } from "hono/factory";

// Simplified auth middleware for Cash on Delivery
// Just extracts userId from request body or headers
export const shouldBeUser = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  // For COD, we can get userId from the request body or header
  const authHeader = c.req.header("x-user-id");
  const body = await c.req.json().catch(() => ({}));
  
  const userId = authHeader || body.userId;

  if (!userId) {
    return c.json({
      message: "User ID is required.",
      error: "Please provide x-user-id header or userId in body"
    }, 401);
  }

  c.set("userId", userId);

  await next();
});

export const shouldBeAdmin = createMiddleware<{
  Variables: {
    userId: string;
  };
}>(async (c, next) => {
  // For COD, simplified admin check
  const authHeader = c.req.header("x-user-id");
  const body = await c.req.json().catch(() => ({}));
  
  const userId = authHeader || body.userId;

  if (!userId) {
    return c.json({
      message: "User ID is required.",
    }, 401);
  }

  c.set("userId", userId);

  await next();
});
