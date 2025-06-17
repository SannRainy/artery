// client/src/hooks/useInView.js
import { useState, useEffect, useRef } from 'react';

export const useInView = (options) => {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Jika elemen masuk ke viewport, update state
      if (entry.isIntersecting) {
        setIsInView(true);
        // Setelah terlihat, kita tidak perlu mengamatinya lagi untuk efisiensi
        observer.unobserve(entry.target);
      }
    }, options);

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [containerRef, options]);

  return [containerRef, isInView];
};