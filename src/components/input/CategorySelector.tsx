import { Category } from '../../types';
import { CATEGORIES_ORDER, CATEGORY_CONFIG } from '../../types/constants';

interface CategorySelectorProps {
  selectedCategories: Category[];
  onToggle: (category: Category) => void;
  className?: string;
}

export function CategorySelector({ selectedCategories, onToggle, className }: CategorySelectorProps) {
  return (
    <div className={`category-selector ${className || ''}`}>
      {CATEGORIES_ORDER.map(category => {
        const config = CATEGORY_CONFIG[category];
        const isActive = selectedCategories.includes(category);

        return (
          <button
            key={category}
            className={`category-btn ${isActive ? 'active' : ''}`}
            onClick={() => onToggle(category)}
            data-category={category}
            aria-pressed={isActive}
          >
            <span className="category-btn-icon">{config.icon}</span>
            <span className="category-btn-label">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
