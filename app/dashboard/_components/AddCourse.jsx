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
  HiOutlinePlusCircle
} from "react-icons/hi";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";

const AddCourse = () => {
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
      if (!user?.primaryEmailAddress?.emailAddress) return;

      try {
        setLoading(true);
        const coursesRef = ref(realtimeDb, 'courses');
        const snapshot = await get(coursesRef);
        
        if (snapshot.exists()) {
          const courses = Object.values(snapshot.val());
          const userEmail = user.primaryEmailAddress.emailAddress;
          const userCourses = courses.filter(course => course.createdBy === userEmail);
          
          const newStats = userCourses.reduce((acc, course) => {
            // Total de capítulos y contenido
            const chaptersCount = course.chapters?.length || 0;
            acc.totalChapters += chaptersCount;
            
            // Contar contenido total (secciones dentro de capítulos)
            course.chapters?.forEach(chapter => {
              acc.totalContent += chapter.content?.length || 0;
            });
            
            // Categorías
            if (course.category) {
              acc.categories[course.category] = (acc.categories[course.category] || 0) + 1;
            }

            // Última actividad
            const courseDate = new Date(course.createdAt || 0);
            if (!acc.lastActivity || courseDate > acc.lastActivity) {
              acc.lastActivity = courseDate;
            }
            
            return acc;
          }, {
            totalCourses: userCourses.length,
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
  }, [user]);

  const StatCard = ({ icon: Icon, title, value, subtitle = "" }) => (
    <div 
      className="group bg-white/50 backdrop-blur-sm p-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors duration-300">
          <Icon className="text-orange-600 text-xl group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div>
          <h3 className="text-sm text-gray-500">{title}</h3>
          <p className="text-xl font-semibold text-gray-900">
            {loading ? (
              <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const formatDate = (date) => {
    if (!date) return 'Sin actividad';
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="relative overflow-hidden animate-fadeIn">
      {/* Fondo con gradiente y animación */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-100/30 to-white rounded-2xl animate-gradient" />
      
      {/* Contenido principal */}
      <div className="relative p-6 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Sección de bienvenida y CTA */}
          <div className="space-y-6 animate-slideInLeft">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <HiSparkles className="text-orange-500 text-2xl animate-bounce" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text animate-gradient">
                  ¡Bienvenido {user?.fullName || 'Profesor'}!
                </h2>
              </div>
              
              <p className="text-gray-600">
                Crea cursos personalizados con IA y compártelos con tu comunidad.
                {stats.totalCourses > 0 && (
                  <span className="block mt-2 animate-fadeIn">
                    Ya tienes <span className="font-semibold text-orange-600">{stats.totalCourses} cursos</span> creados
                    con <span className="font-semibold text-orange-600">{stats.totalContent} lecciones</span>.
                  </span>
                )}
              </p>
            </div>
            
            {/* Botón CTA con animaciones */}
            <div className="group animate-slideInUp">
              <Link href="/create-course" className="block">
                <Button className="relative w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <HiOutlinePlusCircle className="mr-2 text-2xl group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10">Crear Nuevo Curso con IA</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Sección de estadísticas */}
          <div className="grid grid-cols-2 gap-3 animate-slideInRight">
            <StatCard 
              icon={HiOutlineBookOpen}
              title="Cursos"
              value={stats.totalCourses}
            />
            <StatCard 
              icon={HiOutlineChartBar}
              title="Capítulos"
              value={stats.totalChapters}
            />
            <StatCard 
              icon={HiOutlineLightBulb}
              title="Contenido"
              value={stats.totalContent}
              subtitle="Lecciones creadas"
            />
            <StatCard 
              icon={HiOutlineTrendingUp}
              title="Última Actividad"
              value={formatDate(stats.lastActivity)}
            />
          </div>
        </div>

        {/* Categorías con animación */}
        {Object.keys(stats.categories).length > 0 && (
          <div className="mt-6 animate-slideInUp">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Tus categorías</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categories).map(([category, count], index) => (
                <span 
                  key={category}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors duration-200 hover:-translate-y-0.5 transform cursor-default"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInUp 0.5s ease forwards'
                  }}
                >
                  {category} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AddCourse;