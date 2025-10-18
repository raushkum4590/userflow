import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from '../routes/userRoutes';
import User from '../models/User';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User API Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/user-network-test');
  });

  afterAll(async () => {
    // Clean up test database
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        age: 25,
        hobbies: ['reading', 'gaming']
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(userData.username);
      expect(response.body.data.age).toBe(userData.age);
      expect(response.body.data.hobbies).toEqual(userData.hobbies);
      expect(response.body.data.popularityScore).toBe(0);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ username: 'testuser' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for empty hobbies array', async () => {
      const userData = {
        username: 'testuser',
        age: 25,
        hobbies: []
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/:id/link', () => {
    it('should create friendship between two users', async () => {
      // Create two users
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['reading']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      const response = await request(app)
        .post(`/api/users/${user1._id}/link`)
        .send({ friendId: user2._id })
        .expect(201);

      expect(response.body.success).toBe(true);

      // Verify friendship was created
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      expect(updatedUser1?.friends).toContain(user2._id);
      expect(updatedUser2?.friends).toContain(user1._id);
    });

    it('should prevent circular friendship', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['reading']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      // Create friendship
      await request(app)
        .post(`/api/users/${user1._id}/link`)
        .send({ friendId: user2._id })
        .expect(201);

      // Try to create same friendship again
      const response = await request(app)
        .post(`/api/users/${user1._id}/link`)
        .send({ friendId: user2._id })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should prevent deletion of user with friends', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['reading']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming']
      });

      // Create friendship
      await request(app)
        .post(`/api/users/${user1._id}/link`)
        .send({ friendId: user2._id })
        .expect(201);

      // Try to delete user1 (should fail)
      const response = await request(app)
        .delete(`/api/users/${user1._id}`)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('still connected');
    });

    it('should allow deletion of user without friends', async () => {
      const user = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['reading']
      });

      const response = await request(app)
        .delete(`/api/users/${user._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Popularity Score Calculation', () => {
    it('should calculate popularity score correctly', async () => {
      const user1 = await User.create({
        username: 'user1',
        age: 25,
        hobbies: ['reading', 'gaming']
      });

      const user2 = await User.create({
        username: 'user2',
        age: 30,
        hobbies: ['gaming', 'cooking']
      });

      // Create friendship
      await request(app)
        .post(`/api/users/${user1._id}/link`)
        .send({ friendId: user2._id })
        .expect(201);

      // Check popularity scores
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);

      // Both should have 1 friend + 1 shared hobby * 0.5 = 1.5
      expect(updatedUser1?.popularityScore).toBe(1.5);
      expect(updatedUser2?.popularityScore).toBe(1.5);
    });
  });
});
