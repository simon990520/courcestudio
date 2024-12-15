import React, { useContext } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UserInputContext } from "@/app/_context/UserInputContext";

const SelectOption = () => {
  const { userCourseInput, setUserCourseInput } = useContext(UserInputContext);
  
  const handleInputChange = (fieldname, value) => {
    setUserCourseInput((prev) => ({
      ...prev,
      [fieldname]: value,
    }));
  };

  const options = [
    {
      id: 'level',
      label: 'Nivel de dificultad',
      icon: '🎓',
      type: 'select',
      placeholder: 'Seleccionar nivel',
      options: [
        { value: 'Beginner', label: 'Principiante' },
        { value: 'Intermediate', label: 'Intermedio' },
        { value: 'Advance', label: 'Avanzado' }
      ]
    },
    {
      id: 'duration',
      label: 'Duración del curso',
      icon: '🕛',
      type: 'select',
      placeholder: 'Seleccionar duración',
      options: [
        { value: '1 Hour', label: '1 Hora' },
        { value: '2 Hours', label: '2 Horas' },
        { value: 'More than 3 Hours', label: 'Más de 3 Horas' }
      ]
    },
    {
      id: 'displayVideo',
      label: 'Agregar video',
      icon: '▶️',
      type: 'select',
      placeholder: 'Seleccionar opción',
      options: [
        { value: 'Yes', label: 'Si' },
        { value: 'No', label: 'No' }
      ]
    },
    {
      id: 'noOfChapter',
      label: 'Número de capítulos',
      icon: '📚',
      type: 'number',
      placeholder: 'Ingrese número'
    }
  ];

  return (
    <div className="px-4 md:px-8 py-2 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <div
            key={option.id}
            className={`bg-white rounded-xl p-4 border border-gray-100 hover:border-primary/30 hover:shadow-md
              transition-all duration-300 transform hover:scale-[1.02] animate-scale
              ${userCourseInput?.[option.id] ? 'border-primary/50 shadow-sm' : ''}
            `}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
              <span className="text-lg">{option.icon}</span>
              {option.label}
            </label>
            
            {option.type === 'select' ? (
              <Select
                onValueChange={(value) => handleInputChange(option.id, value)}
                defaultValue={userCourseInput?.[option.id]}
              >
                <SelectTrigger className="bg-gray-50/50 border-gray-200 hover:border-primary/30 transition-colors duration-300">
                  <SelectValue placeholder={option.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {option.options.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      className="hover:bg-orange-50 cursor-pointer transition-colors duration-200"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                onChange={(e) => handleInputChange(option.id, e.target.value)}
                defaultValue={userCourseInput?.[option.id]}
                placeholder={option.placeholder}
                className="bg-gray-50/50 border-gray-200 hover:border-primary/30 transition-colors duration-300"
                min="1"
                max={userCourseInput?.level === "Beginner" ? "25" : "100"}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectOption;
