import React from 'react';
import { motion } from 'framer-motion';

// Componente para mostrar código con resaltado de sintaxis
export const CodeBlock = ({ code, language = 'javascript' }) => (
  <div className="my-2 bg-gray-800 rounded-lg overflow-hidden">
    <div className="px-4 py-2 bg-gray-700 text-gray-200 text-sm font-mono">
      {language}
    </div>
    <pre className="p-4 text-gray-200 text-sm overflow-x-auto">
      <code>{code}</code>
    </pre>
  </div>
);

// Componente para mostrar consejos o información importante
export const InfoBox = ({ title, children }) => (
  <div className="my-2 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
    <h4 className="text-blue-800 font-semibold mb-2">{title}</h4>
    <div className="text-blue-700">{children}</div>
  </div>
);

// Componente para mostrar advertencias
export const WarningBox = ({ title, children }) => (
  <div className="my-2 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
    <h4 className="text-yellow-800 font-semibold mb-2">{title}</h4>
    <div className="text-yellow-700">{children}</div>
  </div>
);

// Componente para mostrar ejemplos
export const ExampleBox = ({ title, children }) => (
  <div className="my-2 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
    <h4 className="text-green-800 font-semibold mb-2">{title}</h4>
    <div className="text-green-700">{children}</div>
  </div>
);

// Componente para mostrar listas de pasos
export const StepsList = ({ steps }) => (
  <div className="my-2">
    {steps.map((step, index) => (
      <div key={index} className="flex items-start mb-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#FF5F13] to-[#FBB041] rounded-full flex items-center justify-center text-white font-semibold">
          {index + 1}
        </div>
        <div className="ml-4 flex-grow">
          <h4 className="font-semibold text-gray-800">{step.title}</h4>
          <p className="text-gray-600">{step.description}</p>
        </div>
      </div>
    ))}
  </div>
);

// Componente para mostrar progreso
export const ProgressSection = ({ progress }) => (
  <div className="my-2 p-4 bg-white rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-3 text-gray-800">Tu Progreso</h3>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">Precisión</div>
        <div className="text-xl font-bold text-[#FF5F13]">{progress.accuracy}</div>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">Tiempo Promedio</div>
        <div className="text-xl font-bold text-[#FF5F13]">{progress.averageResponseTime}</div>
      </div>
      <div className="col-span-2">
        <div className="text-sm text-gray-600 mb-1">Temas Dominados</div>
        <div className="flex flex-wrap gap-2">
          {progress.masteredTopics.map((topic, index) => (
            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Componente para mostrar respuestas estructuradas
export const StructuredResponse = ({ content }) => {
  if (typeof content === 'string') {
    return <p className="text-gray-800 leading-relaxed">{content}</p>;
  }

  return (
    <div className="space-y-4 w-full">
      {/* Título */}
      {content.title && (
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          {content.title}
        </h3>
      )}

      {/* Explicación principal */}
      {content.explanation && (
        <p className="text-gray-800 leading-relaxed">
          {content.explanation}
        </p>
      )}

      {/* Pasos */}
      {content.steps && content.steps.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-3">Pasos a seguir:</h4>
          <div className="space-y-3">
            {content.steps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#FF5F13] to-[#FBB041] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="ml-4 flex-grow">
                  <h5 className="font-semibold text-gray-800">{step.title}</h5>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ejemplo */}
      {content.example && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <h4 className="text-green-800 font-semibold mb-2">Ejemplo</h4>
          <p className="text-green-700">{content.example}</p>
        </div>
      )}

      {/* Información adicional */}
      {content.info && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h4 className="text-blue-800 font-semibold mb-2">Información Adicional</h4>
          <p className="text-blue-700">{content.info}</p>
        </div>
      )}

      {/* Advertencia */}
      {content.warning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <h4 className="text-yellow-800 font-semibold mb-2">¡Importante!</h4>
          <p className="text-yellow-700">{content.warning}</p>
        </div>
      )}

      {/* Código */}
      {content.code && (
        <div className="mt-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-700 text-gray-200 text-sm font-mono">
              {content.language || 'Código'}
            </div>
            <div className="p-4">
              <pre className="text-gray-200 text-sm overflow-x-auto whitespace-pre-wrap">
                <code>{content.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
