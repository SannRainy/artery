// client/src/components/layout/MasonryLayout.jsx
import React from 'react';
import Masonry from 'react-masonry-css';

export default function MasonryLayout({ children }) {
  // Objek ini mendefinisikan berapa banyak kolom yang akan ditampilkan pada breakpoint layar yang berbeda.
  const breakpointColumnsObj = {
    default: 5,     // 5 kolom untuk layar yang sangat besar
    1280: 4,        // 4 kolom untuk layar >= 1280px (xl)
    1024: 3,        // 3 kolom untuk layar >= 1024px (lg)
    768: 2,         // 2 kolom untuk layar >= 768px (md)
    640: 2          // 2 kolom untuk layar >= 640px (sm)
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="masonry-grid" // Class untuk kontainer flex
      columnClassName="masonry-grid_column" // Class untuk setiap kolom
    >
      {children}
    </Masonry>
  );
}