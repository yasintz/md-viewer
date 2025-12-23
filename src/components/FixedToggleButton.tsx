import { cn } from '@/lib/utils';
import React from 'react';

interface FixedToggleButtonProps {
  onClick: () => void;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  position?: 'left' | 'right';
  index?: number;
  className?: string;
}

export function FixedToggleButton({
  onClick,
  title,
  icon: Icon,
  position = 'left',
  index = 0,
  className = '',
}: FixedToggleButtonProps) {
  const baseClasses =
    'fixed z-20 bg-white shadow-lg border border-gray-200 px-2 py-3 hover:bg-gray-50 transition-colors cursor-pointer';

  const positionClasses =
    position === 'left'
      ? 'rounded-r-lg border-l-0'
      : 'rounded-l-lg border-r-0 right-0';

  const top = `calc(50% + ${index * 48}px)`;

  return (
    <button
      onClick={onClick}
      className={cn(baseClasses, positionClasses, className)}
      style={{ top }}
      title={title}
    >
      <Icon className="size-4 text-gray-600" />
    </button>
  );
}

