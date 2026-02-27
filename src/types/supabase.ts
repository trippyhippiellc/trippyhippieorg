////////////////////////////////////////////////////////////////////
// SUPABASE DATABASE TYPES — src/types/supabase.ts
//
// These TypeScript types mirror the exact shape of every table
// in your Supabase PostgreSQL database.
//
// HOW TO KEEP THESE UP TO DATE:
//   After adding or modifying tables in Supabase, regenerate with:
//   npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
//
// For now, these are manually written to match the schema we will
// create in supabase/migrations/001_initial_schema.sql
////////////////////////////////////////////////////////////////////

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];


////////////////////////////////////////////////////////////////////
// DATABASE ROOT TYPE
// All tables live under Database["public"]["Tables"]
////////////////////////////////////////////////////////////////////
export interface Database {
  public: {
    Tables: {

      ////////////////////////////////////////////////////////////////
      // PROFILES TABLE
      // Extended user data beyond what Supabase Auth provides.
      // Linked to auth.users via id (UUID foreign key).
      // Created automatically by a Supabase trigger on signup.
      ////////////////////////////////////////////////////////////////
      profiles: {
        Row: {
          id: string;                          // UUID — matches auth.users.id
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          account_status: "pending" | "approved" | "rejected" | "suspended";
          is_admin: boolean;
          is_wholesale_approved: boolean;      // Wholesale access toggle
          is_wholesale: boolean;               // Currently shopping in wholesale mode
          is_affiliate: boolean;               // Has an affiliate account
          affiliate_code: string | null;       // Their unique discount code
          affiliate_earnings: number;          // Accrued unpaid earnings (cents)
          id_verified: boolean;                // Has uploaded + passed ID check
          id_document_url: string | null;      // Supabase Storage URL of ID doc
          selected_state: string | null;       // 2-letter state code they selected
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          account_status?: "pending" | "approved" | "rejected" | "suspended";
          is_admin?: boolean;
          is_wholesale_approved?: boolean;
          is_wholesale?: boolean;
          is_affiliate?: boolean;
          affiliate_code?: string | null;
          affiliate_earnings?: number;
          id_verified?: boolean;
          id_document_url?: string | null;
          selected_state?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // PRODUCTS TABLE
      // Every product sold on the site — retail and wholesale.
      ////////////////////////////////////////////////////////////////
      products: {
        Row: {
          id: string;                          // UUID
          name: string;
          slug: string;                        // URL-safe name: "blue-dream-thca"
          description: string | null;
          category: "flower" | "vape" | "edible" | "accessory" | "other";
          subcategory: string | null;          // e.g., "pre-roll", "disposable"
          strain_type: "sativa" | "indica" | "hybrid" | null;
          thca_percentage: number | null;      // e.g., 22.5 for 22.5%
          price_retail: number;                // Price in cents (e.g., 2500 = $25.00)
          price_wholesale: number;             // Wholesale price in cents
          price_compare: number | null;        // Original price (for sale display)
          stock_quantity: number;
          is_active: boolean;                  // Visible on site
          is_featured: boolean;                // Show in featured section
          images: string[];                    // Array of Supabase Storage URLs
          video_url: string | null;            // Product video URL
          model_url: string | null;            // 3D model URL (.glb)
          weight_grams: number | null;
          tags: string[];                      // ["hemp", "thca", "indoor"]
          allowed_states: string[] | null;     // null = all states, or ["TX","FL"]
          bulk_tiers: Json | null;             // See BulkTier type below
          average_rating: number;              // Computed from reviews (0–5)
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category: "flower" | "vape" | "edible" | "accessory" | "other";
          subcategory?: string | null;
          strain_type?: "sativa" | "indica" | "hybrid" | null;
          thca_percentage?: number | null;
          price_retail: number;
          price_wholesale: number;
          price_compare?: number | null;
          stock_quantity?: number;
          is_active?: boolean;
          is_featured?: boolean;
          images?: string[];
          video_url?: string | null;
          model_url?: string | null;
          weight_grams?: number | null;
          tags?: string[];
          allowed_states?: string[] | null;
          bulk_tiers?: Json | null;
          average_rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // ORDERS TABLE
      // Every completed and pending order.
      ////////////////////////////////////////////////////////////////
      orders: {
        Row: {
          id: string;                          // UUID
          order_number: string;                // Human-readable: TH-20240101-0001
          user_id: string;                     // FK → profiles.id
          status: "processing" | "pending" | "shipped" | "completed" | "cancelled" | "refunded";
          payment_method: "stripe" | "crypto" | "cashapp" | "wire";
          payment_status: "unpaid" | "paid" | "failed" | "refunded";
          payment_intent_id: string | null;    // Stripe payment intent ID
          crypto_invoice_id: string | null;    // NOWPayments invoice ID
          is_wholesale: boolean;               // Was this a wholesale order?
          subtotal: number;                    // Before discounts, in cents
          discount_amount: number;             // Coupon discount in cents
          coupon_code: string | null;          // Applied coupon code
          affiliate_id: string | null;         // FK → profiles.id of affiliate
          affiliate_commission: number;        // 10% of subtotal in cents
          shipping_cost: number;
          tax_amount: number;
          total: number;                       // Final charged amount in cents
          shipping_address: Json;              // Full address object
          items: Json;                         // Array of OrderItem
          notes: string | null;                // Customer or admin notes
          tracking_number: string | null;
          shipped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id: string;
          status?: "processing" | "pending" | "shipped" | "completed" | "cancelled" | "refunded";
          payment_method: "stripe" | "crypto" | "cashapp" | "wire";
          payment_status?: "unpaid" | "paid" | "failed" | "refunded";
          payment_intent_id?: string | null;
          crypto_invoice_id?: string | null;
          is_wholesale?: boolean;
          subtotal: number;
          discount_amount?: number;
          coupon_code?: string | null;
          affiliate_id?: string | null;
          affiliate_commission?: number;
          shipping_cost?: number;
          tax_amount?: number;
          total: number;
          shipping_address: Json;
          items: Json;
          notes?: string | null;
          tracking_number?: string | null;
          shipped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // REVIEWS TABLE
      // Customer product reviews with star ratings.
      ////////////////////////////////////////////////////////////////
      reviews: {
        Row: {
          id: string;
          product_id: string;                  // FK → products.id
          user_id: string;                     // FK → profiles.id
          rating: number;                      // 1–5
          title: string | null;
          body: string | null;
          is_approved: boolean;                // Admin approves before showing
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          title?: string | null;
          body?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // WHOLESALE APPLICATIONS TABLE
      ////////////////////////////////////////////////////////////////
      wholesale_applications: {
        Row: {
          id: string;
          user_id: string;                     // FK → profiles.id
          business_name: string;
          business_type: string;
          ein_number: string | null;
          estimated_monthly_volume: string;
          years_in_business: string;
          website_url: string | null;
          business_references: string | null;
          reason: string;
          status: "pending" | "approved" | "rejected";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_type: string;
          ein_number?: string | null;
          estimated_monthly_volume: string;
          years_in_business: string;
          website_url?: string | null;
          business_references?: string | null;
          reason: string;
          status?: "pending" | "approved" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wholesale_applications"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // AFFILIATE APPLICATIONS TABLE
      ////////////////////////////////////////////////////////////////
      affiliate_applications: {
        Row: {
          id: string;
          user_id: string;                     // FK → profiles.id
          full_name: string;
          platform: string;                    // Instagram, TikTok, etc.
          handle: string;
          follower_count: string;
          content_type: string;
          promotion_plan: string;
          agreed_to_terms: boolean;
          status: "pending" | "approved" | "rejected";
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          platform: string;
          handle: string;
          follower_count: string;
          content_type: string;
          promotion_plan: string;
          agreed_to_terms: boolean;
          status?: "pending" | "approved" | "rejected";
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["affiliate_applications"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // STATE LAWS TABLE
      // Controls which products show in which states.
      ////////////////////////////////////////////////////////////////
      state_laws: {
        Row: {
          state_code: string;                  // "TX", "FL", etc.
          state_name: string;
          allows_thca_flower: boolean;
          allows_vapes: boolean;
          allows_edibles: boolean;
          allows_accessories: boolean;
          shipping_allowed: boolean;           // Can we ship here at all?
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          state_code: string;
          state_name: string;
          allows_thca_flower?: boolean;
          allows_vapes?: boolean;
          allows_edibles?: boolean;
          allows_accessories?: boolean;
          shipping_allowed?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["state_laws"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // BLOG POSTS TABLE
      ////////////////////////////////////////////////////////////////
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          content: string;                     // HTML or Markdown
          cover_image_url: string | null;
          author_id: string;                   // FK → profiles.id
          is_published: boolean;
          published_at: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt?: string | null;
          content: string;
          cover_image_url?: string | null;
          author_id: string;
          is_published?: boolean;
          published_at?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // COMMUNITY THREADS TABLE
      ////////////////////////////////////////////////////////////////
      community_threads: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          category: string;
          reply_count: number;
          is_pinned: boolean;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          category?: string;
          reply_count?: number;
          is_pinned?: boolean;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_threads"]["Insert"]>;
      };

      ////////////////////////////////////////////////////////////////
      // COMMUNITY REPLIES TABLE
      ////////////////////////////////////////////////////////////////
      community_replies: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_replies"]["Insert"]>;
      };

    };

    ////////////////////////////////////////////////////////////////
    // VIEWS (read-only computed tables)
    // Add view types here as you create them in Supabase
    ////////////////////////////////////////////////////////////////
    Views: {
      [_ in never]: never;
    };

    ////////////////////////////////////////////////////////////////
    // FUNCTIONS (RPC calls)
    // Add function signatures here as you create them
    ////////////////////////////////////////////////////////////////
    Functions: {
      increment_affiliate_earnings: {
        Args: { affiliate_id: string; amount: number };
        Returns: void;
      };
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };

    ////////////////////////////////////////////////////////////////
    // ENUMS
    ////////////////////////////////////////////////////////////////
    Enums: {
      account_status: "pending" | "approved" | "rejected" | "suspended";
      order_status: "processing" | "pending" | "shipped" | "completed" | "cancelled" | "refunded";
      payment_method: "stripe" | "crypto" | "cashapp" | "wire";
      product_category: "flower" | "vape" | "edible" | "accessory" | "other";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}


////////////////////////////////////////////////////////////////////
// HELPER TYPES
// Shorthand types used throughout the app for cleaner code
////////////////////////////////////////////////////////////////////

// Row types — what you get back from a SELECT
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type WholesaleApplication = Database["public"]["Tables"]["wholesale_applications"]["Row"];
export type AffiliateApplication = Database["public"]["Tables"]["affiliate_applications"]["Row"];
export type StateLaw = Database["public"]["Tables"]["state_laws"]["Row"];
export type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
export type CommunityThread = Database["public"]["Tables"]["community_threads"]["Row"];
export type CommunityReply = Database["public"]["Tables"]["community_replies"]["Row"];

// Insert types — what you pass to INSERT
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];

// Update types — what you pass to UPDATE
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];


////////////////////////////////////////////////////////////////////
// NESTED TYPES
// Complex JSON fields stored in database columns
////////////////////////////////////////////////////////////////////

// Bulk pricing tier (stored in products.bulk_tiers as JSON array)
export interface BulkTier {
  quantity: number;       // Minimum quantity to trigger this tier
  discount_percent: number; // Discount off the unit price (e.g., 10 = 10% off)
  label: string;          // Display label: "Buy 2, Save 10%"
}

// Order line item (stored in orders.items as JSON array)
export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: number;     // Price per unit in cents at time of order
  bulk_discount: number;  // Discount applied in cents
  total: number;          // quantity * unit_price - bulk_discount
}

// Shipping address (stored in orders.shipping_address as JSON)
export interface ShippingAddress {
  full_name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;          // 2-letter state code
  zip: string;
  country: string;        // "US"
  phone: string;
}
