// Simplified storage for Vercel serverless functions
// This uses memory storage for demo purposes

class MemStorage {
  constructor() {
    this.users = new Map();
    this.scribeRequests = new Map();
    this.volunteerApplications = new Map();
    this.sessions = new Map();
    this.chatHistory = new Map();
    this.matches = new Map();
    this.analytics = {
      totalUsers: 0,
      totalRequests: 0,
      totalApplications: 0,
      totalSessions: 0,
      totalMatches: 0
    };
  }

  // User Management
  async createUser(userData) {
    const user = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.set(user.id, user);
    this.analytics.totalUsers++;
    return user;
  }

  async getUser(userId) {
    return this.users.get(userId) || null;
  }

  async getVolunteers() {
    return Array.from(this.users.values()).filter(user => user.role === 'volunteer');
  }

  async updateUser(userId, updateData) {
    const user = this.users.get(userId);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Scribe Request Management
  async createScribeRequest(requestData) {
    const request = {
      id: `request_${Date.now()}`,
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.scribeRequests.set(request.id, request);
    this.analytics.totalRequests++;
    return request;
  }

  async getScribeRequests() {
    return Array.from(this.scribeRequests.values());
  }

  async updateScribeRequest(requestId, updateData) {
    const request = this.scribeRequests.get(requestId);
    if (!request) return null;
    
    const updatedRequest = {
      ...request,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.scribeRequests.set(requestId, updatedRequest);
    return updatedRequest;
  }

  // Volunteer Application Management
  async createVolunteerApplication(applicationData) {
    const application = {
      id: `app_${Date.now()}`,
      ...applicationData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.volunteerApplications.set(application.id, application);
    this.analytics.totalApplications++;
    return application;
  }

  async getVolunteerApplications() {
    return Array.from(this.volunteerApplications.values());
  }

  async updateApplicationStatus(applicationId, status) {
    const application = this.volunteerApplications.get(applicationId);
    if (!application) return null;
    
    const updatedApplication = {
      ...application,
      status,
      updatedAt: new Date().toISOString()
    };
    this.volunteerApplications.set(applicationId, updatedApplication);
    return updatedApplication;
  }

  // Session Management
  async createSession(sessionData) {
    const session = {
      id: `session_${Date.now()}`,
      ...sessionData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.sessions.set(session.id, session);
    this.analytics.totalSessions++;
    return session;
  }

  async getSessions() {
    return Array.from(this.sessions.values());
  }

  async updateSession(sessionId, updateData) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    const updatedSession = {
      ...session,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  // Chat Management
  async addChatMessage(messageData) {
    const message = {
      id: `msg_${Date.now()}`,
      ...messageData,
      timestamp: new Date().toISOString()
    };
    
    if (!this.chatHistory.has(messageData.requestId)) {
      this.chatHistory.set(messageData.requestId, []);
    }
    
    const chat = this.chatHistory.get(messageData.requestId);
    chat.push(message);
    this.chatHistory.set(messageData.requestId, chat);
    
    return message;
  }

  async getChatHistory(requestId) {
    return this.chatHistory.get(requestId) || [];
  }

  // Matching
  async createMatch(matchData) {
    const match = {
      id: `match_${Date.now()}`,
      ...matchData,
      createdAt: new Date().toISOString()
    };
    this.matches.set(match.id, match);
    this.analytics.totalMatches++;
    return match;
  }

  async getMatches() {
    return Array.from(this.matches.values());
  }

  // Analytics
  async getAnalytics() {
    return this.analytics;
  }
}

// Create a singleton instance
const storage = new MemStorage();

export { storage };
