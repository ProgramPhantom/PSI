import { Components, ICollection } from "../../logic/collection";
import LabelGroup, { ILabelGroup } from "../../logic/hasComponents/labelGroup";
import { AllComponentTypes, UserComponentType } from "../../logic/point";
import Visual, { IVisual } from "../../logic/visual";
import { FormRequirements } from "./FormBase";
import { FORM_DEFAULTS, FormBundle } from "./formDataRegistry";
import Collection from "../../logic/collection";


// ====================== Types ======================

export interface ResolvedFormTargets {
	/** Form component + defaults for the primary element */
	primary: {
		Form: React.FC<FormRequirements>;
		defaults: IVisual;
		target?: Visual;
		elementType: UserComponentType;
	};
	/** Form component + defaults for the core child (only when target is a LabelGroup) */
	coreChild?: {
		Form: React.FC<FormRequirements>;
		defaults: IVisual;
		target?: Visual;
	};
	/** Current role children states keyed by role name */
	roleDefaults: Record<string, IVisual>;
	/** UI flags */
	allowLabels: boolean;
	isLabelGroup: boolean;
	isCollection: boolean;
	/** Roles from the label-group schema (for the Labels tab) */
	labelRoles: EditableRole[];
	/** Roles from the element's own schema (for the Components tab) */
	componentRoles: EditableRole[];
}

export interface EditableRole {
	roleName: string;
	displayName: string;
	elementType: AllComponentTypes;
	currentState?: IVisual;
	mandatory?: boolean;
	defaultValues?: any;
}


// ====================== Resolve ======================

/**
 * Given a target element and its object type, resolve all the form components,
 * defaults, and metadata needed to render the ElementForm.
 */
export function resolveFormDataFromTarget(
	target: Visual | undefined,
	objectType: UserComponentType
): ResolvedFormTargets {
	const formBundle: FormBundle | undefined = FORM_DEFAULTS[objectType];
	if (!formBundle) {
		throw new Error(`No form bundle registered for type '${objectType}'`);
	}

	const getFallbackLabelRoles = (): EditableRole[] => {
		const lgSchema = FORM_DEFAULTS["label-group"]?.roles ?? {};
		return Object.entries(lgSchema).map(([roleName, schema]) => ({
			roleName,
			displayName: schema.displayName,
			elementType: schema.elementType,
			mandatory: schema.mandatory,
			defaultValues: schema.defaultValues
		}));
	};

	// --- No target: creating a new element ---
	if (target === undefined) {
		let creatingLabelRoles: EditableRole[] = [];
		let creatingComponentRoles: EditableRole[] = [];

		if (formBundle.roles) {
			const rolesArray = Object.entries(formBundle.roles).map(([roleName, schema]) => ({
				roleName,
				displayName: schema.displayName,
				elementType: schema.elementType,
				mandatory: schema.mandatory,
				defaultValues: schema.defaultValues
			}));

			if (objectType === "label-group") {
				creatingLabelRoles = rolesArray;
			} else {
				creatingComponentRoles = rolesArray;
			}
		}

		if (formBundle.allowLabels) {
			creatingLabelRoles = getFallbackLabelRoles();
		}

		return {
			primary: {
				Form: formBundle.form,
				defaults: structuredClone(formBundle.defaults),
				elementType: objectType,
			},
			roleDefaults: {},
			allowLabels: formBundle.allowLabels,
			isLabelGroup: false,
			isCollection: false,
			labelRoles: creatingLabelRoles,
			componentRoles: creatingComponentRoles,
		};
	}

	// --- Editing an existing element ---
	const primaryForm = formBundle.form;
	const primaryDefaults = structuredClone(target.state);
	const allowLabels = formBundle.allowLabels;
	const isCollection = Collection.isCollection(target);

	let coreChild: ResolvedFormTargets["coreChild"] = undefined;
	let isLabelGroup = false;
	let roleDefaults: Record<string, IVisual> = {};
	let labelRoles: EditableRole[] = [];
	let componentRoles: EditableRole[] = [];

	if (LabelGroup.isLabelGroup(target)) {
		isLabelGroup = true;

		// Resolve core child
		const coreChildObj = target.coreChild;
		if (coreChildObj) {
			const coreChildType = (coreChildObj.constructor as typeof Visual).ElementType;
			const coreChildBundle = FORM_DEFAULTS[coreChildType];
			if (coreChildBundle) {
				coreChild = {
					Form: coreChildBundle.form,
					defaults: structuredClone(coreChildObj.state),
					target: coreChildObj,
				};
			}
		}
	}

	// Resolve editable roles from any Collection
	if (isCollection) {
		const collection = target as Collection;
		const roles: Components = collection.roles;
		const schemaRoles = formBundle.roles ?? {};

		// Iterate through the target's roles
		// If the role is defined in the form bundle's schema, it's editable
		for (const [roleName, roleEntry] of Object.entries(roles)) {
			const roleSchema = schemaRoles[roleName];
			if (!roleSchema) continue;

			const elementType = roleSchema.elementType;
			if (!elementType) continue;

			const role: EditableRole = {
				roleName,
				displayName: roleSchema.displayName,
				elementType,
				currentState: roleEntry.object ? structuredClone(roleEntry.object.state) : undefined,
				mandatory: roleSchema.mandatory,
				defaultValues: roleSchema.defaultValues
			};

			if (objectType === "label-group") {
				labelRoles.push(role);
			} else {
				componentRoles.push(role);
			}

			if (roleEntry.object) {
				roleDefaults[roleName] = structuredClone(roleEntry.object.state);
			}
		}
	}

	if (allowLabels && objectType !== "label-group") {
		// Target is not a label-group, but it supports labels — provide LabelGroup 
		// roles so the user can add labels and trigger promotion to a LabelGroup.
		labelRoles = getFallbackLabelRoles();
	}

	return {
		primary: {
			Form: primaryForm,
			defaults: primaryDefaults,
			target,
			elementType: objectType,
		},
		coreChild,
		roleDefaults,
		allowLabels,
		isLabelGroup,
		isCollection,
		labelRoles,
		componentRoles,
	};
}


