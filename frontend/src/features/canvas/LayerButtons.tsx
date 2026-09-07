import { Button, ButtonGroup, Position, Tooltip } from "@blueprintjs/core";
import React, { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import Visual from "../../logic/visual";
import styles from "./styles/toolbars.module.scss";

interface LayerButtonsProps {
	element: Visual;
}

export const LayerButtons: React.FC<LayerButtonsProps> = React.memo(({ element }) => {
	// Re-render when diagram changes to keep disabled states updated
	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const diagram = ENGINE.handler.diagram;
	const index = diagram.childIndexById(element.id);
	const numChildren = diagram.numChildren;

	const isAtBack = index === undefined || index <= 0;
	const isAtFront = index === undefined || index >= numChildren - 1;

	const handleSendToBack = (e: React.MouseEvent) => {
		e.stopPropagation();
		ENGINE.handler.act({
			type: "reorderChild",
			input: { elementId: element.id, toIndex: 0 }
		});
	};

	const handleSendBack = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (index !== undefined) {
			ENGINE.handler.act({
				type: "reorderChild",
				input: { elementId: element.id, toIndex: Math.max(0, index - 1) }
			});
		}
	};

	const handleSendForwards = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (index !== undefined) {
			ENGINE.handler.act({
				type: "reorderChild",
				input: { elementId: element.id, toIndex: Math.min(numChildren - 1, index + 1) }
			});
		}
	};

	const handleSendToFront = (e: React.MouseEvent) => {
		e.stopPropagation();
		ENGINE.handler.act({
			type: "reorderChild",
			input: { elementId: element.id, toIndex: numChildren - 1 }
		});
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			onMouseDown={(e) => e.stopPropagation()}
			onMouseUp={(e) => e.stopPropagation()}
			className={styles["frosted-toolbar"]}
		>
			<ButtonGroup>
				<Tooltip hoverOpenDelay={500} content="Send to Back" position={Position.TOP}>
					<Button
						icon="double-chevron-down"
						disabled={isAtBack}
						onClick={handleSendToBack}
						variant="minimal"
					/>
				</Tooltip>
				<Tooltip hoverOpenDelay={500} content="Send Back" position={Position.TOP}>
					<Button
						icon="chevron-down"
						disabled={isAtBack}
						onClick={handleSendBack}
						variant="minimal"
					/>
				</Tooltip>
				<Tooltip hoverOpenDelay={500} content="Send Forwards" position={Position.TOP}>
					<Button
						icon="chevron-up"
						disabled={isAtFront}
						onClick={handleSendForwards}
						variant="minimal"
					/>
				</Tooltip>
				<Tooltip hoverOpenDelay={500} content="Send to Front" position={Position.TOP}>
					<Button
						icon="double-chevron-up"
						disabled={isAtFront}
						onClick={handleSendToFront}
						variant="minimal"
					/>
				</Tooltip>
			</ButtonGroup>
		</div>
	);
});
