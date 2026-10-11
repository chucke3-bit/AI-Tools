import React from 'react';
import javidLogoImg from '../../assets/images/javid_silhouette_glasses_1791554167543.jpg';

interface JavidLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const JavidLogo: React.FC<JavidLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-white border border-[#2b334a] shadow-md flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <img
        src={javidLogoImg}
        alt="Javid Studio Logo"
        className="w-full h-full object-contain p-0.5 select-none"
      />
    </div>
  );
};