// ====================== Assemble ======================

function isICollection(visual: IVisual): visual is ICollection {
	return 'children' in visual;
}

/**
 * Given the form data from all sub-forms, assemble the final IVisual to
 * submit. Handles promotion (plain → LabelGroup), update, and demotion
 * (LabelGroup → plain).
 */
export function formDataAssembler(
	masterData: IVisual,
	childData: IVisual | undefined,
	roleData: Record<string, IVisual>,
	context: {
		isLabelGroup: boolean;
		objectType: UserComponentType;
		originalTarget?: Visual;
		editableRoles: EditableRole[];
	}
): IVisual {
	const hasRoleChildren: boolean = Object.keys(roleData).length > 0;
	const formBundle: FormBundle<IVisual> | undefined = FORM_DEFAULTS[context.objectType];
	const allowsLabels: boolean | undefined = formBundle?.allowLabels;

	// Already a LabelGroup
	if (context.isLabelGroup === true) {

		if (hasRoleChildren) {
			// Update LabelGroup with new role children
			return buildLabelGroup(masterData, roleData, childData)
		} else {
			// Demote LabelGroup -> plain element (unwrap core child)
			if (childData && context.originalTarget) {
				childData.placementMode = context.originalTarget.placementMode;
				childData.placementControl = context.originalTarget.placementControl;
				childData.parentId = context.originalTarget.parentId;
				return childData;
			}
			return masterData;
		}

	} else if (allowsLabels === true) {
		// Not a LabelGroup, but allows labels

		if (hasRoleChildren) {
			// Promote plain element → LabelGroup
			return buildLabelGroup(masterData, roleData);
		} else {
			// Stay as plain element
			return masterData;
		}

	} else {
		// A generic component that holds its own roles (e.g. Channel)
		// Apply role data by replacing any existing mapped role children

		if (isICollection((masterData))) {
			if (hasRoleChildren) {
				const roleNames = Object.keys(formBundle?.roles ?? {});
				masterData.children = masterData.children.filter(c => !c.role || !roleNames.includes(c.role));
			} else {
				masterData.children = [];
			}

			for (const [roleName, roleState] of Object.entries(roleData)) {
				const child: IVisual = { ...roleState, role: roleName };
				masterData.children.push(child);
			}
		}

		return masterData;
	}

}

/**
 * Build an ILabelGroup from master data + role children data.
 */
function buildLabelGroup(
	masterData: IVisual,
	roleData: Record<string, IVisual>,
	existingChildData?: IVisual,
): IVisual {
	// Core child: either existing child data or derived from master
	let coreChildData: IVisual;

	if (existingChildData) {
		coreChildData = existingChildData;
	} else {
		coreChildData = { ...masterData };
		coreChildData.padding = [0, 0, 0, 0];
		coreChildData.offset = [0, 0];
		coreChildData.id = undefined
	}
	coreChildData.role = "coreChild";

	// Build children array
	const children: IVisual[] = [coreChildData];

	for (const [roleName, roleState] of Object.entries(roleData)) {
		const child: IVisual = { ...roleState };
		child.role = roleName;
		children.push(child);
	}

	const result: ILabelGroup = {
		...masterData,
		children,
		sizeMode: { x: "fit", y: "fit" },
		type: "label-group",
	};

	return result;
}
