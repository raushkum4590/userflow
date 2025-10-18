import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// Import models and controllers
import User from '../backend/src/models/User';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  createFriendship,
  removeFriendship,
  getGraphData
} from '../backend/src/controllers/userController';

// Extend VercelRequest to include params like Express Request
interface ExtendedRequest extends VercelRequest {
  params?: Record<string, string>;
}

// Database connection
let cachedDb: typeof mongoose | null = null;

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    cachedDb = db;
    console.log('MongoDB connected');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Main handler
export default async function handler(req: ExtendedRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Connect to database
  await connectDB();

  // Route handling
  const path = req.url?.split('?')[0] || '';
  const method = req.method || 'GET';

  try {
    // Health check
    if (path === '/api' || path === '/api/health') {
      return res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    }

    // GET /api/users/graph
    if (path === '/api/users/graph' && method === 'GET') {
      return await getGraphData(req as any, res as any);
    }

    // GET /api/users
    if (path === '/api/users' && method === 'GET') {
      return await getAllUsers(req as any, res as any);
    }

    // POST /api/users
    if (path === '/api/users' && method === 'POST') {
      return await createUser(req as any, res as any);
    }

    // PUT /api/users/:id
    if (path.match(/^\/api\/users\/[^\/]+$/) && method === 'PUT') {
      const id = path.split('/').pop();
      (req as ExtendedRequest).params = { id: id || '' };
      return await updateUser(req as any, res as any);
    }

    // DELETE /api/users/:id
    if (path.match(/^\/api\/users\/[^\/]+$/) && method === 'DELETE' && !path.includes('/link')) {
      const id = path.split('/').pop();
      (req as ExtendedRequest).params = { id: id || '' };
      return await deleteUser(req as any, res as any);
    }

    // POST /api/users/:id/link
    if (path.match(/^\/api\/users\/[^\/]+\/link$/) && method === 'POST') {
      const parts = path.split('/');
      const id = parts[parts.length - 2];
      (req as ExtendedRequest).params = { id: id || '' };
      return await createFriendship(req as any, res as any);
    }

    // DELETE /api/users/:id/unlink
    if (path.match(/^\/api\/users\/[^\/]+\/unlink$/) && method === 'DELETE') {
      const parts = path.split('/');
      const id = parts[parts.length - 2];
      (req as ExtendedRequest).params = { id: id || '' };
      return await removeFriendship(req as any, res as any);
    }

    // 404 - Route not found
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
