import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Client-side Supabase client (for browser usage)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role key (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Server-side client for request/response handling
export function createSupabaseServerClient(request: Request) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.headers.get('cookie')?.split(';')
          .find(c => c.trim().startsWith(`${name}=`))
          ?.split('=')[1];
      },
      set(name: string, value: string, options: any) {
        // This will be handled by the response
      },
      remove(name: string, options: any) {
        // This will be handled by the response
      }
    }
  });
}

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'blind_user' | 'volunteer' | 'admin';
          phone_number: string | null;
          location: any | null;
          languages: string[] | null;
          availability: any | null;
          reliability_score: string | null;
          preferences: any | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'blind_user' | 'volunteer' | 'admin';
          phone_number?: string | null;
          location?: any | null;
          languages?: string[] | null;
          availability?: any | null;
          reliability_score?: string | null;
          preferences?: any | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'blind_user' | 'volunteer' | 'admin';
          phone_number?: string | null;
          location?: any | null;
          languages?: string[] | null;
          availability?: any | null;
          reliability_score?: string | null;
          preferences?: any | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      scribe_requests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          exam_type: string | null;
          subject: string | null;
          scheduled_date: string;
          duration: number;
          location: any;
          urgency: string | null;
          status: string | null;
          special_requirements: string | null;
          estimated_difficulty: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          exam_type?: string | null;
          subject?: string | null;
          scheduled_date: string;
          duration: number;
          location: any;
          urgency?: string | null;
          status?: string | null;
          special_requirements?: string | null;
          estimated_difficulty?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          exam_type?: string | null;
          subject?: string | null;
          scheduled_date?: string;
          duration?: number;
          location?: any;
          urgency?: string | null;
          status?: string | null;
          special_requirements?: string | null;
          estimated_difficulty?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      scribe_sessions: {
        Row: {
          id: string;
          request_id: string;
          user_id: string;
          volunteer_id: string;
          status: string | null;
          start_time: string | null;
          end_time: string | null;
          actual_duration: number | null;
          notes: string | null;
          user_rating: number | null;
          volunteer_rating: number | null;
          user_feedback: string | null;
          volunteer_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          user_id: string;
          volunteer_id: string;
          status?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          actual_duration?: number | null;
          notes?: string | null;
          user_rating?: number | null;
          volunteer_rating?: number | null;
          user_feedback?: string | null;
          volunteer_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          user_id?: string;
          volunteer_id?: string;
          status?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          actual_duration?: number | null;
          notes?: string | null;
          user_rating?: number | null;
          volunteer_rating?: number | null;
          user_feedback?: string | null;
          volunteer_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      volunteer_applications: {
        Row: {
          id: string;
          request_id: string;
          volunteer_id: string;
          message: string | null;
          status: string | null;
          match_score: string | null;
          applied_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          volunteer_id: string;
          message?: string | null;
          status?: string | null;
          match_score?: string | null;
          applied_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          volunteer_id?: string;
          message?: string | null;
          status?: string | null;
          match_score?: string | null;
          applied_at?: string;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          message: string;
          response: string;
          context: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          message: string;
          response: string;
          context?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          message?: string;
          response?: string;
          context?: any | null;
          created_at?: string;
        };
      };
    };
  };
}
