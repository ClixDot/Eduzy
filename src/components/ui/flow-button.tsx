'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './flow-button.css';

interface FlowButtonProps {
  text?: string;
  onClick?: () => void;
  to?: string;
  href?: string;
  className?: string;
  hoverColor?: string;
  id?: string;
}

export function FlowButton({
  text = "Modern Button",
  onClick,
  to,
  href,
  className = "",
  hoverColor = "#F97316",
  id,
}: FlowButtonProps) {
  const content = (
    <>
      {/* Left arrow (arr-2) */}
      <ArrowRight className="flow-arrow-left" />

      {/* Text */}
      <span className="flow-text">{text}</span>

      {/* Expanding Circle */}
      <span 
        className="flow-circle"
        style={hoverColor ? { backgroundColor: hoverColor } : undefined}
      />

      {/* Right arrow (arr-1) */}
      <ArrowRight className="flow-arrow-right" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`flow-button ${className}`} onClick={onClick} id={id}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flow-button ${className}`}
        onClick={onClick}
        id={id}
      >
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`flow-button ${className}`} id={id}>
      {content}
    </button>
  );
}

export default FlowButton;
