'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIAssistant = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Función para procesar la pregunta y generar una respuesta contextual
  const processQuestion = (question, courseContext) => {
    // Normalizar la pregunta
    const normalizedQuestion = question.toLowerCase();
    
    // Extraer información relevante del curso
    const courseName = courseContext.courseOutput?.course?.name || '';
    const courseDescription = courseContext.courseOutput?.course?.description || '';
    const chapters = courseContext.chapters || [];

    // Buscar capítulos relevantes basados en la pregunta
    const relevantChapters = chapters.filter(chapter => {
      const chapterContent = JSON.stringify(chapter).toLowerCase();
      return chapterContent.includes(normalizedQuestion);
    });

    // Si la pregunta es sobre el curso en general
    if (normalizedQuestion.includes('curso') || normalizedQuestion.includes('sobre que') || normalizedQuestion.includes('de que') || normalizedQuestion.includes('trata')) {
      return `Este curso trata sobre ${courseName}. ${courseDescription}`;
    }

    // Si la pregunta es sobre capítulos específicos
    if (normalizedQuestion.includes('capitulo') || normalizedQuestion.includes('capítulo') || normalizedQuestion.includes('tema') || normalizedQuestion.includes('parte')) {
      if (relevantChapters.length > 0) {
        const chapterInfo = relevantChapters.map(chapter => {
          return `En el capítulo "${chapter.name}", aprenderás: ${chapter.content?.content?.map(item => item.title).join(', ')}`;
        }).join('\\n\\n');
        return chapterInfo;
      }
    }

    // Si la pregunta es sobre un tema específico
    if (relevantChapters.length > 0) {
      const relevantContent = relevantChapters.map(chapter => {
        const matchingContent = chapter.content?.content?.filter(item => 
          item.title.toLowerCase().includes(normalizedQuestion) || 
          item.description.toLowerCase().includes(normalizedQuestion)
        );
        if (matchingContent?.length > 0) {
          return matchingContent.map(content => content.description).join('\\n');
        }
        return null;
      }).filter(Boolean);

      if (relevantContent.length > 0) {
        return relevantContent.join('\\n\\n');
      }
    }

    // Si no encontramos información específica, dar una respuesta general
    return `En este curso de ${courseName}, tenemos ${chapters.length} capítulos que cubren diferentes aspectos. ¿Te gustaría que te explique algún tema específico o que te muestre el contenido de algún capítulo en particular?`;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Agregar mensaje del usuario
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Procesar la pregunta y obtener una respuesta contextual
      const response = processQuestion(userMessage, course);

      // Simular un pequeño retraso para la experiencia de usuario
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response
        }]);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu pregunta. ¿Podrías reformularla?'
      }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white shadow-lg flex items-center justify-center hover:shadow-xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true);
          if (messages.length === 0) {
            // Mensaje de bienvenida
            setMessages([{
              role: 'assistant',
              content: `¡Hola! Soy tu asistente para el curso "${course.courseOutput?.course?.name}". Puedo ayudarte a entender mejor el contenido, responder preguntas específicas sobre los temas o guiarte a través de los capítulos. ¿En qué puedo ayudarte?`
            }]);
          }
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </motion.button>

      {/* Modal del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white rounded-t-xl flex justify-between items-center">
                <h3 className="text-lg font-medium">Kunno AI - Asistente del Curso</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Chat messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Escribe tu pregunta aquí..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
