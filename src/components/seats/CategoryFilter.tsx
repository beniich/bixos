import React from 'react';
import { SeatCategory } from '../../types/seat';

interface CategoryFilterProps {
  categories: SeatCategory[];
  activeCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategories,
  onToggleCategory
}) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-gray-400 text-sm py-1.5 mr-2">Filtrer par catégorie :</span>
      {categories.map(cat => {
        const isActive = activeCategories.has(cat.id);
        
        return (
          <button
            key={cat.id}
            onClick={() => onToggleCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border flex items-center gap-2 ${
              isActive 
                ? 'bg-white/10 border-white/20 text-white shadow-lg' 
                : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300 hover:border-white/10'
            }`}
          >
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-transform ${isActive ? 'scale-110 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : ''}`}
              style={{ backgroundColor: isActive ? cat.color : '#4b5563' }}
            />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
