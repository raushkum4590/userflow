'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowProvider,
  Panel,
  MarkerType,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import HighScoreNode from './HighScoreNode';
import LowScoreNode from './LowScoreNode';

// Define nodeTypes outside component to prevent recreation
const nodeTypes: NodeTypes = {
  highScoreNode: HighScoreNode,
  lowScoreNode: LowScoreNode,
};

interface UserNetworkFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onHobbyDrop?: (nodeId: string, hobby: string) => void;
}

const UserNetworkFlow = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onHobbyDrop,
}: UserNetworkFlowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Debug logging
  console.log('UserNetworkFlow - Nodes:', nodes.length, 'Edges:', edges.length);

  // Simple edge styles
  const defaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: {
      strokeWidth: 2,
      stroke: '#8b5cf6',
    },
  }), []);

  // Handle drag and drop events
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const hobby = event.dataTransfer.getData('application/hobby');
    if (hobby && dragOverNode && onHobbyDrop) {
      onHobbyDrop(dragOverNode, hobby);
    }
    setDragOverNode(null);
  }, [dragOverNode, onHobbyDrop]);

  const handleNodeDragOver = useCallback((event: React.DragEvent, nodeId: string) => {
    event.preventDefault();
    setDragOverNode(nodeId);
  }, []);

  const handleNodeDragLeave = useCallback(() => {
    setDragOverNode(null);
  }, []);

  // Simple connection handlers
  const onConnectStart = useCallback(() => {
    setIsConnecting(true);
  }, []);

  const onConnectEnd = useCallback(() => {
    setIsConnecting(false);
  }, []);

  // Show fallback when no nodes
  if (nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/50">
          <div className="text-7xl mb-6 animate-bounce">🌐</div>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">No Users Yet</h3>
          <p className="text-gray-600 text-lg">Create some users to see the network visualization</p>
          <div className="mt-6 text-sm text-gray-500">
            👉 Use the right panel to add users
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="bg-transparent"
        connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 2 }}
        connectionMode={ConnectionMode.Loose}
      >
        <Controls 
          className="bg-white/95 backdrop-blur-md border-2 border-purple-200/50 rounded-xl shadow-2xl hover:shadow-purple-200/50 transition-shadow duration-300"
          position="top-left"
        />
        
        <MiniMap 
          className="bg-white/95 backdrop-blur-md border-2 border-purple-200/50 rounded-xl shadow-2xl"
          nodeColor={(node) => {
            if (node.type === 'highScoreNode') return '#10b981';
            return '#8b5cf6';
          }}
          nodeStrokeWidth={3}
          nodeBorderRadius={12}
          maskColor="rgba(139, 92, 246, 0.1)"
        />
        
        <Background 
          variant="dots" 
          gap={16} 
          size={2} 
          color="#c4b5fd"
          className="opacity-30"
        />
        
        <Panel position="top-right" className="bg-gradient-to-br from-white/95 to-purple-50/95 backdrop-blur-lg border-2 border-purple-200/50 rounded-2xl shadow-2xl p-5">
          <div className="text-sm">
            <div className="font-bold text-lg mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center">
              📊 Network Stats
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg px-3 py-2 border border-emerald-200/50">
                <span className="font-medium text-gray-700">👥 Users:</span>
                <span className="font-bold text-emerald-600">{nodes.length}</span>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg px-3 py-2 border border-purple-200/50">
                <span className="font-medium text-gray-700">🔗 Connections:</span>
                <span className="font-bold text-purple-600">{edges.length}</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border-2 border-blue-300/50">
              <div className="font-bold mb-2 text-sm text-purple-700">🔗 Connect Users:</div>
              <div className="bg-white/60 rounded p-2 text-center">
                <div className="text-lg font-bold text-purple-600 mb-1">
                  Drag ⭕ → ⭕ Drop
                </div>
                <div className="text-xs text-gray-600">
                  From bottom circle to top circle
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
      
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center space-x-4 border-2 border-purple-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-purple-600"></div>
            <span className="text-gray-700 font-semibold text-lg">Updating network...</span>
          </div>
        </div>
      )}
      
      {isConnecting && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-pulse">
            <div className="text-center">
              <div className="text-3xl mb-1">⭕ → ⭕</div>
              <div className="font-bold text-base">Drop on circle to connect</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNetworkFlow;
