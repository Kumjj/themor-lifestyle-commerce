import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * ScrollReveal: Renders children with smooth rise & fade-in when scrolled into view.
 * Triggers exactly once per element.
 */
export default function ScrollReveal({ children, delay = 0, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) { setIsVisible(true); return; }
    // If IntersectionObserver is supported
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Run exactly once
          }
        },
        { threshold: 0.08, rootMargin: '30px' }
      );

      if (domRef.current) {
        observer.observe(domRef.current);
      }

      return () => observer.disconnect();
    } else {
      // Fallback for environments without IntersectionObserver
      setIsVisible(true);
    }
  }, [reducedMotion]);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}
