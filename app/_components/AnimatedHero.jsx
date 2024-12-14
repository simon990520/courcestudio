'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export default function AnimatedHero() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-8 md:mb-16 px-4 md:px-0"
    >
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
        Aprende y refuerza
        <span className="block text-gray-400 mt-1 md:mt-2">tu conocimiento</span>
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 md:mb-10">
        Plataforma interactiva con cursos, quizzes y flashcards para potenciar tu aprendizaje
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
        <Link href="/explore-course" className="w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:opacity-90 transition-colors text-base md:text-lg font-medium"
          >
            Explorar
          </motion.button>
        </Link>
        <Link href="/download" className="w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-8 py-2.5 border-4 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors text-base md:text-lg font-medium"
          >
            Descargar App
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
