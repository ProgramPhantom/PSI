import { UserComponentType } from "../logic/diagramHandler";
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

import Arrow from "../logic/arrow";
import Channel from "../logic/channel";
import Diagram from "../logic/diagram";
import Label from "../logic/label";
import LabelGroup from "../logic/labelGroup";
import { Line } from "../logic/line";
import RectElement from "../logic/rectElement";
import Sequence from "../logic/sequence";
import Space from "../logic/space";
import Text from "../logic/text";
import SVGElement from "../logic/svgElement";
import Point from "../logic/point";
import { Visual } from "../logic/visual";

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