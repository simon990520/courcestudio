"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig"; 
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  HiOutlineTrendingUp,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineCheck,
  HiOutlineCollection,
  HiOutlineChevronLeft
} from "react-icons/hi";
import { motion } from "framer-motion";

const FlashcardsProgressPage = () => {
  const [sessions, setSessions] = useState([]);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      loadProgress();
    }
  }, [user, isLoaded]);

  const loadProgress = async () => {
    try {
      // Cargar sesiones de flashcards
      const sessionsRef = ref(realtimeDb, `users/${user.id}/flashcardSessions`);
      const sessionsSnapshot = await get(sessionsRef);
      
      if (sessionsSnapshot.exists()) {
        const sessionsData = sessionsSnapshot.val();
        const processedSessions = Object.entries(sessionsData)
          .map(([key, data]) => {
            const total = data.stats?.total || (data.flashcards ? data.flashcards.length : 0);
            const mastered = data.stats?.mastered || 0;
            const completionRate = total > 0 ? (mastered / total) * 100 : 0;

            return {
              id: key,
              ...data,
              total,
              mastered,
              completionRate,
              dateObj: new Date(parseInt(key)),
              displayDate: new Date(parseInt(key)).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            };
          })
          .sort((a, b) => b.dateObj - a.dateObj);

        setSessions(processedSessions);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
      setSessions([]);
    }
  };

  const calculateStats = () => {
    if (sessions.length === 0) return {
      totalSessions: 0,
      totalCards: 0,
      masteredCards: 0,
      averageCompletionRate: 0,
      streak: 0
    };

    const stats = sessions.reduce((acc, session) => {
      const total = session.total || 0;
      const mastered = session.mastered || 0;
      const completionRate = session.completionRate || 0;
      
      acc.totalCards += total;
      acc.masteredCards += mastered;
      acc.totalCompletionRate += completionRate;
      return acc;
    }, {
      totalCards: 0,
      masteredCards: 0,
      totalCompletionRate: 0
    });

    // Calcular racha
    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    let lastDate = today;
    
    for (const session of sessions) {
      const sessionDate = session.dateObj.setHours(0, 0, 0, 0);
      if (sessionDate === lastDate || sessionDate === lastDate - 86400000) {
        streak++;
        lastDate = sessionDate;
      } else {
        break;
      }
    }

    return {
      totalSessions: sessions.length,
      totalCards: stats.totalCards,
      masteredCards: stats.masteredCards,
      averageCompletionRate: sessions.length > 0 ? stats.totalCompletionRate / sessions.length : 0,
      streak
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/review/flashcards">
          <Button variant="outline" size="sm" className="gap-2">
            <HiOutlineChevronLeft className="w-4 h-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Progreso de Flashcards</h1>
      </div>
      
      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <HiOutlineTrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Tasa de Éxito</h3>
                <p className="text-2xl font-bold">{stats.averageCompletionRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <HiOutlineAcademicCap className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Racha Actual</h3>
                <p className="text-2xl font-bold text-orange-600">{stats.streak} días</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <HiOutlineChartBar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Tarjetas Dominadas</h3>
                <p className="text-2xl font-bold">{stats.masteredCards}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Historial de Sesiones */}
      <h2 className="text-xl font-semibold mb-4">Historial de Sesiones</h2>
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            <HiOutlineCollection className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No hay sesiones de estudio registradas aún.</p>
            <p className="text-sm">¡Comienza a estudiar con flashcards para ver tu progreso aquí!</p>
          </Card>
        ) : (
          sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group"
            >
              <Card className="p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <HiOutlineClock className="text-gray-400" />
                      <span className="text-sm text-gray-500">{session.displayDate}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-green-600">
                        <HiOutlineCheck className="mr-1" />
                        {session.mastered} dominadas
                      </div>
                      <div>
                        {session.total} tarjetas totales
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Tasa de Éxito</div>
                      <div className="text-xl font-bold">
                        {session.completionRate.toFixed(1)}%
                      </div>
                    </div>
                    <Progress 
                      value={session.completionRate} 
                      className="w-32 h-2" 
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default FlashcardsProgressPage;
