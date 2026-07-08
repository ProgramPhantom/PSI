import { Button, IconName, Menu, MenuItem, NonIdealState, NonIdealStateIconSize, Popover, Section, Tooltip } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { defaultLabel, defaultLine, defaultText, defaultLaTeX } from "../../logic/default/index";
import { Position } from "../../logic/textBase";
import ArrowForm from "./ArrowForm";
import { FormRequirements } from "./FormBase";
import LabelForm from "./LabelForm";
import LaTeXForm from "./LaTeXForm";
import { RoleChildrenFormData } from "./RoleChildrenForm";
import sectionStyles from "./styles/FormSection.module.scss";
import styles from "./styles/LabelListForm.module.scss";
import TextForm from "./TextForm";

interface ILabelMapProps extends FormRequirements { }

const POSITIONS: Position[] = ["top", "bottom", "left", "right", "centre"];

const posToRole = (pos: Position) => `label${pos.charAt(0).toUpperCase() + pos.slice(1)}`;

function LabelListForm(props: ILabelMapProps) {
	const parentFormControls = useFormContext<RoleChildrenFormData>();

	// Watch only the type of each annotation position to prevent unnecessary re-renders when internal details change
	const labelTopType = useWatch({ control: parentFormControls.control, name: "roles.labelTop.type" });
	const labelBottomType = useWatch({ control: parentFormControls.control, name: "roles.labelBottom.type" });
	const labelLeftType = useWatch({ control: parentFormControls.control, name: "roles.labelLeft.type" });
	const labelRightType = useWatch({ control: parentFormControls.control, name: "roles.labelRight.type" });
	const labelCentreType = useWatch({ control: parentFormControls.control, name: "roles.labelCentre.type" });

	const roles: Record<string, { type: string } | null | undefined> = {
		labelTop: labelTopType ? { type: labelTopType } : undefined,
		labelBottom: labelBottomType ? { type: labelBottomType } : undefined,
		labelLeft: labelLeftType ? { type: labelLeftType } : undefined,
		labelRight: labelRightType ? { type: labelRightType } : undefined,
		labelCentre: labelCentreType ? { type: labelCentreType } : undefined,
	};

	const [activePos, setActivePos] = useState<Position | null>(null);

	// Reset activePos when target changes
	useEffect(() => {
		setActivePos(null);
	}, [props.target]);

	const addLabel = (pos: Position, type: "label" | "text" | "line" | "latex") => {
		let defaultValue;
		if (type === "text") defaultValue = structuredClone(defaultText);
		else if (type === "line") defaultValue = structuredClone(defaultLine);
		else if (type === "latex") defaultValue = structuredClone(defaultLaTeX);
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
			else if (labelObj.type === "latex") iconName = "function";

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
					<MenuItem icon="function" text="Add LaTeX" onClick={() => addLabel(pos, "latex")} />
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

	return (
		<>
			<div className={styles.container}>
				<div className={styles.gridContainer}>
					<svg className={styles.svgBackground}>
						<rect width="100%" height="100%" rx="4" fill="rgba(125, 125, 125, 0.1)" stroke="currentColor" strokeWidth="2" opacity={0.5} strokeDasharray="4 4" />
					</svg>
					{POSITIONS.map(pos => (
						<div key={pos} className={`${styles.gridItem} ${styles[pos]}`}>
							{renderGridPosition(pos)}
						</div>
					))}
				</div>

				{activePos && roles?.[posToRole(activePos)] ? (
					<Section
						title={roles[posToRole(activePos)]?.type}
						subtitle={`Location: ${activePos.charAt(0).toUpperCase() + activePos.slice(1)}`}
						className={sectionStyles.minimalSection}
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
						<div className={styles.scrollContainer} key={activePos}>
							{roles[posToRole(activePos)]?.type === "text" && <TextForm prefix={`roles.${posToRole(activePos)}`} />}
							{roles[posToRole(activePos)]?.type === "line" && <ArrowForm prefix={`roles.${posToRole(activePos)}`} />}
							{roles[posToRole(activePos)]?.type === "label" && <LabelForm prefix={`roles.${posToRole(activePos)}`} />}
							{roles[posToRole(activePos)]?.type === "latex" && <LaTeXForm prefix={`roles.${posToRole(activePos)}`} />}
						</div>
					</Section>
				) : (
					<div className={styles.emptyStateContainer}>
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

