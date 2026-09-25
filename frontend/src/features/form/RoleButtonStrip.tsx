import { Button, Popover, Position } from "@blueprintjs/core";
import React, { useSyncExternalStore } from "react";
import { useFormContext } from "react-hook-form";
import { AllComponentTypes } from "../../logic/point";
import Collection from "../../logic/collection";
import ENGINE from "../../logic/engine";
import Visual, { IVisual } from "../../logic/visual";
import { useAppDispatch } from "../../redux/hooks";
import { pushRoleSubform, RoleSubformLevel } from "../../redux/slices/dialogSlice";
import { useSelectedElement } from "../../hooks/useSelectedElements";
import { FORM_DEFAULTS } from "./formDataRegistry";
import { EditableRole, getRoleIcon } from "./formHelpers";
import styles from "./styles/ElementForm.module.scss";

export interface RoleButtonStripProps {
	elementType?: AllComponentTypes;
	roles?: EditableRole[];
	prefix?: string;
	target?: Visual;
	onRecreateRole?: (role: EditableRole) => void;
}

function resolveParentObject(target: Visual | undefined, prefix?: string): Visual | undefined {
	if (!target) return undefined;
	if (!prefix) return target;

	const parts = prefix.split(".").filter((p) => p && p !== "roles");
	let current: Visual | undefined = target;
	for (const part of parts) {
		if (!current || !Collection.isCollection(current)) {
			return undefined;
		}
		const roleChild: Visual | undefined = current.roles?.[part]?.object ?? current.children.find((c) => c.role === part);
		current = roleChild;
	}
	return current;
}

function checkRolePresence(parent: Visual | undefined, role: EditableRole): boolean {
	if (!parent) {
		// When no object is selected/targeted, the role is not "missing from selected object"
		return true;
	}

	if (Collection.isCollection(parent)) {
		const roleEntry = parent.roles?.[role.roleName];
		const hasInRoles = roleEntry?.object !== undefined;
		const hasInChildren = parent.children?.some((c) => c.role === role.roleName);
		return Boolean(hasInRoles || hasInChildren);
	}

	return false;
}

export const RoleButtonStrip: React.FC<RoleButtonStripProps> = ({
	elementType,
	roles: passedRoles,
	prefix,
	target,
	onRecreateRole
}) => {
	const dispatch = useAppDispatch();
	const formContext = useFormContext();
	useSyncExternalStore(ENGINE.subscribe, ENGINE.getSnapshot);
	const selectedElement = useSelectedElement();

	const liveTarget = target?.id && ENGINE.handler?.diagram?.allElements?.[target.id]
		? ENGINE.handler.diagram.allElements[target.id]
		: (target ?? selectedElement);

	const parentObject = resolveParentObject(liveTarget, prefix);

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

	const handleRecreateRole = (role: EditableRole) => {
		const parent = parentObject ?? resolveParentObject(liveTarget, prefix);
		if (!parent) return;

		// 1. Prepare default child data
		const bundle = FORM_DEFAULTS[role.elementType];
		if (!bundle) return;

		let childData: IVisual = structuredClone(bundle.defaults);
		if (role.defaultValues) {
			childData = { ...childData, ...structuredClone(role.defaultValues) };
		}
		childData.role = role.roleName;
		childData.id = Math.random().toString(16).slice(2);
		childData.parentId = parent.id;

		// 2. Add to parent in diagram via ENGINE.handler if present in diagram
		if (parent.id && ENGINE.handler?.diagram?.allElements?.[parent.id]) {
			ENGINE.handler.act({
				type: "add",
				input: {
					child: childData
				}
			});
		} else if (Collection.isCollection(parent)) {
			// Fallback direct addition if not in diagram
			const childInstance = ENGINE.ConstructElement(childData, role.elementType);
			if (childInstance) {
				parent.add({ child: childInstance });
				ENGINE.handler?.draw?.();
			}
		}

		// 3. Update form context if present (so form controls know about the recreated role)
		if (formContext) {
			const childFormPath = prefix
				? `${prefix}.${role.roleName}`
				: `roles.${role.roleName}`;
			formContext.setValue(childFormPath, childData, { shouldDirty: true });
		}

		// 4. Fire optional callback
		onRecreateRole?.(role);
	};

	return (
		<div className={styles.roleButtonStrip}>
			<span className={styles.roleLabel}>Components</span>
			<div className={styles.roleButtons}>
				{rolesToDisplay.map((role) => {
					const isPresent = checkRolePresence(parentObject, role);
					const icon = role.icon ?? getRoleIcon(role);

					const buttonElement = (
						<Button
							key={role.roleName}
							size="medium"
							className={`${styles.compactRoleButton} ${!isPresent ? styles.missingRoleButton : ""}`}
							icon={icon}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (isPresent) {
									handleRoleClick(role);
								} else {
									handleRecreateRole(role);
								}
							}}
						/>
					);

					if (!isPresent) {
						return (
							<Popover
								key={role.roleName}
								interactionKind="hover"
								hoverOpenDelay={100}
								hoverCloseDelay={100}
								position={Position.TOP}
								content={
									<div style={{ padding: "6px 10px", fontSize: "11px", maxWidth: "200px", textAlign: "center" }}>
										<div><strong>{role.displayName || role.roleName}</strong> is not present.</div>
										<div style={{ opacity: 0.8, marginTop: "2px" }}>Click to recreate this component on the parent.</div>
									</div>
								}
							>
								{buttonElement}
							</Popover>
						);
					}

					return buttonElement;
				})}
			</div>
		</div>
	);
};

export default RoleButtonStrip;
