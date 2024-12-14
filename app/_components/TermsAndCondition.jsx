'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { NextSeo } from 'next-seo';
import { seoConfig } from '../_config/seoConfig';

const TermsAndCondition = () => {
  return (
    <>
      <NextSeo
        title={seoConfig.terms.title}
        description={seoConfig.terms.description}
        canonical="https://kunno.vercel.app/terms"
        openGraph={{
          ...seoConfig.default.openGraph,
          url: 'https://kunno.vercel.app/terms',
          title: seoConfig.terms.title,
          description: seoConfig.terms.description,
        }}
        twitter={seoConfig.default.twitter}
        additionalMetaTags={[
          ...seoConfig.default.additionalMetaTags,
          {
            name: 'keywords',
            content: seoConfig.terms.keywords
          }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoConfig.terms.structuredData) }}
      />
      <Header/>
      <main className="min-h-screen bg-[#f8f9fa] relative overflow-hidden">
        {/* Background Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="absolute top-0 left-0 w-full h-full -z-10"
        >
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-50 rounded-full filter blur-3xl"></div>
        </motion.div>

        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-bold mb-4">
              Términos y Condiciones
              <span className="block text-gray-400 mt-2 text-3xl">Plataforma de Aprendizaje IA</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Bienvenido a Kunno AI, tu plataforma de aprendizaje potenciada por inteligencia artificial. Al utilizar nuestros servicios, aceptas los siguientes términos y condiciones.
            </p>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-orange-500 mr-2">1.</span> Servicios Educativos
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  Kunno AI ofrece servicios de generación de contenido educativo mediante inteligencia artificial, incluyendo:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Generación automática de cursos personalizados</li>
                  <li>Creación de quizzes adaptativos</li>
                  <li>Sistema de flashcards para repaso espaciado</li>
                  <li>Contenido educativo personalizado según el nivel del usuario</li>
                </ul>
                <p>
                  Nos reservamos el derecho de modificar, actualizar o discontinuar cualquier aspecto de nuestros servicios para mejorar la experiencia de aprendizaje.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-orange-500 mr-2">2.</span> Contenido Generado por IA
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>
                  El contenido generado por nuestra IA está diseñado para ser educativo y preciso, sin embargo:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>No garantizamos la precisión absoluta del contenido generado automáticamente</li>
                  <li>Recomendamos verificar la información crítica con fuentes adicionales</li>
                  <li>El contenido puede ser actualizado o modificado para mantener su relevancia</li>
                  <li>Los usuarios deben usar su criterio al aplicar el conocimiento adquirido</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-orange-500 mr-2">3.</span> Uso de la Plataforma
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>Al utilizar nuestra plataforma, te comprometes a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>No compartir tus credenciales de acceso con terceros</li>
                  <li>No copiar o distribuir el contenido generado sin autorización</li>
                  <li>Usar la plataforma solo para fines educativos legítimos</li>
                  <li>No intentar manipular o explotar el sistema de IA</li>
                  <li>Respetar los derechos de otros usuarios</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-orange-500 mr-2">4.</span> Privacidad y Datos
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>Nos comprometemos a proteger tu privacidad y datos:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Almacenamos datos de progreso para personalizar tu experiencia</li>
                  <li>Utilizamos análisis de rendimiento para mejorar el contenido</li>
                  <li>No compartimos información personal con terceros sin consentimiento</li>
                  <li>Mantenemos encriptados todos los datos sensibles</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-orange-500 mr-2">5.</span> Propiedad Intelectual
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>Respecto a la propiedad intelectual:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>El sistema de IA y su código son propiedad exclusiva de Kunno AI</li>
                  <li>Los usuarios mantienen los derechos sobre el contenido que suban</li>
                  <li>El contenido generado por la IA está licenciado para uso personal</li>
                  <li>No está permitida la redistribución comercial del contenido</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-orange-500 mr-2">6.</span> Responsabilidad y Garantías
              </h2>
              <div className="text-gray-600 space-y-4">
                <p>Limitaciones de nuestra responsabilidad:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>No garantizamos resultados específicos de aprendizaje</li>
                  <li>El progreso depende del compromiso del usuario</li>
                  <li>No nos responsabilizamos por interrupciones técnicas temporales</li>
                  <li>Nos reservamos el derecho de modificar o suspender cuentas que violen los términos</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="text-center mt-12"
            >
              <p className="text-gray-600 mb-4">
                ¿Tienes dudas sobre nuestros términos y condiciones?
              </p>
              <motion.a
                href="/contact"
                className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:opacity-90 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contáctanos
              </motion.a>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
};

export default TermsAndCondition;