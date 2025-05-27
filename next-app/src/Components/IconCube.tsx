import React from 'react';

interface IconCubeProps {
  width?: number;
  height?: number;
  className?: string;
}

const IconCube: React.FC<IconCubeProps> = ({ width = 42, height = 42, className }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 42 42"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
  >
    {/* Círculo exterior */}
    <circle
      cx="21"
      cy="21"
      r="20"
      stroke="#0F3C96"
      strokeWidth={2}
      fill="none"
    />

    {/* Cubo isométrico */}
    <g stroke="#0F3C96" strokeWidth={1.5}>
      {/* Cara superior */}
      <polygon points="21,13 29,18 21,23 13,18" fill="#2592F9" />
      {/* Cara izquierda */}
      <polygon points="13,18 13,27 21,32 21,23" fill="#214FDB" />
      {/* Cara derecha */}
      <polygon points="29,18 29,27 21,32 21,23" fill="#0F3C96" />
    </g>
  </svg>
);

export default IconCube;