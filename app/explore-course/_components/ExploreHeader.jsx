'use client'

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  HiSparkles, 
  HiOutlineChartBar, 
  HiOutlineBookOpen, 
  HiOutlineLightBulb, 
  HiOutlineTrendingUp,
  HiOutlinePlusCircle,
  HiOutlineAcademicCap
} from "react-icons/hi2";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";

const StatCard = ({ icon: Icon, title, value, isLoading }) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex-1 min-w-[200px]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-300">
          {Icon && <Icon className="text-orange-600 text-xl group-hover:scale-110 transition-transform duration-300" />}
        </div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-xl font-semibold text-gray-900">
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              value
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ExploreHeader = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalChapters: 0,
    categories: {},
    totalContent: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const coursesRef = ref(realtimeDb, 'courses');
        const snapshot = await get(coursesRef);
        
        if (snapshot.exists()) {
          const courses = Object.values(snapshot.val());
          
          const newStats = courses.reduce((acc, course) => {
            const chaptersCount = course.chapters?.length || 0;
            acc.totalChapters += chaptersCount;
            
            course.chapters?.forEach(chapter => {
              acc.totalContent += chapter.content?.length || 0;
            });
            
            if (course.category) {
              acc.categories[course.category] = (acc.categories[course.category] || 0) + 1;
            }

            const courseDate = new Date(course.createdAt || 0);
            if (!acc.lastActivity || courseDate > acc.lastActivity) {
              acc.lastActivity = courseDate;
            }
            
            return acc;
          }, {
            totalCourses: courses.length,
            totalChapters: 0,
            totalContent: 0,
            categories: {},
            lastActivity: null
          });
          
          setStats(newStats);
        }
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="mt-0">
      {/* Tarjeta de bienvenida */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-1/3 -translate-y-1/3">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl rounded-full animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            ¡Bienvenido{user?.firstName ? `, ${user.firstName}` : ''}! 👋
          </h1>
          <div className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
            Explora nuestra colección de cursos creados por la comunidad.
            Encuentra el conocimiento que buscas y aprende a tu propio ritmo.
          </div>
          <Link href="/create-course">
            <Button 
              className="bg-white text-orange-600 hover:bg-orange-50 transition-colors duration-300 text-sm sm:text-base px-6 py-2 sm:px-8 sm:py-3 rounded-xl flex items-center gap-2 font-medium"
            >
              <HiOutlinePlusCircle className="text-xl" />
              <span>Crear Nuevo Curso</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExploreHeader;
