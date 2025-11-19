import db from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { eq } from "drizzle-orm";

export async function createURL(shortCode, url, userId) {
  const [result] = await db
    .insert(urlsTable)
    .values({
      shortCode,
      targetURL: url,
      userId: userId,
    })
    .returning({
      id: urlsTable.id,
      shortCode: urlsTable.shortCode,
      targetURL: urlsTable.targetURL,
    });

  return result;
}

export async function loadAllURLs(userId) {
  const codes = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, userId));

  return codes;
}
