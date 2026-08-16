import React from 'react';

export const Avatar = ({ name = '', src = '', size = 'md', color = 'primary' }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'w-8 h-8 text-[12px]',
    md: 'w-10 h-10 text-[14px]',
    lg: 'w-16 h-16 text-[24px]',
    xl: 'w-24 h-24 text-[32px]'
  };

  const colors = {
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
    surface: 'bg-surface-container-high text-on-surface'
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedColor = colors[color] || colors.primary;

  return (
    <div className={`relative rounded-full flex items-center justify-center font-bold overflow-hidden ${selectedSize} ${selectedColor}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
