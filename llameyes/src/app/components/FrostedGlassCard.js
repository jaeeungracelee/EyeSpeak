// File: components/FrostedGlassCard.jsx
import React, { useState, useRef } from 'react';

const FrostedGlassCard = ({ children, className, style }) => {
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });
  const requestRef = useRef(null);

  const handleMouseMove = (e) => {
    if (requestRef.current) return;
    requestRef.current = requestAnimationFrame(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
      requestRef.current = null;
    });
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
