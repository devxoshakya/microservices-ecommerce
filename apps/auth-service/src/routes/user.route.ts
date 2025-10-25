import { Router } from "express";
import clerkClient from "../utils/clerk";
import { producer } from "../utils/kafka";

const router: Router = Router();

router.get("/", async (req, res) => {
  const users = await clerkClient.users.getUserList();
  res.status(200).json(users);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await clerkClient.users.getUser(id);
  res.status(200).json(user);
});

router.post("/", async (req, res) => {
  type CreateParams = Parameters<typeof clerkClient.users.createUser>[0];
  const newUser: CreateParams = req.body;
  const user = await clerkClient.users.createUser(newUser);
  producer.send("user.created", {
    value: {
      username: user.username,
      email: user.emailAddresses[0]?.emailAddress,
    },
  });
  res.status(200).json(user);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await clerkClient.users.deleteUser(id);
  res.status(200).json(user);
});

export default router;
