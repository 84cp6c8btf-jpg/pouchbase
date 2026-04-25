export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          website_url: string | null;
          logo_url: string | null;
          country_origin: string | null;
          is_active: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          website_url?: string | null;
          logo_url?: string | null;
          country_origin?: string | null;
          is_active?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["brands"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          brand_id: string;
          name: string;
          slug: string;
          line: string;
          flavor: string;
          flavor_family: string;
          nicotine_mg: number;
          format: string;
          pouch_count: number;
          moisture_level: string;
          description: string | null;
          image_url: string | null;
          gtin: string | null;
          source_url: string | null;
          is_active: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          brand_id: string;
          name: string;
          slug: string;
          line: string;
          flavor: string;
          flavor_family: string;
          nicotine_mg: number;
          format: string;
          pouch_count: number;
          moisture_level: string;
          description?: string | null;
          image_url?: string | null;
          gtin?: string | null;
          source_url?: string | null;
          is_active?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_markets: {
        Row: {
          id: string;
          product_id: string;
          market_code: string;
          is_available: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          product_id: string;
          market_code: string;
          is_available?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["product_markets"]["Insert"]>;
        Relationships: [];
      };
      shops: {
        Row: {
          id: string;
          name: string;
          slug: string;
          website_url: string;
          market_code: string;
          affiliate_base_url: string | null;
          is_active: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          website_url: string;
          market_code: string;
          affiliate_base_url?: string | null;
          is_active?: boolean;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["shops"]["Insert"]>;
        Relationships: [];
      };
      prices: {
        Row: {
          id: string;
          product_id: string;
          shop_id: string;
          product_url: string;
          currency: string;
          price_per_can: number;
          price_per_pouch: number;
          in_stock: boolean | null;
          checked_at: Timestamp;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          product_id: string;
          shop_id: string;
          product_url: string;
          currency: string;
          price_per_can: number;
          price_per_pouch: number;
          in_stock?: boolean | null;
          checked_at: Timestamp;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["prices"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          burn_rating: number;
          flavor_accuracy_rating: number;
          nicotine_feel_rating: number;
          comfort_rating: number;
          longevity_rating: number;
          value_rating: number;
          review_text: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          burn_rating: number;
          flavor_accuracy_rating: number;
          nicotine_feel_rating: number;
          comfort_rating: number;
          longevity_rating: number;
          value_rating: number;
          review_text?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
