'use client'

import { useUser } from "@clerk/nextjs";
import { 
  HiOutlineChartBar, 
  HiOutlineAcademicCap,
  HiOutlinePuzzlePiece,
} from "react-icons/hi2";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";

const ReviewWelcome = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalFlashcards: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const usersRef = ref(realtimeDb);
        const usersSnapshot = await get(usersRef);
        
        if (usersSnapshot.exists()) {
          const allData = usersSnapshot.val();
          let userQuizzes = [];
          let userFlashcards = [];
          let recentActivity = 0;
          
          Object.values(allData).forEach(node => {
            if (node.quizHistory) {
              Object.values(node.quizHistory).forEach(quiz => {
                if (quiz.selectedSubjects && 
                    quiz.selectedSubjects[0] && 
                    quiz.selectedSubjects[0].createdBy === user.id) {
                  userQuizzes.push(quiz);
                  
                  const quizDate = new Date(quiz.timestamp);
                  const now = new Date();
                  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  if (quizDate > oneWeekAgo) {
                    recentActivity++;
                  }
                }
              });
            }
            
            if (node.flashcards) {
              Object.values(node.flashcards).forEach(flashcard => {
                if (flashcard.userId === user.id) {
                  userFlashcards.push(flashcard);
                  
                  const flashcardDate = new Date(flashcard.lastReviewed);
                  const now = new Date();
                  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  if (flashcardDate > oneWeekAgo) {
                    recentActivity++;
                  }
                }
              });
            }
          });

          setStats({
            totalQuizzes: userQuizzes.length,
            totalFlashcards: userFlashcards.length,
            recentActivity
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl">
      {/* Fondo decorativo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 px-6 pt-8 pb-14 sm:px-8 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Tu progreso
                </h1>
                <p className="text-orange-100 mt-2">
                  Revisa tu avance en quizzes y flashcards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewWelcome;
