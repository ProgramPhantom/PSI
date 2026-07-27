import {
	Button,
	ButtonGroup,
	Dialog,
	DialogBody,
	DialogFooter,
	FormGroup,
	Icon,
	InputGroup,
	Tag
} from "@blueprintjs/core";
import { useEffect, useState } from "react";
import ENGINE from "../../logic/engine";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectCurrentFileName } from "../../redux/selectors/diagramSelectors";
import * as Actions from "../../redux/thunks/actionThunks";
import styles from "./PNGExportDialog.module.scss";

interface ISVGExportDialogProps {
	close: () => void;
	isOpen: boolean;
}

type ColumnPreset = "single" | "intermediate" | "double" | "original";
type BackgroundOption = "transparent" | "#ffffff";

// Converts cm to px at standard 96 DPI for SVG rendering (1 cm = 37.795 px)
const CM_TO_PX = 37.795;

export function SVGExportDialog(props: ISVGExportDialogProps) {
	const dispatch = useAppDispatch();
	const currentFileName = useAppSelector(selectCurrentFileName);

	const baseWidth = Math.max(1, Math.round(ENGINE.handler.diagram?.width || 800));
	const baseHeight = Math.max(1, Math.round(ENGINE.handler.diagram?.height || 600));
	const originalRatio = baseWidth / baseHeight;

	const [svgFilename, setSvgFilename] = useState(currentFileName || "pulse-diagram");
	const [preset, setPreset] = useState<ColumnPreset>("original");
	const [bgOption, setBgOption] = useState<BackgroundOption>("transparent");
	const [targetWidth, setTargetWidth] = useState<number>(baseWidth);

	useEffect(() => {
		if (props.isOpen) {
			const initialName = currentFileName && currentFileName !== "unnamed" ? currentFileName : "pulse-diagram";
			setSvgFilename(initialName);
			setPreset("original");
			setBgOption("transparent");
			setTargetWidth(baseWidth);
		}
	}, [props.isOpen, baseWidth, currentFileName]);

	const handlePresetChange = (p: ColumnPreset) => {
		setPreset(p);
		switch (p) {
			case "single":
				setTargetWidth(Math.round(8.5 * CM_TO_PX));
				break;
			case "intermediate":
				setTargetWidth(Math.round(11.5 * CM_TO_PX));
				break;
			case "double":
				setTargetWidth(Math.round(17.5 * CM_TO_PX));
				break;
			case "original":
				setTargetWidth(baseWidth);
				break;
		}
	};

	const handleSaveSVG = () => {
		const targetHeight = Math.round(targetWidth / originalRatio);
		dispatch(
			Actions.handleSaveSVG({
				width: targetWidth,
				height: targetHeight,
				backgroundColor: bgOption,
				fileName: svgFilename
			})
		);
		props.close();
	};

	const targetHeight = Math.round(targetWidth / originalRatio);
	const targetCmWidth = (targetWidth / CM_TO_PX).toFixed(1);
	const targetCmHeight = (targetHeight / CM_TO_PX).toFixed(1);

	return (
		<Dialog
			isOpen={props.isOpen}
			onClose={props.close}
			title="Export SVG Vector Graphic"
			icon="flow-linear"
			style={{ width: "480px" }}>
			<div className={styles.dialogBody}>
				{/* Filename Field */}
				<FormGroup label="Filename" labelFor="svg-filename-input" className={styles.formGroupContainer}>
					<InputGroup
						id="svg-filename-input"
						value={svgFilename}
						onChange={(e) => setSvgFilename(e.target.value)}
						placeholder="Enter export filename..."
						leftIcon="document"
					/>
				</FormGroup>

				{/* Journal Column Width Presets */}
				<div className={styles.formGroupContainer}>
					<div className={styles.sectionHeader}>
						<span>Journal Column Width</span>
						<Tag minimal>{targetCmWidth} cm ({targetWidth} px)</Tag>
					</div>
					<ButtonGroup fill size="small" variant="outlined" className={styles.presetGroup}>
						<Button
							text="Single (8.5 cm)"
							intent={preset === "single" ? "primary" : "none"}
							onClick={() => handlePresetChange("single")}
						/>
						<Button
							text="Mid (11.5 cm)"
							intent={preset === "intermediate" ? "primary" : "none"}
							onClick={() => handlePresetChange("intermediate")}
						/>
						<Button
							text="Double (17.5 cm)"
							intent={preset === "double" ? "primary" : "none"}
							onClick={() => handlePresetChange("double")}
						/>
						<Button
							text="Original"
							intent={preset === "original" ? "primary" : "none"}
							onClick={() => handlePresetChange("original")}
						/>
					</ButtonGroup>
				</div>

				{/* Background Choice */}
				<div className={styles.formGroupContainer}>
					<div className={styles.sectionHeader}>
						<span>Background Option</span>
					</div>
					<ButtonGroup fill size="small" variant="outlined" className={styles.presetGroup}>
						<Button
							icon="blank"
							text="Transparent"
							intent={bgOption === "transparent" ? "primary" : "none"}
							onClick={() => setBgOption("transparent")}
						/>
						<Button
							icon="media"
							text="White (#FFFFFF)"
							intent={bgOption === "#ffffff" ? "primary" : "none"}
							onClick={() => setBgOption("#ffffff")}
						/>
					</ButtonGroup>
				</div>

				{/* Summary Callout */}
				<div className={styles.summaryCard}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<Icon icon="info-sign" intent="primary" size={16} />
						<span>Vector Summary</span>
					</div>
					<div className={styles.summaryMetrics}>
						<span>Physical: <strong>{targetCmWidth} × {targetCmHeight} cm</strong></span>
						<span>Pixels: <strong>{targetWidth} × {targetHeight} px</strong></span>
					</div>
				</div>
			</div>

			<DialogFooter
				actions={
					<>
						<Button text="Export" intent="primary" icon="export" onClick={handleSaveSVG} />
					</>
				}
			/>
		</Dialog>
	);
}

export default SVGExportDialog;
