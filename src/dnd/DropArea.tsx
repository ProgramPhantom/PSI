import { useDrop } from "react-dnd";
import { ElementTypes } from "./DraggableElement";
import { CSSProperties } from "react";

const style: CSSProperties = {
    height: '12rem',
    width: '12rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    lineHeight: 'normal',
    float: 'left',
    backgroundColor: "transparent"
  }

function DropArea() {
    const [{ canDrop, isOver }, drop] = useDrop(() => ({
        accept: ElementTypes.PULSE,
        drop: () => ({ name: 'Dustbin' }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
        }))

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

export default DropArea