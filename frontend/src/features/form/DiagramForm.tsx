import {
	Button,
	ButtonGroup,
	ControlGroup,
	EditableText,
	FormGroup,
	Icon,
	InputGroup,
	NumericInput,
	Section,
	Tag,
	Tooltip
} from "@blueprintjs/core";
import React, { useSyncExternalStore } from "react";
import ENGINE from "../../logic/engine";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
	selectCurrentAuthor,
	selectCurrentDiagramSource,
	selectCurrentFileName,
	selectCurrentInstitution
} from "../../redux/selectors/diagramSelectors";
import { setAuthor, setFileName, setInstitution } from "../../redux/slices/diagramSlice";
import { setPNGDialogOpen } from "../../redux/slices/dialogSlice";
import * as Actions from "../../redux/thunks/actionThunks";
import { DoubleField } from "./fields/DoubleField";
import { QuadField } from "./fields/QuadField";
import fieldStyles from "./styles/FormFields.module.scss";
import styles from "./styles/FormContainers.module.scss";
import sectionStyles from "./styles/FormSection.module.scss";

export const DiagramForm: React.FC = () => {
	const dispatch = useAppDispatch();

	// Redux state
	const fileName = useAppSelector(selectCurrentFileName);
	const author = useAppSelector(selectCurrentAuthor);
	const institution = useAppSelector(selectCurrentInstitution);
	const { diagramUUID, saveState, loadStatus } = useAppSelector((state) => state.diagram);
	const diagramSource = useAppSelector(selectCurrentDiagramSource);

	// Engine state synchronization
	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);

	const diagram = ENGINE.handler.diagram;
	const padding = diagram?.padding ?? [0, 0, 0, 0];

	const handlePaddingChange = (index: number, val: number) => {
		if (!diagram) return;
		const nextPadding: [number, number, number, number] = [
			padding[0] ?? 0,
			padding[1] ?? 0,
			padding[2] ?? 0,
			padding[3] ?? 0
		];
		nextPadding[index] = Math.max(0, val || 0);

		ENGINE.handler.act({
			type: "modify",
			input: {
				child: {
					...diagram.state,
					padding: nextPadding
				},
				target: diagram
			}
		});
	};

	return (
		<div className="custom-scrollbar" style={{ flex: "1 1 0", minHeight: 0, overflowY: "auto" }}>
			{/* File & Author Identity */}
			<ControlGroup vertical={true} className={styles.formGroupContainer} style={{ paddingTop: "8px" }}>
				<FormGroup label="File Name" labelFor="diagram-file-name">
					<InputGroup
						id="diagram-file-name"
						placeholder="Diagram Name..."
						value={fileName}
						onChange={(e) => dispatch(setFileName(e.target.value))}
						onBlur={(e) => {
							if (e.target.value.trim() === "") {
								dispatch(setFileName("untitled"));
							}
						}}
						size="small"
						rightElement={
							saveState !== "saved" ? (
								<span style={{ paddingRight: "8px", lineHeight: "24px", color: "#d9822b", fontWeight: "bold" }}>*</span>
							) : undefined
						}
					/>
				</FormGroup>

				<DoubleField
					leftLabel="Author"
					leftField={
						<InputGroup
							id="diagram-author"
							placeholder="Author..."
							value={author}
							onChange={(e) => dispatch(setAuthor(e.target.value))}
							size="small"
						/>
					}
					rightLabel="Institution"
					rightField={
						<InputGroup
							id="diagram-institution"
							placeholder="Institution..."
							value={institution}
							onChange={(e) => dispatch(setInstitution(e.target.value))}
							size="small"
						/>
					}
				/>
			</ControlGroup>

			{/* Padding Form (copied structure from VisualForm) */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{
					defaultIsOpen: true,
					transitionDuration: 0
				}}
				compact={true}
				title="Padding"
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<QuadField
						label1="Top"
						field1={
							<NumericInput
								id="diagram-padding-top"
								className={fieldStyles.compactNumericInput}
								value={padding[0] ?? 0}
								onValueChange={(val) => handlePaddingChange(0, val)}
								size="small"
								fill
								min={0}
								allowNumericCharactersOnly={true}
							/>
						}
						label2="Right"
						field2={
							<NumericInput
								id="diagram-padding-right"
								className={fieldStyles.compactNumericInput}
								value={padding[1] ?? 0}
								onValueChange={(val) => handlePaddingChange(1, val)}
								size="small"
								fill
								min={0}
								allowNumericCharactersOnly={true}
							/>
						}
						label3="Bottom"
						field3={
							<NumericInput
								id="diagram-padding-bottom"
								className={fieldStyles.compactNumericInput}
								value={padding[2] ?? 0}
								onValueChange={(val) => handlePaddingChange(2, val)}
								size="small"
								fill
								min={0}
								allowNumericCharactersOnly={true}
							/>
						}
						label4="Left"
						field4={
							<NumericInput
								id="diagram-padding-left"
								className={fieldStyles.compactNumericInput}
								value={padding[3] ?? 0}
								onValueChange={(val) => handlePaddingChange(3, val)}
								size="small"
								fill
								min={0}
								allowNumericCharactersOnly={true}
							/>
						}
					/>
				</ControlGroup>
			</Section>

			{/* Quick Export Strip */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{
					defaultIsOpen: true,
					transitionDuration: 0
				}}
				compact={true}
				title="Export"
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<FormGroup style={{ padding: "8px 0px 0 0" }}>
						<ButtonGroup fill size="small" variant="outlined">
							<Button
								icon="document-share"
								text=".nmrd"
								title="Export .nmrd diagram file"
								onClick={() => dispatch(Actions.handleExportDiagramFile())}
							/>
							<Button
								icon="flow-linear"
								text="SVG"
								title="Export SVG image"
								onClick={() => dispatch(Actions.handleSaveSVG())}
							/>
							<Button
								icon="media"
								text="PNG"
								title="Export PNG image"
								onClick={() => dispatch(setPNGDialogOpen(true))}
							/>
						</ButtonGroup>
					</FormGroup>
				</ControlGroup>
			</Section>

			{/* Statistics & Metadata */}
			<Section
				className={sectionStyles.minimalSection}
				collapseProps={{
					defaultIsOpen: true,
					transitionDuration: 0
				}}
				compact={true}
				title="Statistics"
				collapsible={true}>
				<ControlGroup vertical={true} className={styles.formGroupContainer}>
					<div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", padding: "4px 0" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ color: "#5c7080" }}>UUID:</span>
							<span style={{ fontFamily: "monospace", fontSize: "11px", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
								{diagramUUID ?? "N/A"}
							</span>
						</div>

						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ color: "#5c7080" }}>Save State:</span>
							<Tag intent={saveState === "saved" ? "success" : saveState === "unsaved" ? "warning" : "primary"}>
								{saveState}
							</Tag>
						</div>

						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ color: "#5c7080" }}>Storage Source:</span>
							<Tag icon={diagramSource === "server" ? "cloud" : "floppy-disk"}>
								{diagramSource}
							</Tag>
						</div>

						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ color: "#5c7080" }}>Canvas Size:</span>
							<span>{diagram ? `${Math.round(diagram.width)} × ${Math.round(diagram.height)} px` : "0 × 0 px"}</span>
						</div>

						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ color: "#5c7080" }}>Channels Count:</span>
							<span>{diagram?.channels?.length ?? 0}</span>
						</div>

						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ color: "#5c7080" }}>Sequences Count:</span>
							<span>{diagram?.sequences?.length ?? 0}</span>
						</div>

						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
							<span style={{ color: "#5c7080" }}>Total Elements:</span>
							<span>{Object.entries(diagram?.allElements).length ?? 0}</span>
						</div>
					</div>
				</ControlGroup>
			</Section>
		</div>
	);
};

export default DiagramForm;
