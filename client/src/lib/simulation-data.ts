// Comprehensive simulation data for InscribeMate
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'blind_user' | 'volunteer' | 'admin';
  phoneNumber: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };
  languages: string[];
  availability?: {
    [key: string]: Array<{ start: string; end: string }> | boolean;
  };
  reliabilityScore: number;
  preferences: {
    preferredLanguage?: string;
    contrastMode?: 'low' | 'medium' | 'high';
    notificationPrefs?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    specializations?: string[];
  };
  isActive: boolean;
  avatar?: string;
  joinDate: string;
}

export interface ScribeRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  examType: 'final' | 'midterm' | 'quiz' | 'assignment' | 'presentation' | 'other';
  subject: string;
  scheduledDate: string;
  duration: number; // in minutes
  location: {
    lat: number;
    lng: number;
    address: string;
    building: string;
    room: string;
  };
  urgency: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  specialRequirements: string;
  estimatedDifficulty: number; // 1-5 scale
  createdAt: string;
  updatedAt: string;
  user: User;
  applications?: VolunteerApplication[];
  session?: ScribeSession;
}

export interface ScribeSession {
  id: string;
  requestId: string;
  userId: string;
  volunteerId: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
  notes?: string;
  userRating?: number;
  volunteerRating?: number;
  userFeedback?: string;
  volunteerFeedback?: string;
  createdAt: string;
  updatedAt: string;
  request: ScribeRequest;
  user: User;
  volunteer: User;
}

export interface VolunteerApplication {
  id: string;
  requestId: string;
  volunteerId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  matchScore: number;
  appliedAt: string;
  volunteer: User;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sessionId?: string;
  message: string;
  response: string;
  context?: any;
  createdAt: string;
  isFromUser: boolean;
}

// Simulation Data
export const SIMULATION_USERS: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    role: 'blind_user',
    phoneNumber: '+1-555-0123',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'New York University, NY',
      city: 'New York',
      state: 'NY'
    },
    languages: ['English', 'Mandarin'],
    preferences: {
      preferredLanguage: 'English',
      contrastMode: 'high',
      notificationPrefs: { email: true, sms: true, push: true }
    },
    reliabilityScore: 0,
    isActive: true,
    avatar: 'AC',
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@volunteer.com',
    role: 'volunteer',
    phoneNumber: '+1-555-0456',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: 'Columbia University, NY',
      city: 'New York',
      state: 'NY'
    },
    languages: ['English', 'Spanish'],
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '13:00', end: '21:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '15:00' }],
      weekend: false
    },
    reliabilityScore: 4.8,
    preferences: {
      specializations: ['Mathematics', 'Science', 'Computer Science']
    },
    isActive: true,
    avatar: 'SJ',
    joinDate: '2023-11-20'
  },
  {
    id: '3',
    name: 'Michael Rodriguez',
    email: 'michael.r@volunteer.com',
    role: 'volunteer',
    phoneNumber: '+1-555-0789',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: 'NYU Tandon School, Brooklyn',
      city: 'Brooklyn',
      state: 'NY'
    },
    languages: ['English', 'Spanish', 'Portuguese'],
    availability: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '16:00' }],
      weekend: true
    },
    reliabilityScore: 4.6,
    preferences: {
      specializations: ['Engineering', 'Physics', 'Mathematics']
    },
    isActive: true,
    avatar: 'MR',
    joinDate: '2023-09-10'
  },
  {
    id: '4',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@admin.edu',
    role: 'admin',
    phoneNumber: '+1-555-0321',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: 'NYU Administration Building',
      city: 'New York',
      state: 'NY'
    },
    languages: ['English', 'Hindi', 'Sanskrit'],
    preferences: {
      preferredLanguage: 'English',
      contrastMode: 'medium'
    },
    reliabilityScore: 0,
    isActive: true,
    avatar: 'PS',
    joinDate: '2023-06-01'
  }
];

export const SIMULATION_REQUESTS: ScribeRequest[] = [
  {
    id: 'req-1',
    userId: '1',
    title: 'Mathematics Final Exam',
    description: 'Need assistance with calculus final exam, multiple choice and problem solving sections. Requires familiarity with advanced calculus notation.',
    examType: 'final',
    subject: 'Mathematics',
    scheduledDate: '2024-12-20T10:00:00Z',
    duration: 180,
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'NYU Mathematics Building',
      building: 'Math Building',
      room: 'Room 201'
    },
    urgency: 'high',
    status: 'pending',
    specialRequirements: 'Familiar with advanced calculus notation and mathematical symbols',
    estimatedDifficulty: 4,
    createdAt: '2024-12-13T08:00:00Z',
    updatedAt: '2024-12-13T08:00:00Z',
    user: SIMULATION_USERS[0]
  },
  {
    id: 'req-2',
    userId: '1',
    title: 'Physics Midterm',
    description: 'Physics midterm exam assistance needed. Focus on problem-solving and equation derivation.',
    examType: 'midterm',
    subject: 'Physics',
    scheduledDate: '2024-12-18T14:00:00Z',
    duration: 120,
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: 'NYU Physics Building',
      building: 'Physics Building',
      room: 'Room 105'
    },
    urgency: 'normal',
    status: 'matched',
    specialRequirements: 'Physics background preferred',
    estimatedDifficulty: 3,
    createdAt: '2024-12-10T10:30:00Z',
    updatedAt: '2024-12-15T14:20:00Z',
    user: SIMULATION_USERS[0]
  },
  {
    id: 'req-3',
    userId: '1',
    title: 'Computer Science Assignment',
    description: 'Help with programming assignment and code review.',
    examType: 'assignment',
    subject: 'Computer Science',
    scheduledDate: '2024-12-16T16:00:00Z',
    duration: 90,
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: 'NYU Computer Science Building',
      building: 'CS Building',
      room: 'Lab 302'
    },
    urgency: 'low',
    status: 'completed',
    specialRequirements: 'Programming experience required',
    estimatedDifficulty: 2,
    createdAt: '2024-12-05T09:15:00Z',
    updatedAt: '2024-12-16T18:30:00Z',
    user: SIMULATION_USERS[0]
  }
];

