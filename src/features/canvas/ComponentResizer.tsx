import {Button, Text} from "@blueprintjs/core";
import React, {ReactNode, useCallback, useEffect, useRef, useState} from "react";

interface ComponentResizerProps {
  children: ReactNode;
  panelName?: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  onResize?: (width: number, height: number) => void;
  resizeDirection?: "horizontal" | "vertical" | "both";
  collapsedWidth?: number;
  collapsedHeight?: number;
}

const ComponentResizer: React.FC<ComponentResizerProps> = ({
  children,
  panelName = "Properties",
  minWidth = 200,
  maxWidth = 800,
  minHeight = 200,
  maxHeight = 800,
  defaultWidth = 400,
  defaultHeight = 400,
  onResize,
  resizeDirection = "horizontal",
  collapsedWidth = 20,
  collapsedHeight = 20
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previousWidth, setPreviousWidth] = useState(defaultWidth);
  const [previousHeight, setPreviousHeight] = useState(defaultHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const startHeightRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      startWidthRef.current = width;
      startHeightRef.current = height;
      document.body.style.cursor =
        resizeDirection === "horizontal"
          ? "col-resize"
          : resizeDirection === "vertical"
            ? "row-resize"
            : "nw-resize";
      document.body.style.userSelect = "none";
    },
    [width, height, resizeDirection]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;

      let newWidth = width;
      let newHeight = height;

      if (resizeDirection === "horizontal" || resizeDirection === "both") {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current - deltaX));
      }

      if (resizeDirection === "vertical" || resizeDirection === "both") {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current - deltaY));
      }

      setWidth(newWidth);
      setHeight(newHeight);
      onResize?.(newWidth, newHeight);
    },
    [isResizing, minWidth, maxWidth, minHeight, maxHeight, width, height, resizeDirection, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const toggleCollapse = useCallback(() => {
    if (isCollapsed) {
      // Expand to previous dimensions
      setWidth(previousWidth);
      setHeight(previousHeight);
      setIsCollapsed(false);
    } else {
      // Collapse and save current dimensions
      setPreviousWidth(width);
      setPreviousHeight(height);
      setWidth(collapsedWidth);
      setHeight(collapsedHeight);
      setIsCollapsed(true);
    }
  }, [isCollapsed, previousWidth, previousHeight, width, height, collapsedWidth, collapsedHeight]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const getResizeHandleStyle = () => {
    const baseStyle = {
      position: "absolute" as const,
      cursor: isCollapsed
        ? "default"
        : resizeDirection === "horizontal"
          ? "col-resize"
          : resizeDirection === "vertical"
            ? "row-resize"
            : "nw-resize",
      backgroundColor: isResizing ? "#0066cc" : isHovering ? "#e6f3ff" : "transparent",
      zIndex: 1000,
      transition: "background-color 0.1s ease"
    };

    if (resizeDirection === "horizontal") {
      return {
        ...baseStyle,
        left: 0,
        top: 0,
        width: "4px",
        height: "100%"
      };
    } else if (resizeDirection === "vertical") {
      return {
        ...baseStyle,
        left: 0,
        top: 0,
        width: "100%",
        height: "4px"
      };
    } else {
      // both - create corner handle
      return {
        ...baseStyle,
        right: 0,
        bottom: 0,
        width: "10px",
        height: "10px",
        cursor: "nw-resize"
      };
    }
  };

  const getToggleButtonStyle = () => {
    if (resizeDirection === "horizontal") {
      return {
        position: "absolute" as const,
        left: isCollapsed ? "-10px" : "-30px",
        top: "10px",
        width: "20px",
        height: "20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        transition: "background-color 0.2s ease"
      };
    } else if (resizeDirection === "vertical") {
      return {
        position: "absolute" as const,
        left: "15px",
        top: isCollapsed ? "-5px" : "-30px",
        width: "10px",
        height: "10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
        transition: "background-color 0.2s ease"
      };
    } else {
      // both - place in top-left corner
      return {
        position: "absolute" as const,
        left: "-30px",
        top: "-30px",
        width: "20px",
        height: "20px",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "3px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
        transition: "background-color 0.2s ease"
      };
    }
  };

  const getCollapsedIndicatorStyle = () => {
    if (resizeDirection === "horizontal") {
      return {
        position: "absolute" as const,
        top: "70px",
        left: "50%",
        transform: "translate(-50%, -50%) rotate(90deg)",
        color: "#999",
        fontSize: "14px",
        whiteSpace: "nowrap",
        zIndex: 5,
        userSelect: "none" as const,
        transition: "none"
      };
    } else if (resizeDirection === "vertical") {
      return {
        position: "absolute" as const,
        top: "50%",
        left: "65px",
        transform: "translate(-50%, -50%)",
        color: "#999",
        fontSize: "14px",
        whiteSpace: "nowrap",
        zIndex: 5,
        userSelect: "none" as const,
        transition: "none"
      };
    } else {
      return {
        position: "absolute" as const,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#999",
        fontSize: "12px",
        fontWeight: "bold",
        whiteSpace: "nowrap",
        zIndex: 999,
        userSelect: "none" as const,
        transition: "none"
      };
    }
  };

  const getToggleIcon = () => {
    if (resizeDirection === "horizontal") {
      return isCollapsed ? "chevron-left" : "chevron-right";
    } else if (resizeDirection === "vertical") {
      return isCollapsed ? "chevron-up" : "chevron-down";
    } else {
      return isCollapsed ? "expand-all" : "collapse-all";
    }
  };

  // Determine container dimensions based on resize direction
  const getContainerStyle = () => {
    const baseStyle = {
      position: "relative" as const,
      transition: isResizing ? "none" : "width 0.3s ease-in-out, height 0.3s ease-in-out"
    };

    if (resizeDirection === "horizontal") {
      return {
        ...baseStyle,
        width: isCollapsed ? `${collapsedWidth}px` : `${width}px`,
        height: "100%" // Let child determine height
      };
    } else if (resizeDirection === "vertical") {
      return {
        ...baseStyle,
        width: "100%", // Let child determine width
        height: isCollapsed ? `${collapsedHeight}px` : `${height}px`
      };
    } else {
      // both - control both dimensions
      return {
        ...baseStyle,
        width: isCollapsed ? `${collapsedWidth}px` : `${width}px`,
        height: isCollapsed ? `${collapsedHeight}px` : `${height}px`
      };
    }
  };

  return (
    <div ref={containerRef} style={getContainerStyle()}>
      {/* Toggle button */}
      <div
        style={getToggleButtonStyle()}
        onClick={toggleCollapse}
        title={isCollapsed ? "Expand panel" : "Collapse panel"}>
        <Button icon={getToggleIcon()} variant="minimal"></Button>
      </div>

      {/* Resize handle */}
      <div
        style={getResizeHandleStyle()}
        onMouseDown={isCollapsed ? undefined : handleMouseDown}
        onMouseEnter={() => !isCollapsed && setIsHovering(true)}
        onMouseLeave={() => !isCollapsed && setIsHovering(false)}
      />

      {/* Collapsed indicator */}
      {isCollapsed && (
        <div style={getCollapsedIndicatorStyle()}>
          <Text>{panelName}</Text>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "auto",
          opacity: isCollapsed ? 0 : 1,
          transition: "opacity 0.3s ease-in-out"
        }}>
        {children}
      </div>
    </div>
  );
};

export default ComponentResizer;
