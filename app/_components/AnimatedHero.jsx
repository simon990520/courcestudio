'use client';

import { motion } from "framer-motion";
import Link from "next/link";

export default function AnimatedHero() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      <h1 className="text-6xl font-bold mb-4">
        Aprende y refuerza
        <span className="block text-gray-400 mt-2">tu conocimiento</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        Plataforma interactiva con cursos, quizzes y flashcards para potenciar tu aprendizaje
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/explore-course">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Explorar
          </motion.button>
        </Link>
        <Link href="/download">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-2 border-4 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Descargar App
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
