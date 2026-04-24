import { Button, Section } from "@blueprintjs/core";
import React from "react";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { IVisual } from "../../logic/visual";
import { FORM_DEFAULTS } from "./formDataRegistry";
import { FormRequirements } from "./FormBase";
import { EditableRole } from "./formHelpers";


export type RoleChildrenFormData = {
	roles: Record<string, IVisual | undefined>;
};

interface RoleChildrenFormProps extends FormRequirements {
	editableRoles: EditableRole[];
}


/**
 * A generalised form for editing role-based children of a Collection.
 * Reads the editable roles and renders the appropriate sub-form for each,
 * dynamically picked from FORM_DEFAULTS based on the role's elementType.
 */
function RoleChildrenForm({ editableRoles }: RoleChildrenFormProps) {
	const parentFormControls = useFormContext<RoleChildrenFormData>();

	// Watch the roles object to trigger re-renders
	const roles = useWatch({
		control: parentFormControls.control,
		name: "roles"
	});

	const addRole = (roleName: string, role: EditableRole) => {
		const bundle = FORM_DEFAULTS[role.elementType];
		if (!bundle) return;

		let defaultVal = structuredClone(bundle.defaults);
		if (role.defaultValues) {
			defaultVal = { ...defaultVal, ...role.defaultValues };
		}

		parentFormControls.setValue(
			`roles.${roleName}`,
			defaultVal,
			{ shouldDirty: true }
		);
	};

	const removeRole = (roleName: string) => {
		parentFormControls.setValue(`roles.${roleName}`, undefined as any, { shouldDirty: true });
		parentFormControls.unregister(`roles.${roleName}`);
	};

	// Auto-add mandatory roles on mount if they don't exist
	React.useEffect(() => {
		editableRoles.forEach(role => {
			const currentVal = parentFormControls.getValues(`roles.${role.roleName}`);
			if (role.mandatory && currentVal === undefined) {
				const bundle = FORM_DEFAULTS[role.elementType];
				if (bundle) {
					let defaultVal = structuredClone(bundle.defaults);
					if (role.defaultValues) {
						defaultVal = { ...defaultVal, ...role.defaultValues };
					}
					parentFormControls.setValue(
						`roles.${role.roleName}`,
						defaultVal
					);
				}
			}
		});
	}, [editableRoles, parentFormControls]);

	return (
		<>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch"
				}}>

				{editableRoles.map((role) => {
					const hasChild = roles?.[role.roleName] !== undefined && roles[role.roleName] !== null;

					// Look up the sub-form component based on the role's elementType
					const SubForm: React.FC<FormRequirements> | undefined =
						FORM_DEFAULTS[role.elementType]?.form;

					return (
						<Section
							style={{ borderRadius: "0px", padding: "0px" }}
							key={role.roleName}
							collapsible={hasChild}
							title={role.displayName}
							compact={true}
							icon={
								role.mandatory ? undefined : (
									hasChild ? (
										<Button
											icon="trash"
											intent="danger"
											variant="minimal"
											onClick={(e) => {
												e.stopPropagation();
												removeRole(role.roleName);
											}}></Button>
									) : (
										<Button
											icon="add"
											intent="success"
											variant="minimal"
											onClick={(e) => {
												e.stopPropagation();
												addRole(role.roleName, role);
											}}></Button>
									)
								)
							}>
							{hasChild && SubForm && (
								<div style={{ padding: "8px" }}>
									<SubForm prefix={`roles.${role.roleName}`}></SubForm>
								</div>
							)}
						</Section>
					);
				})}
			</div>
		</>
	);
}

export default RoleChildrenForm;
