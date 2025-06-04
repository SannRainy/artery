// client/src/components/layout/MasonryLayout.jsx
import React, { useState, useEffect, useMemo } from 'react';

export default function MasonryLayout({ children, columns = 4, gap = 4 }) { // gap dalam unit Tailwind (misal 4 -> 1rem -> 16px)
  const [columnWrapper, setColumnWrapper] = useState([]);
  const validChildren = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);

  useEffect(() => {

    let numColumns = columns;
    if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) numColumns = 2; // Contoh: 2 kolom untuk layar kecil (<sm)
        else if (window.innerWidth < 1024) numColumns = Math.max(2, columns -1); // Contoh: 3 kolom untuk layar medium (<lg)
        else numColumns = columns; // Default untuk layar besar
    }

    const newColumnWrapper = Array.from({ length: numColumns }, () => []);
    validChildren.forEach((child, index) => {
      newColumnWrapper[index % numColumns].push(child);
    });
    setColumnWrapper(newColumnWrapper);
  }, [validChildren, columns]); // Tambahkan listener resize jika ingin responsivitas kolom dinamis

  const gapClass = `gap-${gap}`; // Misal: gap-4
  const marginBottomClass = `mb-${gap}`; // Misal: mb-4

  return (
    <div className={`flex flex-row ${gapClass} w-full`}>
      {columnWrapper.map((items, columnIndex) => (
        <div key={columnIndex} className="flex flex-col flex-1 min-w-0"> 
          {items.map((item, itemIndex) => (
            <div 
              // Key dari item.props.pin.id lebih baik jika item adalah PinCard
              key={item.props.pin?.id || item.key || `col-${columnIndex}-item-${itemIndex}`} 
              className={marginBottomClass} // Jarak antar item dalam satu kolom
            >
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}