'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get, set } from 'firebase/database';
import { realtimeDb } from '@/configs/firebaseConfig';
import { LearningMetrics } from './LearningMetrics';
import { useUser } from "@clerk/nextjs";
import { generateCourseResponse } from '@/services/gemini';
import { 
  StructuredResponse,
  InfoBox,
  WarningBox,
  ExampleBox,
  StepsList,
  ProgressSection,
  CodeBlock
} from './MessageComponents';

const AIAssistant = ({ course }) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const chatContainerRef = useRef(null);
  const sessionStartTime = useRef(null);

  useEffect(() => {
    if (user?.id && isOpen) {
      loadUserMetrics();
      sessionStartTime.current = new Date();
    }
  }, [user?.id, isOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadUserMetrics = async () => {
    try {
      const metricsRef = ref(realtimeDb, `userMetrics/${user.id}`);
      const snapshot = await get(metricsRef);
      let userMetrics;
      
      if (snapshot.exists()) {
        // Convertir los datos de Firebase a una instancia de LearningMetrics
        const data = snapshot.val();
        userMetrics = LearningMetrics.fromJSON(data);
      } else {
        userMetrics = new LearningMetrics(user.id);
      }

      setMetrics(userMetrics);
      
      // Iniciar nueva sesión
      userMetrics.startSession({
        device: navigator.platform,
        browser: navigator.userAgent
      });
      
      // Guardar métricas actualizadas
      await set(metricsRef, userMetrics.toJSON());
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    }
  };

  const saveMetrics = async () => {
    if (!metrics || !user?.id) return;
    
    try {
      const metricsRef = ref(realtimeDb, `userMetrics/${user.id}`);
      await set(metricsRef, metrics.toJSON());
    } catch (error) {
      console.error('Error al guardar métricas:', error);
    }
  };

  // Función para evaluar la dificultad de una pregunta
  const assessQuestionDifficulty = (question) => {
    const length = question.length;
    const complexityMarkers = ['por qué', 'cómo', 'explica', 'compara', 'analiza'];
    const hasComplexity = complexityMarkers.some(marker => question.toLowerCase().includes(marker));
    
    if (length > 100 || hasComplexity) return 'hard';
    if (length > 50) return 'medium';
    return 'easy';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const startTime = new Date();
      
      // Generar respuesta usando Gemini
      const response = await generateCourseResponse(userMessage, course, metrics);
      
      // Actualizar métricas
      if (metrics) {
        const endTime = new Date();
        const responseTime = (endTime - startTime) / 1000;
        const difficulty = assessQuestionDifficulty(userMessage);
        
        // Determinar si la respuesta fue relevante basado en su longitud y contenido
        const isRelevant = response.length > 100 && !response.includes("no tengo suficiente información");
        
        // Obtener el tema más relevante del curso basado en la pregunta
        const topic = course.chapters?.find(chapter => 
          userMessage.toLowerCase().includes(chapter.name.toLowerCase())
        )?.name || 'general';
        
        metrics.recordAnswer(
          isRelevant,
          topic,
          difficulty,
          responseTime,
          isRelevant ? 4 : 3 // Confianza simulada
        );
        
        await saveMetrics();
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response
      }]);
    } catch (error) {
      console.error('Error al procesar mensaje:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Lo siento ${user?.firstName || ''}, hubo un error al procesar tu pregunta. ¿Podrías reformularla?`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar métricas al cerrar el chat
  const handleClose = async () => {
    if (metrics && sessionStartTime.current) {
      const sessionDuration = (new Date() - sessionStartTime.current) / 60000; // en minutos
      metrics.usage.totalTimeSpent += sessionDuration;
      await saveMetrics();
    }
    setIsOpen(false);
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
            setMessages([{
              role: 'assistant',
              content: `¡Hola ${user?.firstName || ''}! Soy tu asistente para el curso "${course.courseOutput?.course?.name}". 
                       Puedo ayudarte a entender mejor el contenido, responder preguntas específicas sobre los temas o guiarte a través de los capítulos.
                       También puedo mostrarte tu progreso y estadísticas de aprendizaje, solo pregúntame "¿cómo voy?" o "muestra mi progreso".
                       ¿En qué puedo ayudarte hoy?`
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
            onClick={(e) => e.target === e.currentTarget && handleClose()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-[#FF5F13] to-[#FBB041] text-white rounded-t-xl flex justify-between items-center">
                <h3 className="text-lg font-medium">Kunno AI - Asistente Personal</h3>
                <button
                  onClick={handleClose}
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
                          : 'bg-white shadow-md'
                      }`}
                    >
                      {message.role === 'user' ? (
                        message.content
                      ) : (
                        <StructuredResponse content={message.content} />
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-md p-3 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-[#FF5F13] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#FF5F13] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#FF5F13] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
                    placeholder={`Escribe tu pregunta aquí, ${user?.firstName || 'estudiante'}...`}
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
