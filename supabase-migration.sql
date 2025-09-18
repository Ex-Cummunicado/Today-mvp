-- InscribeMate Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('blind_user', 'volunteer', 'admin')),
  phone_number VARCHAR(20),
  location JSONB,
  languages TEXT[] DEFAULT '{}',
  availability JSONB,
  reliability_score DECIMAL(3,2) DEFAULT 5.00,
  preferences JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scribe_requests table
CREATE TABLE IF NOT EXISTS scribe_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  exam_type VARCHAR(100),
  subject VARCHAR(100),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  location JSONB NOT NULL,
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'in_progress', 'completed', 'cancelled')),
  special_requirements TEXT,
  estimated_difficulty INTEGER DEFAULT 3 CHECK (estimated_difficulty >= 1 AND estimated_difficulty <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scribe_sessions table
CREATE TABLE IF NOT EXISTS scribe_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES scribe_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  actual_duration INTEGER,
  notes TEXT,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  volunteer_rating INTEGER CHECK (volunteer_rating >= 1 AND volunteer_rating <= 5),
  user_feedback TEXT,
  volunteer_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteer_applications table
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES scribe_requests(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  match_score DECIMAL(5,2),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES scribe_sessions(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_scribe_requests_user_id ON scribe_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_scribe_requests_status ON scribe_requests(status);
CREATE INDEX IF NOT EXISTS idx_scribe_requests_scheduled_date ON scribe_requests(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_scribe_sessions_user_id ON scribe_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_volunteer_id ON scribe_sessions(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_scribe_sessions_request_id ON scribe_sessions(request_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_request_id ON volunteer_applications(request_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_volunteer_id ON volunteer_applications(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scribe_requests_updated_at BEFORE UPDATE ON scribe_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scribe_sessions_updated_at BEFORE UPDATE ON scribe_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scribe_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE scribe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - customize based on your auth requirements)
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can read their own requests
CREATE POLICY "Users can read own requests" ON scribe_requests
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can create their own requests
CREATE POLICY "Users can create own requests" ON scribe_requests
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own requests
CREATE POLICY "Users can update own requests" ON scribe_requests
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Volunteers can read all pending requests
CREATE POLICY "Volunteers can read pending requests" ON scribe_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'volunteer'
        )
    );

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON scribe_sessions
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR 
        auth.uid()::text = volunteer_id::text
    );

-- Volunteers can read applications for their requests
CREATE POLICY "Volunteers can read applications" ON volunteer_applications
    FOR SELECT USING (
        auth.uid()::text = volunteer_id::text OR
        EXISTS (
            SELECT 1 FROM scribe_requests 
            WHERE scribe_requests.id = volunteer_applications.request_id 
            AND scribe_requests.user_id::text = auth.uid()::text
        )
    );

-- Users can read their own chat history
CREATE POLICY "Users can read own chat history" ON chat_history
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can create their own chat history
CREATE POLICY "Users can create own chat history" ON chat_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Insert sample data (optional)
INSERT INTO users (id, email, name, role, phone_number, location, languages, availability, reliability_score, preferences, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'alex.chen@university.edu', 'Alex Chen', 'blind_user', '+1-555-0123', '{"lat": 40.7128, "lng": -74.0060, "address": "New York University, NY"}', '{"English", "Mandarin"}', NULL, NULL, '{"preferredLanguage": "English", "contrastMode": "high", "notificationPrefs": {"email": true, "sms": true}}', true),
('550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@volunteer.com', 'Sarah Johnson', 'volunteer', '+1-555-0456', '{"lat": 40.7589, "lng": -73.9851, "address": "Columbia University, NY"}', '{"English", "Spanish"}', '{"monday": [{"start": "09:00", "end": "17:00"}], "tuesday": [{"start": "09:00", "end": "17:00"}], "wednesday": [{"start": "13:00", "end": "21:00"}], "thursday": [{"start": "09:00", "end": "17:00"}], "friday": [{"start": "09:00", "end": "15:00"}], "weekend": false}', '4.8', '{"specializations": ["Mathematics", "Science", "Computer Science"]}', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO scribe_requests (id, user_id, title, description, exam_type, subject, scheduled_date, duration, location, urgency, status, special_requirements, estimated_difficulty) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Mathematics Final Exam', 'Need assistance with calculus final exam, multiple choice and problem solving sections', 'final', 'Mathematics', NOW() + INTERVAL '7 days', 180, '{"lat": 40.7128, "lng": -74.0060, "address": "NYU Mathematics Building, Room 201"}', 'high', 'pending', 'Familiar with advanced calculus notation and mathematical symbols', 4)
ON CONFLICT (id) DO NOTHING;
