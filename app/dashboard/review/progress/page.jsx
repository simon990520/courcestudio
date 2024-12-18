"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HiOutlineTrendingUp,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from "react-icons/hi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const QuizProgressPage = () => {
  const [progress, setProgress] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      // Cargar progreso general
      const progressRef = ref(realtimeDb, `users/${user.id}/progress`);
      const progressSnapshot = await get(progressRef);
      
      // Cargar historial de quizzes
      const historyRef = ref(realtimeDb, `users/${user.id}/quizHistory`);
      const historySnapshot = await get(historyRef);
      
      if (progressSnapshot.exists()) {
        setProgress(progressSnapshot.val());
      }
      
      if (historySnapshot.exists()) {
        const historyData = historySnapshot.val();
        
        // Convertir los timestamps a objetos Date para comparación
        const processedHistory = Object.entries(historyData)
          .map(([key, data]) => ({
            id: key,
            ...data,
            dateObj: new Date(data.timestamp),
            displayDate: new Date(data.timestamp).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }))
          // Ordenar por fecha, más reciente primero
          .sort((a, b) => b.dateObj - a.dateObj)
          // Eliminar duplicados basados en el timestamp (mantener solo el más reciente)
          .filter((quiz, index, self) => 
            index === self.findIndex((q) => 
              Math.abs(q.dateObj - quiz.dateObj) < 1000 // Considerar duplicados si están dentro de 1 segundo
            )
          )
          // Limpiar campos temporales
          .map(({ dateObj, ...quiz }) => quiz);

        setQuizHistory(processedHistory);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const calculateStats = () => {
    if (!progress) return { averageScore: 0, totalQuizzes: 0, totalQuestions: 0 };
    
    return {
      averageScore: progress.averageScore || 0,
      totalQuizzes: progress.totalQuizzes || 0,
      totalQuestions: progress.totalQuestions || 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Tu Progreso</h1>
            <p className="text-gray-500">Visualiza tu rendimiento en quizzes y evaluaciones</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-white p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <HiOutlineTrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Promedio General</h3>
                    <p className="text-2xl font-bold text-gray-800">{stats.averageScore.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-white p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <HiOutlineAcademicCap className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Quizzes Completados</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</p>
                      <span className="text-sm text-gray-500">evaluaciones</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group"
            >
              <Card className="relative overflow-hidden bg-white p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <HiOutlineChartBar className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total de Preguntas</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-800">{stats.totalQuestions}</p>
                      <span className="text-sm text-gray-500">preguntas</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Quiz History */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Historial de Quizzes</h2>
              {quizHistory.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <HiOutlineChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <HiOutlineChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4">
              {quizHistory.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="bg-white p-6 transition-all duration-300 hover:shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <HiOutlineClock className="h-5 w-5 text-orange-500" />
                          <span className="text-sm text-gray-500">{quiz.displayDate}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center text-green-600">
                            <HiOutlineCheck className="mr-2 h-5 w-5" />
                            <span className="text-lg font-medium">{quiz.correctAnswers} correctas</span>
                          </div>
                          <div className="flex items-center text-red-500">
                            <HiOutlineX className="mr-2 h-5 w-5" />
                            <span className="text-lg font-medium">{quiz.incorrectAnswers} incorrectas</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Puntuación</div>
                          <div className="text-2xl font-bold text-gray-800">{quiz.score.toFixed(1)}%</div>
                        </div>
                        <Progress 
                          value={quiz.score} 
                          className="w-32 h-2 bg-orange-100" 
                          indicatorClassName="bg-orange-500"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {quizHistory.length === 0 && (
                <Card className="bg-white p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <HiOutlineAcademicCap className="h-12 w-12 text-orange-500" />
                    <h3 className="text-lg font-semibold text-gray-800">No hay quizzes completados</h3>
                    <p className="text-gray-500">Comienza a tomar quizzes para ver tu progreso aquí</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizProgressPage;
