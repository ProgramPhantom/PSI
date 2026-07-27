import {
	Button,
	ButtonGroup,
	Callout,
	ControlGroup,
	Dialog,
	DialogBody,
	DialogFooter,
	FormGroup,
	Icon,
	InputGroup,
	NumericInput,
	Tag,
	Tooltip
} from "@blueprintjs/core";
import { useEffect, useState } from "react";
import ENGINE from "../../logic/engine";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectCurrentFileName } from "../../redux/selectors/diagramSelectors";
import * as Actions from "../../redux/thunks/actionThunks";
import styles from "./PNGExportDialog.module.scss";

interface IPNGExportDialogProps {
	close: () => void;
	isOpen: boolean;
}

type AspectPreset = "original" | "16:9" | "4:3" | "1:1" | "custom";
type SizeUnit = "px" | "cm" | "in";

const MAX_PX = 4000;
const MIN_PX = 10;

const capPx = (v: number) => Math.min(MAX_PX, Math.max(MIN_PX, Math.round(v)));

const pxToUnit = (px: number, unit: SizeUnit, dpi: number): number => {
	if (unit === "cm") {
		return Number(((px / dpi) * 2.54).toFixed(2));
	}
	if (unit === "in") {
		return Number((px / dpi).toFixed(2));
	}
	return Math.round(px);
};

const unitToPx = (val: number, unit: SizeUnit, dpi: number): number => {
	let px = val;
	if (unit === "cm") {
		px = (val / 2.54) * dpi;
	} else if (unit === "in") {
		px = val * dpi;
	}
	return capPx(px);
};

