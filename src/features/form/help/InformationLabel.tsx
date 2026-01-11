import { Icon } from "@blueprintjs/core";
import { ReactNode, useState } from "react";
import { AllHelpTypes, GetHelpDialog } from "./types";

interface IInformationLabel {
    text: ReactNode;
    helpType: AllHelpTypes;
}

export default function InformationLabel(props: IInformationLabel) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ display: "flex", alignItems: "center", flexDirection: "row" }}>
            {props.text}

            <Icon
                icon="small-info-sign"
                size={12}
                style={{ alignSelf: "flex-start", cursor: "help" }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
            />
            {GetHelpDialog(props.helpType, isOpen, () => setIsOpen(false))}
        </div>
    );
}