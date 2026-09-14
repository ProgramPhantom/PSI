import { Icon } from "@blueprintjs/core";
import { CSSProperties, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { ID } from "../../logic/point";
import { DragElementTypes } from "./CanvasDropContainer";
import { Orientation } from "../../logic/spacial";
import styles from "./styles/PulseInsertArea.module.scss";


export interface IPulseArea {
	area: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	channelID: ID;
	sequenceID: ID;
	index: number;
	orientation: Orientation;
	insert: boolean;
}

interface IPulseDataAreaResult {
	index: number;
	channelID: ID;
	sequenceID: ID;
	orientation: Orientation;
	insert: boolean;
}
export type PulseDropResultType = { type: "pulse", data: IPulseDataAreaResult }


function PulseInsertArea(props: { areaSpec: IPulseArea; key: string }) {
	const [{ canDrop, isOver }, drop] = useDrop(() => ({
		accept: [DragElementTypes.PULSE, DragElementTypes.ATOMIC_PREFAB, DragElementTypes.FREE],
		drop: () =>
			({
				data: {
					index: props.areaSpec.index,
					channelID: props.areaSpec.channelID,
					sequenceID: props.areaSpec.sequenceID,
					insert: props.areaSpec.insert,
					orientation: props.areaSpec.orientation,
				},
				type: "pulse"
			}) as PulseDropResultType,
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			isOverCurrent: monitor.isOver({ shallow: false }),
			canDrop: monitor.canDrop()
		})
	}));

	const [isDropActive, setIsDropActive] = useState(false);

	useEffect(() => {
		if (canDrop) {
			const timer = setTimeout(() => {
				setIsDropActive(true);
			}, 50);
			return () => clearTimeout(timer);
		} else {
			setIsDropActive(false);
		}
	}, [canDrop]);

	const isActive = canDrop && isOver;

	const GAP = 2; // 2px inset on all sides creates a 4px gap between adjacent insert areas
	const areaX = props.areaSpec.area.x + GAP;
	const areaY = props.areaSpec.area.y + GAP;
	const areaWidth = Math.max(0, props.areaSpec.area.width - GAP * 2);
	const areaHeight = Math.max(0, props.areaSpec.area.height - GAP * 2);

	const badgeSize = Math.min(22, Math.max(14, Math.min(areaHeight, areaWidth) - 6));
	const iconSize = Math.max(10, Math.min(13, badgeSize - 6));

	const style: CSSProperties = {
		height: `${areaHeight}px`,
		width: `${areaWidth}px`,
		position: "absolute",
		top: `${areaY}px`,
		left: `${areaX}px`,
		visibility: canDrop ? "visible" : "hidden",
		zIndex: isDropActive ? (isActive ? 60000 : 55000) : 200,
		pointerEvents: isDropActive ? "auto" : "none"
	};

	return (
		<div
			ref={drop}
			className={`${styles.pulseInsertArea} ${isActive ? styles.active : ""}`}
			style={style}
			data-testid={props.areaSpec.channelID + props.areaSpec.index}
			key={props.key}>
			<div
				className={styles.badge}
				style={{
					width: `${badgeSize}px`,
					height: `${badgeSize}px`
				}}
			>
				+
			</div>
		</div>
	);
}

export default PulseInsertArea;
