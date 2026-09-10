import { Divider, Tab, Tabs } from "@blueprintjs/core";
import React, { useState } from "react";
import { useDrop, useDragLayer } from "react-dnd";
import { isPulse } from "../../logic/spacial";
import Visual from "../../logic/visual";
import { DragElementTypes, SchemeDropResultType } from "../dnd/CanvasDropContainer";
import TemplateDraggableElement from "../dnd/TemplateDraggableElement";
import styles from "./styles/SchemeTabPanel.module.scss";
import { IPulseData } from "../../logic/pulseData";

interface SchemeTabPanelProps {
	schemeId: string;
	schemeName: string;
	schemeSingletons: Record<string, Visual>;
	setIsNewElementDialogOpen: (open: boolean) => void;
	handleElementDoubleClick: (element: Visual) => void;
}

export const getPulseDataForFilter = (filter: string): IPulseData | undefined => {
	switch (filter) {
		case "Hard":
			return { pulseType: { category: "shape", type: "Hard" } };
		case "Soft":
			return { pulseType: { category: "shape", type: "Soft" } };
		case "Composite":
			return { pulseType: { category: "shape", type: "Composite" } };
		case "Adiabatic":
			return { pulseType: { category: "shape", type: "Adiabatic" } };
		case "PFGs":
			return { pulseType: { category: "PFG" } };
		default:
			return undefined;
	}
};

const filterElement = (element: Visual, filter: string) => {
	if (filter === "All") return true;
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

	const { isAnyDragging } = useDragLayer((monitor) => ({
		isAnyDragging: monitor.isDragging()
	}));

	const [{ isOver }, dropRef] = useDrop(() => ({
		accept: [DragElementTypes.PULSE, DragElementTypes.FREE, DragElementTypes.OTHER],
		drop: () =>
			({
				type: "scheme",
				data: {
					schemeId,
					filter,
					pulseData: getPulseDataForFilter(filter)
				}
			}) as SchemeDropResultType,
		collect: (monitor) => ({
			isOver: monitor.isOver()
		})
	}), [schemeId, filter]);

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
						<Tab id="All" title={<span onMouseEnter={() => { if (isAnyDragging && filter !== "All") setFilter("All"); }}>All</span>} />
						<Tab id="Hard" title={<span onMouseEnter={() => { if (isAnyDragging && filter !== "Hard") setFilter("Hard"); }}>Hard</span>} />
						<Tab id="Soft" title={<span onMouseEnter={() => { if (isAnyDragging && filter !== "Soft") setFilter("Soft"); }}>Soft</span>} />
						<Tab id="Composite" title={<span onMouseEnter={() => { if (isAnyDragging && filter !== "Composite") setFilter("Composite"); }}>Composite</span>} />
						<Tab id="Adiabatic" title={<span onMouseEnter={() => { if (isAnyDragging && filter !== "Adiabatic") setFilter("Adiabatic"); }}>Adiabatic</span>} />
						<Tab id="PFGs" title={<span onMouseEnter={() => { if (isAnyDragging && filter !== "PFGs") setFilter("PFGs"); }}>PFGs</span>} />
						<Tab id="Annotation" title={<span onMouseEnter={() => { if (isAnyDragging && filter !== "Annotation") setFilter("Annotation"); }}>Annotation</span>} />
					</Tabs>
				</div>

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
			</div>
		</div>
	);
};

export default SchemeTabPanel;

