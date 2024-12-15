import React from 'react';
import { HiOutlineBookOpen } from "react-icons/hi";

const ChapterListCard = ({ chapter, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 cursor-pointer border-b border-gray-100
        hover:bg-orange-50/50 transition-colors duration-200
        ${isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          isSelected ? 'bg-orange-100' : 'bg-gray-100'
        }`}>
          <HiOutlineBookOpen className={`w-5 h-5 ${
            isSelected ? 'text-orange-600' : 'text-gray-600'
          }`} />
        </div>
        <div>
          <h3 className={`font-medium ${
            isSelected ? 'text-orange-900' : 'text-gray-900'
          }`}>
            {chapter.name}
          </h3>
          {chapter.about && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {chapter.about}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterListCard;