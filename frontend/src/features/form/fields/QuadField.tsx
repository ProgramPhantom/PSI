import { FormGroup } from "@blueprintjs/core";
import React from "react";
import styles from "./FormGroup.module.scss";

export interface QuadFieldProps {
	label?: React.ReactNode;
	intent?: "danger" | "none" | "primary" | "success" | "warning";
	helperText?: React.ReactNode;
	style?: React.CSSProperties;
	className?: string;
	field1?: React.ReactNode;
	label1?: React.ReactNode;
	field2?: React.ReactNode;
	label2?: React.ReactNode;
	field3?: React.ReactNode;
	label3?: React.ReactNode;
	field4?: React.ReactNode;
	label4?: React.ReactNode;
}

export const QuadField: React.FC<QuadFieldProps> = ({
	label,
	intent,
	helperText,
	style,
	className,
	field1,
	label1,
	field2,
	label2,
	field3,
	label3,
	field4,
	label4
}) => {
	const classNames = [styles.quadGroup, className].filter(Boolean).join(" ");
	return (
		<FormGroup
			className={classNames}
			label={label}
			intent={intent}
			helperText={helperText}
			style={style}>
			<div className={styles.quadFields}>
				{field1 && (
					<div className={styles.inlineField}>
						{label1 && <span className={styles.fieldLabel}>{label1}</span>}
						{field1}
					</div>
				)}
				{field2 && (
					<div className={styles.inlineField}>
						{label2 && <span className={styles.fieldLabel}>{label2}</span>}
						{field2}
					</div>
				)}
				{field3 && (
					<div className={styles.inlineField}>
						{label3 && <span className={styles.fieldLabel}>{label3}</span>}
						{field3}
					</div>
				)}
				{field4 && (
					<div className={styles.inlineField}>
						{label4 && <span className={styles.fieldLabel}>{label4}</span>}
						{field4}
					</div>
				)}
			</div>
		</FormGroup>
	);
};

export default QuadField;
