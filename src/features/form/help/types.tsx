
import { IRectElement } from "../../../logic/rectElement";
import { ISVGElement } from "../../../logic/svgElement";
import { IVisual } from "../../../logic/visual";
import PlacementModeHelp from "./visual/PlacementModeHelp";
import RefHelp from "./visual/RefHelp";


type VisualHelpTypes = keyof IVisual
type RectHelpTypes = keyof IRectElement
type SVGHelpTypes = keyof ISVGElement

export function GetHelpDialog(type: AllHelpTypes, isOpen: boolean, onClose: () => void) {
    switch (type) {
        case "ref":
            return <RefHelp isOpen={isOpen} onClose={onClose} />;
        case "placementMode":
            return <PlacementModeHelp isOpen={isOpen} onClose={onClose} />;
        default:
            return null;
    }
}

export type AllHelpTypes = VisualHelpTypes | RectHelpTypes | SVGHelpTypes;