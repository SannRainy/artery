// client/src/components/layout/MasonryLayout.jsx
import React, { useState, useEffect, useMemo } from 'react';

export default function MasonryLayout({ children, columns = 4, gap = 4 }) { // Default gap Tailwind (16px jika 1 unit = 4px)
  const [columnWrapper, setColumnWrapper] = useState([]);

  // Gunakan useMemo untuk anak-anak yang valid agar tidak memproses ulang jika children tidak berubah
  const validChildren = useMemo(() => React.Children.toArray(children).filter(Boolean), [children]);

  useEffect(() => {
    const newColumnWrapper = Array.from({ length: columns }, () => []);
    validChildren.forEach((child, index) => {
      newColumnWrapper[index % columns].push(child);
    });
    setColumnWrapper(newColumnWrapper);
  }, [validChildren, columns]);

  const gapClass = `gap-${gap}`;

  return (
    <div className={`flex flex-row ${gapClass} w-full`}>
      {columnWrapper.map((items, columnIndex) => (
        <div key={columnIndex} className="flex flex-col flex-1 min-w-0"> {/* min-w-0 penting untuk flex item agar tidak overflow */}
          {items.map((item, itemIndex) => (
            // Berikan key unik berdasarkan item asli jika memungkinkan, atau kombinasi
            <div key={item.key || `col-${columnIndex}-item-${itemIndex}`} className={`mb-${gap}`}>
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}