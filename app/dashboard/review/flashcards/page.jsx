"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ref, get, set } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";
import { generateFlashcards, calculateNextReview } from "@/services/flashcards";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import FlashcardSelector from "../_components/FlashcardSelector";
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBookOpen,
  HiOutlineTrendingUp,
  HiOutlineChartBar
} from "react-icons/hi";
import { toast } from "sonner";
import Link from "next/link";

const FlashcardsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({ status: '', message: '' });
  const [sessionStats, setSessionStats] = useState({
    mastered: 0,
    reviewing: 0,
    total: 0,
    completed: 0,
    sessionId: null
  });
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadSubjectsAndNotes();
      loadFlashcards();
    }
  }, [user]);

  useEffect(() => {
    if (flashcards && flashcards.length > 0 && !sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  }, [flashcards, sessionStartTime]);

  useEffect(() => {
    return () => {
      resetSession();
    };
  }, []);

  const loadSubjectsAndNotes = async () => {
    try {
      const subjectsRef = ref(realtimeDb, 'subjects');
      const snapshot = await get(subjectsRef);
      
      if (snapshot.exists()) {
        const subjectsData = snapshot.val();
        const subjectsList = [];
        const notesList = [];

        Object.entries(subjectsData).forEach(([id, data]) => {
          subjectsList.push({ id, ...data });
          if (data.notes) {
            Object.entries(data.notes).forEach(([noteId, noteData]) => {
              notesList.push({
                id: noteId,
                subjectId: id,
                ...noteData
              });
            });
          }
        });

        setSubjects(subjectsList);
        setNotes(notesList);
      }
    } catch (error) {
      console.error("Error loading subjects and notes:", error);
      toast.error("Error al cargar las materias y apuntes");
    }
  };

  const loadFlashcards = async () => {
    try {
      if (sessionStats.sessionId) {
        const flashcardsRef = ref(realtimeDb, `users/${user.id}/flashcardSessions/${sessionStats.sessionId}`);
        const snapshot = await get(flashcardsRef);
        
        if (snapshot.exists()) {
          const sessionData = snapshot.val();
          setFlashcards(sessionData.flashcards);
          if (sessionData.stats) {
            setSessionStats(prev => ({
              ...prev,
              ...sessionData.stats
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error loading flashcards:", error);
      toast.error("Error al cargar las flashcards");
    }
  };

  const handleStartFlashcards = async (selectedSubjects, selectedNotes) => {
    resetSession();
    
    try {
      const flashcardsData = await generateFlashcards(
        selectedSubjects,
        selectedNotes,
        user.id
      );

      if (flashcardsData && flashcardsData.length > 0) {
        // Generar un ID único para la sesión
        const sessionId = Date.now().toString();
        
        const initialStats = {
          total: flashcardsData.length,
          completed: 0,
          mastered: 0,
          reviewing: 0
        };

        // Guardar flashcards en una nueva ruta con el ID de sesión
        const flashcardsRef = ref(realtimeDb, `users/${user.id}/flashcardSessions/${sessionId}`);
        await set(flashcardsRef, {
          flashcards: flashcardsData,
          createdAt: Date.now(),
          subjects: selectedSubjects.map(s => s.name),
          stats: initialStats,
          lastUpdated: Date.now()
        });
        
        setFlashcards(flashcardsData);
        setSessionStats({
          ...initialStats,
          sessionId
        });
        setSessionStartTime(Date.now());
        
        toast.success("¡Flashcards generadas con éxito!");
      } else {
        toast.error("No se encontraron apuntes para generar flashcards");
      }
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error(error.message || "Error al generar las flashcards");
    }
  };

  const handleCardStatus = async (status) => {
    if (!flashcards || !sessionStats.sessionId) return;

    const updatedFlashcards = flashcards.map(card => {
      if (card.id === flashcards[currentIndex].id) {
        return {
          ...card,
          status,
          lastReviewed: Date.now(),
          reviewCount: (card.reviewCount || 0) + 1
        };
      }
      return card;
    });

    setFlashcards(updatedFlashcards);

    // Actualizar estadísticas de la sesión
    const newStats = {
      ...sessionStats,
      mastered: updatedFlashcards.filter(card => card.status === 'mastered').length,
      reviewing: updatedFlashcards.filter(card => card.status === 'reviewing').length,
      completed: updatedFlashcards.filter(card => card.status !== 'new').length
    };
    setSessionStats(newStats);

    try {
      // Guardar en Firebase
      const flashcardsRef = ref(realtimeDb, `users/${user.id}/flashcardSessions/${sessionStats.sessionId}`);
      await set(flashcardsRef, {
        flashcards: updatedFlashcards,
        stats: {
          total: newStats.total,
          completed: newStats.completed,
          mastered: newStats.mastered,
          reviewing: newStats.reviewing
        },
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Error saving flashcard status:', error);
      toast.error('Error al guardar el progreso');
    }

    // Avanzar a la siguiente tarjeta
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setFlashcards([]);
    setSessionStats({
      mastered: 0,
      reviewing: 0,
      total: 0,
      completed: 0,
      sessionId: null
    });
    setShowSummary(false);
    setSessionSummary(null);
    setSessionStartTime(null);
  };

  // Obtener la tarjeta actual
  const currentCard = flashcards && flashcards.length > 0 ? flashcards[currentIndex] : null;

  // Renderizar el selector si no hay flashcards
  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <FlashcardSelector
          subjects={subjects}
          notes={notes}
          onStart={handleStartFlashcards}
        />
      </div>
    );
  }

  // Renderizar el resumen si se completó la sesión
  if (showSummary && sessionSummary) {
    return (
      <div className="container mx-auto p-6">
        <SessionSummary
          summary={sessionSummary}
          onRestart={() => {
            resetSession();
            setShowSummary(false);
          }}
        />
      </div>
    );
  }

  // Renderizar la interfaz de flashcards
  return (
    <div className="container mx-auto p-6">
      {/* Barra de progreso y estadísticas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetSession();
                setShowSummary(false);
              }}
              className="flex items-center gap-2"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="text-sm text-gray-500">
              Tarjeta {currentIndex + 1} de {flashcards.length}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <HiOutlineCheck className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-500">
                {sessionStats.mastered} dominadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineRefresh className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-500">
                {sessionStats.reviewing} repasando
              </span>
            </div>
          </div>
        </div>
        <Progress value={(currentIndex / flashcards.length) * 100} className="h-2" />
      </div>

      {/* Tarjeta de flashcard */}
      {currentCard && (
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <HiOutlineBookOpen className="w-4 h-4" />
                <span>{currentCard.topic}</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                  {currentCard.difficulty}
                </span>
              </div>

              <div
                className={`relative min-h-[200px] flex items-center justify-center p-6 rounded-lg transition-all duration-500 ${
                  isFlipped ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="text-center">
                  {isFlipped ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentCard.back }}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="prose prose-blue max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentCard.front }}
                    />
                  )}
                </div>
                <div className="absolute bottom-4 right-4 text-gray-400">
                  <HiOutlineRefresh className="w-5 h-5" />
                </div>
              </div>

              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 mt-4"
                >
                  <Button
                    onClick={() => handleCardStatus('reviewing')}
                    variant="outline"
                    className="flex-1"
                  >
                    Repasar Después
                    <HiOutlineRefresh className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={() => handleCardStatus('mastered')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                  >
                    ¡Lo Domino!
                    <HiOutlineCheck className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
