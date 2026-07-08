import { Colors } from "@blueprintjs/core";
import React from "react";
import { useDrop } from "react-dnd";
import { DragElementTypes } from "./CanvasDropContainer";
import { ID } from "../../logic/point";

export interface ILabelGroupAreaSpec {
	pulseId: ID;
	role: string;
	style: React.CSSProperties;
}

export type LabelGroupDropResultType = {
	type: "labelGroup";
	data: {
		pulseId: ID;
		role: string;
	};
};

const isTextOrLabel = (element: any): boolean => {
	if (!element) return false;
	const type = element.type;
	return type === "latex" || type === "text" || type === "label";
};

interface ILabelGroupDropAreaProps {
	areaSpec: ILabelGroupAreaSpec;
}

export default function LabelGroupDropArea({ areaSpec }: ILabelGroupDropAreaProps) {
	const [{ canDrop, isOver }, dropRef] = useDrop(() => ({
		accept: [DragElementTypes.ATOMIC_PREFAB, DragElementTypes.FREE],
		canDrop: (item: any) => {
			return isTextOrLabel(item?.element);
		},
		drop: () => ({
			type: "labelGroup",
			data: {
				pulseId: areaSpec.pulseId,
				role: areaSpec.role
			}
		}) as LabelGroupDropResultType,
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop()
		})
	}), [areaSpec]);

	if (!canDrop) return null;

	const isActive = canDrop && isOver;

	const style: React.CSSProperties = {
		position: "absolute",
		backgroundColor: isActive ? `${Colors.BLUE5}` : "rgba(0, 120, 212, 0.08)",
		border: isActive ? `2px solid ${Colors.BLUE3}` : `1px solid ${Colors.BLUE5}`,
		transition: "all 0.05s ease-in-out",
		cursor: "copy",
		pointerEvents: "auto",
		zIndex: isActive ? 30000 : 25000,
		...areaSpec.style
	};

	return (
		<div
			ref={dropRef}
			style={style}
			title={`Drop to add label at ${areaSpec.role}`}
		/>
	);
}
