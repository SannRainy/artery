import { useState, useEffect } from 'react'

export default function MasonryLayout({ children, columns = 4, gap = 16 }) {
  const [columnWrapper, setColumnWrapper] = useState([])

  useEffect(() => {
    const columnItems = Array(columns).fill().map(() => [])
    
    children.forEach((child, index) => {
      columnItems[index % columns].push(child)
    })

    setColumnWrapper(columnItems)
  }, [children, columns])

  return (
    <div className={`flex gap-[${gap}px] flex-wrap`}>
      {columnWrapper.map((items, idx) => (
        <div key={idx} className={`flex-1 min-w-[calc(100%/${columns})]`}>
          {items.map((item, i) => (
            <div key={i} className="mb-4">
              {item}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
