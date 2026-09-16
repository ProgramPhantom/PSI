import { Button, Checkbox, Popover, Position } from "@blueprintjs/core";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    toggleDiagramOutline,
    togglePulseInsertAreas,
    toggleSequenceChannelPaddingEditor,
    toggleSequenceColumnEditor
} from "../../redux/slices/applicationSlice";
import styles from "./styles/OverlaySelector.module.scss";

export const OverlaySelector: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const showDiagramOutline = useAppSelector((state) => state.application.showDiagramOutline);
    const showSequenceColumnEditor = useAppSelector((state) => state.application.showSequenceColumnEditor);
    const showSequenceChannelPaddingEditor = useAppSelector((state) => state.application.showSequenceChannelPaddingEditor);
    const showPulseInsertAreas = useAppSelector((state) => state.application.showPulseInsertAreas);
    const [isOpen, setIsOpen] = useState(false);

    const menuContent = (
        <div
            className={styles["views-popover-content"]}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <Checkbox
                alignIndicator="right"
                checked={showDiagramOutline}
                onChange={() => dispatch(toggleDiagramOutline())}
                label="Diagram Outline"
            />
            <Checkbox
                alignIndicator="right"
                checked={showSequenceColumnEditor}
                onChange={() => dispatch(toggleSequenceColumnEditor())}
                label="Column Editor"
            />
            <Checkbox
                alignIndicator="right"
                checked={showSequenceChannelPaddingEditor}
                onChange={() => dispatch(toggleSequenceChannelPaddingEditor())}
                label="Padding Editor"
            />
            <Checkbox
                alignIndicator="right"
                checked={showPulseInsertAreas}
                onChange={() => dispatch(togglePulseInsertAreas())}
                label="Pulse Insert Areas"
            />
        </div>
    );

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <Popover
                isOpen={isOpen}
                onInteraction={(nextOpen) => setIsOpen(nextOpen)}
                content={menuContent}
                position={Position.BOTTOM_LEFT}
                minimal={true}
                autoFocus={false}
                enforceFocus={false}
                hasBackdrop={false}
            >
                <Button
                    className={`${styles["views-dropdown-btn"]} ${isOpen ? styles["open"] : ""}`}
                    variant="minimal"
                    size="small"
                    text="Views"
                    endIcon="caret-down"
                />
            </Popover>
        </div>
    );
});

export default OverlaySelector;
