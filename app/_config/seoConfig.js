export const baseStructuredData = {
  "@context": "https://kunno.vercel.app",
  "@type": "Organization",
  "name": "Kunno AI Course Generator",
  "description": "Plataforma líder en generación de cursos personalizados con inteligencia artificial",
  "url": "https://kunno.vercel.app",
  "logo": "https://kunno.vercel.app/logo.png",
  "sameAs": [
    "https://twitter.com/kunnoai",
    "https://facebook.com/kunnoai",
    "https://linkedin.com/company/kunnoai"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ES"
  }
};

export const seoConfig = {
  default: {
    title: "Kunno AI Course Generator | Aprende y Crea Cursos con Inteligencia Artificial",
    description: "Descubre Kunno AI Course Generator, la plataforma líder en generación de cursos personalizados con IA. Aprende a tu ritmo con contenido adaptado a tus necesidades.",
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: 'https://kunno.vercel.app',
      site_name: 'Kunno AI',
      images: [
        {
          url: 'https://kunno.vercel.app/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Kunno AI Course Generator',
        }
      ],
    },
    twitter: {
      handle: '@kunnoai',
      site: '@kunnoai',
      cardType: 'summary_large_image',
    },
    additionalMetaTags: [
      {
        name: 'author',
        content: 'Kunno AI'
      },
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large'
      }
    ]
  },
  about: {
    title: "Kunno AI Course Generator | Innovación en Educación con IA",
    description: "Plataforma líder en generación de cursos personalizados con IA. Aprende y mejora tus habilidades con contenido adaptado a tus necesidades.",
    keywords: "Kunno AI, cursos IA, generador de cursos, inteligencia artificial, educación personalizada, aprendizaje en línea, educación tecnológica, cursos personalizados, IA educativa",
    structuredData: {
      ...baseStructuredData,
      "offers": {
        "@type": "Offer",
        "description": "Cursos personalizados con IA",
        "price": "0",
        "priceCurrency": "EUR"
      }
    }
  },
  contact: {
    title: "Contacto | Kunno AI Course Generator",
    description: "¿Tienes preguntas? Contáctanos y descubre cómo Kunno AI puede transformar tu experiencia de aprendizaje con cursos personalizados mediante IA.",
    keywords: "contacto Kunno AI, soporte Kunno, ayuda cursos IA, contactar plataforma educativa, asistencia IA educativa",
    structuredData: {
      ...baseStructuredData,
      "@type": "ContactPage",
      "mainEntity": {
        "@type": "Organization",
        "name": "Kunno AI Support",
        "contactType": "customer support",
        "email": "support@kunno.ai",
        "availableLanguage": ["Spanish", "English"]
      }
    }
  },
  terms: {
    title: "Términos y Condiciones | Kunno AI Course Generator",
    description: "Conoce nuestros términos y condiciones. Información importante sobre el uso de la plataforma Kunno AI, derechos y responsabilidades.",
    keywords: "términos y condiciones Kunno AI, política de uso, términos de servicio, condiciones legales, derechos de usuario, responsabilidades",
    structuredData: {
      ...baseStructuredData,
      "@type": "WebPage",
      "mainEntity": {
        "@type": "WebPage",
        "name": "Términos y Condiciones",
        "description": "Términos y condiciones completos de uso de la plataforma Kunno AI Course Generator",
        "inLanguage": "es",
        "datePublished": "2024-01-01",
        "dateModified": "2024-12-14"
      }
    }
  }
};
