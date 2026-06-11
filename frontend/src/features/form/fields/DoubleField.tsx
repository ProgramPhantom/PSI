import { FormGroup } from "@blueprintjs/core";
import React from "react";
import styles from "./FormGroup.module.scss";

export interface DoubleFieldProps {
	label?: React.ReactNode;
	intent?: "danger" | "none" | "primary" | "success" | "warning";
	helperText?: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	leftLabel?: React.ReactNode;
	leftField?: React.ReactNode;
	rightLabel?: React.ReactNode;
	rightField?: React.ReactNode;
}

export const DoubleField: React.FC<DoubleFieldProps> = ({
	label,
	intent,
	helperText,
	style,
	className,
	leftLabel,
	leftField,
	rightLabel,
	rightField
}) => {
	const classNames = [styles.doubleGroup, className].filter(Boolean).join(" ");
	return (
		<FormGroup
			className={classNames}
			label={label}
			intent={intent}
			helperText={helperText}
			style={style}>
			<div className={styles.doubleFields}>
				{leftField && (
					<div className={styles.inlineField}>
						{leftLabel && <span className={styles.fieldLabel}>{leftLabel}</span>}
						{leftField}
					</div>
				)}
				{rightField && (
					<div className={styles.inlineField}>
						{rightLabel && <span className={styles.fieldLabel}>{rightLabel}</span>}
						{rightField}
					</div>
				)}
			</div>
		</FormGroup>
	);
};

export default DoubleField;
