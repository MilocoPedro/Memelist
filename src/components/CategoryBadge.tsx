import React from 'react';
import * as LucideIcons from 'lucide-react';
import { CATEGORIES, CategoryKey } from '../types';

interface CategoryBadgeProps {
  categoryKey: string;
  className?: string;
  showIconOnly?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  categoryKey,
  className = '',
  showIconOnly = false,
}) => {
  const cat = CATEGORIES[categoryKey as CategoryKey] || CATEGORIES['Otros'];

  // Dynamically resolve lucide icon element safely
  const IconComponent = (LucideIcons as any)[cat.iconName] || LucideIcons.ShoppingBag;

  if (showIconOnly) {
    return (
      <div 
        className={`p-1.5 rounded-full ${cat.bgLight} ${className}`} 
        title={cat.label}
      >
        <IconComponent className="w-4 h-4 shrink-0 font-medium" />
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${cat.bgLight} ${cat.color} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      <span>{cat.label}</span>
    </span>
  );
};
