import { Button, Section, Popover, Menu, MenuItem, IconName, NonIdealState, NonIdealStateIconSize, Tooltip } from "@blueprintjs/core";
import { useFormContext, useWatch } from "react-hook-form";
import { defaultLabel, defaultText, defaultLine } from "../../logic/default/index";
import { IText } from "../../logic/text";
import { ILine } from "../../logic/line";
import React, { useState } from "react";
import LabelForm from "./LabelForm";
import TextForm from "./TextForm";
import ArrowForm from "./ArrowForm";
import { FormRequirements } from "./FormBase";
import { Position } from "../../logic/text";
import { RoleChildrenFormData } from "./RoleChildrenForm";
import sectionStyles from "./styles/FormSection.module.scss";

interface ILabelMapProps extends FormRequirements { }

const POSITIONS: Position[] = ["top", "bottom", "left", "right", "centre"];

const posToRole = (pos: Position) => `label${pos.charAt(0).toUpperCase() + pos.slice(1)}`;

function LabelListForm(props: ILabelMapProps) {
	const parentFormControls = useFormContext<RoleChildrenFormData>();

	// Watch the roles object to trigger re-renders
	const roles = useWatch({
		control: parentFormControls.control,
		name: "roles"
	});

	const [activePos, setActivePos] = useState<Position | null>(null);

	const addLabel = (pos: Position, type: "label" | "text" | "line") => {
		let defaultValue;
		if (type === "text") defaultValue = structuredClone(defaultText);
		else if (type === "line") defaultValue = structuredClone(defaultLine);
		else defaultValue = structuredClone(defaultLabel);

		parentFormControls.setValue(`roles.${posToRole(pos)}`, defaultValue, { shouldDirty: true });
		setActivePos(pos);
	};

	const removeLabel = (pos: Position) => {
		parentFormControls.setValue(`roles.${posToRole(pos)}`, undefined as any, { shouldDirty: true });
		parentFormControls.unregister(`roles.${posToRole(pos)}`);
		if (activePos === pos) {
			setActivePos(null);
		}
	};

	const renderGridPosition = (pos: Position) => {
		const roleName = posToRole(pos);
		const labelObj = roles?.[roleName];
		const hasLabel = labelObj !== undefined && labelObj !== null;

		if (hasLabel) {
			let iconName: IconName = "tag";
			if (labelObj.type === "text") iconName = "font";
			else if (labelObj.type === "line") iconName = "minus";

			return (
				<Tooltip content={`Edit ${pos} annotation`} placement="top">
					<Button
						icon={iconName}
						intent={activePos === pos ? "primary" : "none"}
						active={activePos === pos}
						onClick={(e) => {
							e.stopPropagation();
							setActivePos(activePos === pos ? null : pos);
						}}
					/>
				</Tooltip>
			);
		} else {
			const addMenu = (
				<Menu >
					<MenuItem icon="font" text="Add Text" onClick={() => addLabel(pos, "text")} />
					<MenuItem icon="minus" text="Add Line" onClick={() => addLabel(pos, "line")} />
					<MenuItem icon="tag" text="Add Label" onClick={() => addLabel(pos, "label")} />
				</Menu>
			);

			return (
				<Popover content={addMenu} placement="bottom" minimal={true}>
					<Tooltip content={`Add annotation to ${pos}`} placement="top">
						<Button icon="plus" intent="none" variant="minimal" />
					</Tooltip>
				</Popover>
			);
		}
	};

	const gridStyle: React.CSSProperties = {
		display: "grid",
		gridTemplateColumns: "4px 80% 4px",
		gridTemplateRows: "4px 64px 4px",
		gap: "8px",
		justifyContent: "center",
		alignItems: "center",
		margin: "12px 0",
		position: "relative"
	};

	const posToGridArea: Record<Position, string> = {
		top: "1 / 2",
		left: "2 / 1",
		centre: "2 / 2",
		right: "2 / 3",
		bottom: "3 / 2"
	};

	return (
		<>
			<div
				style={{
					marginTop: "4px",
					display: "flex", height: "100%",
					flexDirection: "column",
					alignItems: "stretch"
				}}>

				<div style={gridStyle}>
					<svg style={{ gridArea: "2 / 2", width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
						<rect width="100%" height="100%" rx="4" fill="rgba(125, 125, 125, 0.1)" stroke="currentColor" strokeWidth="2" opacity={0.5} strokeDasharray="4 4" />
					</svg>
					{POSITIONS.map(pos => (
						<div key={pos} style={{ gridArea: posToGridArea[pos], display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1 }}>
							{renderGridPosition(pos)}
						</div>
					))}
				</div>

				{activePos && roles?.[posToRole(activePos)] ? (
					<Section
						title={roles[posToRole(activePos)]?.type}
						subtitle={`Location: ${activePos.charAt(0).toUpperCase() + activePos.slice(1)}`}
						className={sectionStyles.minimalSection}
						style={{ padding: "0px", marginTop: "12px", flexGrow: 1, display: "flex", flexDirection: "column" }}
						compact={true}
						icon="edit"
						rightElement={
							<Button
								icon="trash"
								intent="danger"
								variant="minimal"
								onClick={(e) => {
									e.stopPropagation();
									removeLabel(activePos);
								}}
							/>
						}
					>
						<div style={{ padding: "0px 4px", flexGrow: 1, overflowY: "auto" }}>
							{roles[posToRole(activePos)]?.type === "text" && <TextForm prefix={`roles.${posToRole(activePos)}`} />}
							{roles[posToRole(activePos)]?.type === "line" && <ArrowForm prefix={`roles.${posToRole(activePos)}`} />}
							{roles[posToRole(activePos)]?.type === "label" && <LabelForm prefix={`roles.${posToRole(activePos)}`} />}
						</div>
					</Section>
				) : (
					<div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "12px" }}>
						<NonIdealState iconSize={NonIdealStateIconSize.SMALL}
							icon="select"

							description="Create or select a piece of annotation"
							layout="vertical"
						/>
					</div>
				)}
			</div>
		</>
	);
}

export default LabelListForm;
