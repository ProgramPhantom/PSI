import React from "react";
import { Button, Dialog, DialogBody, DialogFooter, Icon, IconName } from "@blueprintjs/core";
import styles from "./styles/CanvasControlsDialog.module.scss";

export interface ICanvasControlsDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

interface IControlGuideItem {
	title: string;
	description: string;
	icon: IconName;
	combos: string[][];
}

const CANVAS_CONTROLS: IControlGuideItem[] = [
	{
		title: "Pan Canvas",
		description: "Move freely across your pulse sequence diagram",
		icon: "hand",
		combos: [
			["Middle Click"],
			["Space", "Left Click"]
		]
	},
	{
		title: "Select Element",
		description: "Select individual pulse elements, channels, or labels",
		icon: "select",
		combos: [
			["Left Click"]
		]
	},
	{
		title: "Multi-Select / Marquee",
		description: "Select multiple elements together or drag a selection box",
		icon: "drag-handle-horizontal",
		combos: [
			["Control", "Left Click"],
			["Click & Drag Empty Canvas"]
		]
	},
	{
		title: "Zoom Canvas",
		description: "Zoom in and out for fine adjustments or overview",
		icon: "zoom-in",
		combos: [
			["Control", "Mouse Wheel"],
			["Trackpad Pinch"]
		]
	}
];

export const CanvasControlsDialog: React.FC<ICanvasControlsDialogProps> = ({ isOpen, onClose }) => {
	const handleDontShowAgain = () => {
		localStorage.setItem("hasSeenCanvasControls", "true");
		onClose();
	};

	return (
		<Dialog
			isOpen={isOpen}
			onClose={onClose}
			title="Canvas Controls & Navigation"
			icon="hand"
			className={styles.dialog}
		>
			<DialogBody className={styles.dialogBody} useOverflowScrollContainer={false}>
				<div className={styles.introBanner}>
					Get familiar with navigation gestures and controls to work quickly and smoothly on the diagram canvas.
				</div>

				<div className={styles.controlsList}>
					{CANVAS_CONTROLS.map((control) => (
						<div key={control.title} className={styles.controlCard}>
							<div className={styles.controlInfo}>
								<div className={styles.iconWrapper}>
									<Icon icon={control.icon} size={18} />
								</div>
								<div className={styles.textGroup}>
									<span className={styles.controlTitle}>{control.title}</span>
									<span className={styles.controlDesc}>{control.description}</span>
								</div>
							</div>

							<div className={styles.badgesGroup}>
								{control.combos.map((combo, comboIdx) => (
									<React.Fragment key={comboIdx}>
										{comboIdx > 0 && <span className={styles.keySeparator}>or</span>}
										<span className={styles.badgeCombo}>
											{combo.map((key, keyIdx) => (
												<React.Fragment key={keyIdx}>
													{keyIdx > 0 && <span className={styles.keyPlus}>+</span>}
													<kbd className={styles.keyBadge}>{key}</kbd>
												</React.Fragment>
											))}
										</span>
									</React.Fragment>
								))}
							</div>
						</div>
					))}
				</div>

				<div className={styles.helpTip}>
					<Icon icon="info-sign" size={14} intent="primary" />
					<span>You can revisit this guide anytime from <strong>Help → Canvas Controls</strong> in the toolbar.</span>
				</div>
			</DialogBody>

			<DialogFooter
				actions={
					<div className={styles.footerContainer}>
						<Button
							icon="eye-off"
							text="Don't show again"
							onClick={handleDontShowAgain}
						/>
						<Button
							intent="primary"
							icon="tick"
							text="Got it"
							onClick={onClose}
						/>
					</div>
				}
			/>
		</Dialog>
	);
};
