import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { v4 as uuidv4 } from 'uuid';

// GET /api/users - Fetch all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
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
};

// POST /api/users - Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, age, hobbies } = req.body;

    // Validation
    if (!username || !age || !hobbies || !Array.isArray(hobbies)) {
      res.status(400).json({
        success: false,
        message: 'Username, age, and hobbies array are required'
      });
      return;
    }

    if (hobbies.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one hobby is required'
      });
      return;
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
      res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
      return;
    }

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PUT /api/users/:id - Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, age, hobbies } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update fields if provided
    if (username !== undefined) user.username = username;
    if (age !== undefined) user.age = age;
    if (hobbies !== undefined) {
      if (!Array.isArray(hobbies) || hobbies.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Hobbies must be a non-empty array'
        });
        return;
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
    
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
      return;
    }

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// DELETE /api/users/:id - Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user can be deleted
    await User.canDeleteUser(id);

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    
    if (error.message.includes('still connected')) {
      res.status(409).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// POST /api/users/:id/link - Create relationship (friendship)
export const createFriendship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;

    if (!friendId) {
      res.status(400).json({
        success: false,
        message: 'Friend ID is required'
      });
      return;
    }

    if (id === friendId) {
      res.status(400).json({
        success: false,
        message: 'Cannot befriend yourself'
      });
      return;
    }

    // Prevent circular friendship
    await User.preventCircularFriendship(id, friendId);

    // Add friendship in both directions
    const user1 = await User.findById(id);
    const user2 = await User.findById(friendId);

    if (!user1 || !user2) {
      res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
      return;
    }

    user1.friends.push(friendId);
    user2.friends.push(id);

    await user1.save();
    await user2.save();

    // Recalculate popularity scores
    await user1.calculatePopularityScore();
    await user2.calculatePopularityScore();

    res.status(201).json({
      success: true,
      message: 'Friendship created successfully',
      data: {
        user1: user1,
        user2: user2
      }
    });
  } catch (error: any) {
    console.error('Error creating friendship:', error);
    
    if (error.message.includes('already friends')) {
      res.status(409).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// DELETE /api/users/:id/unlink - Remove relationship
export const removeFriendship = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { friendId } = req.body;

    if (!friendId) {
      res.status(400).json({
        success: false,
        message: 'Friend ID is required'
      });
      return;
    }

    const user1 = await User.findById(id);
    const user2 = await User.findById(friendId);

    if (!user1 || !user2) {
      res.status(404).json({
        success: false,
        message: 'One or both users not found'
      });
      return;
    }

    // Remove friendship from both users
    user1.friends = user1.friends.filter(friend => friend.toString() !== friendId);
    user2.friends = user2.friends.filter(friend => friend.toString() !== id);

    await user1.save();
    await user2.save();

    // Recalculate popularity scores
    await user1.calculatePopularityScore();
    await user2.calculatePopularityScore();

    res.status(200).json({
      success: true,
      message: 'Friendship removed successfully',
      data: {
        user1: user1,
        user2: user2
      }
    });
  } catch (error: any) {
    console.error('Error removing friendship:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/graph - Return graph data (users + relationships)
export const getGraphData = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().populate('friends', 'username age hobbies popularityScore');
    
    // Transform data for React Flow
    const nodes = users.map(user => ({
      id: user._id.toString(),
      position: { x: Math.random() * 800, y: Math.random() * 600 }, // Random positioning for now
      data: {
        label: user.username,
        age: user.age,
        hobbies: user.hobbies,
        popularityScore: user.popularityScore
      },
      type: user.popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode'
    }));

    const edges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
    }> = [];
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
      data: {
        nodes,
        edges
      }
    });
  } catch (error) {
    console.error('Error fetching graph data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
