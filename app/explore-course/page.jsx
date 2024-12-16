"use client"
import React, { useEffect, useState } from 'react'
import Card from './_components/Card'
import ExploreHeader from './_components/ExploreHeader'
import SearchBar from './_components/SearchBar'
import { ref, onValue } from 'firebase/database'
import { realtimeDb } from '@/configs/firebaseConfig'

const ExploreCourse = () => {
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        console.log('Cursos cargados:', coursesArray); // Log para depuración
        setCourseList(coursesArray);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar cursos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtrar cursos basado en la búsqueda
  const filteredCourses = courseList.filter(course => {
    if (!searchQuery.trim()) return true; // Si no hay búsqueda, mostrar todos los cursos
    
    const searchLower = searchQuery.toLowerCase().trim();
    
    // Verificar cada campo que queremos buscar
    const titleMatch = course.name?.toLowerCase().includes(searchLower);
    const descriptionMatch = course.description?.toLowerCase().includes(searchLower);
    const topicMatch = course.topic?.toLowerCase().includes(searchLower);
    const levelMatch = course.level?.toLowerCase().includes(searchLower);

    console.log('Búsqueda para curso:', {
      id: course.courseId,
      name: course.name,
      searchTerm: searchLower,
      matches: {
        title: titleMatch,
        description: descriptionMatch,
        topic: topicMatch,
        level: levelMatch
      }
    });

    return titleMatch || descriptionMatch || topicMatch || levelMatch;
  });

  console.log('Resultados filtrados:', filteredCourses.length); // Log para depuración

  return (
    <div className='min-h-screen bg-gradient-to-b from-orange-50 to-white'>
      <div className='p-5'>
        <ExploreHeader />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <div className="mt-8 px-3 sm:px-3">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-10">
              {searchQuery ? (
                <>
                  <h3 className="text-xl font-medium text-gray-600">No se encontraron cursos para "{searchQuery}"</h3>
                  <p className="text-gray-500 mt-2">Intenta con otros términos de búsqueda</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200"
                  >
                    Limpiar búsqueda
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
              {searchQuery && (
                <div className="mb-6 text-gray-600">
                  Se encontraron {filteredCourses.length} resultados para "{searchQuery}"
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <Card key={course.courseId || index} course={course} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExploreCourse
