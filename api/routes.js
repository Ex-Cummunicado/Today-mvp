// Simplified routes for Vercel serverless functions
import { storage } from '../server/storage.js';

export function registerRoutes(app) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'InscribeMate API'
    });
  });

  // User Management Routes
  app.get('/api/users/me', async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/users/volunteers', async (req, res) => {
    try {
      const volunteers = await storage.getVolunteers();
      res.json(volunteers);
    } catch (error) {
      console.error('Error getting volunteers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Scribe Request Routes
  app.get('/api/requests', async (req, res) => {
    try {
      const requests = await storage.getScribeRequests();
      res.json(requests);
    } catch (error) {
      console.error('Error getting requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/requests', async (req, res) => {
    try {
      const requestData = req.body;
      const request = await storage.createScribeRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/requests/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const request = await storage.updateScribeRequest(id, updateData);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Volunteer Application Routes
  app.get('/api/applications', async (req, res) => {
    try {
      const applications = await storage.getVolunteerApplications();
      res.json(applications);
    } catch (error) {
      console.error('Error getting applications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/applications', async (req, res) => {
    try {
      const applicationData = req.body;
      const application = await storage.createVolunteerApplication(applicationData);
      res.status(201).json(application);
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Chat Routes
  app.get('/api/chat/:requestId', async (req, res) => {
    try {
      const { requestId } = req.params;
      const chatHistory = await storage.getChatHistory(requestId);
      res.json(chatHistory);
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const messageData = req.body;
      const message = await storage.addChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error('Error adding chat message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Matching Routes
  app.get('/api/matches', async (req, res) => {
    try {
      const matches = await storage.getMatches();
      res.json(matches);
    } catch (error) {
      console.error('Error getting matches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analytics Routes
  app.get('/api/analytics', async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
