import { db } from "./db";
import {
  users, articles, premiumPacks, payments, accessLogs,
  type User, type InsertUser, type Article, type PremiumPack, type Payment, type AccessLog
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: string): Promise<User | undefined>; // Changed to string
  // getUserByUsername(username: string): Promise<User | undefined>; // Removed as we use email/id
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: string, status: string, credits: number): Promise<User>; // Changed to string
  decrementUserCredits(userId: string): Promise<User>; // Changed to string

  // Articles
  getArticles(category?: string, search?: string): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: typeof articles.$inferInsert): Promise<Article>;
  
  // Packs
  getPacks(): Promise<PremiumPack[]>;
  getPack(id: number): Promise<PremiumPack | undefined>;
  
  // Payments
  createPayment(payment: typeof payments.$inferInsert): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, paymentId: string): Promise<Payment>;
  
  // Logs
  logAccess(log: typeof accessLogs.$inferInsert): Promise<AccessLog>;
}

export class DatabaseStorage implements IStorage {
  // === USER ===
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // async getUserByUsername(username: string): Promise<User | undefined> {
  //   const [user] = await db.select().from(users).where(eq(users.username, username));
  //   return user;
  // }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserSubscription(userId: string, status: string, credits: number): Promise<User> {
    const [user] = await db.update(users)
      .set({ subscriptionStatus: status, premiumCredits: credits })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async decrementUserCredits(userId: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ premiumCredits: sql`${users.premiumCredits} - 1` })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // === ARTICLES ===
  async getArticles(category?: string, search?: string): Promise<Article[]> {
    let query = db.select().from(articles);
    
    if (category) {
      query = query.where(eq(articles.category, category)) as any;
    }
    
    return await query.orderBy(desc(articles.createdAt));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: typeof articles.$inferInsert): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  // === PACKS ===
  async getPacks(): Promise<PremiumPack[]> {
    return await db.select().from(premiumPacks).orderBy(premiumPacks.price);
  }

  async getPack(id: number): Promise<PremiumPack | undefined> {
    const [pack] = await db.select().from(premiumPacks).where(eq(premiumPacks.id, id));
    return pack;
  }

  // === PAYMENTS ===
  async createPayment(payment: typeof payments.$inferInsert): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string, paymentId: string): Promise<Payment> {
    const [updated] = await db.update(payments)
      .set({ status, razorpayPaymentId: paymentId })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // === LOGS ===
  async logAccess(log: typeof accessLogs.$inferInsert): Promise<AccessLog> {
    const [newLog] = await db.insert(accessLogs).values(log).returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
