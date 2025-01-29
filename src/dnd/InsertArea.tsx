import { useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties } from "react";
import { IDrop } from "./CanvasDropContainer";
import { Orientation } from "../vanilla/mountable";

interface Rect {
    x: number,
    y: number,
    width: number,
    height: number,
}

export interface AddSpec {
    area: Rect,
    channelName: string,
    index: number,
    orientation: Orientation,
    insert: boolean,
}

export interface IInsertAreaResult extends IDrop {
  index: number,
  channelName: string,
  orientation: Orientation,
  insert: boolean,
}

function InsertArea(props: {areaSpec: AddSpec, key: string}) {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: [ElementTypes.PREFAB, ElementTypes.CANVAS_ELEMENT],
        drop: () => ({ 
            index: props.areaSpec.index, 
            channelName: props.areaSpec.channelName,
            insert: props.areaSpec.insert,
            orientation: props.areaSpec.orientation,
            dropEffect: "insert"} as IInsertAreaResult),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isOverCurrent: monitor.isOver({shallow: true}),
            canDrop: monitor.canDrop(),
        }),
    }))

    let style: CSSProperties = {
        height: `${props.areaSpec.area.height}px`,
        width: `${props.areaSpec.area.width}px`,

        backgroundColor: "transparent",
        position: "absolute",
        top: `${props.areaSpec.area.y}px`,
        left: `${props.areaSpec.area.x}px`,
        opacity: 0.4,
        zIndex: 200
    }

    const isActive = canDrop && isOver
    let backgroundColor = 'transparent'
    let border = "2px solid rgba(0, 0, 0, 0)";
    if (isActive) {
        backgroundColor = 'darkgreen'
    } else if (canDrop) {
        backgroundColor = 'lightgrey'
        border = "2px solid rgba(80, 80, 80, 0)"
    }

    

    return (
        <div ref={drop} style={{ ...style, backgroundColor}} data-testid={props.areaSpec.channelName + props.areaSpec.index}
                key={props.key}
                >
            
        </div>
    )
}

export default InsertArea