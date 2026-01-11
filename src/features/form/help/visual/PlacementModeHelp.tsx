import { Button, Classes, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";

interface IHelpDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlacementModeHelp(props: IHelpDialogProps) {
    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Placement Mode"
            icon="info-sign"
        >
            <DialogBody>
                <p>
                    Information on how the application is to position this element. The most basic placement Mode
                    is "free", which describes an element that is positioned by it's x and y coordinates.
                </p>
            </DialogBody>
        </Dialog>
    );
}
