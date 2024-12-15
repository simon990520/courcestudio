"use client"
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import UserCourseList from './_components/UserCourseList'
import AddCourse from './_components/AddCourse'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <AddCourse />
          <UserCourseList />
        </div>
      </div>
    </div>
  );
}