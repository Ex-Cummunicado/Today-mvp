import { supabaseAdmin } from '@shared/supabase';
import { 
  type User, 
  type NewUser, 
  type ScribeRequest, 
  type NewScribeRequest,
  type ScribeSession,
  type NewScribeSession,
  type VolunteerApplication,
  type NewVolunteerApplication,
  type ChatHistory,
  type NewChatHistory,
  type ScribeRequestWithUser,
  type ScribeSessionWithDetails,
  type UserRole,
  type RequestStatus,
  type ApplicationStatus
} from "@shared/schema";
import { IStorage } from './storage';

export class SupabaseStorage implements IStorage {
  // User management
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapUserFromSupabase(data);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return undefined;
    return this.mapUserFromSupabase(data);
  }

  async createUser(newUser: NewUser): Promise<User> {
    const userData = this.mapUserToSupabase(newUser);
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return this.mapUserFromSupabase(data);
  }

  async updateUser(id: string, updates: Partial<NewUser>): Promise<User> {
    const updateData = this.mapUserToSupabase(updates);
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return this.mapUserFromSupabase(data);
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', role);

    if (error) throw new Error(`Failed to get users by role: ${error.message}`);
    return data.map(this.mapUserFromSupabase);
  }

  async getAvailableVolunteers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'volunteer')
      .eq('is_active', true);

    if (error) throw new Error(`Failed to get volunteers: ${error.message}`);
    return data.map(this.mapUserFromSupabase);
  }

  // Scribe request management
  async getScribeRequest(id: string): Promise<ScribeRequestWithUser | undefined> {
    const { data, error } = await supabaseAdmin
      .from('scribe_requests')
      .select(`
        *,
        users!scribe_requests_user_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapScribeRequestWithUserFromSupabase(data);
  }

  async getScribeRequestsByUser(userId: string): Promise<ScribeRequestWithUser[]> {
    const { data, error } = await supabaseAdmin
      .from('scribe_requests')
      .select(`
        *,
        users!scribe_requests_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get requests by user: ${error.message}`);
    return data.map(this.mapScribeRequestWithUserFromSupabase);
  }

  async getScribeRequestsByStatus(status: RequestStatus): Promise<ScribeRequestWithUser[]> {
    const { data, error } = await supabaseAdmin
      .from('scribe_requests')
      .select(`
        *,
        users!scribe_requests_user_id_fkey(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get requests by status: ${error.message}`);
    return data.map(this.mapScribeRequestWithUserFromSupabase);
  }

  async createScribeRequest(newRequest: NewScribeRequest): Promise<ScribeRequest> {
    const requestData = this.mapScribeRequestToSupabase(newRequest);
    const { data, error } = await supabaseAdmin
      .from('scribe_requests')
      .insert(requestData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create request: ${error.message}`);
    return this.mapScribeRequestFromSupabase(data);
  }

  async updateScribeRequest(id: string, updates: Partial<NewScribeRequest & { status: RequestStatus }>): Promise<ScribeRequest> {
    const updateData = this.mapScribeRequestToSupabase(updates);
    const { data, error } = await supabaseAdmin
      .from('scribe_requests')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update request: ${error.message}`);
    return this.mapScribeRequestFromSupabase(data);
  }

  async deleteScribeRequest(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('scribe_requests')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete request: ${error.message}`);
  }

  // Session management
  async getScribeSession(id: string): Promise<ScribeSessionWithDetails | undefined> {
    const { data, error } = await supabaseAdmin
      .from('scribe_sessions')
      .select(`
        *,
        scribe_requests!scribe_sessions_request_id_fkey(*),
        users!scribe_sessions_user_id_fkey(*),
        volunteers:users!scribe_sessions_volunteer_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapScribeSessionWithDetailsFromSupabase(data);
  }

  async getSessionsByUser(userId: string): Promise<ScribeSessionWithDetails[]> {
    const { data, error } = await supabaseAdmin
      .from('scribe_sessions')
      .select(`
        *,
        scribe_requests!scribe_sessions_request_id_fkey(*),
        users!scribe_sessions_user_id_fkey(*),
        volunteers:users!scribe_sessions_volunteer_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get sessions by user: ${error.message}`);
    return data.map(this.mapScribeSessionWithDetailsFromSupabase);
  }

  async getSessionsByVolunteer(volunteerId: string): Promise<ScribeSessionWithDetails[]> {
    const { data, error } = await supabaseAdmin
      .from('scribe_sessions')
      .select(`
        *,
        scribe_requests!scribe_sessions_request_id_fkey(*),
        users!scribe_sessions_user_id_fkey(*),
        volunteers:users!scribe_sessions_volunteer_id_fkey(*)
      `)
      .eq('volunteer_id', volunteerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get sessions by volunteer: ${error.message}`);
    return data.map(this.mapScribeSessionWithDetailsFromSupabase);
  }

  async createScribeSession(newSession: NewScribeSession): Promise<ScribeSession> {
    const sessionData = this.mapScribeSessionToSupabase(newSession);
    const { data, error } = await supabaseAdmin
      .from('scribe_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);
    return this.mapScribeSessionFromSupabase(data);
  }

  async updateScribeSession(id: string, updates: Partial<NewScribeSession>): Promise<ScribeSession> {
    const updateData = this.mapScribeSessionToSupabase(updates);
    const { data, error } = await supabaseAdmin
      .from('scribe_sessions')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update session: ${error.message}`);
    return this.mapScribeSessionFromSupabase(data);
  }

  // Volunteer applications
  async getApplicationsForRequest(requestId: string): Promise<(VolunteerApplication & { volunteer: User })[]> {
    const { data, error } = await supabaseAdmin
      .from('volunteer_applications')
      .select(`
        *,
        users!volunteer_applications_volunteer_id_fkey(*)
      `)
      .eq('request_id', requestId)
      .order('match_score', { ascending: false });

    if (error) throw new Error(`Failed to get applications: ${error.message}`);
    return data.map(this.mapVolunteerApplicationWithVolunteerFromSupabase);
  }

  async getApplicationsByVolunteer(volunteerId: string): Promise<(VolunteerApplication & { request: ScribeRequest })[]> {
    const { data, error } = await supabaseAdmin
      .from('volunteer_applications')
      .select(`
        *,
        scribe_requests!volunteer_applications_request_id_fkey(*)
      `)
      .eq('volunteer_id', volunteerId)
      .order('applied_at', { ascending: false });

    if (error) throw new Error(`Failed to get applications by volunteer: ${error.message}`);
    return data.map(this.mapVolunteerApplicationWithRequestFromSupabase);
  }

  async getApplicationByIdForValidation(id: string): Promise<VolunteerApplication | undefined> {
    const { data, error } = await supabaseAdmin
      .from('volunteer_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return this.mapVolunteerApplicationFromSupabase(data);
  }

  async createVolunteerApplication(application: NewVolunteerApplication): Promise<VolunteerApplication> {
    const applicationData = this.mapVolunteerApplicationToSupabase(application);
    const { data, error } = await supabaseAdmin
      .from('volunteer_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create application: ${error.message}`);
    return this.mapVolunteerApplicationFromSupabase(data);
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<VolunteerApplication> {
    const { data, error } = await supabaseAdmin
      .from('volunteer_applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update application: ${error.message}`);
    return this.mapVolunteerApplicationFromSupabase(data);
  }

  // AI Chat history
  async getChatHistory(userId: string, limit = 50): Promise<ChatHistory[]> {
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get chat history: ${error.message}`);
    return data.map(this.mapChatHistoryFromSupabase);
  }

  async createChatEntry(newChat: NewChatHistory): Promise<ChatHistory> {
    const chatData = this.mapChatHistoryToSupabase(newChat);
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .insert(chatData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create chat entry: ${error.message}`);
    return this.mapChatHistoryFromSupabase(data);
  }

  // Analytics and matching
  async getRequestAnalytics(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    completedSessions: number;
    activeVolunteers: number;
  }> {
    const [requestsResult, sessionsResult, volunteersResult] = await Promise.all([
      supabaseAdmin.from('scribe_requests').select('status', { count: 'exact' }),
      supabaseAdmin.from('scribe_sessions').select('status', { count: 'exact' }),
      supabaseAdmin.from('users').select('role, is_active', { count: 'exact' }).eq('role', 'volunteer').eq('is_active', true)
    ]);

    const totalRequests = requestsResult.count || 0;
    const pendingRequests = requestsResult.data?.filter(r => r.status === 'pending').length || 0;
    const completedSessions = sessionsResult.data?.filter(s => s.status === 'completed').length || 0;
    const activeVolunteers = volunteersResult.count || 0;

    return { totalRequests, pendingRequests, completedSessions, activeVolunteers };
  }

  async findNearbyVolunteers(location: { lat: number; lng: number }, radiusKm: number): Promise<User[]> {
    // For now, return all active volunteers. In production, implement proper geospatial queries
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'volunteer')
      .eq('is_active', true);

    if (error) throw new Error(`Failed to find nearby volunteers: ${error.message}`);
    
    // Filter by distance (simplified implementation)
    return data
      .map(this.mapUserFromSupabase)
      .filter(user => {
        if (!user.location) return false;
        const userLoc = user.location as { lat: number; lng: number };
        const distance = this.calculateDistance(location, userLoc);
        return distance <= radiusKm;
      });
  }

  async calculateMatchScore(requestId: string, volunteerId: string): Promise<number> {
    // Get request and volunteer data
    const [requestResult, volunteerResult] = await Promise.all([
      supabaseAdmin.from('scribe_requests').select('*').eq('id', requestId).single(),
      supabaseAdmin.from('users').select('*').eq('id', volunteerId).single()
    ]);

    if (requestResult.error || !requestResult.data || volunteerResult.error || !volunteerResult.data) {
      return 0;
    }

    const request = requestResult.data;
    const volunteer = volunteerResult.data;

    let score = 50; // Base score

    // Language matching
    if (volunteer.languages?.includes('English')) score += 20;

    // Location proximity
    if (request.location && volunteer.location) {
      const distance = this.calculateDistance(
        request.location as { lat: number; lng: number },
        volunteer.location as { lat: number; lng: number }
      );
      if (distance < 10) score += 20;
      else if (distance < 25) score += 10;
    }

    // Reliability score
    const reliability = parseFloat(volunteer.reliability_score || '3.0');
    score += reliability * 4; // Max 20 points for 5.0 rating

    return Math.min(100, score);
  }

  // Helper methods for mapping between Supabase and application types
  private mapUserFromSupabase(data: any): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      phoneNumber: data.phone_number,
      location: data.location,
      languages: data.languages,
      availability: data.availability,
      reliabilityScore: data.reliability_score,
      preferences: data.preferences,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapUserToSupabase(user: Partial<NewUser>): any {
    return {
      email: user.email,
      name: user.name,
      role: user.role,
      phone_number: user.phoneNumber,
      location: user.location,
      languages: user.languages,
      availability: user.availability,
      reliability_score: user.reliabilityScore,
      preferences: user.preferences,
      is_active: user.isActive,
    };
  }

  private mapScribeRequestFromSupabase(data: any): ScribeRequest {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      examType: data.exam_type,
      subject: data.subject,
      scheduledDate: new Date(data.scheduled_date),
      duration: data.duration,
      location: data.location,
      urgency: data.urgency,
      status: data.status,
      specialRequirements: data.special_requirements,
      estimatedDifficulty: data.estimated_difficulty,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapScribeRequestToSupabase(request: Partial<NewScribeRequest>): any {
    return {
      user_id: request.userId,
      title: request.title,
      description: request.description,
      exam_type: request.examType,
      subject: request.subject,
      scheduled_date: request.scheduledDate?.toISOString(),
      duration: request.duration,
      location: request.location,
      urgency: request.urgency,
      status: request.status,
      special_requirements: request.specialRequirements,
      estimated_difficulty: request.estimatedDifficulty,
    };
  }

  private mapScribeRequestWithUserFromSupabase(data: any): ScribeRequestWithUser {
    return {
      ...this.mapScribeRequestFromSupabase(data),
      user: this.mapUserFromSupabase(data.users),
    };
  }

  private mapScribeSessionFromSupabase(data: any): ScribeSession {
    return {
      id: data.id,
      requestId: data.request_id,
      userId: data.user_id,
      volunteerId: data.volunteer_id,
      status: data.status,
      startTime: data.start_time ? new Date(data.start_time) : null,
      endTime: data.end_time ? new Date(data.end_time) : null,
      actualDuration: data.actual_duration,
      notes: data.notes,
      userRating: data.user_rating,
      volunteerRating: data.volunteer_rating,
      userFeedback: data.user_feedback,
      volunteerFeedback: data.volunteer_feedback,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapScribeSessionToSupabase(session: Partial<NewScribeSession>): any {
    return {
      request_id: session.requestId,
      user_id: session.userId,
      volunteer_id: session.volunteerId,
      status: session.status,
      start_time: session.startTime?.toISOString(),
      end_time: session.endTime?.toISOString(),
      actual_duration: session.actualDuration,
      notes: session.notes,
      user_rating: session.userRating,
      volunteer_rating: session.volunteerRating,
      user_feedback: session.userFeedback,
      volunteer_feedback: session.volunteerFeedback,
    };
  }

  private mapScribeSessionWithDetailsFromSupabase(data: any): ScribeSessionWithDetails {
    return {
      ...this.mapScribeSessionFromSupabase(data),
      request: this.mapScribeRequestFromSupabase(data.scribe_requests),
      user: this.mapUserFromSupabase(data.users),
      volunteer: this.mapUserFromSupabase(data.volunteers),
    };
  }

  private mapVolunteerApplicationFromSupabase(data: any): VolunteerApplication {
    return {
      id: data.id,
      requestId: data.request_id,
      volunteerId: data.volunteer_id,
      message: data.message,
      status: data.status,
      matchScore: data.match_score,
      appliedAt: new Date(data.applied_at),
    };
  }

  private mapVolunteerApplicationToSupabase(application: Partial<NewVolunteerApplication>): any {
    return {
      request_id: application.requestId,
      volunteer_id: application.volunteerId,
      message: application.message,
      status: application.status,
      match_score: application.matchScore,
    };
  }

  private mapVolunteerApplicationWithVolunteerFromSupabase(data: any): VolunteerApplication & { volunteer: User } {
    return {
      ...this.mapVolunteerApplicationFromSupabase(data),
      volunteer: this.mapUserFromSupabase(data.users),
    };
  }

  private mapVolunteerApplicationWithRequestFromSupabase(data: any): VolunteerApplication & { request: ScribeRequest } {
    return {
      ...this.mapVolunteerApplicationFromSupabase(data),
      request: this.mapScribeRequestFromSupabase(data.scribe_requests),
    };
  }

  private mapChatHistoryFromSupabase(data: any): ChatHistory {
    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      message: data.message,
      response: data.response,
      context: data.context,
      createdAt: new Date(data.created_at),
    };
  }

  private mapChatHistoryToSupabase(chat: Partial<NewChatHistory>): any {
    return {
      user_id: chat.userId,
      session_id: chat.sessionId,
      message: chat.message,
      response: chat.response,
      context: chat.context,
    };
  }

  private calculateDistance(loc1: { lat: number; lng: number }, loc2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
