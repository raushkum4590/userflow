'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface HighScoreNodeData {
  label: string;
  age: number;
  hobbies: string[];
  popularityScore: number;
}

const HighScoreNode = memo(({ data, selected }: NodeProps<HighScoreNodeData>) => {
  return (
    <div className={`
      px-6 py-5 shadow-2xl rounded-2xl 
      bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 
      text-white border-2 border-emerald-200/50
      min-w-[200px] max-w-[240px]
      transform transition-all duration-300 ease-out
      hover:scale-110 hover:shadow-[0_20px_50px_rgba(16,185,129,0.5)]
      hover:rotate-1
      ${selected ? 'ring-4 ring-yellow-300 ring-offset-2 scale-105' : ''}
      relative overflow-hidden
      backdrop-blur-sm
      animate-pulse-slow
    `}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-white/10 animate-gradient"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]"></div>
      </div>
      
      <Handle 
        type="target" 
        position={Position.Top}
        isConnectable={true}
        className="!w-4 !h-4 !bg-white !border-4 !border-emerald-400 !rounded-full hover:!scale-150 transition-transform"
        style={{ top: -8 }}
      />
      
      <div className="text-center relative z-10">
        <div className="font-extrabold text-xl mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] tracking-tight">{data.label}</div>
        <div className="text-sm font-medium opacity-90 mb-3 bg-white/20 rounded-full px-3 py-1 inline-block">🎂 {data.age} years</div>
        
        {/* Popularity score with visual indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-yellow-300/30 to-orange-300/30 border border-yellow-200/50 rounded-full px-4 py-2 text-sm font-bold shadow-inner backdrop-blur-sm">
            ⭐ {data.popularityScore.toFixed(1)} Score
          </div>
        </div>
        
        {/* Hobbies with better styling */}
        <div className="text-xs space-y-2">
          <div className="font-semibold text-xs uppercase tracking-wider opacity-80 mb-1">Interests</div>
          {data.hobbies.slice(0, 3).map((hobby, index) => (
            <div key={index} className="bg-white/25 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm border border-white/20 hover:bg-white/35 transition-colors duration-200">
              🎯 {hobby}
            </div>
          ))}
          {data.hobbies.length > 3 && (
            <div className="text-xs font-semibold opacity-90 bg-white/15 rounded-lg px-2 py-1">
              +{data.hobbies.length - 3} more hobbies
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom}
        isConnectable={true}
        className="!w-4 !h-4 !bg-white !border-4 !border-emerald-400 !rounded-full hover:!scale-150 transition-transform"
        style={{ bottom: -8 }}
      />
    </div>
  );
});

HighScoreNode.displayName = 'HighScoreNode';

export default HighScoreNode;
