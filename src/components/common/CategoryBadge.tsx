import { Category } from '../../types';
import { CATEGORY_CONFIG } from '../../types/constants';

interface CategoryBadgeProps {
  category: Category;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function CategoryBadge({ category, showIcon = true, size = 'medium', className }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category] ?? { label: category, color: '#888', icon: '📌' };
  const sizeClass = `category-badge-${size}`;

  return (
    <span
      className={`category-badge ${sizeClass} ${className || ''}`}
      data-category={category}
    >
      {showIcon && <span className="category-icon">{config.icon}</span>}
      <span className="category-label">{config.label}</span>
    </span>
  );
}
