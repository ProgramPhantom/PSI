import { Button, Classes, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";

interface IHelpDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RefHelp(props: IHelpDialogProps) {
    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Reference"
            icon="info-sign"
        >
            <DialogBody>
                <p>
                    A non-unique identifier for the visual element.
                </p>
            </DialogBody>
        </Dialog>
    );
}
