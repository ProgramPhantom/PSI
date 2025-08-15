import { Button, Text } from '@blueprintjs/core';
import React, { ReactNode, useRef, useState, useCallback, useEffect } from 'react';

interface ComponentResizerProps {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  onResize?: (width: number) => void;
  resizeDirection?: 'left' | 'right';
  collapsedWidth?: number;
}

const ComponentResizer: React.FC<ComponentResizerProps> = ({
  children,
  minWidth = 200,
  maxWidth = 800,
  defaultWidth = 400,
  onResize,
  resizeDirection = 'left',
  collapsedWidth = 20
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previousWidth, setPreviousWidth] = useState(defaultWidth);
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

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      // Expand to previous width
      setWidth(previousWidth);
      setIsCollapsed(false);
    } else {
      // Collapse and save current width
      setPreviousWidth(width);
      setWidth(collapsedWidth);
      setIsCollapsed(true);
    }
  }, [isCollapsed, previousWidth, width, collapsedWidth]);

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
         height: '100%', position: 'relative',
         transition: isResizing ? 'none' : 'width 0.3s ease-in-out',
       }}
     >
      {/* Toggle button */}
      <div
        style={{
          position: 'absolute',
          left: '-30px',
          top: '10px',
          width: '20px',
          height: '20px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '3px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e0e0e0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f0f0f0';
        }}
        onClick={toggleCollapse}
        title={isCollapsed ? "Expand panel" : "Collapse panel"}
      >
        <Button icon={isCollapsed ? "chevron-left" : "chevron-right"} size="small" variant="minimal"></Button>
      </div>

      {/* Resize handle */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '4px',
          height: '100%',
          cursor: isCollapsed ? 'default' : 'col-resize',
          backgroundColor: isResizing ? '#0066cc' : isHovering ? '#e6f3ff' : 'transparent',
          zIndex: 1000,
          transition: 'background-color 0.1s ease'
        }}
        onMouseDown={isCollapsed ? undefined : handleMouseDown}
        onMouseEnter={() => !isCollapsed && setIsHovering(true)}
        onMouseLeave={() => !isCollapsed && setIsHovering(false)}
      />

      {/* Collapsed indicator */}
      {isCollapsed && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          color: '#999',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          zIndex: 999,
          userSelect: 'none',
          transition: "none"
        }}>
          <Text>PROPERTIES</Text>
        </div>
      )}
       
        {/* Content */}
       <div style={{ 
         width: '100%', 
         height: '100%',
         overflow: 'auto',
         opacity: isCollapsed ? 0 : 1,
         transition: 'opacity 0.3s ease-in-out',
       }}>
         {children}
       </div>


    </div>
  );
};

export default ComponentResizer;
