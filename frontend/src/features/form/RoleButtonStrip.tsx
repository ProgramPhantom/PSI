import { Button, ButtonGroup } from "@blueprintjs/core";
import React from "react";
import { AllComponentTypes } from "../../logic/point";
import { useAppDispatch } from "../../redux/hooks";
import { pushRoleSubform, RoleSubformLevel } from "../../redux/slices/dialogSlice";
import { FORM_DEFAULTS } from "./formDataRegistry";
import { EditableRole, getRoleIcon } from "./formHelpers";
import styles from "./styles/ElementForm.module.scss";

export interface RoleButtonStripProps {
	elementType?: AllComponentTypes;
	roles?: EditableRole[];
	prefix?: string;
}

export const RoleButtonStrip: React.FC<RoleButtonStripProps> = ({ elementType, roles: passedRoles, prefix }) => {
	const dispatch = useAppDispatch();

	let rolesToDisplay: EditableRole[] = [];

	if (passedRoles && passedRoles.length > 0) {
		rolesToDisplay = passedRoles;
	} else if (elementType && FORM_DEFAULTS[elementType]?.roles) {
		const schemaRoles = FORM_DEFAULTS[elementType]?.roles ?? {};
		rolesToDisplay = Object.entries(schemaRoles).map(([roleName, schema]) => ({
			roleName,
			displayName: schema.displayName,
			elementType: schema.elementType,
			icon: schema.icon ?? getRoleIcon({ roleName, elementType: schema.elementType, icon: schema.icon }),
			mandatory: schema.mandatory,
			defaultValues: schema.defaultValues
		}));
	}

	if (rolesToDisplay.length === 0) {
		return null;
	}

	const handleRoleClick = (role: EditableRole) => {
		const childPrefix = prefix
			? `${prefix}.${role.roleName}`
			: `roles.${role.roleName}`;

		const level: RoleSubformLevel = {
			roleName: role.roleName,
			prefix: childPrefix,
			displayName: role.displayName,
			elementType: role.elementType,
			icon: role.icon ?? getRoleIcon(role)
		};

		dispatch(pushRoleSubform(level));
	};

	return (
		<div className={styles.roleButtonStrip}>
			<span className={styles.roleLabel}>Components</span>
			<div className={styles.roleButtons}>
				{rolesToDisplay.map((role) => (
					<Button
						key={role.roleName}
						size="medium"
						className={styles.compactRoleButton}
						icon={role.icon ?? getRoleIcon(role)}

						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleRoleClick(role);
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default RoleButtonStrip;
