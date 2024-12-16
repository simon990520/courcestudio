'use client'

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  HiOutlineChartBar, 
  HiOutlineBookOpen, 
  HiOutlineDocumentText,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";

const Wellcome = ({ setIsSubjectModalOpen, setEditingSubject }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalSubjects: 0,
    totalNotes: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      const subjectsRef = ref(realtimeDb, 'subjects');
      const snapshot = await get(subjectsRef);
      
      if (snapshot.exists()) {
        const subjectsData = snapshot.val();
        const userSubjects = Object.entries(subjectsData)
          .map(([id, data]) => ({
            id,
            ...data,
            notes: data.notes && typeof data.notes === 'object' ? data.notes : {}
          }))
          .filter(subject => subject.createdBy === user.id);
        
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const totalNotes = userSubjects.reduce((total, subject) => 
          total + Object.keys(subject.notes || {}).length, 0);

        setStats({
          totalSubjects: userSubjects.length,
          totalNotes: totalNotes,
          recentActivity: userSubjects.filter(subject => 
            subject.updatedAt && new Date(subject.updatedAt) > oneWeekAgo).length || 0
        });
      }
    };

    fetchStats();
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                ¡Bienvenido{user?.firstName ? `, ${user.firstName}` : ''}! 👋
              </h1>
              <Button 
                onClick={() => {
                  setEditingSubject(null);
                  setIsSubjectModalOpen(true);
                }}
                className="bg-white text-orange-600 hover:bg-orange-50 transition-colors duration-300 text-sm sm:text-base px-6 py-2 sm:px-8 sm:py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                <HiOutlinePlusCircle className="text-xl" />
                <span>Nueva Materia</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white mb-2">
                  <HiOutlineBookOpen className="text-2xl" />
                  <h3 className="font-semibold">Materias</h3>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalSubjects}</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white mb-2">
                  <HiOutlineDocumentText className="text-2xl" />
                  <h3 className="font-semibold">Notas</h3>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalNotes}</p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-white mb-2">
                  <HiOutlineChartBar className="text-2xl" />
                  <h3 className="font-semibold">Última Semana</h3>
                </div>
                <p className="text-3xl font-bold text-white">{stats.recentActivity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wellcome;
