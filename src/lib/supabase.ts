import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'PET' | 'VET';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface VetProfile {
  id: string;
  user_id: string;
  specialization: string;
  experience_years: number;
  consultation_fee: number;
  bio?: string;
  availability: Array<{
    day: string;
    slots: string[];
  }>;
  is_available: boolean;
  average_rating: number;
  total_reviews: number;
}

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  age: number;
  breed: string;
  gender: 'MALE' | 'FEMALE';
  species: 'DOG' | 'CAT' | 'BIRD' | 'RABBIT' | 'OTHER';
  profile_image?: string;
  medical_history?: string;
  current_symptoms?: string;
  created_at: string;
  updated_at: string;
}

export interface Vaccination {
  id: string;
  pet_id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date?: string;
  veterinarian_notes?: string;
  status: 'COMPLETED' | 'UPCOMING' | 'OVERDUE';
  administered_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  pet_id: string;
  owner_id: string;
  vet_id: string;
  appointment_date: string;
  appointment_time: string;
  issue_description: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED';
  diagnosis?: string;
  medication_notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  pet_id: string;
  vet_id: string;
  prescription_url: string;
  notes?: string;
  created_at: string;
}
