import React, { ReactNode, useRef, useState, useCallback, useEffect } from 'react';

interface ComponentResizerProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  onResize?: (width: number) => void;
  resizeDirection?: 'left' | 'right';
}

const ComponentResizer: React.FC<ComponentResizerProps> = ({
  children,
  minWidth = 200,
  maxWidth = 800,
  defaultWidth = 400,
  onResize,
  resizeDirection = 'left'
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current - deltaX));
    
    setWidth(newWidth);
    onResize?.(newWidth);
  }, [isResizing, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
             {/* Resize handle */}
       <div
         style={{
           position: 'absolute',
           left: 0,
           top: 0,
           width: '4px',
           height: '100%',
           cursor: 'col-resize',
           backgroundColor: isResizing ? '#0066cc' : isHovering ? '#e6f3ff' : 'transparent',
           zIndex: 1000,
           transition: 'background-color 0.1s ease'
         }}
         onMouseDown={handleMouseDown}
         onMouseEnter={() => setIsHovering(true)}
         onMouseLeave={() => setIsHovering(false)}
       />
      
      {/* Content */}
      <div style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export default ComponentResizer;
