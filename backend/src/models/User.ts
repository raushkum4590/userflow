import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: Date;
  popularityScore: number;
  calculatePopularityScore(): Promise<number>;
}

export interface IUserModel extends Model<IUser> {
  preventCircularFriendship(userId1: string, userId2: string): Promise<boolean>;
  canDeleteUser(userId: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Username must be at least 2 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age cannot exceed 120']
  },
  hobbies: [{
    type: String,
    trim: true,
    minlength: [1, 'Hobby must be at least 1 character']
  }],
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  popularityScore: {
    type: Number,
    default: 0
  }
});

// Calculate popularity score before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('friends') || this.isModified('hobbies')) {
    await this.calculatePopularityScore();
  }
  next();
});

// Method to calculate popularity score
UserSchema.methods.calculatePopularityScore = async function() {
  const user = this;
  
  // Get all friends with their hobbies
  const friends = await User.find({ _id: { $in: user.friends } });
  
  // Count unique friends
  const uniqueFriends = friends.length;
  
  // Calculate shared hobbies with friends
  const userHobbies = new Set(user.hobbies);
  let sharedHobbies = 0;
  
  friends.forEach(friend => {
    friend.hobbies.forEach(hobby => {
      if (userHobbies.has(hobby)) {
        sharedHobbies++;
      }
    });
  });
  
  // Calculate popularity score: unique friends + (shared hobbies * 0.5)
  user.popularityScore = uniqueFriends + (sharedHobbies * 0.5);
  
  return user.popularityScore;
};

// Static method to prevent circular friendships
UserSchema.statics.preventCircularFriendship = async function(userId1: string, userId2: string) {
  const user1 = await this.findById(userId1);
  const user2 = await this.findById(userId2);
  
  if (!user1 || !user2) {
    throw new Error('One or both users not found');
  }
  
  // Check if they're already friends (either direction)
  const alreadyFriends = user1.friends.includes(userId2) || user2.friends.includes(userId1);
  
  if (alreadyFriends) {
    throw new Error('Users are already friends');
  }
  
  return true;
};

// Static method to check if user can be deleted
UserSchema.statics.canDeleteUser = async function(userId: string) {
  const user = await this.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if any other user has this user as a friend
  const hasFriends = await this.findOne({ friends: userId });
  
  if (hasFriends) {
    throw new Error('Cannot delete user: still connected as friend to other users');
  }
  
  return true;
};

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;
