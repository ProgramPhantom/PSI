import { useDrop } from "react-dnd";
import { ElementTypes, DropResult } from "./DraggableElement";
import { CSSProperties } from "react";
import { Orientation } from "../vanilla/positional";

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

function InsertArea(props: {areaSpec: AddSpec}) {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: ElementTypes.PULSE,
        drop: () => ({ 
            index: props.areaSpec.index, 
            channelName: props.areaSpec.channelName,
            insert: props.areaSpec.insert,
            orientation: props.areaSpec.orientation}),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
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
            <div ref={drop} style={{ ...style, backgroundColor}} data-testid={props.areaSpec.channelName}>
                
            </div>
        )
}

export default InsertArea