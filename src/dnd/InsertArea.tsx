import { useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties } from "react";
import { Orientation } from "../vanilla/temporal";

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
    orientation: Orientation
}

function InsertArea(props: {areaSpec: AddSpec}) {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: ElementTypes.PULSE,
        drop: () => ({ index: props.areaSpec.index }),
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
            left: `${props.areaSpec.area.x}px`
          }

        const isActive = canDrop && isOver
        let backgroundColor = 'transparent'
        if (isActive) {
            backgroundColor = 'darkgreen'
        } else if (canDrop) {
            backgroundColor = 'lightgrey'
        }

        return (
            <div ref={drop} style={{ ...style, backgroundColor}} data-testid="dustbin">
                
            </div>
        )
}

export default InsertArea