export function PNGExportDialog(props: IPNGExportDialogProps) {
	const dispatch = useAppDispatch();
	const currentFileName = useAppSelector(selectCurrentFileName);

	const baseWidth = Math.max(1, Math.round(ENGINE.handler.diagram?.width || 800));
	const baseHeight = Math.max(1, Math.round(ENGINE.handler.diagram?.height || 600));
	const originalRatio = baseWidth / baseHeight;

	const [pngFilename, setPngFilename] = useState(currentFileName || "pulse-diagram");
	const [selectedDpi, setSelectedDpi] = useState<number>(300);
	const [unit, setUnit] = useState<SizeUnit>("px");
	const [isAspectLocked, setIsAspectLocked] = useState<boolean>(true);
	const [aspectPreset, setAspectPreset] = useState<AspectPreset>("original");
	const [currentRatio, setCurrentRatio] = useState<number>(originalRatio);

	const [pngWidth, setPngWidth] = useState<number>(capPx(baseWidth * (300 / 72)));
	const [pngHeight, setPngHeight] = useState<number>(capPx(baseHeight * (300 / 72)));

	// Reset values when dialog opens
	useEffect(() => {
		if (props.isOpen) {
			const initialName = currentFileName && currentFileName !== "unnamed" ? currentFileName : "pulse-diagram";
			setPngFilename(initialName);
			setSelectedDpi(300);
			setUnit("px");
			setIsAspectLocked(true);
			setAspectPreset("original");
			setCurrentRatio(originalRatio);
			const defaultW = capPx(baseWidth * (300 / 72));
			const defaultH = capPx(baseHeight * (300 / 72));
			setPngWidth(defaultW);
			setPngHeight(defaultH);
		}
	}, [props.isOpen, baseWidth, baseHeight, originalRatio, currentFileName]);

	const handleDpiChange = (dpi: number) => {
		setSelectedDpi(dpi);
		const scale = dpi / 72;
		const newW = capPx(baseWidth * scale);
		const newH = capPx(newW / currentRatio);
		setPngWidth(newW);
		setPngHeight(newH);
	};

	const handleAspectPresetChange = (preset: AspectPreset) => {
		setAspectPreset(preset);
		let targetRatio = originalRatio;

		switch (preset) {
			case "original":
				targetRatio = originalRatio;
				break;
			case "16:9":
				targetRatio = 16 / 9;
				break;
			case "4:3":
				targetRatio = 4 / 3;
				break;
			case "1:1":
				targetRatio = 1;
				break;
			case "custom":
				return;
		}

		setCurrentRatio(targetRatio);
		setIsAspectLocked(true);
		const newH = capPx(pngWidth / targetRatio);
		setPngHeight(newH);
	};

	const handleWidthInputChange = (val: number | null) => {
		if (val === null || isNaN(val)) return;
		const newPxW = unitToPx(val, unit, selectedDpi);
		setPngWidth(newPxW);

		if (isAspectLocked && currentRatio > 0) {
			const newPxH = capPx(newPxW / currentRatio);
			setPngHeight(newPxH);
		} else if (pngHeight > 0) {
			setCurrentRatio(newPxW / pngHeight);
			setAspectPreset("custom");
		}
	};

	const handleHeightInputChange = (val: number | null) => {
		if (val === null || isNaN(val)) return;
		const newPxH = unitToPx(val, unit, selectedDpi);
		setPngHeight(newPxH);

		if (isAspectLocked && currentRatio > 0) {
			const newPxW = capPx(newPxH * currentRatio);
			setPngWidth(newPxW);
		} else if (pngWidth > 0) {
			setCurrentRatio(pngWidth / newPxH);
			setAspectPreset("custom");
		}
	};

	const handleStandardResolution = (w: number, h: number, presetLabel?: AspectPreset) => {
		const capW = capPx(w);
		const capH = capPx(h);
		setPngWidth(capW);
		setPngHeight(capH);
		setCurrentRatio(capW / capH);
		setAspectPreset(presetLabel || "custom");
	};

	const handleSavePNG = () => {
		dispatch(
			Actions.SavePNG({
				width: pngWidth,
				height: pngHeight,
				fileName: pngFilename
			})
		);
		props.close();
	};

	const displayWidth = pxToUnit(pngWidth, unit, selectedDpi);
	const displayHeight = pxToUnit(pngHeight, unit, selectedDpi);

	const cmWidth = ((pngWidth / selectedDpi) * 2.54).toFixed(1);
	const cmHeight = ((pngHeight / selectedDpi) * 2.54).toFixed(1);
	const inWidth = (pngWidth / selectedDpi).toFixed(1);
	const inHeight = (pngHeight / selectedDpi).toFixed(1);

	const megapixels = ((pngWidth * pngHeight) / 1000000).toFixed(2);
	const maxUnitVal = pxToUnit(MAX_PX, unit, selectedDpi);
	const minUnitVal = pxToUnit(MIN_PX, unit, selectedDpi);

	return (
		<Dialog
			isOpen={props.isOpen}
			onClose={props.close}
			title="Export PNG"
			icon="media"
			style={{ width: "520px" }}>
			<div className={styles.dialogBody}>
				{/* Filename Field */}
				<FormGroup label="Filename" labelFor="png-filename-input" className={styles.formGroupContainer}>
					<InputGroup
						id="png-filename-input"
						value={pngFilename}
						onChange={(e) => setPngFilename(e.target.value)}
						placeholder="Enter export filename..."
						leftIcon="document"
					/>
				</FormGroup>

				{/* DPI Selection */}
				<div className={styles.formGroupContainer}>
					<div className={styles.sectionHeader}>
						<span>Target Quality / DPI</span>
						<Tag minimal>{selectedDpi} DPI ({(selectedDpi / 72).toFixed(1)}x)</Tag>
					</div>
					<ButtonGroup fill size="small" variant="outlined" className={styles.presetGroup}>
						<Button
							text="72 (Web)"
							intent={selectedDpi === 72 ? "primary" : "none"}
							onClick={() => handleDpiChange(72)}
						/>
						<Button
							text="150 (HD)"
							intent={selectedDpi === 150 ? "primary" : "none"}
							onClick={() => handleDpiChange(150)}
						/>
						<Button
							text="300 (Print)"
							intent={selectedDpi === 300 ? "primary" : "none"}
							onClick={() => handleDpiChange(300)}
						/>
						<Button
							text="600 (Ultra)"
							intent={selectedDpi === 600 ? "primary" : "none"}
							onClick={() => handleDpiChange(600)}
						/>
					</ButtonGroup>
				</div>

				{/* Aspect Ratio Presets */}
				<div className={styles.formGroupContainer}>
					<div className={styles.sectionHeader}>
						<span>Aspect Ratio</span>
						<Tag minimal>{aspectPreset}</Tag>
					</div>
					<ButtonGroup fill size="small" variant="outlined" className={styles.presetGroup}>
						<Button
							text="Original"
							intent={aspectPreset === "original" ? "primary" : "none"}
							onClick={() => handleAspectPresetChange("original")}
						/>
						<Button
							text="16:9"
							intent={aspectPreset === "16:9" ? "primary" : "none"}
							onClick={() => handleAspectPresetChange("16:9")}
						/>
						<Button
							text="4:3"
							intent={aspectPreset === "4:3" ? "primary" : "none"}
							onClick={() => handleAspectPresetChange("4:3")}
						/>
						<Button
							text="1:1"
							intent={aspectPreset === "1:1" ? "primary" : "none"}
							onClick={() => handleAspectPresetChange("1:1")}
						/>
					</ButtonGroup>
				</div>

				{/* Standard Resolutions */}
				<div className={styles.formGroupContainer}>
					<div className={styles.sectionHeader}>
						<span>Standard Resolutions (Capped at 4000px)</span>
					</div>
					<ButtonGroup fill size="small" variant="outlined" className={styles.presetGroup}>
						<Button
							text="720p (1280×720)"
							intent={pngWidth === 1280 && pngHeight === 720 ? "primary" : "none"}
							onClick={() => handleStandardResolution(1280, 720, "16:9")}
						/>
						<Button
							text="1080p (1920×1080)"
							intent={pngWidth === 1920 && pngHeight === 1080 ? "primary" : "none"}
							onClick={() => handleStandardResolution(1920, 1080, "16:9")}
						/>
						<Button
							text="2K (2560×1440)"
							intent={pngWidth === 2560 && pngHeight === 1440 ? "primary" : "none"}
							onClick={() => handleStandardResolution(2560, 1440, "16:9")}
						/>
						<Button
							text="4K (3840×2160)"
							intent={pngWidth === 3840 && pngHeight === 2160 ? "primary" : "none"}
							onClick={() => handleStandardResolution(3840, 2160, "16:9")}
						/>
					</ButtonGroup>
				</div>

				{/* Custom Dimensions with Units & Aspect Ratio Lock */}
				<div className={styles.formGroupContainer}>
					<div className={styles.sectionHeader}>
						<span>Custom Dimensions (Max {MAX_PX} px)</span>
						<ButtonGroup size="small" variant="outlined">
							<Button text="px" intent={unit === "px" ? "primary" : "none"} onClick={() => setUnit("px")} />
							<Button text="cm" intent={unit === "cm" ? "primary" : "none"} onClick={() => setUnit("cm")} />
							<Button text="in" intent={unit === "in" ? "primary" : "none"} onClick={() => setUnit("in")} />
						</ButtonGroup>
					</div>
					<div className={styles.inlineContainer}>
						<FormGroup label={`Width (${unit})`} labelFor="png-width-input">
							<NumericInput
								id="png-width-input"
								value={displayWidth}
								onValueChange={(val) => handleWidthInputChange(val)}
								min={minUnitVal}
								max={maxUnitVal}
								stepSize={unit === "px" ? 50 : 0.1}
								minorStepSize={unit === "px" ? 10 : 0.05}
								fill
								allowNumericCharactersOnly={false}
							/>
						</FormGroup>

						<Tooltip content={isAspectLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"} position="top">
							<Button
								icon={isAspectLocked ? "lock" : "unlock"}
								intent={isAspectLocked ? "primary" : "none"}
								variant="minimal"
								onClick={() => setIsAspectLocked(!isAspectLocked)}
								style={{ marginBottom: "2px" }}
							/>
						</Tooltip>

						<FormGroup label={`Height (${unit})`} labelFor="png-height-input">
							<NumericInput
								id="png-height-input"
								value={displayHeight}
								onValueChange={(val) => handleHeightInputChange(val)}
								min={minUnitVal}
								max={maxUnitVal}
								stepSize={unit === "px" ? 50 : 0.1}
								minorStepSize={unit === "px" ? 10 : 0.05}
								fill
								allowNumericCharactersOnly={false}
							/>
						</FormGroup>
					</div>
				</div>

				{/* Summary Callout */}
				<div className={styles.summaryCard}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<Icon icon="info-sign" intent="primary" size={16} />
						<span>Resolution Summary</span>
					</div>
					<div className={styles.summaryMetrics}>
						<span>Pixels: <strong>{pngWidth} × {pngHeight} px</strong></span>
						<span>Physical: <strong>{cmWidth} × {cmHeight} cm</strong> ({inWidth} × {inHeight} in)</span>
						<span>Size: <strong>{megapixels} MP</strong></span>
					</div>
				</div>
			</div>

			<DialogFooter
				actions={
					<>
						<Button text="Export" intent="primary" icon="export" onClick={handleSavePNG} />
					</>
				}
			/>
		</Dialog>
	);
}
