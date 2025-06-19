// client/src/components/layout/MasonryLayout.jsx
import React from 'react';
import Masonry from 'react-masonry-css';

export default function MasonryLayout({ children }) {

  const breakpointColumnsObj = {
    default: 5,     
    1280: 4,        
    1024: 3,        
    768: 2,         
    640: 2          
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="masonry-grid"
      columnClassName="masonry-grid_column" 
    >
      {children}
    </Masonry>
  );
}