import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, userData: {
  name: string;
  role: 'blind_user' | 'volunteer' | 'admin';
  phoneNumber?: string;
  location?: any;
  languages?: string[];
  preferences?: any;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getScribeRequests = async (filters?: {
  userId?: string;
  status?: string;
}) => {
  let query = supabase
    .from('scribe_requests')
    .select(`
      *,
      users!scribe_requests_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createScribeRequest = async (requestData: any) => {
  const { data, error } = await supabase
    .from('scribe_requests')
    .insert(requestData)
    .select()
    .single();
  return { data, error };
};

export const updateScribeRequest = async (requestId: string, updates: any) => {
  const { data, error } = await supabase
    .from('scribe_requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single();
  return { data, error };
};

export const getSessions = async (filters?: {
  userId?: string;
  volunteerId?: string;
}) => {
  let query = supabase
    .from('scribe_sessions')
    .select(`
      *,
      scribe_requests!scribe_sessions_request_id_fkey(*),
      users!scribe_sessions_user_id_fkey(*),
      volunteers:users!scribe_sessions_volunteer_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters?.volunteerId) {
    query = query.eq('volunteer_id', filters.volunteerId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getVolunteerApplications = async (requestId: string) => {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .select(`
      *,
      users!volunteer_applications_volunteer_id_fkey(*)
    `)
    .eq('request_id', requestId)
    .order('match_score', { ascending: false });
  return { data, error };
};

export const createVolunteerApplication = async (applicationData: any) => {
  const { data, error } = await supabase
    .from('volunteer_applications')
    .insert(applicationData)
    .select()
    .single();
  return { data, error };
};

export const getChatHistory = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const createChatEntry = async (chatData: any) => {
  const { data, error } = await supabase
    .from('chat_history')
    .insert(chatData)
    .select()
    .single();
  return { data, error };
};
