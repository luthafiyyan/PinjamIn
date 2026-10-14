import React from 'react';

interface PinjamInIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const PinjamInIcon: React.FC<PinjamInIconProps> = ({
  className = 'w-5 h-5',
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Royal Blue / Indigo Squircle Background */}
      <rect width="512" height="512" rx="116" ry="116" fill="#4848ed" />
      
      {/* Stylized White 'p' Stem with rounded ends */}
      <rect x="176" y="120" width="60" height="268" rx="30" ry="30" fill="#ffffff" />
      {/* Circular Bowl */}
      <circle cx="284" cy="220" r="102" fill="#ffffff" />
      
      {/* Inner Blue Lens / Hole */}
      <circle cx="284" cy="220" r="50" fill="#4848ed" />
      
      {/* Amber/Gold Core Dot (PinjamIn Accent) */}
      <circle cx="284" cy="220" r="24" fill="#fab818" />
    </svg>
  );
};
