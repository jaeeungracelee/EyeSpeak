import React, { useState } from 'react';

const FrostedGlassCard = ({ children, className, style }) => {
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        ...style,
        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0)), rgba(255, 255, 255, 0.1)`,
      }}
      className={`relative backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
};

export default FrostedGlassCard;
