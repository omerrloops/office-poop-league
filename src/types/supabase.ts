export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string
          emoji: string
          id: string
          name: string
        }
        Insert: {
          description: string
          emoji: string
          id?: string
          name: string
        }
        Update: {
          description?: string
          emoji?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      poop_chat: {
        Row: {
          id: string
          user_id: string
          user_name: string
          user_avatar: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          user_avatar: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          user_avatar?: string
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poop_chat_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_reactions: {
        Row: {
          user_id: string
          reaction: string
          created_at: string
        }
        Insert: {
          user_id: string
          reaction: string
          created_at?: string
        }
        Update: {
          user_id?: string
          reaction?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      poop_sessions: {
        Row: {
          created_at: string
          duration: number
          end_time: string
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number
          end_time?: string
          id?: string
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          end_time?: string
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poop_sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar: string
          id: string
          name: string
          total_time_weekly: number
        }
        Insert: {
          avatar: string
          id: string
          name: string
          total_time_weekly?: number
        }
        Update: {
          avatar?: string
          id?: string
          name?: string
          total_time_weekly?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 