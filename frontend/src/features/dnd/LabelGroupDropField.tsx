import React from "react";
import { useDrop } from "react-dnd";
import ENGINE from "../../logic/engine";
import Visual from "../../logic/visual";
import LabelGroup from "../../logic/hasComponents/labelGroup";
import { DragElementTypes } from "./CanvasDropContainer";
import LabelGroupDropArea, { ILabelGroupAreaSpec } from "./LabelGroupDropArea";

interface ILabelGroupDropFieldProps {
	pulse: Visual;
}

const isTextOrLabel = (element: any): boolean => {
	if (!element) return false;
	const type = element.type;
	return type === "latex" || type === "text" || type === "label";
};

export default function LabelGroupDropField({ pulse }: ILabelGroupDropFieldProps) {
	const [{ canDrop, isOver }, parentDropRef] = useDrop(() => ({
		accept: [DragElementTypes.ATOMIC_PREFAB, DragElementTypes.FREE],
		canDrop: (item: any) => {
			return isTextOrLabel(item?.element);
		},
		collect: (monitor) => ({
			isOver: monitor.isOver({ shallow: false }),
			canDrop: monitor.canDrop()
		})
	}), [pulse]);

	if (!canDrop) return null;

	// Resolve the target element (the pulse itself, or its parent LabelGroup if it is already wrapped)
	let targetElement: Visual = pulse;
	const parentElement = pulse.parentId ? ENGINE.handler.identifyElement(pulse.parentId) : undefined;
	if (parentElement && LabelGroup.isLabelGroup(parentElement)) {
		targetElement = parentElement;
	}

	const isRoleOccupied = (role: string): boolean => {
		if (LabelGroup.isLabelGroup(targetElement)) {
			const roleConfig = (targetElement.roles as any)[role];
			if (roleConfig) {
				return roleConfig.object !== undefined;
			}
			// If target is a simple-label-group, it does not support left/right/centre.
			// So we treat them as occupied/disabled.
			if (targetElement.type === "simple-label-group") {
				return true;
			}
		}
		return false;
	};

	const W = pulse.width;
	const H = pulse.height;
	const T = Math.min(8, H * 0.25, W * 0.25); // Thickness of side zones
	const CS = Math.min(16, Math.min(W, H) * 0.4); // Center size

	const areas: ILabelGroupAreaSpec[] = [
		{
			pulseId: pulse.id,
			role: "labelTop",
			style: { top: 0, left: 0, width: W, height: T }
		},
		{
			pulseId: pulse.id,
			role: "labelBottom",
			style: { top: H - T, left: 0, width: W, height: T }
		},
		{
			pulseId: pulse.id,
			role: "labelLeft",
			style: { top: T, left: 0, width: T, height: H - 2 * T }
		},
		{
			pulseId: pulse.id,
			role: "labelRight",
			style: { top: T, left: W - T, width: T, height: H - 2 * T }
		},
		{
			pulseId: pulse.id,
			role: "labelCentre",
			style: { top: (H - CS) / 2, left: (W - CS) / 2, width: CS, height: CS }
		}
	];

	// Filter out drop areas whose roles are already occupied
	const activeAreas = areas.filter(area => !isRoleOccupied(area.role));

	const fieldStyle: React.CSSProperties = {
		position: "absolute",
		left: pulse.drawX,
		top: pulse.drawY,
		width: W,
		height: H,
		pointerEvents: "auto",
		zIndex: isOver ? 30000 : 20000,
	};

	return (
		<div ref={parentDropRef} style={fieldStyle}>
			{isOver && activeAreas.map((area) => (
				<LabelGroupDropArea key={area.role} areaSpec={area} />
			))}
		</div>
	);
}
