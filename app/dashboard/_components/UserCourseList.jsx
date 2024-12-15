"use client"
import { db } from '@/configs/db'
import { CourseList } from '@/configs/Schema'
import { useUser } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import React, { useContext, useEffect, useState } from 'react'
import CourseCard from './CourseCard'
import { UserCourseListContext } from '@/app/_context/UserCourseListContext'
import { ref, get, set, update, push } from "firebase/database";
import { realtimeDb } from "@/configs/firebaseConfig";
import { Button } from "@/components/ui/button"
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

const UserCourseList = () => {
  const [courseList,setCourseList] =  useState([]);
  const{userCourseList, setUserCourseList} = useContext(UserCourseListContext)
  const [showSkeleton, setShowSkeleton] = useState(true);
  const[pageIndex,setPageIndex]=useState(0);

  const {user} =  useUser();

  useEffect(()=>{
     user&&getUserCourses();
     const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 3000);

    return () => clearTimeout(timer);
  },[user, pageIndex])

  const getUserCourses = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      console.error("Falta la dirección de correo electrónico del usuario.");
      return;
    }
  
    try {
      const coursesRef = ref(realtimeDb, `courses`);
      const snapshot = await get(coursesRef);

      if (snapshot.exists()) {
        const allCourses = snapshot.val();
        const userCourses = Object.values(allCourses).filter(
          (course) => course.createdBy === user.primaryEmailAddress.emailAddress
        );

        const startIndex = pageIndex * 6;
        const paginatedCourses = userCourses.slice(startIndex, startIndex + 6);

        setCourseList(paginatedCourses);
        setUserCourseList(userCourses);

        console.log("Cursos del usuario:", userCourses);
      } else {
        console.error("No se encontraron cursos en la base de datos.");
        setCourseList([]);
        setUserCourseList([]);
      }
    } catch (error) {
      console.error("Error al obtener los cursos del usuario desde Firebase:", error);
    }
  };
  
  return (
    <div className='mt-8'>
      <div className="flex items-center justify-between mb-6">
        <h2 className='text-2xl font-bold text-gray-900'>Mis Cursos</h2>
        <div className="flex items-center gap-2">
          {pageIndex !== 0 && (
            <Button 
              onClick={() => setPageIndex(pageIndex - 1)}
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            >
              <HiOutlineChevronLeft className="text-lg" />
              Anterior
            </Button>
          )}
          {courseList?.length === 6 && (
            <Button 
              onClick={() => setPageIndex(pageIndex + 1)}
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            >
              Siguiente
              <HiOutlineChevronRight className="text-lg" />
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {showSkeleton ? (
          [1, 2, 3, 4, 5, 6].map((item, index) => (
            <div
              key={index}
              className="animate-pulse"
            >
              <div className="rounded-xl overflow-hidden">
                <div className="w-full h-[200px] bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 bg-slate-200 rounded" />
                    <div className="h-8 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : courseList?.length > 0 ? (
          courseList.map((course, index) => (
            <div
              key={index}
              className="opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <CourseCard course={course} refreshData={()=>getUserCourses()}/>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
            <div className="text-center">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes cursos aún</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer curso con IA.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserCourseList