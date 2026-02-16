
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import React from "react";

export interface ILoginDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginDialog(props: ILoginDialogProps) {
    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Log in"
            style={{ width: "800px", height: "500px" }}
        >
            <DialogBody>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <Button
                        intent="primary"
                        text="Log in"
                        large={true}
                        onClick={() => {
                            // Placeholder for login logic
                            console.log("Log in clicked");
                            props.onClose();
                        }}
                    />
                </div>
            </DialogBody>
            <DialogFooter
                actions={
                    <Button
                        text="Cancel"
                        onClick={props.onClose}
                    />
                }
            />
        </Dialog>
    );
}
