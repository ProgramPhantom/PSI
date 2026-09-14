import React from "react";
import { Button, Dialog, DialogBody, DialogFooter, Icon, IconName } from "@blueprintjs/core";
import styles from "./styles/KeyboardShortcutsDialog.module.scss";

interface IShortcutItem {
	label: string;
	combo: string;
}

interface IShortcutCategory {
	category: string;
	icon: IconName;
	shortcuts: IShortcutItem[];
}

const SHORTCUT_GROUPS: IShortcutCategory[] = [
	{
		category: "File & Project",
		icon: "document",
		shortcuts: [
			{ label: "New Diagram", combo: "Ctrl + N" },
			{ label: "Open Diagram", combo: "Ctrl + O" },
			{ label: "Save Diagram", combo: "Ctrl + S" },
			{ label: "Save Diagram As...", combo: "Ctrl + Shift + S" },
			{ label: "Export .nmrd File", combo: "Ctrl + Alt + S" },
			{ label: "Export SVG", combo: "Shift + Alt + S" },
			{ label: "Export PNG", combo: "Ctrl + E" },
		],
	},
	{
		category: "Edit & Selection",
		icon: "edit",
		shortcuts: [
			{ label: "Undo", combo: "Ctrl + Z" },
			{ label: "Redo", combo: "Ctrl + Y" },
			{ label: "Cut Element", combo: "Ctrl + X" },
			{ label: "Copy Element", combo: "Ctrl + C" },
			{ label: "Paste Element", combo: "Ctrl + V" },
			{ label: "Copy State JSON", combo: "Ctrl + Shift + C" },
			{ label: "Delete Selected", combo: "Delete / Backspace" },
			{ label: "Clear Selection", combo: "Escape" },
		],
	},
	{
		category: "Canvas & Positioning",
		icon: "drag-handle-vertical",
		shortcuts: [
			{ label: "Nudge 1px", combo: "↑ / ↓ / ← / →" },
			{ label: "Nudge 10px (Large)", combo: "Shift + Arrows" },
			{ label: "Reset Element Offset", combo: "R" },
			{ label: "Toggle Column Mode", combo: "Alt + C" },
		],
	},
	{
		category: "Tools & Help",
		icon: "help",
		shortcuts: [
			{ label: "Keyboard Shortcuts", combo: "Ctrl + /" },
			{ label: "Debug Layer Dialog", combo: "Ctrl + D" },
			{ label: "Benchmark Dialog", combo: "Ctrl + Alt + J" },
			{ label: "Report Bug (GitHub)", combo: "Ctrl + B" },
			{ label: "Report Bug (Email)", combo: "Ctrl + Alt + B" },
		],
	},
];

const renderKeyBadge = (comboStr: string) => {
	const alternatives = comboStr.split(" / ");
	return (
		<span className={styles.shortcutKeys}>
			{alternatives.map((alt, altIdx) => {
				const keys = alt.split(" + ");
				return (
					<React.Fragment key={altIdx}>
						{altIdx > 0 && <span className={styles.keySeparator}>/</span>}
						{keys.map((key, keyIdx) => (
							<React.Fragment key={keyIdx}>
								{keyIdx > 0 && <span className={styles.keyPlus}>+</span>}
								<kbd className={styles.keyBadge}>{key.trim()}</kbd>
							</React.Fragment>
						))}
					</React.Fragment>
				);
			})}
		</span>
	);
};

export interface IKeyboardShortcutsDialogProps {
	isOpen: boolean;
	onClose: () => void;
}

export const KeyboardShortcutsDialog: React.FC<IKeyboardShortcutsDialogProps> = ({ isOpen, onClose }) => {
	return (
		<Dialog
			isOpen={isOpen}
			onClose={onClose}
			title="Keyboard Shortcuts"
			icon="key"
			className={styles.dialog}
		>
			<DialogBody className={styles.dialogBody} useOverflowScrollContainer={false}>
				<div className={styles.shortcutsGrid}>
					{SHORTCUT_GROUPS.map((group) => (
						<div key={group.category} className={styles.groupCard}>
							<div className={styles.groupHeader}>
								<Icon icon={group.icon} size={14} />
								<span>{group.category}</span>
							</div>
							<div className={styles.shortcutsList}>
								{group.shortcuts.map((shortcut) => (
									<div key={shortcut.label} className={styles.shortcutRow}>
										<span className={styles.shortcutLabel}>{shortcut.label}</span>
										{renderKeyBadge(shortcut.combo)}
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</DialogBody>
			<DialogFooter
				actions={
					<Button intent="primary" onClick={onClose}>
						Close
					</Button>
				}
			/>
		</Dialog>
	);
};
