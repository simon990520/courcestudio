"use client"

import { UserInputContext } from "@/app/_context/UserInputContext";
import CategoryList from "@/app/_shared/CategoryList";
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
        {CategoryList.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleCategoryChange(item.name)}
              className={`relative group flex flex-col p-4 items-center rounded-xl cursor-pointer
                transform transition-all duration-500 ease-out hover:scale-105
                ${userCourseInput?.category === item.name
                  ? 'bg-gradient-to-br from-orange-50 to-primary/10 border-2 border-primary shadow-lg animate-pulse-shadow'
                  : 'bg-white border border-gray-100 hover:border-primary/30 hover:shadow-md'
                }
                ${hoveredIndex === index ? 'animate-bounce-subtle' : ''}`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-2
                ${userCourseInput?.category === item.name
                  ? 'bg-primary text-white'
                  : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'
                }
                transition-all duration-300`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className={`text-sm font-medium text-center
                ${userCourseInput?.category === item.name
                  ? 'text-primary'
                  : 'text-gray-600 group-hover:text-primary'
                }
                transition-colors duration-300`}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectCategory;
