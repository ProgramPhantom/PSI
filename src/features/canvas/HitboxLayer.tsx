import { Element } from "@svgdotjs/svg.js";
import ENGINE from "../../logic/engine"
import { Rect } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { SVG } from "@svgdotjs/svg.js";
import { Visual } from "../../logic/visual";
import { ID } from "../../logic/point";
import { AllComponentTypes } from "../../logic/diagramHandler";


interface IHitboxLayerProps {
    focusLevel: number

    setHoveredElement: (element?: Visual) => void
}


type HoverBehaviour = "terminate" | "carry" | "conditional"
// Terminate: return this object immediately
// Carry: always pass to parent
// Conditional: Check parent and only return itself IF above is carry. If above is terminal, pass up.
const FocusLevels: Record<number, Record<HoverBehaviour, AllComponentTypes[]>> = {
    0: {
        terminate: [
            "label-group",
            "channel",
            "rect",
            "line",
            "svg",
        ],
        carry: [
            "text",
            "diagram",
            "lower-abstract",
        ],
        conditional: [
            "rect",
            "svg",
            "label"
        ]
    },
    1: {
        terminate: [
            "diagram",
            "label-group",
            "channel",
            "svg",
            "rect",
            "label-group"
        ],
        carry: ["diagram"],
        conditional: [
            
        ]
    },
    2: {
        terminate: [
            "diagram",
            "label-group",
        ],
        carry: ["diagram"],
        conditional: [
            "svg",
            "rect"
        ]
    }
}


export function HitboxLayer(props: IHitboxLayerProps) {
    var hitboxes: Rect[] = ENGINE.handler.diagram.getHitbox(999);
    var hitboxLayer: Svg = SVG();

    for (var hitbox of hitboxes) {
        hitboxLayer.add(hitbox);
    }


    const getMouseElementFromID = (id: ID | undefined): Visual | undefined => {
        if (id === undefined) {return undefined}
        var initialElement: Visual | undefined = ENGINE.handler.identifyElement(id);
        if (initialElement === undefined) {return undefined}

        var terminators: AllComponentTypes[] = FocusLevels[props.focusLevel].terminate;
        var carry: AllComponentTypes[] = FocusLevels[props.focusLevel].carry;
        var conditional: AllComponentTypes[] = FocusLevels[props.focusLevel].conditional;

        function walkUp(currElement: Visual): Visual | undefined {
            if (currElement.parentId !== undefined) {
                var elementUp: Visual | undefined = ENGINE.handler.identifyElement(currElement.parentId);
            } else {
                return currElement
            }
            
            if (elementUp === undefined) { return currElement }
            
            if (currElement.ref === "LINE") {
                console.log()
            }
            var currElementType: AllComponentTypes = (currElement.constructor as typeof Visual).ElementType;
            var elementUpType: AllComponentTypes = (elementUp.constructor as typeof Visual).ElementType;


            if (terminators.includes(currElementType)) {
                return currElement
            }
            if (conditional.includes(currElementType) && !terminators.includes(elementUpType)) {
                return currElement;
            }
            
            elementUp = walkUp(elementUp);
            
            
            return elementUp
        }

        return walkUp(initialElement);
    }

    const mouseOver = (over: React.MouseEvent<SVGSVGElement, globalThis.MouseEvent>) => {
        var rawTargetId: string | undefined = (over.target as HTMLElement).id;
         console.log(rawTargetId)
        
        if (rawTargetId === undefined) {
            props.setHoveredElement(undefined);

            return
        }
        
        var parsedId: string = rawTargetId.split("-")[0]
        var element: Visual | undefined = getMouseElementFromID(parsedId)
        
       
        props.setHoveredElement(element);
    }

    return (
        <>
        <svg key={"hitbox"}
          style={{position: "absolute", left: 0, top: 0,
            
            width: ENGINE.handler.diagram.width,
            height: ENGINE.handler.diagram.height,
            marginBottom: "auto", marginTop: "auto"
          }} onMouseMove={(o) => {mouseOver(o)}}
          dangerouslySetInnerHTML={{__html: hitboxLayer?.svg()!}}
        />
        </>
    )
}