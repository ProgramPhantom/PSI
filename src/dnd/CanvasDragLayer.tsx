import type { CSSProperties, FC } from 'react'
import type { XYCoord } from 'react-dnd'
import { useDragLayer } from 'react-dnd'


import { ElementTypes } from './DraggableElement'
import { ElementDragPreview } from './ElementDragPreview'
import { CanvasDraggableElementPayload } from './CanvasDraggableElement'

const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
  scale: number
    ) {
  if (!initialOffset || !currentOffset) {
    // If not dragging don't show
    console.log("NO OFFSET NOT SHOWING PREVIEW")
    return {
      display: 'none',
    }
  }

  let { x, y } = currentOffset

  console.log(`initialOffset: ${x} ${y}`)
  console.log(`currentOffset: ${x} ${y}`)

  const transform = `translate(${x}px, ${y}px) `
  const s = `scale(${scale})`
  return {
    transform: transform + s,
    WebkitTransform: transform + s,
  }
}

export interface CustomDragLayerProps {
    scale: number
}

export const CanvasDragLayer: FC<CustomDragLayerProps> = (props) => {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem() as CanvasDraggableElementPayload,
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }))

  function renderItem() {
    switch (itemType) {
      case ElementTypes.REAL_ELEMENT:
        return <ElementDragPreview element={item.element}/>
      case ElementTypes.PREFAB:
        console.log(item)  
        return <ElementDragPreview element={item.element}/>
      default:
        return null
    }
  }

  var css;

    css = getItemStyles(initialOffset, currentOffset, props.scale);
    console.log(css)

  

  if (!isDragging) {
    return null
  }
  return (
    <div style={layerStyles}>
      <div style={{...css, transformOrigin: "top left"}}>
        {renderItem()}
      </div>
    </div>
  )
}
