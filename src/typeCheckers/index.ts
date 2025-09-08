import { UserComponentType } from "../vanilla/diagramHandler";
import * as t from "ts-interface-checker";
import arrowTypeSuite from "./arrow-ti";
import channelTypeSuite from "./channel-ti";
import diagramTypeSuite from "./diagram-ti";
import labelTypeSuite from "./label-ti";
import lineTypeSuite from "./line-ti";
import rectElementTypeSuite from "./rectElement-ti";
import sequenceTypeSuite from "./sequence-ti";
import spaceTypeSuite from "./spacial-ti";
import svgElementTypeSuite from "./SVGElement-ti";
import textTypeSuite from "./text-ti";

import Arrow from "../vanilla/arrow";
import Channel from "../vanilla/channel";
import Diagram from "../vanilla/diagram";
import Label from "../vanilla/label";
import LabelGroup from "../vanilla/labelGroup";
import { Line } from "../vanilla/line";
import RectElement from "../vanilla/rectElement";
import Sequence from "../vanilla/sequence";
import Space from "../vanilla/space";
import Text from "../vanilla/text";
import SVGElement from "../vanilla/svgElement";
import Point from "../vanilla/point";
import { Visual } from "../vanilla/visual";

export const CheckerTypeIndex: Record<UserComponentType, {suite: t.ITypeSuite, type: t.TType}> = {
    "arrow": {suite: arrowTypeSuite, type: arrowTypeSuite.IArrow},
    "channel": {suite: channelTypeSuite, type: channelTypeSuite.IChannel},
    "diagram": {suite: diagramTypeSuite, type: diagramTypeSuite.IDiagram},
    "label": {suite: labelTypeSuite, type: labelTypeSuite.ILabel},
    "label-group": {suite:  labelTypeSuite, type: labelTypeSuite.ILabelGroup},
    "line": {suite: lineTypeSuite, type: lineTypeSuite.ILine},
    "rect": {suite: rectElementTypeSuite, type: rectElementTypeSuite.IRect},
    "sequence": {suite: sequenceTypeSuite, type: sequenceTypeSuite.ISequence},
    "space": {suite: spaceTypeSuite, type: spaceTypeSuite.ISpace},
    "svg": {suite: svgElementTypeSuite, type: svgElementTypeSuite.ISVGElement},
    "text": {suite: textTypeSuite, type: textTypeSuite.IRectElement},
}


// Brain-warping circular imports are stopping this nice solution from working.


// export const TypeConstructorRegistry: Partial<Record<UserComponentType, new (...args: any[]) => Visual>> = {
//     "arrow": Arrow,
// 
// }
// 
// export function createElementOfType<T extends UserComponentType>(
//   type: T,
//   data: ConstructorParameters<typeof TypeConstructorRegistry[T]>[0]
// ): InstanceType<typeof TypeConstructorRegistry[T]> {
//   const Ctor = TypeConstructorRegistry[type];
//   return new Ctor(data) as InstanceType<typeof Ctor>;
// }


   // "channel": Channel,
   // "diagram": Diagram,
   // "label": Label,
   // "label-group": LabelGroup,
   // "line": Line,
   // "rect": RectElement,
   // "sequence": Sequence,
   // "space": Space,
   // "svg": SVGElement,
   // "text": Text