'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { seoConfig } from '../_config/seoConfig';

const AboutUs = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kunno AI Course Generator",
    "description": "Plataforma líder en generación de cursos personalizados con inteligencia artificial",
    "url": "https://kunno.ai",
    "logo": "https://kunno.ai/logo.png",
    "sameAs": [
      "https://twitter.com/kunnoai",
      "https://facebook.com/kunnoai",
      "https://linkedin.com/company/kunnoai"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ES"
    },
    "offers": {
      "@type": "Offer",
      "description": "Cursos personalizados con IA",
      "price": "0",
      "priceCurrency": "EUR"
    }
  };

  return (
    <>
      <Header/>
      <NextSeo
        title={seoConfig.about.title}
        description={seoConfig.about.description}
        canonical="https://kunno.vercel.app/about"
        openGraph={{
          ...seoConfig.default.openGraph,
          url: 'https://kunno.vercel.app/about',
          title: seoConfig.about.title,
          description: seoConfig.about.description,
        }}
        twitter={seoConfig.default.twitter}
        additionalMetaTags={[
          ...seoConfig.default.additionalMetaTags,
          {
            name: 'keywords',
            content: seoConfig.about.keywords
          }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoConfig.about.structuredData) }}
      />

      <main className="min-h-screen bg-[#f8f9fa] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-50">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-50 rounded-full filter blur-3xl"></div>
        </div>

        <motion.div 
          className="container mx-auto px-4 py-16"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h1 className="text-5xl font-bold mb-4">
              Quiénes Somos
              <span className="block text-gray-400 mt-2 text-3xl">Innovando en Educación con IA</span>
            </h1>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div 
              variants={fadeInUp}
              className="space-y-6"
            >
              <p className="text-xl leading-relaxed text-gray-700">
                Bienvenido a AI Course Generator, tu herramienta definitiva para crear cursos personalizados con IA. Nuestra misión es simplificar el proceso de aprendizaje aprovechando el poder de la inteligencia artificial.
              </p>
              <p className="text-xl leading-relaxed text-gray-700">
                Creemos que todos deberían tener acceso a una educación de alta calidad. Nuestra plataforma utiliza la API de Gemini para generar contenido de cursos completo que satisface las necesidades tanto de estudiantes como de profesionales.
              </p>
            </motion.div>
            <motion.div 
              variants={fadeInUp}
              className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/cap.png"
                alt="Educación personalizada con Kunno AI - Plataforma de cursos con IA"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={staggerChildren}
          >
            {[
              {
                title: "Innovación Constante",
                description: "Actualizamos constantemente nuestros cursos para reflejar los avances más recientes en tecnología y educación.",
                icon: "🚀"
              },
              {
                title: "Equipo Apasionado",
                description: "Nuestro equipo está formado por educadores y entusiastas de la IA comprometidos con mejorar la experiencia de aprendizaje.",
                icon: "💡"
              },
              {
                title: "Aprendizaje Personalizado",
                description: "Cada curso se adapta a tus necesidades específicas, asegurando una experiencia de aprendizaje óptima.",
                icon: "🎯"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center"
            variants={fadeInUp}
          >
            <p className="text-xl mb-8">
              ¡Únete a nosotros en este emocionante viaje y desbloquea el potencial de la IA en tu educación!
            </p>
            <motion.a
              href="/dashboard"
              className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:opacity-90 transition-colors text-lg font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Comienza tu viaje
            </motion.a>
          </motion.div>
        </motion.div>
      </main>
      <Footer/>
    </>
  );
};

export default AboutUs;