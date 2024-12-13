"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ref, get, set } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";
import { toast } from "sonner";
import { generateQuiz } from "@/services/quiz";
import QuizSelector from "../_components/QuizSelector";
import QuizQuestion from "../_components/QuizQuestion";
import QuizSummary from "../_components/QuizSummary";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const QuizPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState({ 
    correctAnswers: 0, 
    incorrectAnswers: 0,
    startTime: null,
    selectedSubjects: [],
    selectedNotes: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState({ status: '', message: '' });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadSubjectsAndNotes();
    }
  }, [user]);

  const loadSubjectsAndNotes = async () => {
    try {
      const subjectsRef = ref(realtimeDb, 'subjects');
      const snapshot = await get(subjectsRef);
      
      if (snapshot.exists()) {
        const subjectsData = snapshot.val();
        const subjectsList = [];
        const notesList = [];

        Object.entries(subjectsData).forEach(([id, data]) => {
          // Solo incluir materias creadas por el usuario actual
          if (data.createdBy === user?.id) {
            subjectsList.push({ id, ...data });
            if (data.notes) {
              Object.entries(data.notes).forEach(([noteId, noteData]) => {
                // Solo incluir apuntes creados por el usuario actual
                if (noteData.createdBy === user?.id) {
                  notesList.push({
                    id: noteId,
                    subjectId: id,
                    ...noteData
                  });
                }
              });
            }
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

  const handleStartQuiz = async (selectedSubjects, selectedNotes) => {
    setLoading(true);
    try {
      const quizData = await generateQuiz(
        selectedSubjects, 
        selectedNotes,
        (progress) => setLoadingStatus(progress)
      );
      setQuiz(quizData.quiz);
      setCurrentQuestionIndex(0);
      setResults({ 
        correctAnswers: 0, 
        incorrectAnswers: 0,
        startTime: new Date().toISOString(),
        selectedSubjects,
        selectedNotes
      });
      setQuizCompleted(false);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Error al generar el quiz");
    } finally {
      setLoading(false);
      setLoadingStatus({ status: '', message: '' });
    }
  };

  const handleAnswer = (isCorrect) => {
    setResults(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1)
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
  };

  const saveQuizProgress = async () => {
    if (!user) return;

    try {
      const endTime = new Date().toISOString();
      const quizResult = {
        ...results,
        endTime,
        totalQuestions: quiz.length,
        score: (results.correctAnswers / quiz.length) * 100,
        timestamp: endTime,
      };

      // Save to user's quiz history
      const quizHistoryRef = ref(realtimeDb, `users/${user.id}/quizHistory/${Date.now()}`);
      await set(quizHistoryRef, quizResult);

      // Update user's overall progress
      const userProgressRef = ref(realtimeDb, `users/${user.id}/progress`);
      const progressSnapshot = await get(userProgressRef);
      const currentProgress = progressSnapshot.exists() ? progressSnapshot.val() : {
        totalQuizzes: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        averageScore: 0
      };

      const updatedProgress = {
        totalQuizzes: currentProgress.totalQuizzes + 1,
        totalCorrect: currentProgress.totalCorrect + results.correctAnswers,
        totalQuestions: currentProgress.totalQuestions + quiz.length,
        averageScore: ((currentProgress.averageScore * currentProgress.totalQuizzes) + quizResult.score) / (currentProgress.totalQuizzes + 1)
      };

      await set(userProgressRef, updatedProgress);
      
      return { quizResult, progress: updatedProgress };
    } catch (error) {
      console.error("Error saving quiz progress:", error);
      toast.error("Error al guardar el progreso del quiz");
      return null;
    }
  };

  const handleRetry = () => {
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setResults({ 
      correctAnswers: 0, 
      incorrectAnswers: 0,
      startTime: null,
      selectedSubjects: [],
      selectedNotes: []
    });
    setQuizCompleted(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Quiz Dinámico</h1>
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 relative">
              <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
            </div>
            <h2 className="text-lg font-medium">{loadingStatus.message}</h2>
            <div className="w-full max-w-md">
              <Progress 
                value={
                  loadingStatus.status === 'starting' ? 20 :
                  loadingStatus.status === 'preparing' ? 40 :
                  loadingStatus.status === 'generating' ? 60 :
                  loadingStatus.status === 'processing' ? 80 :
                  loadingStatus.status === 'completed' ? 100 : 0
                } 
                className="h-2"
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Quiz Dinámico</h1>
        <QuizSelector
          subjects={subjects}
          notes={notes}
          onStart={handleStartQuiz}
        />
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="p-6">
        <QuizSummary 
          results={results} 
          onRetry={handleRetry} 
          saveProgress={saveQuizProgress}
          totalQuestions={quiz.length}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <QuizQuestion
        question={quiz[currentQuestionIndex]}
        onAnswer={(isCorrect) => {
          handleAnswer(isCorrect);
          handleNextQuestion();
        }}
        onComplete={handleQuizComplete}
        currentQuestion={currentQuestionIndex + 1}
        totalQuestions={quiz.length}
        correctAnswers={results.correctAnswers}
        incorrectAnswers={results.incorrectAnswers}
      />
    </div>
  );
};

export default QuizPage;
