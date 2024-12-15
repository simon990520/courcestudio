import { UserInputContext } from "@/app/_context/UserInputContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useContext } from "react";

const TopicDescription = () => {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  
  const handleInputChange = (fieldname, value) => {
    setUserCourseInput((prev) => ({
      ...prev,
      [fieldname]: value,
    }));
  };

  const fields = [
    {
      id: 'topic',
      label: 'Escribe un tema para el que quieras generar un curso',
      icon: '',
      type: 'input',
      placeholder: 'Ej: Curso de Python, Yoga, Marketing Digital...',
      example: '(por ejemplo, Curso de Python, Yoga, etc.)',
      component: Input,
      props: {
        className: "bg-gray-50/50 border-gray-200 hover:border-primary/30 transition-all duration-300 text-lg",
      }
    },
    {
      id: 'description',
      label: 'Cuéntanos más sobre tu curso',
      icon: '',
      type: 'textarea',
      placeholder: 'Describe los temas principales que te gustaría incluir en el curso...',
      example: '(Opcional)',
      component: Textarea,
      props: {
        className: "bg-gray-50/50 border-gray-200 hover:border-primary/30 transition-all duration-300 text-lg min-h-[120px] resize-none",
      }
    }
  ];

  return (
    <div className="px-4 md:px-8 py-2 animate-fade-in">
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={`bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-md
              transition-all duration-300 transform hover:scale-[1.01] animate-scale
              ${userCourseInput?.[field.id] ? 'border-primary/50 shadow-sm' : ''}
            `}
            style={{
              animationDelay: `${index * 150}ms`
            }}
          >
            <div className="flex items-start gap-2 mb-3">
              <span className="text-xl mt-1">{field.icon}</span>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <span className="text-xs text-gray-500">
                  {field.example}
                </span>
              </div>
            </div>

            <field.component
              placeholder={field.placeholder}
              defaultValue={userCourseInput?.[field.id]}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              {...field.props}
            />

            {field.id === 'topic' && userCourseInput?.topic && (
              <div className="mt-2 text-xs text-gray-500 animate-fade-in">
                Tip: Un buen título es claro y específico
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicDescription;
