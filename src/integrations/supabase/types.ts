export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string | null
          admin_email: string | null
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target: string | null
        }
        Insert: {
          action?: string | null
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target?: string | null
        }
        Update: {
          action?: string | null
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target?: string | null
        }
        Relationships: []
      }
      broadcast_notifications: {
        Row: {
          active: boolean | null
          broadcast_date: string | null
          created_at: string | null
          department: string | null
          id: string
          is_archived: boolean | null
          label: string | null
          message: string | null
          title: string | null
        }
        Insert: {
          active?: boolean | null
          broadcast_date?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_archived?: boolean | null
          label?: string | null
          message?: string | null
          title?: string | null
        }
        Update: {
          active?: boolean | null
          broadcast_date?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          is_archived?: boolean | null
          label?: string | null
          message?: string | null
          title?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      deposit_requests: {
        Row: {
          amount: number | null
          createdAt: string | null
          id: string
          remark: string | null
          resellerDocId: string | null
          screenshot: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          createdAt?: string | null
          id?: string
          remark?: string | null
          resellerDocId?: string | null
          screenshot?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          createdAt?: string | null
          id?: string
          remark?: string | null
          resellerDocId?: string | null
          screenshot?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deposit_requests_resellerDocId_fkey"
            columns: ["resellerDocId"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          adjustedprice: number | null
          cost: number | null
          created_at: string | null
          id: string
          image: string | null
          name: string | null
          order_id: string | null
          price: number | null
          price_at_time: number | null
          product_id: string | null
          qty: number | null
          quantity: number | null
        }
        Insert: {
          adjustedprice?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string | null
          order_id?: string | null
          price?: number | null
          price_at_time?: number | null
          product_id?: string | null
          qty?: number | null
          quantity?: number | null
        }
        Update: {
          adjustedprice?: number | null
          cost?: number | null
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string | null
          order_id?: string | null
          price?: number | null
          price_at_time?: number | null
          product_id?: string | null
          qty?: number | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_username: string | null
          completed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customername: string | null
          focused: boolean | null
          human_reseller_id: string | null
          id: string
          items_count: number | null
          member_of_admin_id: string | null
          order_items: Json | null
          order_number: string | null
          orderid: string | null
          picked_up_at: string | null
          products_count: number | null
          profile_name: string | null
          profilename: string | null
          profit: number | null
          profits: number | null
          referral_id: string | null
          referred_by_staff_id: string | null
          reseller_id: string | null
          reseller_name: string | null
          resellername: string | null
          resellernumericid: number | null
          service_cost: number | null
          shipping: number | null
          shipping_address: string | null
          staff_username: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total_amount: number | null
          total_cost: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_username?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customername?: string | null
          focused?: boolean | null
          human_reseller_id?: string | null
          id: string
          items_count?: number | null
          member_of_admin_id?: string | null
          order_items?: Json | null
          order_number?: string | null
          orderid?: string | null
          picked_up_at?: string | null
          products_count?: number | null
          profile_name?: string | null
          profilename?: string | null
          profit?: number | null
          profits?: number | null
          referral_id?: string | null
          referred_by_staff_id?: string | null
          reseller_id?: string | null
          reseller_name?: string | null
          resellername?: string | null
          resellernumericid?: number | null
          service_cost?: number | null
          shipping?: number | null
          shipping_address?: string | null
          staff_username?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total_amount?: number | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_username?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customername?: string | null
          focused?: boolean | null
          human_reseller_id?: string | null
          id?: string
          items_count?: number | null
          member_of_admin_id?: string | null
          order_items?: Json | null
          order_number?: string | null
          orderid?: string | null
          picked_up_at?: string | null
          products_count?: number | null
          profile_name?: string | null
          profilename?: string | null
          profit?: number | null
          profits?: number | null
          referral_id?: string | null
          referred_by_staff_id?: string | null
          reseller_id?: string | null
          reseller_name?: string | null
          resellername?: string | null
          resellernumericid?: number | null
          service_cost?: number | null
          shipping?: number | null
          shipping_address?: string | null
          staff_username?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total_amount?: number | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          in_stock: boolean | null
          name: string | null
          original_price: number | null
          price: number | null
          rating: number | null
          seller: string | null
          sku: string | null
          specifications: Json | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          badge?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          image?: string | null
          in_stock?: boolean | null
          name?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          seller?: string | null
          sku?: string | null
          specifications?: Json | null
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          badge?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          name?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          seller?: string | null
          sku?: string | null
          specifications?: Json | null
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reseller_chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          sender: string | null
          session_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          sender?: string | null
          session_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          sender?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reseller_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "reseller_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_chat_sessions: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          id: string
          is_online: boolean | null
          is_pinned: boolean | null
          last_message_at: string | null
          reseller_id: string | null
          reseller_name: string | null
          unread_count: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          is_online?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          reseller_id?: string | null
          reseller_name?: string | null
          unread_count?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          is_online?: boolean | null
          is_pinned?: boolean | null
          last_message_at?: string | null
          reseller_id?: string | null
          reseller_name?: string | null
          unread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reseller_chat_sessions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_notifications: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          read: boolean | null
          reseller_id: string | null
          title: string | null
          type: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          reseller_id?: string | null
          title?: string | null
          type?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          reseller_id?: string | null
          title?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reseller_notifications_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_product_selection: {
        Row: {
          created_at: string | null
          product_id: string
          reseller_id: string
        }
        Insert: {
          created_at?: string | null
          product_id: string
          reseller_id: string
        }
        Update: {
          created_at?: string | null
          product_id?: string
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_product_selection_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_product_selection_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_profiles: {
        Row: {
          balance: number | null
          bank_info: string | null
          created_at: string | null
          credit_score: number | null
          email: string | null
          fcm_tokens: string[] | null
          first_name: string | null
          id: string
          last_name: string | null
          last_token_update: string | null
          level: string | null
          member_of_admin_id: string | null
          payment_method: string | null
          pending_balance: number | null
          product_limit: number | null
          referral_code: string | null
          referral_id: string | null
          referred_by_staff_id: string | null
          registration_date: string | null
          reseller_id: number | null
          shop_name: string | null
          shop_slug: string | null
          star_rating: number | null
          total_deposits: number | null
          total_earnings: number | null
          total_orders: number | null
          total_withdrawals: number | null
          unpicked_balance: number | null
          updated_at: string | null
          usdc_address: string | null
          verified: boolean | null
        }
        Insert: {
          balance?: number | null
          bank_info?: string | null
          created_at?: string | null
          credit_score?: number | null
          email?: string | null
          fcm_tokens?: string[] | null
          first_name?: string | null
          id: string
          last_name?: string | null
          last_token_update?: string | null
          level?: string | null
          member_of_admin_id?: string | null
          payment_method?: string | null
          pending_balance?: number | null
          product_limit?: number | null
          referral_code?: string | null
          referral_id?: string | null
          referred_by_staff_id?: string | null
          registration_date?: string | null
          reseller_id?: number | null
          shop_name?: string | null
          shop_slug?: string | null
          star_rating?: number | null
          total_deposits?: number | null
          total_earnings?: number | null
          total_orders?: number | null
          total_withdrawals?: number | null
          unpicked_balance?: number | null
          updated_at?: string | null
          usdc_address?: string | null
          verified?: boolean | null
        }
        Update: {
          balance?: number | null
          bank_info?: string | null
          created_at?: string | null
          credit_score?: number | null
          email?: string | null
          fcm_tokens?: string[] | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_token_update?: string | null
          level?: string | null
          member_of_admin_id?: string | null
          payment_method?: string | null
          pending_balance?: number | null
          product_limit?: number | null
          referral_code?: string | null
          referral_id?: string | null
          referred_by_staff_id?: string | null
          registration_date?: string | null
          reseller_id?: number | null
          shop_name?: string | null
          shop_slug?: string | null
          star_rating?: number | null
          total_deposits?: number | null
          total_earnings?: number | null
          total_orders?: number | null
          total_withdrawals?: number | null
          unpicked_balance?: number | null
          updated_at?: string | null
          usdc_address?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reseller_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_profiles_member_of_admin_id_fkey"
            columns: ["member_of_admin_id"]
            isOneToOne: false
            referencedRelation: "sla_admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_profiles_referred_by_staff_id_fkey"
            columns: ["referred_by_staff_id"]
            isOneToOne: false
            referencedRelation: "sla_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_shops: {
        Row: {
          created_at: string | null
          credit_score: number | null
          id: string
          is_suspended: boolean | null
          level: string | null
          product_limit: number | null
          reseller_id: number | null
          shop_name: string | null
          shop_slug: string | null
          star_rating: number | null
        }
        Insert: {
          created_at?: string | null
          credit_score?: number | null
          id: string
          is_suspended?: boolean | null
          level?: string | null
          product_limit?: number | null
          reseller_id?: number | null
          shop_name?: string | null
          shop_slug?: string | null
          star_rating?: number | null
        }
        Update: {
          created_at?: string | null
          credit_score?: number | null
          id?: string
          is_suspended?: boolean | null
          level?: string | null
          product_limit?: number | null
          reseller_id?: number | null
          shop_name?: string | null
          shop_slug?: string | null
          star_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "retail_shops_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string | null
          rating: number | null
          user_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          user_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_themes: {
        Row: {
          banner_message: string | null
          created_at: string | null
          cta_label: string | null
          cta_path: string | null
          decorations: Json | null
          id: string
          is_active: boolean | null
          name: string | null
          show_on_reseller: boolean
          show_on_storefront: boolean
          slug: string | null
          template: string
          updated_at: string
        }
        Insert: {
          banner_message?: string | null
          created_at?: string | null
          cta_label?: string | null
          cta_path?: string | null
          decorations?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          show_on_reseller?: boolean
          show_on_storefront?: boolean
          slug?: string | null
          template?: string
          updated_at?: string
        }
        Update: {
          banner_message?: string | null
          created_at?: string | null
          cta_label?: string | null
          cta_path?: string | null
          decorations?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          show_on_reseller?: boolean
          show_on_storefront?: boolean
          slug?: string | null
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
      sla_admins: {
        Row: {
          account_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          permissions: string[] | null
          phone: string | null
          status: string | null
        }
        Insert: {
          account_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          permissions?: string[] | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          account_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          permissions?: string[] | null
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      sla_staff: {
        Row: {
          created_at: string | null
          created_by_admin_id: string | null
          department: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          referral_id: string | null
          staff_id: string | null
          status: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_admin_id?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          referral_id?: string | null
          staff_id?: string | null
          status?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_admin_id?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          referral_id?: string | null
          staff_id?: string | null
          status?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_staff_created_by_admin_id_fkey"
            columns: ["created_by_admin_id"]
            isOneToOne: false
            referencedRelation: "sla_admins"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          sender: string | null
          session_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          sender?: string | null
          session_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          sender?: string | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "support_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_sessions: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string
          is_online: boolean | null
          last_message_at: string | null
          reseller_id: string | null
          unread_count: number | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          is_online?: boolean | null
          last_message_at?: string | null
          reseller_id?: string | null
          unread_count?: number | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          is_online?: boolean | null
          last_message_at?: string | null
          reseller_id?: string | null
          unread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "support_sessions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          key: string | null
          label: string | null
          value: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          key?: string | null
          label?: string | null
          value?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          key?: string | null
          label?: string | null
          value?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      virtual_customer_profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_info: string | null
          amount: number | null
          createdAt: string | null
          id: string
          method: string | null
          remark: string | null
          resellerDocId: string | null
          status: string | null
        }
        Insert: {
          account_info?: string | null
          amount?: number | null
          createdAt?: string | null
          id?: string
          method?: string | null
          remark?: string | null
          resellerDocId?: string | null
          status?: string | null
        }
        Update: {
          account_info?: string | null
          amount?: number | null
          createdAt?: string | null
          id?: string
          method?: string | null
          remark?: string | null
          resellerDocId?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_resellerDocId_fkey"
            columns: ["resellerDocId"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_sla_user: { Args: { user_id: string }; Returns: boolean }
      is_staff: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
