'use client';

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Typed from 'typed.js';

export default function AnimatedHero() {
  const el = useRef(null);
  const typed = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const options = {
      strings: [
        'programación avanzada',
        'matemáticas para niños',
        'inglés conversacional',
        'física cuántica',
        'diseño gráfico digital',
        'marketing digital',
        'desarrollo web moderno',
        'inteligencia artificial',
        'música y composición',
        'fotografía profesional',
        'escritura creativa',
        'negocios y emprendimiento',
        'ciencia de datos',
        'psicología práctica',
        'arte y pintura',
        'cocina internacional',
        'desarrollo personal',
        'historia del mundo',
        'biología molecular',
        'economía y finanzas'
      ],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1500,
      loop: true,
    };

    // Solo inicializar Typed.js si el elemento existe
    if (el.current) {
      typed.current = new Typed(el.current, options);

      return () => {
        if (typed.current) {
          typed.current.destroy();
        }
      };
    }
  }, [isClient]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.8 }}
      className="text-center mb-8 md:mb-16 px-4 md:px-0"
    >
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 leading-tight">
        <span style={{ color: '#0a0a0a' }}>Aprende sobre </span>
        <span ref={el} className="bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text">
          {!isClient && 'programación avanzada'}
        </span>
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
      </div>
    </motion.div>
  );
}
