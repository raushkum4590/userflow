'use client';

import { useState, useMemo } from 'react';

interface HobbySidebarProps {
  allHobbies: string[];
  onHobbyDrag: (hobby: string) => void;
  onHobbySearch: (searchTerm: string) => void;
}

const HobbySidebar = ({ allHobbies, onHobbyDrag, onHobbySearch }: HobbySidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedHobby, setDraggedHobby] = useState<string | null>(null);

  const filteredHobbies = useMemo(() => {
    if (!searchTerm) return allHobbies;
    return allHobbies.filter(hobby =>
      hobby.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allHobbies, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onHobbySearch(value);
  };

  const handleDragStart = (e: React.DragEvent, hobby: string) => {
    setDraggedHobby(hobby);
    e.dataTransfer.setData('application/hobby', hobby);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedHobby(null);
  };

  return (
    <div className="w-full lg:w-64 xl:w-72 2xl:w-80 bg-gradient-to-b from-white via-indigo-50/30 to-purple-50/30 border-r-2 border-purple-200/50 h-48 lg:h-full overflow-y-auto backdrop-blur-sm">
      <div className="p-4 lg:p-6">
        <div className="flex items-center mb-4 lg:mb-6">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg flex items-center justify-center mr-3">
            <span className="text-white text-lg lg:text-xl">🎯</span>
          </div>
          <h3 className="text-lg lg:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Hobbies</h3>
        </div>
        
        <div className="mb-4 lg:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search hobbies..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 lg:px-4 lg:py-3 pl-9 lg:pl-11 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-md transition-all duration-200 text-sm lg:text-base hover:shadow-lg text-gray-900 placeholder:text-gray-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-purple-400 text-base lg:text-lg">🔍</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 lg:space-y-3">
          {filteredHobbies.map((hobby, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, hobby)}
              onDragEnd={handleDragEnd}
              className={`
                bg-gradient-to-r from-white to-purple-50/50 p-3 lg:p-4 rounded-xl shadow-md border-2 border-purple-200/50 
                cursor-move hover:shadow-xl hover:scale-110 
                transition-all duration-300 transform
                ${draggedHobby === hobby ? 'opacity-50 scale-95 rotate-3' : ''}
                hover:border-purple-400 hover:from-purple-100 hover:to-pink-100
                group
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🎯</span>
                  <span className="text-xs lg:text-sm font-semibold text-gray-700 group-hover:text-purple-700 truncate">
                    {hobby}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
                  <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 hidden lg:inline">Drag →</span>
                  <span className="text-base text-purple-500 lg:hidden">➡️</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHobbies.length === 0 && (
          <div className="text-center py-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-dashed border-purple-300">
            <div className="text-6xl mb-4 animate-pulse">🔍</div>
            <div className="text-gray-600 font-semibold text-base mb-2">
              No hobbies found
            </div>
            <div className="text-gray-500 text-sm">
              matching "{searchTerm}"
            </div>
          </div>
        )}

        {allHobbies.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-blue-200/50 shadow-lg">
            <div className="text-xs text-gray-700">
              <div className="font-bold mb-2 flex items-center text-sm">
                <span className="text-lg mr-2">💡</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Pro Tip</span>
              </div>
              <div className="text-gray-600">Drag hobbies onto user nodes to add them as interests!</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HobbySidebar;
