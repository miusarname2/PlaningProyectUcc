import { useState } from 'react';
import { CirclePlus } from 'lucide-react';
import ButtonGradient from '@/Components/ButtonGradient';

export default function HeaderModule({ title, description, buttonText, onClick }) {
  const [buttonHidden, setButtonHidden] = useState(false);

  const handleClick = () => {
    setButtonHidden(true);
    if (onClick) onClick(); // Llama función del padre para reemplazar contenido
  };

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>

      {!buttonHidden && (
        <ButtonGradient onClick={handleClick}>
          <CirclePlus className="w-4 h-4" />
          {buttonText}
        </ButtonGradient>
      )}
    </div>
  );
}
