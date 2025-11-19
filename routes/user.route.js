import express from "express";
import { error } from "console";
import {
  signupPostRequestBodySchema,
  loginPostrequestBodySchema,
} from "../validation/request.validation.js";
import { hashedPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail } from "../services/user.service.js";
import { createUser } from "../services/user.service.js";
import { createUserToken } from "../utils/token.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body
  );

  console.log(validationResult.password);

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.format() });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return res
      .status(400)
      .json({ error: `User with email: ${email} already exists` });
  }

  const { salt, password: hashedPassword } = hashedPasswordWithSalt(password);

  const user = await createUser(
    firstname,
    lastname,
    email,
    hashedPassword,
    salt
  );
  return res.status(201).json({ data: { userId: user.id } });
});

router.post("/login", async (req, res) => {
  const validationResult = await loginPostrequestBodySchema.safeParseAsync(
    req.body
  );

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error });
  }

  const { email, password } = validationResult.data;

  const user = await getUserByEmail(email);

  if (!user) {
    return res
      .status(404)
      .json({ error: `User with email: ${email} does not exists` });
  }

  const { password: hashedPassword } = hashedPasswordWithSalt(
    password,
    user.salt
  );

  if (user.password !== hashedPassword) {
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = await createUserToken({ id: user.id });

  return res.json({ token });
});

export default router;
