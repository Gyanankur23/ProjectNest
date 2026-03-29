import { supabase } from "./db";
import {
  type User, type InsertUser, type Article, type PremiumPack, type Payment, type AccessLog
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSubscription(userId: string, status: string, credits: number): Promise<User>;
  decrementUserCredits(userId: string): Promise<User>;

  getArticles(category?: string, search?: string): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<Article>;
  
  getPacks(): Promise<PremiumPack[]>;
  getPack(id: number): Promise<PremiumPack | undefined>;
  
  createPayment(payment: Pick<Payment, 'userId' | 'amount' | 'razorpayOrderId' | 'status' | 'packId'>): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, paymentId: string): Promise<Payment>;
  
  logAccess(log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<AccessLog>;
}

export class SupabaseStorage implements IStorage {
  // === USER ===
  async getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase.from('users').insert(insertUser).select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateUserSubscription(userId: string, status: string, credits: number): Promise<User> {
    const { data, error } = await supabase.from('users')
      .update({ subscriptionStatus: status, premiumCredits: credits })
      .eq('id', userId)
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  async decrementUserCredits(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const { data, error } = await supabase.from('users')
      .update({ premiumCredits: Math.max(0, (user.premiumCredits || 0) - 1) })
      .eq('id', userId)
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  }

  // === ARTICLES ===
  async getArticles(category?: string, search?: string): Promise<Article[]> {
    let query = supabase.from('articles').select('*').order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    // Simple mock search using ilike
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) {
       console.error(error);
       return [];
    }
    
    return data.map((item: any) => ({
      ...item,
      isPremium: item.is_premium,
      pdfUrl: item.pdf_url,
      generatedByAi: item.generated_by_ai,
      createdAt: new Date(item.created_at)
    }));
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
      ...data,
      isPremium: data.is_premium,
      pdfUrl: data.pdf_url,
      generatedByAi: data.generated_by_ai,
      createdAt: new Date(data.created_at)
    };
  }

  async createArticle(article: Omit<Article, 'id' | 'createdAt'>): Promise<Article> {
    const { data, error } = await supabase.from('articles').insert({
      title: article.title,
      content: article.content,
      category: article.category,
      is_premium: article.isPremium,
      pdf_url: article.pdfUrl,
      generated_by_ai: article.generatedByAi
    }).select().single();
    
    if (error) throw new Error(error.message);
    return {
      ...data,
      isPremium: data.is_premium,
      pdfUrl: data.pdf_url,
      generatedByAi: data.generated_by_ai,
      createdAt: new Date(data.created_at)
    };
  }

  // === PACKS ===
  async getPacks(): Promise<PremiumPack[]> {
    const { data, error } = await supabase.from('premium_packs').select('*').order('price');
    if (error) return [];
    return data.map((item: any) => ({
       ...item,
       pdfLimit: item.pdf_limit,
       accessType: item.access_type
    }));
  }

  async getPack(id: number): Promise<PremiumPack | undefined> {
    const { data, error } = await supabase.from('premium_packs').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
       ...data,
       pdfLimit: data.pdf_limit,
       accessType: data.access_type
    };
  }

  // === PAYMENTS ===
  async createPayment(payment: Pick<Payment, 'userId' | 'amount' | 'razorpayOrderId' | 'status' | 'packId'>): Promise<Payment> {
    const { data, error } = await supabase.from('payments').insert({
       user_id: payment.userId,
       amount: payment.amount,
       razorpay_order_id: payment.razorpayOrderId,
       status: payment.status,
       pack_id: payment.packId
    }).select().single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      userId: data.user_id,
      razorpayOrderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
      packId: data.pack_id,
      createdAt: new Date(data.created_at)
    };
  }

  async updatePaymentStatus(id: number, status: string, paymentId: string): Promise<Payment> {
    const { data, error } = await supabase.from('payments')
      .update({ status, razorpay_payment_id: paymentId })
      .eq('id', id)
      .select().single();
    if (error) throw new Error(error.message);
    return {
      ...data,
      userId: data.user_id,
      razorpayOrderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
      packId: data.pack_id,
      createdAt: new Date(data.created_at)
    };
  }

  // === LOGS ===
  async logAccess(log: Omit<AccessLog, 'id' | 'timestamp'>): Promise<AccessLog> {
    const { data, error } = await supabase.from('access_logs').insert({
       user_id: log.userId,
       article_id: log.articleId,
       type: log.type
    }).select().single();
    if (error) throw new Error(error.message);
    return {
       ...data,
       userId: data.user_id,
       articleId: data.article_id,
       createdAt: new Date(data.timestamp)
    };
  }
}

export const storage = new SupabaseStorage();
