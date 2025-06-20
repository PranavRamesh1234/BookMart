import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          location: string | null
          bio: string | null
          created_at: string
          updated_at: string
          settings: {
            email_notifications: boolean
            show_phone: boolean
            show_email: boolean
            show_location: boolean
          }
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          location?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          settings?: {
            email_notifications: boolean
            show_phone: boolean
            show_email: boolean
            show_location: boolean
          }
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          location?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          settings?: {
            email_notifications: boolean
            show_phone: boolean
            show_email: boolean
            show_location: boolean
          }
        }
      }
      books: {
        Row: {
          id: string
          seller_id: string
          title: string
          author: string
          description: string | null
          condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          price: number | null
          price_type: 'fixed' | 'negotiable' | 'price_on_call'
          genre: string | null
          year_published: number | null
          language: string | null
          images: string[]
          location: string
          latitude: number
          longitude: number
          seller_contact_phone: string | null
          seller_contact_email: string
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          author: string
          description?: string | null
          condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          price?: number | null
          price_type: 'fixed' | 'negotiable' | 'price_on_call'
          genre?: string | null
          year_published?: number | null
          language?: string | null
          images?: string[]
          location: string
          latitude: number
          longitude: number
          seller_contact_phone?: string | null
          seller_contact_email: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          author?: string
          description?: string | null
          condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
          price?: number | null
          price_type?: 'fixed' | 'negotiable' | 'price_on_call'
          genre?: string | null
          year_published?: number | null
          language?: string | null
          images?: string[]
          location?: string
          latitude?: number
          longitude?: number
          seller_contact_phone?: string | null
          seller_contact_email?: string
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      book_requests: {
        Row: {
          id: string
          requester_id: string
          title: string
          author: string | null
          description: string | null
          max_price: number | null
          preferred_condition: string | null
          location: string
          latitude: number
          longitude: number
          contact_phone: string | null
          contact_email: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          title: string
          author?: string | null
          description?: string | null
          max_price?: number | null
          preferred_condition?: string | null
          location: string
          latitude: number
          longitude: number
          contact_phone?: string | null
          contact_email: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          title?: string
          author?: string | null
          description?: string | null
          max_price?: number | null
          preferred_condition?: string | null
          location?: string
          latitude?: number
          longitude?: number
          contact_phone?: string | null
          contact_email?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}