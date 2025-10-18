'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReactFlowProvider, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import UserNetworkFlow from './components/UserNetworkFlow';
import HobbySidebar from './components/HobbySidebar';
import UserManagementPanel from './components/UserManagementPanel';
import { Connection } from 'reactflow';

interface User {
  _id: string;
  username: string;
  age: number;
  hobbies: string[];
  popularityScore: number;
}


// Backend is deployed separately on Vercel
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backenduserflow.vercel.app/api';

function HomeContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allHobbies, setAllHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/graph`);
      const data = await response.json();
      
      if (data.success) {
        setNodes(data.data.nodes);
        setEdges(data.data.edges);
      } else {
        setError(data.message || 'Failed to fetch graph data');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        // Extract all unique hobbies
        const hobbies = new Set<string>();
        data.data.forEach((user: User) => {
          user.hobbies.forEach(hobby => hobbies.add(hobby));
        });
        setAllHobbies(Array.from(hobbies));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  // Create user
  const handleUserCreate = useCallback(async (userData: Omit<User, '_id' | 'popularityScore'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        await fetchGraphData();
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch {
      setError('Failed to create user');
    }
  }, [fetchUsers, fetchGraphData]);

  // Update user
  const handleUserUpdate = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        await fetchGraphData();
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch {
      setError('Failed to update user');
    }
  }, [fetchUsers, fetchGraphData]);

  // Delete user
  const handleUserDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        await fetchGraphData();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch {
      setError('Failed to delete user');
    }
  }, [fetchUsers, fetchGraphData]);

  // Connect users
  const handleUsersConnect = useCallback(async (userId1: string, userId2: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId1}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId2 }),
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
        await fetchGraphData();
      } else {
        setError(data.message || 'Failed to connect users');
      }
    } catch {
      setError('Failed to connect users');
    }
  }, [fetchUsers, fetchGraphData]);

  // Handle node connections
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target) {
      console.log('✅ Connecting:', connection.source, '→', connection.target);
      handleUsersConnect(connection.source, connection.target);
    }
  }, [handleUsersConnect]);

  // Handle hobby drop on node
  const handleHobbyDrop = useCallback(async (nodeId: string, hobby: string) => {
    try {
      const user = users.find(u => u._id === nodeId);
      if (!user) return;

      const updatedHobbies = [...user.hobbies, hobby];
      await handleUserUpdate(nodeId, { hobbies: updatedHobbies });
    } catch (error) {
      console.error('Failed to add hobby to user:', error);
    }
  }, [users, handleUserUpdate]);

  // Handle hobby search
  const handleHobbySearch = useCallback((searchTerm: string) => {
    console.log('Searching hobbies:', searchTerm);
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchUsers();
    fetchGraphData();
  }, [fetchUsers, fetchGraphData]);

  // Debug logging
  console.log('HomeContent - Users:', users.length, 'Nodes:', nodes.length, 'Edges:', edges.length);

  // Create sample data if no users exist (commented out to prevent infinite loops)
  // useEffect(() => {
  //   if (users.length === 0 && !loading) {
  //     console.log('No users found, creating sample data...');
  //     handleUserCreate({
  //       username: 'John Doe',
  //       age: 25,
  //       hobbies: ['reading', 'gaming']
  //     });
  //   }
  // }, [users.length, loading, handleUserCreate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-12 flex flex-col items-center space-y-6 border-2 border-purple-200/50">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-400 opacity-20"></div>
          </div>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Loading Network...</div>
          <div className="text-base text-gray-600">Setting up your user relationship network</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 flex flex-col items-center space-y-6 max-w-lg text-center border-2 border-red-200/50">
          <div className="text-7xl animate-bounce">⚠️</div>
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600">Connection Error</div>
          <div className="text-gray-700 text-lg bg-red-50 rounded-lg p-4 border border-red-200">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold text-lg"
          >
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col lg:flex-row h-full w-full">
        {/* Hobby Sidebar - Mobile: Top, Desktop: Left */}
        <div className="lg:order-1">
          <HobbySidebar
            allHobbies={allHobbies}
            onHobbySearch={handleHobbySearch}
          />
        </div>
        
        {/* Main Graph Area - Mobile: Middle, Desktop: Center */}
        <div className="flex-1 relative order-2 lg:order-2" style={{ minHeight: '500px', height: '100vh' }}>
          <UserNetworkFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onHobbyDrop={handleHobbyDrop}
          />
        </div>
        
        {/* User Management Panel - Mobile: Bottom, Desktop: Right */}
        <div className="lg:order-3">
          <UserManagementPanel
            users={users}
            onUserCreate={handleUserCreate}
            onUserUpdate={handleUserUpdate}
            onUserDelete={handleUserDelete}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <HomeContent />
    </ReactFlowProvider>
  );
}