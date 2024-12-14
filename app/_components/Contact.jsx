'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { NextSeo } from 'next-seo';
import { seoConfig } from '../_config/seoConfig';

const AnimatedContactHero = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="text-center mb-16"
  >
    <h1 className="text-6xl font-bold mb-4">
      Contáctanos
      <span className="block text-gray-400 mt-2">Estamos aquí para ayudarte</span>
    </h1>
    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
      ¿Tienes preguntas o sugerencias? Nos encantaría escucharte y ayudarte en tu viaje de aprendizaje
    </p>
  </motion.div>
);

const AnimatedContactInfo = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white p-8 rounded-xl shadow-lg"
  >
    <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
    {[
      { icon: "📧", title: "Email", content: "support@kunno.ai" },
      { icon: "🌎", title: "Ubicación", content: "España" },
      { icon: "⏰", title: "Horario", content: "Lunes a Viernes: 9:00 - 18:00" }
    ].map((item, index) => (
      <motion.div 
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + index * 0.1 }}
        className="flex items-center space-x-4 mb-6 last:mb-0"
      >
        <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
          {item.icon}
        </div>
        <div>
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-gray-600">{item.content}</p>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const AnimatedContactForm = ({ formData, handleChange, handleSubmit }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white p-8 rounded-xl shadow-lg"
  >
    <h2 className="text-2xl font-bold mb-6">Envíanos un Mensaje</h2>
    <form onSubmit={handleSubmit} className="space-y-6">
      {[
        { name: "name", label: "Nombre", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "subject", label: "Asunto", type: "text" }
      ].map((field, index) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + index * 0.1 }}
        >
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
          />
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
        ></textarea>
      </motion.div>
      <motion.button
        type="submit"
        className="w-full px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-lg hover:opacity-90 transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Enviar Mensaje
      </motion.button>
    </form>
  </motion.div>
);

const AnimatedSocialLinks = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1 }}
    className="text-center"
  >
    <p className="text-xl mb-8">
      También puedes seguirnos en nuestras redes sociales
    </p>
    <div className="flex justify-center space-x-8">
      {[
        { icon: "🐦", href: "https://twitter.com/kunnoai", label: "Twitter" },
        { icon: "📘", href: "https://facebook.com/kunnoai", label: "Facebook" },
        { icon: "💼", href: "https://linkedin.com/company/kunnoai", label: "LinkedIn" }
      ].map((social, index) => (
        <motion.a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-4 rounded-full shadow-lg text-2xl"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 + index * 0.1 }}
        >
          {social.icon}
        </motion.a>
      ))}
    </div>
  </motion.div>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí implementarías la lógica de envío del formulario
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Header/>
      <NextSeo
        title={seoConfig.contact.title}
        description={seoConfig.contact.description}
        canonical="https://kunno.vercel.app/contact"
        openGraph={{
          ...seoConfig.default.openGraph,
          url: 'https://kunno.vercel.app/contact',
          title: seoConfig.contact.title,
          description: seoConfig.contact.description,
        }}
        twitter={seoConfig.default.twitter}
        additionalMetaTags={[
          ...seoConfig.default.additionalMetaTags,
          {
            name: 'keywords',
            content: seoConfig.contact.keywords
          }
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seoConfig.contact.structuredData) }}
      />

      <main className="min-h-screen bg-[#f8f9fa] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1 }}
            className="absolute top-20 left-20 w-64 h-64 bg-blue-100 rounded-full filter blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-20 right-20 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl"
          ></motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-50 rounded-full filter blur-3xl"
          ></motion.div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <AnimatedContactHero />
          
          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <AnimatedContactInfo />
            <AnimatedContactForm 
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          </div>

          <AnimatedSocialLinks />
        </div>
      </main>
      <Footer/>
    </>
  );
};

export default Contact;
