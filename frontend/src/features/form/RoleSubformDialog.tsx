import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import React from "react";
import Visual from "../../logic/visual";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { popRoleSubform } from "../../redux/slices/dialogSlice";
import { FORM_DEFAULTS } from "./formDataRegistry";
import { FormRequirements } from "./FormBase";
import { getRoleIcon } from "./formHelpers";
import RoleButtonStrip from "./RoleButtonStrip";

interface RoleSubformDialogProps {
	target?: Visual;
}

export const RoleSubformDialog: React.FC<RoleSubformDialogProps> = () => {
	const dispatch = useAppDispatch();
	const roleSubformStack = useAppSelector((state) => state.dialog.roleSubformStack);

	if (roleSubformStack.length === 0) {
		return null;
	}

	return (
		<>
			{roleSubformStack.map((level, index) => {
				const SubForm: React.FC<FormRequirements> | undefined =
					FORM_DEFAULTS[level.elementType]?.form;
				const isTop = index === roleSubformStack.length - 1;
				const dialogIcon = level.icon ?? getRoleIcon(level);

				return (
					<Dialog
						key={`${level.prefix}-${index}`}
						isOpen={true}
						onClose={() => dispatch(popRoleSubform())}
						title={level.displayName}
						icon={dialogIcon}
						canOutsideClickClose={isTop}
						canEscapeKeyClose={isTop}
						style={{ width: "30vw", maxWidth: "90vw", height: "80vh" }}
					>
						<DialogBody style={{ maxHeight: "70vh", overflowY: "auto", padding: "16px" }}>
							<RoleButtonStrip elementType={level.elementType} prefix={level.prefix} />
							{SubForm ? (
								<SubForm prefix={level.prefix} />
							) : (
								<div>No form available for {level.elementType}</div>
							)}
						</DialogBody>
						<DialogFooter
							actions={
								<Button
									text="Done"
									onClick={() => dispatch(popRoleSubform())}
								/>
							}
						/>
					</Dialog>
				);
			})}
		</>
	);
};

export default RoleSubformDialog;
