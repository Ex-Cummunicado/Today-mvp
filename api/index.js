// Vercel API function - main entry point
import express from 'express';
import cors from 'cors';

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Import and use the routes
import { registerRoutes } from './routes.js';

// Register all API routes
registerRoutes(app);

// Export the Express app as a Vercel serverless function
export default app;
