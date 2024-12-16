"use client"
import React, { useEffect, useState } from 'react'
import Card from './_components/Card'
import ExploreHeader from './_components/ExploreHeader'
import SearchBar from './_components/SearchBar'
import { ref, onValue } from 'firebase/database'
import { realtimeDb } from '@/configs/firebaseConfig'
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2"
import { motion, AnimatePresence } from "framer-motion"

const ExploreCourse = () => {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 16; // 4x4 grid

  useEffect(() => {
    // Referencia a la colección de cursos
    const coursesRef = ref(realtimeDb, 'courses');

    // Escuchar cambios en tiempo real
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        // Convertir los datos de Firebase a un array y asegurarse de que cada curso tenga un ID
        const coursesData = snapshot.val();
        const coursesArray = Object.entries(coursesData).map(([id, course]) => ({
          ...course,
          courseId: id
        }));
        console.log('Cursos cargados:', coursesArray);
        setCourseList(coursesArray);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar cursos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar cursos basado en la búsqueda y categoría
  const filteredCourses = courseList.filter(course => {
    if (selectedCategory && course.category !== selectedCategory) {
      return false;
    }
    
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase().trim();
    
    const titleMatch = course.courseOutput?.course?.name?.toLowerCase().includes(searchLower);
    const descriptionMatch = course.courseOutput?.course?.description?.toLowerCase().includes(searchLower);
    const categoryMatch = course.category?.toLowerCase().includes(searchLower);

    return titleMatch || descriptionMatch || categoryMatch;
  });

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Obtener los cursos para la página actual
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Función para cambiar de página
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
      <div className='p-5'>
        <ExploreHeader />
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        
        <div className="mt-8 px-3 sm:px-3">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-10">
              {searchQuery || selectedCategory ? (
                <>
                  <h3 className="text-xl font-medium text-gray-600">
                    No se encontraron cursos
                    {searchQuery && ` para "${searchQuery}"`}
                    {selectedCategory && ` en la categoría "${selectedCategory}"`}
                  </h3>
                  <p className="text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200"
                  >
                    Limpiar filtros
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-medium text-gray-600">No hay cursos disponibles</h3>
                  <p className="text-gray-500 mt-2">¡Sé el primero en crear un curso!</p>
                </>
              )}
            </div>
          ) : (
            <>
              {(searchQuery || selectedCategory) && (
                <div className="mb-6 text-gray-600">
                  Se encontraron {filteredCourses.length} resultados
                  {searchQuery && ` para "${searchQuery}"`}
                  {selectedCategory && ` en la categoría "${selectedCategory}"`}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="wait">
                  {currentCourses.map((course, index) => (
                    <motion.div
                      key={course.courseId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card course={course} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-orange-500 hover:bg-orange-100'
                    }`}
                  >
                    <HiChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = pageNumber === currentPage;
                      const isNearCurrent = Math.abs(pageNumber - currentPage) <= 1;
                      const isFirstOrLast = pageNumber === 1 || pageNumber === totalPages;
                      
                      if (isNearCurrent || isFirstOrLast) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                              isCurrentPage
                                ? 'bg-orange-500 text-white'
                                : 'hover:bg-orange-100 text-gray-600'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        (pageNumber === currentPage - 2 && currentPage > 3) ||
                        (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
                      ) {
                        return <span key={pageNumber} className="px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-orange-500 hover:bg-orange-100'
                    }`}
                  >
                    <HiChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExploreCourse
