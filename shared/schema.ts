import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Export Auth & Chat Models
export * from "./models/auth";
export * from "./models/chat";

// === ARTICLES ===
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  isPremium: boolean("is_premium").default(false),
  pdfUrl: text("pdf_url"),
  generatedByAi: boolean("generated_by_ai").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true });

// === PREMIUM PACKS ===
export const premiumPacks = pgTable("premium_packs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  pdfLimit: integer("pdf_limit"),
  accessType: text("access_type").notNull(),
  features: jsonb("features").$type<string[]>(),
});

export const insertPackSchema = createInsertSchema(premiumPacks).omit({ id: true });

// === PAYMENTS ===
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(), // Changed to varchar
  amount: integer("amount").notNull(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  status: text("status").notNull(),
  packId: integer("pack_id").references(() => premiumPacks.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });

// === ACCESS LOGS ===
export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(), // Changed to varchar
  articleId: integer("article_id").references(() => articles.id).notNull(),
  type: text("type").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({ id: true, timestamp: true });

// === TYPES ===
export type Article = typeof articles.$inferSelect;
export type PremiumPack = typeof premiumPacks.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type AccessLog = typeof accessLogs.$inferSelect;
