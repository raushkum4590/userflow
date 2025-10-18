import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  createFriendship,
  removeFriendship,
  getGraphData
} from '../controllers/userController';

const router = express.Router();

// User CRUD routes
router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Relationship routes
router.post('/:id/link', createFriendship);
router.delete('/:id/unlink', removeFriendship);

// Graph data route
router.get('/graph', getGraphData);

export default router;
