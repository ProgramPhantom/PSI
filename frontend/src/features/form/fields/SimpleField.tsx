import { FormGroup } from "@blueprintjs/core";
import React from "react";
import styles from "./FormGroup.module.scss";

export interface SimpleFieldProps {
	label?: React.ReactNode;
	labelFor?: string;
	intent?: "danger" | "none" | "primary" | "success" | "warning";
	helperText?: React.ReactNode;
	inline?: boolean;
	fill?: boolean;
	style?: React.CSSProperties;
	children: React.ReactNode;
	className?: string;
}

export const SimpleField: React.FC<SimpleFieldProps> = ({
	label,
	labelFor,
	intent,
	helperText,
	inline,
	fill,
	style,
	children,
	className
}) => {
	const classNames = [styles.simpleGroup, className].filter(Boolean).join(" ");
	return (
		<FormGroup
			className={classNames}
			style={style}
			fill={fill}
			inline={inline}
			label={label}
			labelFor={labelFor}
			intent={intent}
			helperText={helperText}>
			{children}
		</FormGroup>
	);
};

export default SimpleField;
