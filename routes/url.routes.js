import express from "express";
import { shortenPostRequestBodySchema } from "../validation/request.validation.js";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm"; // Fixed: added 'and' import

import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { ensureAuthenticated } from "../middlewares/auth.middleware.js";
import { createURL, loadAllURLs } from "../services/url.service.js";

const router = express.Router();

router.post("/shorten", ensureAuthenticated, async (req, res) => {
  const validationResult = await shortenPostRequestBodySchema.safeParseAsync(
    req.body
  );

  if (validationResult.error) {
    return res.status(400).json({ error: validationResult.error.message });
  }

  const { url, code } = validationResult.data;

  const shortCode = code ?? nanoid(6);

  try {
    const result = await createURL(shortCode, url, req.user.id);

    return res.status(201).json({
      id: result.id,
      shortCode: result.shortCode,
      targetURL: result.targetURL,
    });
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({ error: "Failed to create short URL" });
  }
});

router.get("/codes", ensureAuthenticated, async (req, res) => {
  try {
    const codes = await loadAllURLs(req.user.id);
    return res.json({ codes: codes });
  } catch (error) {
    console.error("Error loading URLs:", error);
    return res.status(500).json({ error: "Failed to load URLs" });
  }
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  const id = req.params.id;

  try {
    await db
      .delete(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

    return res.status(200).json({
      deleted: true,
    });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return res.status(500).json({ error: "Failed to delete URL" });
  }
});

router.get("/:shortcode", async (req, res) => {
  const code = req.params.shortcode;

  try {
    const [result] = await db
      .select({
        targetURL: urlsTable.targetURL,
      })
      .from(urlsTable)
      .where(eq(urlsTable.shortCode, code));

    if (!result) {
      return res.status(404).json({ error: "Invalid url" });
    }

    return res.redirect(result.targetURL);
  } catch (error) {
    console.error("Error fetching URL:", error);
    return res.status(500).json({ error: "Failed to fetch URL" });
  }
});

export default router;
