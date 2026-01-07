import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db"; // Added db import
import { api } from "@shared/routes";
import { premiumPacks } from "@shared/schema"; // Added premiumPacks import
import { setupAuth } from "./replit_integrations/auth"; // Replit Auth will create this
import Razorpay from "razorpay";
import { getGeminiResponse } from "./lib/gemini"; // We'll create this helper
import crypto from "crypto";
import { z } from "zod";

// Initialize Razorpay (mock if keys missing for dev)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_SECRET || "secret_placeholder",
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  setupAuth(app);

  // === ARTICLES ===
  app.get(api.articles.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const articles = await storage.getArticles(category, search);
    res.json(articles);
  });

  app.get(api.articles.get.path, async (req, res) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  });

  app.post(api.articles.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    // In real app, check isAdmin
    try {
      const input = api.articles.create.input.parse(req.body);
      const article = await storage.createArticle(input);
      res.status(201).json(article);
    } catch (e) {
      res.status(400).json({ message: "Validation failed" });
    }
  });

  // AI Generation Endpoint
  app.post(api.articles.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const { topic, category } = req.body;
      const prompt = `Write a comprehensive project management article about "${topic}" in the category "${category}". Format as Markdown.`;
      
      const content = await getGeminiResponse(prompt);
      
      // Save to DB
      const article = await storage.createArticle({
        title: topic,
        content: content || "AI Generation Failed",
        category,
        isPremium: true, // Default to premium for AI content
        generatedByAi: true,
        pdfUrl: null, // Would generate PDF here in real app
      });
      
      res.status(201).json(article);
    } catch (e: any) {
      console.error("AI Gen Error:", e);
      res.status(500).json({ message: e.message || "Internal Server Error" });
    }
  });

  // === PACKS ===
  app.get(api.packs.list.path, async (req, res) => {
    const packs = await storage.getPacks();
    res.json(packs);
  });

  // === PAYMENTS ===
  app.post(api.payments.createOrder.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    
    const { packId } = req.body;
    const pack = await storage.getPack(packId);
    if (!pack) return res.status(404).json({ message: "Pack not found" });

    try {
      const options = {
        amount: pack.price * 100, // amount in paisa
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };
      
      const order = await razorpay.orders.create(options);
      
      // Create pending payment record
      await storage.createPayment({
        userId: req.user!.id,
        amount: pack.price,
        razorpayOrderId: order.id,
        status: "pending",
        packId: pack.id,
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY || "rzp_test_placeholder",
      });
    } catch (error: any) {
      console.error("Razorpay Error:", error);
      res.status(500).json({ message: "Payment initialization failed" });
    }
  });

  app.post(api.payments.verify.path, async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "secret_placeholder")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find payment by order ID
      // Simplified: Just verifying and updating subscription
      if (!req.user) return res.status(401).send("Unauthorized");

      const pack = await storage.getPack(packId);
      if (pack) {
        let credits = req.user.premiumCredits || 0;
        let status = req.user.subscriptionStatus || "free";
        
        if (pack.accessType === "lifetime") {
          status = "lifetime";
          credits = 999999;
        } else {
          status = "premium";
          credits += (pack.pdfLimit || 0);
        }

        await storage.updateUserSubscription(req.user.id, status, credits);
        // Also update payment record status to 'completed' (omitted for brevity)
      }

      res.json({ success: true });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  });

  // === USER ===
  app.get(api.user.me.path, (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    res.json(req.user);
  });

  app.post(api.user.downloadPdf.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Login required" });
    
    const articleId = Number(req.params.id);
    const article = await storage.getArticle(articleId);
    
    if (!article) return res.status(404).json({ message: "Article not found" });
    
    if (article.isPremium) {
      if (req.user.subscriptionStatus !== "lifetime" && (req.user.premiumCredits || 0) <= 0) {
        return res.status(403).json({ message: "No credits remaining" });
      }
      
      // Deduct credit if not lifetime
      if (req.user.subscriptionStatus !== "lifetime") {
        await storage.decrementUserCredits(req.user.id);
      }
    }

    // Log access
    await storage.logAccess({
      userId: req.user.id,
      articleId,
      type: "pdf_download",
    });

    // In a real app, we'd generate/serve the PDF file here.
    // For now, return a placeholder or the stored URL
    res.json({ url: article.pdfUrl || "#" });
  });

  // Seed Data
  await seed();

  return httpServer;
}

async function seed() {
  const packs = await storage.getPacks();
  if (packs.length === 0) {
    // Seed Packs
    const seedPacks = [
      { name: "Basic Pack", price: 199, pdfLimit: 1, accessType: "limited_pdfs", features: ["1 PDF Download"] },
      { name: "Standard Pack", price: 349, pdfLimit: 2, accessType: "limited_pdfs", features: ["2 PDF Downloads"] },
      { name: "Pro Pack", price: 499, pdfLimit: 5, accessType: "limited_pdfs", features: ["5 PDF Downloads"] },
      { name: "Power Pack", price: 899, pdfLimit: 10, accessType: "limited_pdfs", features: ["10 PDF Downloads"] },
      { name: "Lifetime Access", price: 1999, pdfLimit: null, accessType: "lifetime", features: ["Unlimited PDF Downloads", "Lifetime Access"] },
    ];
    
    for (const p of seedPacks) {
      await db.insert(premiumPacks).values(p);
    }
  }

  const arts = await storage.getArticles();
  if (arts.length === 0) {
    // Seed Articles
    await storage.createArticle({
      title: "10 Agile Best Practices",
      content: "# 10 Agile Best Practices\n\n1. Standups\n2. Sprints...",
      category: "Agile",
      isPremium: false,
      generatedByAi: false,
    });
    await storage.createArticle({
      title: "Risk Management Strategies 2024",
      content: "# Risk Management\n\nIdentifying risks is key...",
      category: "Risk",
      isPremium: true,
      generatedByAi: true,
    });
  }
}
