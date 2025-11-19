import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user.model.js";

export const urlsTable = pgTable("urls", {
  id: uuid().primaryKey().defaultRandom(),
  shortCode: varchar("code", { length: 155 }).notNull().unique(),
  targetURL: text("target-url").notNull(),

  userId: uuid()
    .references(() => usersTable.id)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
