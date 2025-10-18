import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config({ path: './config.env' });

const app = express();

// Database connection (cached for serverless)
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

// CORS middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// GET all users
app.get('/users', async (req, res) => {
  try {
    await connectDB();
    const users = await User.find().populate('friends', 'username age hobbies popularityScore');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET graph data
app.get('/users/graph', async (req, res) => {
  try {
    await connectDB();
    const users = await User.find().populate('friends', 'username age hobbies popularityScore');
    
    const nodes = users.map(user => ({
      id: user._id.toString(),
      position: { x: Math.random() * 800, y: Math.random() * 600 },
      data: {
        label: user.username,
        age: user.age,
        hobbies: user.hobbies,
        popularityScore: user.popularityScore
      },
      type: user.popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode'
    }));

    const edges: any[] = [];
    const processedPairs = new Set<string>();

    users.forEach(user => {
      user.friends.forEach((friend: any) => {
        const pair = [user._id.toString(), friend._id.toString()].sort().join('-');
        if (!processedPairs.has(pair)) {
          edges.push({
            id: `e${user._id}-${friend._id}`,
            source: user._id.toString(),
            target: friend._id.toString(),
            type: 'smoothstep'
          });
          processedPairs.add(pair);
        }
      });
    });

    res.status(200).json({
      success: true,
      data: { nodes, edges }
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST create user
app.post('/users', async (req, res) => {
  try {
    await connectDB();
    const { username, age, hobbies } = req.body;

    if (!username || !age || !hobbies || !Array.isArray(hobbies)) {
      return res.status(400).json({
        success: false,
        message: 'Username, age, and hobbies array are required'
      });
    }

    if (hobbies.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one hobby is required'
      });
    }

    const user = new User({
      username,
      age,
      hobbies,
      friends: [],
      popularityScore: 0
    });

    await user.save();
    await user.calculatePopularityScore();

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT update user
app.put('/users/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { username, age, hobbies } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (username !== undefined) user.username = username;
    if (age !== undefined) user.age = age;
    if (hobbies !== undefined) {
      if (!Array.isArray(hobbies) || hobbies.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Hobbies must be a non-empty array'
        });
      }
      user.hobbies = hobbies;
    }

    await user.save();
    await user.calculatePopularityScore();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE user
app.delete('/users/:id', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;

    await User.canDeleteUser(id);
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    if (error.message && error.message.includes('still connected')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST create friendship
app.post('/users/:id/link', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: 'Friend ID is required'
      });
    }

    if (id === friendId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot befriend yourself'
      });
    }

    await User.preventCircularFriendship(id, friendId);

    const user1 = await User.findById(id);
    const user2 = await User.findById(friendId);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    user1.friends.push(friendId);
    user2.friends.push(id);

    await user1.save();
    await user2.save();

    await user1.calculatePopularityScore();
    await user2.calculatePopularityScore();

    res.status(201).json({
      success: true,
      message: 'Friendship created successfully',
      data: { user1, user2 }
    });
  } catch (error: any) {
    console.error('Error creating friendship:', error);
    
    if (error.message && error.message.includes('already friends')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE remove friendship
app.delete('/users/:id/unlink', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.params;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: 'Friend ID is required'
      });
    }

    const user1 = await User.findById(id);
    const user2 = await User.findById(friendId);

    if (!user1 || !user2) {
      return res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
    }

    user1.friends = user1.friends.filter(friend => friend.toString() !== friendId);
    user2.friends = user2.friends.filter(friend => friend.toString() !== id);

    await user1.save();
    await user2.save();

    await user1.calculatePopularityScore();
    await user2.calculatePopularityScore();

    res.status(200).json({
      success: true,
      message: 'Friendship removed successfully',
      data: { user1, user2 }
    });
  } catch (error: any) {
    console.error('Error removing friendship:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Vercel serverless export
export default app;
