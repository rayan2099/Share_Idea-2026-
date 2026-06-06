import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'custom';
  className?: string;
  style?: React.CSSProperties;
}

export const Logo = ({ size = 'md', className = '', style = {} }: LogoProps) => {
  const widths = {
    sm: 140,
    md: 200,
    lg: 240,
    custom: undefined,
  };

  return (
    <img
      src="/logo.png"
      alt="Share idea - مشاركة الفكرة"
      width={widths[size]}
      style={{
        objectFit: 'contain',
        display: 'block',
        ...style,
      }}
      className={className}
    />
  );
};

export default Logo;
