import { Divider, Tab, Tabs } from "@blueprintjs/core";
import React, { useState } from "react";
import { useDrop } from "react-dnd";
import { isPulse } from "../../logic/spacial";
import Visual from "../../logic/visual";
import { DragElementTypes, SchemeDropResultType } from "../dnd/CanvasDropContainer";
import TemplateDraggableElement from "../dnd/TemplateDraggableElement";
import DiagramElementList from "./DiagramElementList";
import Diagram from "../../logic/hasComponents/diagram";
import styles from "./styles/SchemeTabPanel.module.scss";

interface SchemeTabPanelProps {
	schemeId: string;
	schemeName: string;
	schemeSingletons: Record<string, Visual>;
	setIsNewElementDialogOpen: (open: boolean) => void;
	handleElementDoubleClick: (element: Visual) => void;
}

const filterElement = (element: Visual, filter: string) => {
	if (filter === "All") return element.type !== "diagram";
	if (filter === "diagrams") return element.type === "diagram";
	if (filter === "Hard") {
		return isPulse(element) && element.pulseData?.pulseType?.category === "shape" && element.pulseData.pulseType.type === "Hard";
	}
	if (filter === "Soft") {
		return isPulse(element) && element.pulseData?.pulseType?.category === "shape" && element.pulseData.pulseType.type === "Soft";
	}
	if (filter === "Composite") {
		return isPulse(element) && element.pulseData?.pulseType?.category === "shape" && element.pulseData.pulseType.type === "Composite";
	}
	if (filter === "Adiabatic") {
		return isPulse(element) && element.pulseData?.pulseType?.category === "shape" && element.pulseData.pulseType.type === "Adiabatic";
	}
	if (filter === "PFGs") {
		return isPulse(element) && element.pulseData?.pulseType?.category === "PFG";
	}
	if (filter === "Annotation") return element.type === "label" || element.type === "text" || element.type === "latex";
	return true;
};

export const SchemeTabPanel: React.FC<SchemeTabPanelProps> = ({
	schemeId,
	schemeName,
	schemeSingletons,
	setIsNewElementDialogOpen,
	handleElementDoubleClick,
}) => {
	const [filter, setFilter] = useState<string>("All");

	const [{ isOver }, dropRef] = useDrop(() => ({
		accept: [DragElementTypes.PULSE, DragElementTypes.FREE, DragElementTypes.OTHER],
		drop: () =>
			({
				type: "scheme",
				data: {
					schemeId
				}
			}) as SchemeDropResultType,
		collect: (monitor) => ({
			isOver: monitor.isOver()
		})
	}), [schemeId]);

	return (
		<div
			ref={dropRef}
			className={`${styles.tabPanelRow} ${isOver ? styles.dropTargetActive : ""}`}
		>
			<Divider />
			<div className={styles.tabPanelColumn}>
				{/* Filter Tabs */}
				<div className={styles.filterTabsWrapper}>
					<Tabs
						id="filter-tabs"
						onChange={(newFilter) => setFilter(newFilter as string)}
						selectedTabId={filter}
						renderActiveTabPanelOnly={false}
					>
						<Tab id="All" title="All" />
						<Tab id="Hard" title="Hard" />
						<Tab id="Soft" title="Soft" />
						<Tab id="Composite" title="Composite" />
						<Tab id="Adiabatic" title="Adiabatic" />
						<Tab id="PFGs" title="PFGs" />
						<Tab id="Annotation" title="Annotation" />
						<Tab id="diagrams" title="Diagrams" style={{ marginLeft: "auto" }} />
					</Tabs>
				</div>

				{filter === "diagrams" ? (
					<DiagramElementList
						diagramElements={Object.entries(schemeSingletons)
							.filter(([id, com]) => filterElement(com, filter))
							.map(([id, com]) => com as Diagram)}
					/>
				) : (
					<div className={`${styles.elementGrid} custom-scrollbar`}>


						{Object.entries(schemeSingletons)
							.filter(([id, com]) => filterElement(com, filter))
							.map(([template_id, visual]) => {
								return (
									<TemplateDraggableElement
										key={template_id}
										element={visual}
										schemeId={schemeId}
										templateId={template_id}
									/>
								);
							})}
					</div>
				)}
			</div>
		</div>
	);
};

export default SchemeTabPanel;

