'use client';

import { useState } from 'react';

interface User {
  _id: string;
  username: string;
  age: number;
  hobbies: string[];
  popularityScore: number;
}

interface UserManagementPanelProps {
  users: User[];
  onUserCreate: (userData: Omit<User, '_id' | 'popularityScore'>) => void;
  onUserUpdate: (id: string, userData: Partial<User>) => void;
  onUserDelete: (id: string) => void;
}

const UserManagementPanel = ({
  users,
  onUserCreate,
  onUserUpdate,
  onUserDelete,
}: UserManagementPanelProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    age: 0,
    hobbies: [] as string[],
  });
  const [newHobby, setNewHobby] = useState('');

  const handleCreateUser = () => {
    if (formData.username && formData.age > 0 && formData.hobbies.length > 0) {
      onUserCreate(formData);
      setFormData({ username: '', age: 0, hobbies: [] });
      setIsCreating(false);
    }
  };

  const handleUpdateUser = () => {
    if (editingUser && formData.username && formData.age > 0) {
      onUserUpdate(editingUser._id, formData);
      setEditingUser(null);
      setFormData({ username: '', age: 0, hobbies: [] });
    }
  };

  const handleAddHobby = () => {
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby('');
    }
  };

  const handleRemoveHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      age: user.age,
      hobbies: [...user.hobbies]
    });
  };

  return (
    <div className="w-full lg:w-72 xl:w-80 2xl:w-96 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/30 p-4 lg:p-6 h-64 lg:h-full overflow-y-auto border-l-2 border-purple-200/50 backdrop-blur-sm">
      <div className="flex items-center mb-4 lg:mb-6">
        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg flex items-center justify-center mr-3">
          <span className="text-white text-lg lg:text-xl">👥</span>
        </div>
        <h3 className="text-lg lg:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">User Management</h3>
      </div>

      {/* Create/Edit Form */}
      <div className="mb-4 lg:mb-6 p-4 lg:p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl border-2 border-purple-200/50 shadow-xl backdrop-blur-sm">
        <h4 className="font-bold mb-3 lg:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 flex items-center text-base lg:text-lg">
          <span className="mr-2 text-2xl">
            {isCreating ? '➕' : editingUser ? '✏️' : '👤'}
          </span>
          <span className="hidden lg:inline">
            {isCreating ? 'Create New User' : editingUser ? 'Edit User' : 'User Form'}
          </span>
          <span className="lg:hidden">
            {isCreating ? 'Create' : editingUser ? 'Edit' : 'Form'}
          </span>
        </h4>
        
        <div className="space-y-2 lg:space-y-3">
          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-md transition-all duration-200 text-sm lg:text-base hover:shadow-lg text-gray-900 placeholder:text-gray-400"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={formData.age || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-md transition-all duration-200 text-sm lg:text-base hover:shadow-lg text-gray-900 placeholder:text-gray-400"
              placeholder="Enter age"
              min="1"
              max="120"
            />
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-1">
              Hobbies
            </label>
            <div className="flex gap-2 mb-2 lg:mb-3 items-stretch">
              <input
                type="text"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 lg:px-4 lg:py-2.5 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white shadow-sm transition-all duration-200 text-sm lg:text-base text-gray-900 placeholder:text-gray-400"
                placeholder="Add hobby"
                onKeyPress={(e) => e.key === 'Enter' && handleAddHobby()}
              />
              <button
                onClick={handleAddHobby}
                type="button"
                className="flex-shrink-0 w-12 lg:w-14 h-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors duration-200 font-bold text-lg lg:text-xl flex items-center justify-center"
              >
                ➕
              </button>
            </div>
            <div className="flex flex-wrap gap-1 lg:gap-2">
              {formData.hobbies.map((hobby, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 lg:px-3 lg:py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs rounded-full border-2 border-purple-300/50 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <span className="truncate max-w-20 lg:max-w-none">{hobby}</span>
                  <button
                    onClick={() => handleRemoveHobby(hobby)}
                    className="ml-1 lg:ml-2 text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full w-3 h-3 lg:w-4 lg:h-4 flex items-center justify-center transition-all duration-200 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {!isCreating && !editingUser && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                ➕ Create User
              </button>
            )}
            
            {isCreating && (
              <button
                onClick={handleCreateUser}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                💾 Save User
              </button>
            )}
            
            {editingUser && (
              <button
                onClick={handleUpdateUser}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                ✏️ Update User
              </button>
            )}
            
            {(isCreating || editingUser) && (
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingUser(null);
                  setFormData({ username: '', age: 0, hobbies: [] });
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl hover:from-gray-600 hover:to-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-bold"
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center">
            <span className="mr-2 text-xl">👥</span>
            All Users ({users.length})
          </h4>
        </div>
        
        {users.map((user) => (
          <div key={user._id} className="p-4 bg-gradient-to-br from-white to-purple-50/30 rounded-2xl border-2 border-purple-200/50 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h5 className="font-semibold text-gray-800 mb-1">{user.username}</h5>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span>Age: {user.age}</span>
                  <span className="flex items-center">
                    {user.popularityScore > 5 ? '⭐' : '📊'} {user.popularityScore.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 font-semibold"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this user?')) {
                      onUserDelete(user._id);
                    }
                  }}
                  className="px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 font-semibold"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <div className="font-medium mb-1">Hobbies:</div>
              <div className="flex flex-wrap gap-1">
                {user.hobbies.slice(0, 3).map((hobby, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                    {hobby}
                  </span>
                ))}
                {user.hobbies.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{user.hobbies.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {users.length === 0 && (
          <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-300">
            <div className="text-6xl mb-4 animate-pulse">👥</div>
            <div className="text-gray-600 font-semibold text-base">No users found</div>
            <div className="text-gray-500 text-sm mt-2">Create your first user above!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPanel;
