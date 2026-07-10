import { Divider, Tab, Tabs } from "@blueprintjs/core";
import React, { useState } from "react";
import { isPulse } from "../../logic/spacial";
import Visual from "../../logic/visual";
import { InternalSchemeId } from "../../redux/slices/schemesSlice";
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

	return (
		<div className={styles.tabPanelRow}>
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
						{/* Plus button for adding new elements */}
						{schemeName !== InternalSchemeId ? (
							<div
								className={styles.addNewCard}
								onClick={() => setIsNewElementDialogOpen(true)}
								title="Add new template element"
							>
								<div style={{ fontSize: "32px", color: "#5c7080", marginBottom: "8px" }}>
									+
								</div>
								<span style={{ fontSize: "12px", color: "#5c7080", fontWeight: "600", textAlign: "center", lineHeight: "1.4" }}>
									Add New
								</span>
							</div>
						) : (
							<></>
						)}

						{Object.entries(schemeSingletons)
							.filter(([id, com]) => filterElement(com, filter))
							.map(([template_id, visual]) => {
								return (
									<TemplateDraggableElement
										key={template_id}
										element={visual}
										onDoubleClick={handleElementDoubleClick}
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

