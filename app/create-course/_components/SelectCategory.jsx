import { UserInputContext } from "@/app/_context/UserInputContext";
import CategoryList from "@/app/_shared/CategoryList";
import Image from "next/image";
import React, { useContext, useState } from "react";

const SelectCategory = () => {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const handleCategoryChange = (category) => {
    setUserCourseInput((prev) => ({
      ...prev,
      category: category,
    }));
  };

  return (
    <div className="px-4 md:px-8 py-2 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {CategoryList.map((item, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`relative group flex flex-col p-4 items-center rounded-xl cursor-pointer
              transform transition-all duration-500 ease-out hover:scale-105
              ${userCourseInput?.category === item.name
                ? 'bg-gradient-to-br from-orange-50 to-primary/10 border-2 border-primary shadow-lg animate-pulse-shadow'
                : 'bg-white border border-gray-100 hover:border-primary/30 hover:shadow-md'
              }
              ${hoveredIndex === index ? 'animate-bounce-subtle' : ''}
              animate-scale`}
            onClick={() => handleCategoryChange(item.name)}
          >
            <div className={`relative w-12 h-12 mb-2 transition-transform duration-300 group-hover:scale-110
              ${userCourseInput?.category === item.name ? 'animate-bounce-subtle' : ''}`}>
              <Image
                rel={"category"}
                src="/logo.png"
                fill
                style={{ objectFit: 'contain' }}
                alt={`${item.name}`}
                className={`drop-shadow-md transition-all duration-500
                  ${hoveredIndex === index ? 'animate-icon-pop' : ''}`}
              />
            </div>
            <h2 className={`text-center text-xs sm:text-sm font-medium transition-colors duration-300
              ${userCourseInput?.category === item.name
                ? 'text-primary'
                : 'text-gray-600 group-hover:text-primary'
              }`}>
              {item.name}
            </h2>
            {userCourseInput?.category === item.name && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md animate-icon-pop">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/5 to-primary/5 rounded-xl transition-opacity duration-300
              ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectCategory;
