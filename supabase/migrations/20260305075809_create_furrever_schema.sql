/*
  # FurrEver Veterinary Telemedicine Platform Schema

  ## Overview
  Complete database schema for a veterinary telemedicine platform with pet management,
  vaccination tracking, appointment booking, and prescription management.

  ## New Tables Created

  ### 1. `user_profiles`
  Extended user profile information linked to Supabase Auth
  - `id` (uuid, FK to auth.users)
  - `role` (text: 'PET' or 'VET')
  - `full_name` (text)
  - `email` (text)
  - `phone` (text)
  - `profile_image` (text, URL)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `vet_profiles`
  Extended information for veterinarians
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to user_profiles)
  - `specialization` (text)
  - `experience_years` (integer)
  - `consultation_fee` (decimal)
  - `bio` (text)
  - `availability` (jsonb - array of available time slots)
  - `is_available` (boolean)
  - `average_rating` (decimal)
  - `total_reviews` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `pets`
  Pet information managed by pet owners
  - `id` (uuid, primary key)
  - `owner_id` (uuid, FK to user_profiles)
  - `name` (text)
  - `age` (integer)
  - `breed` (text)
  - `gender` (text: 'MALE' or 'FEMALE')
  - `species` (text: 'DOG', 'CAT', 'BIRD', 'OTHER')
  - `profile_image` (text, URL)
  - `medical_history` (text)
  - `current_symptoms` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `vaccinations`
  Vaccination records for pets
  - `id` (uuid, primary key)
  - `pet_id` (uuid, FK to pets)
  - `vaccine_name` (text)
  - `date_administered` (date)
  - `next_due_date` (date)
  - `veterinarian_notes` (text)
  - `status` (text: 'COMPLETED', 'UPCOMING', 'OVERDUE')
  - `administered_by` (uuid, FK to user_profiles - vet)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `appointments`
  Appointment bookings between pet owners and vets
  - `id` (uuid, primary key)
  - `pet_id` (uuid, FK to pets)
  - `owner_id` (uuid, FK to user_profiles)
  - `vet_id` (uuid, FK to user_profiles)
  - `appointment_date` (date)
  - `appointment_time` (time)
  - `issue_description` (text)
  - `status` (text: 'PENDING', 'ACCEPTED', 'REJECTED', 'RESCHEDULED', 'COMPLETED')
  - `diagnosis` (text)
  - `medication_notes` (text)
  - `rejection_reason` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `prescriptions`
  Prescription documents uploaded by vets
  - `id` (uuid, primary key)
  - `appointment_id` (uuid, FK to appointments)
  - `pet_id` (uuid, FK to pets)
  - `vet_id` (uuid, FK to user_profiles)
  - `prescription_url` (text)
  - `notes` (text)
  - `created_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only access their own data
  - Pet owners can view their pets and appointments
  - Vets can view appointments assigned to them
  - Proper authentication checks using auth.uid()

  ## Important Notes
  1. Vaccination status is automatically calculated based on dates
  2. Appointment system supports full lifecycle management
  3. File uploads for profile images and prescriptions use Supabase Storage
  4. All timestamps use UTC timezone
  5. Indexes added for performance on foreign keys and frequently queried fields
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('PET', 'VET')),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vet_profiles table
CREATE TABLE IF NOT EXISTS vet_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  experience_years integer DEFAULT 0,
  consultation_fee decimal(10,2) DEFAULT 0.00,
  bio text,
  availability jsonb DEFAULT '[]'::jsonb,
  is_available boolean DEFAULT true,
  average_rating decimal(3,2) DEFAULT 0.00,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  breed text,
  gender text CHECK (gender IN ('MALE', 'FEMALE')),
  species text DEFAULT 'DOG' CHECK (species IN ('DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER')),
  profile_image text,
  medical_history text,
  current_symptoms text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  date_administered date NOT NULL,
  next_due_date date,
  veterinarian_notes text,
  status text DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'UPCOMING', 'OVERDUE')),
  administered_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  vet_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  issue_description text NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'RESCHEDULED', 'COMPLETED')),
  diagnosis text,
  medication_notes text,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vet_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  prescription_url text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_vet_profiles_user_id ON vet_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vet_profiles_specialization ON vet_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_status ON vaccinations(status);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view vet profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (role = 'VET');

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for vet_profiles
CREATE POLICY "Anyone can view vet profiles"
  ON vet_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vets can update their own profile"
  ON vet_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.id = vet_profiles.user_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.id = vet_profiles.user_id
    )
  );

CREATE POLICY "Vets can insert their own profile"
  ON vet_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.id = vet_profiles.user_id
      AND user_profiles.role = 'VET'
    )
  );

-- RLS Policies for pets
CREATE POLICY "Pet owners can view their own pets"
  ON pets FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Vets can view pets with appointments"
  ON pets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.pet_id = pets.id
      AND appointments.vet_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can insert their own pets"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Pet owners can update their own pets"
  ON pets FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Pet owners can delete their own pets"
  ON pets FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for vaccinations
CREATE POLICY "Pet owners can view their pets' vaccinations"
  ON vaccinations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can view vaccinations for their appointments"
  ON vaccinations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      JOIN pets ON pets.id = appointments.pet_id
      WHERE pets.id = vaccinations.pet_id
      AND appointments.vet_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can insert vaccinations for their pets"
  ON vaccinations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can update vaccinations for their pets"
  ON vaccinations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can delete vaccinations for their pets"
  ON vaccinations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

-- RLS Policies for appointments
CREATE POLICY "Pet owners can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Vets can view their appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (vet_id = auth.uid());

CREATE POLICY "Pet owners can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Pet owners can update their pending appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() AND status = 'PENDING')
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Vets can update their appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (vet_id = auth.uid())
  WITH CHECK (vet_id = auth.uid());

-- RLS Policies for prescriptions
CREATE POLICY "Pet owners can view their prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = prescriptions.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can view their prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (vet_id = auth.uid());

CREATE POLICY "Vets can create prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (vet_id = auth.uid());

-- Function to update vaccination status automatically
CREATE OR REPLACE FUNCTION update_vaccination_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_due_date IS NOT NULL THEN
    IF NEW.next_due_date < CURRENT_DATE THEN
      NEW.status := 'OVERDUE';
    ELSIF NEW.next_due_date <= CURRENT_DATE + INTERVAL '7 days' THEN
      NEW.status := 'UPCOMING';
    ELSE
      NEW.status := 'COMPLETED';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vaccination status
DROP TRIGGER IF EXISTS vaccination_status_trigger ON vaccinations;
CREATE TRIGGER vaccination_status_trigger
  BEFORE INSERT OR UPDATE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_vaccination_status();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vet_profiles_updated_at ON vet_profiles;
CREATE TRIGGER update_vet_profiles_updated_at
  BEFORE UPDATE ON vet_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vaccinations_updated_at ON vaccinations;
CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();