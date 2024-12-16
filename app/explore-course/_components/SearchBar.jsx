"use client"
import React, { useState } from 'react'
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2"
import { motion, AnimatePresence } from "framer-motion"
import CategoryList from '@/app/_shared/CategoryList'

const SearchBar = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleCategoryClick = (category) => {
    if (selectedCategory === category.name) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category.name);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-3xl mx-auto -mt-8 space-y-4 px-6 sm:px-8"
    >
      <div className="relative">
        <motion.div
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused 
              ? "0 8px 32px rgba(234, 88, 12, 0.2)" 
              : "0 4px 20px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ duration: 0.2 }}
          className="relative rounded-xl overflow-hidden bg-white backdrop-blur-lg bg-opacity-80"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full px-4 py-4 pl-12 pr-10 bg-transparent rounded-xl border border-white/20 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all duration-200 outline-none"
          />
          <motion.div
            animate={{ scale: isFocused ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
          >
            <HiMagnifyingGlass className="text-orange-500 text-xl" />
          </motion.div>
          
          <AnimatePresence>
            {(searchQuery || selectedCategory) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <HiXMark className="text-xl" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      <motion.div 
        layout
        className="flex gap-2 flex-wrap"
      >
        {CategoryList.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.name;
          return (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white/80 backdrop-blur-lg text-orange-700 hover:bg-orange-50 shadow-md'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{category.name}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  )
}

export default SearchBar