export const SIMULATION_SESSIONS: ScribeSession[] = [
  {
    id: 'session-1',
    requestId: 'req-2',
    userId: '1',
    volunteerId: '2',
    status: 'scheduled',
    startTime: '2024-12-18T14:00:00Z',
    createdAt: '2024-12-15T14:20:00Z',
    updatedAt: '2024-12-15T14:20:00Z',
    request: SIMULATION_REQUESTS[1],
    user: SIMULATION_USERS[0],
    volunteer: SIMULATION_USERS[1]
  },
  {
    id: 'session-2',
    requestId: 'req-3',
    userId: '1',
    volunteerId: '3',
    status: 'completed',
    startTime: '2024-12-16T16:00:00Z',
    endTime: '2024-12-16T18:30:00Z',
    actualDuration: 150,
    notes: 'Great session, student was well prepared',
    userRating: 5,
    volunteerRating: 5,
    userFeedback: 'Excellent help with debugging',
    volunteerFeedback: 'Student was engaged and asked good questions',
    createdAt: '2024-12-05T09:15:00Z',
    updatedAt: '2024-12-16T18:30:00Z',
    request: SIMULATION_REQUESTS[2],
    user: SIMULATION_USERS[0],
    volunteer: SIMULATION_USERS[2]
  }
];

export const SIMULATION_APPLICATIONS: VolunteerApplication[] = [
  {
    id: 'app-1',
    requestId: 'req-1',
    volunteerId: '2',
    message: 'I have extensive experience with calculus and mathematical notation. I can help with both multiple choice and problem solving sections.',
    status: 'pending',
    matchScore: 92,
    appliedAt: '2024-12-13T09:15:00Z',
    volunteer: SIMULATION_USERS[1]
  },
  {
    id: 'app-2',
    requestId: 'req-1',
    volunteerId: '3',
    message: 'I specialize in mathematics and have helped with similar exams before. I understand the importance of clear communication during exams.',
    status: 'pending',
    matchScore: 88,
    appliedAt: '2024-12-13T10:30:00Z',
    volunteer: SIMULATION_USERS[2]
  }
];

export const SIMULATION_CHAT: ChatMessage[] = [
  {
    id: 'chat-1',
    userId: '1',
    sessionId: 'session-1',
    message: 'Hi Sarah, I have some questions about the physics exam format.',
    response: 'Hello Alex! I\'d be happy to help you prepare for your physics midterm. What specific questions do you have about the exam format?',
    createdAt: '2024-12-15T15:30:00Z',
    isFromUser: true
  },
  {
    id: 'chat-2',
    userId: '1',
    sessionId: 'session-1',
    message: 'Will there be equation derivations or just problem solving?',
    response: 'Based on the course syllabus, there will be both equation derivations and problem solving. I recommend focusing on the key equations from chapters 3-7. Would you like me to help you review those?',
    createdAt: '2024-12-15T15:32:00Z',
    isFromUser: true
  }
];

// Search and filter utilities
export const SEARCH_FILTERS = {
  subjects: ['Mathematics', 'Physics', 'Computer Science', 'Chemistry', 'Biology', 'English', 'History', 'Economics'],
  examTypes: ['final', 'midterm', 'quiz', 'assignment', 'presentation', 'other'],
  urgencyLevels: ['low', 'normal', 'high', 'critical'],
  statuses: ['pending', 'matched', 'in_progress', 'completed', 'cancelled'],
  languages: ['English', 'Spanish', 'Mandarin', 'Hindi', 'French', 'German', 'Portuguese'],
  difficulties: [1, 2, 3, 4, 5]
};

export const LOCATION_DATA = {
  universities: [
    { name: 'New York University', lat: 40.7128, lng: -74.0060, city: 'New York', state: 'NY' },
    { name: 'Columbia University', lat: 40.7589, lng: -73.9851, city: 'New York', state: 'NY' },
    { name: 'NYU Tandon School', lat: 40.7505, lng: -73.9934, city: 'Brooklyn', state: 'NY' },
    { name: 'City College of New York', lat: 40.8176, lng: -73.9482, city: 'New York', state: 'NY' },
    { name: 'Hunter College', lat: 40.7685, lng: -73.9646, city: 'New York', state: 'NY' }
  ],
  defaultCenter: { lat: 40.7589, lng: -73.9851 },
  defaultZoom: 12
};

// TTS Configuration
export const TTS_CONFIG = {
  enabled: true,
  voice: 'en-US-Standard-A',
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8
};

// Animation configurations
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.3 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2 }
  }
};
