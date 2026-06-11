// src/types/database.ts
// TypeScript types that exactly match your Supabase schema.
// These let you get autocomplete when querying the database.

export type UserRole      = 'student' | 'teacher' | 'admin'
export type TeacherStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type LessonStatus  = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'
export type PaymentMethod = 'stripe' | 'jazzcash' | 'wallet'
export type CourseType    = 'noorani_qaida' | 'tajweed' | 'hifz' | 'tafseer' | 'islamic_studies' | 'ijazah'

// ── Row types (what you get back from SELECT) ────────────────

export interface Profile {
  id:         string
  role:       UserRole
  first_name: string
  last_name:  string
  email:      string
  phone:      string | null
  country:    string | null
  timezone:   string
  avatar_url: string | null
  bio:        string | null
  is_active:  boolean
  created_at: string
  updated_at: string
}

export interface TeacherProfile {
  id:                  string
  user_id:             string
  status:              TeacherStatus
  ijazah_verified:     boolean
  ijazah_document_url: string | null
  years_experience:    number
  specializations:     CourseType[]
  teaching_languages:  string[]
  hourly_rate_usd:     number
  trial_rate_usd:      number
  max_students:        number
  available_days:      string[]
  available_times:     Record<string, string[]>
  total_lessons:       number
  avg_rating:          number | null
  total_reviews:       number
  daily_room_name:     string | null
  created_at:          string
  updated_at:          string
}

export interface Course {
  id:              string
  teacher_id:      string
  course_type:     CourseType
  title:           string
  description:     string | null
  level:           string
  age_group:       string
  duration_mins:   number
  price_usd:       number
  trial_price_usd: number
  max_students:    number
  is_active:       boolean
  created_at:      string
  updated_at:      string
}

export interface Booking {
  id:             string
  student_id:     string
  teacher_id:     string
  course_id:      string
  status:         BookingStatus
  start_date:     string
  recurrence:     string
  session_time:   string
  duration_mins:  number
  price_usd:      number
  is_trial:       boolean
  student_notes:  string | null
  teacher_notes:  string | null
  cancel_reason:  string | null
  cancelled_by:   string | null
  created_at:     string
  updated_at:     string
}

export interface Lesson {
  id:               string
  booking_id:       string
  student_id:       string
  teacher_id:       string
  status:           LessonStatus
  scheduled_at:     string
  started_at:       string | null
  ended_at:         string | null
  duration_mins:    number
  daily_room_url:   string | null
  daily_session_id: string | null
  teacher_notes:    string | null
  homework:         string | null
  surahs_covered:   string[]
  created_at:       string
  updated_at:       string
}

export interface Review {
  id:           string
  lesson_id:    string
  booking_id:   string
  student_id:   string
  teacher_id:   string
  rating:       number
  title:        string | null
  body:         string | null
  is_published: boolean
  created_at:   string
}

export interface Payment {
  id:                        string
  booking_id:                string
  student_id:                string
  teacher_id:                string
  status:                    PaymentStatus
  method:                    PaymentMethod
  gross_amount_usd:          number
  platform_fee_usd:          number
  teacher_payout_usd:        number
  stripe_payment_intent_id:  string | null
  jazzcash_transaction_id:   string | null
  gateway_response:          Record<string, unknown>
  refunded_at:               string | null
  refund_reason:             string | null
  created_at:                string
  updated_at:                string
}

// ── View types ───────────────────────────────────────────────

export interface PublicTeacher {
  id:                 string
  first_name:         string
  last_name:          string
  country:            string | null
  avatar_url:         string | null
  bio:                string | null
  specializations:    CourseType[]
  teaching_languages: string[]
  hourly_rate_usd:    number
  trial_rate_usd:     number
  avg_rating:         number | null
  total_reviews:      number
  total_lessons:      number
  ijazah_verified:    boolean
  years_experience:   number
}

export interface StudentBookingView {
  booking_id:          string
  booking_status:      BookingStatus
  start_date:          string
  session_time:        string
  recurrence:          string
  price_usd:           number
  is_trial:            boolean
  course_title:        string
  course_type:         CourseType
  teacher_first_name:  string
  teacher_last_name:   string
  teacher_avatar:      string | null
  student_id:          string
  teacher_id:          string
}

export interface TeacherBookingView {
  booking_id:          string
  booking_status:      BookingStatus
  start_date:          string
  session_time:        string
  recurrence:          string
  price_usd:           number
  is_trial:            boolean
  course_title:        string
  course_type:         CourseType
  student_first_name:  string
  student_last_name:   string
  student_avatar:      string | null
  student_id:          string
  teacher_id:          string
}

// ── Supabase Database type (for createClient<Database>()) ────

export interface Database {
  public: {
    Tables: {
      profiles:         { Row: Profile;        Insert: Omit<Profile, 'created_at' | 'updated_at'>;        Update: Partial<Profile> }
      teacher_profiles: { Row: TeacherProfile; Insert: Omit<TeacherProfile, 'id' | 'created_at' | 'updated_at'>; Update: Partial<TeacherProfile> }
      courses:          { Row: Course;         Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>;         Update: Partial<Course> }
      bookings:         { Row: Booking;        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'>;        Update: Partial<Booking> }
      lessons:          { Row: Lesson;         Insert: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;         Update: Partial<Lesson> }
      reviews:          { Row: Review;         Insert: Omit<Review, 'id' | 'created_at'>;                        Update: Partial<Review> }
      payments:         { Row: Payment;        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;        Update: Partial<Payment> }
    }
    Views: {
      public_teachers:        { Row: PublicTeacher }
      student_bookings_view:  { Row: StudentBookingView }
      teacher_bookings_view:  { Row: TeacherBookingView }
    }
    Enums: {
      user_role:      UserRole
      teacher_status: TeacherStatus
      booking_status: BookingStatus
      lesson_status:  LessonStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      course_type:    CourseType
    }
  }
}
