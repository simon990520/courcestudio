'use client';

import { motion } from "framer-motion";

export default function AnimatedFeatures() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
      {/* Cursos Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <div className="bg-orange-100 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Cursos Interactivos</h3>
        <p className="text-gray-600">Aprende con contenido multimedia y ejercicios prácticos diseñados para maximizar tu aprendizaje.</p>
      </motion.div>

      {/* Quiz Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <div className="bg-yellow-100 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Quizzes Dinámicos</h3>
        <p className="text-gray-600">Pon a prueba tus conocimientos con cuestionarios interactivos y recibe retroalimentación instantánea.</p>
      </motion.div>

      {/* Flashcards Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <div className="bg-orange-100 w-12 h-12 rounded-lg mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Flashcards</h3>
        <p className="text-gray-600">Refuerza tu memoria y mejora la retención con nuestro sistema de tarjetas de aprendizaje.</p>
      </motion.div>
    </div>
  );
}
