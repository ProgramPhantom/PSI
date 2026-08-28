import { Button, ButtonGroup, Popover, Position, Tooltip } from "@blueprintjs/core";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { CanvasToolType, setSelectedTool } from "../../redux/slices/applicationSlice";
import styles from "./styles/toolbars.module.scss";
import ArrowToolPopup from "./toolPopups/ArrowToolPopup";
import LaTeXToolPopup from "./toolPopups/LaTeXToolPopup";
import TextToolPopup from "./toolPopups/TextToolPopup";

export const CanvasToolToolbar: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const [openPopup, setOpenPopup] = useState<CanvasToolType | null>(null);

    const selectTool = (toolType: CanvasToolType) => {
        dispatch(setSelectedTool({
            type: toolType,
            config: selectedTool.type === toolType ? selectedTool.config : {}
        }));
    };

    const togglePopup = (toolType: CanvasToolType) => {
        setOpenPopup((prev) => (prev === toolType ? null : toolType));
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={styles["frosted-toolbar"]}
        >
            <Tooltip hoverOpenDelay={2000} content="Select Tool" position={Position.TOP}>
                <Button
                    icon="move"
                    active={selectedTool.type === 'select'}
                    intent={selectedTool.type === 'select' ? 'primary' : 'none'}
                    onClick={() => {
                        setOpenPopup(null);
                        selectTool('select');
                    }}
                    variant="minimal"
                />
            </Tooltip>

            <ButtonGroup>
                <Tooltip hoverOpenDelay={2000} content="Text Tool" position={Position.TOP}>
                    <Button
                        icon="font"
                        active={selectedTool.type === 'text'}
                        intent={selectedTool.type === 'text' ? 'primary' : 'none'}
                        onClick={() => selectTool('text')}
                        variant="minimal"
                    />
                </Tooltip>
                <Popover
                    isOpen={openPopup === 'text'}
                    onInteraction={(nextOpenState) => setOpenPopup(nextOpenState ? 'text' : null)}
                    content={<TextToolPopup />}
                    position="top"
                    minimal={true}
                    autoFocus={false}
                    enforceFocus={false}
                >
                    <Button
                        icon="caret-up"
                        active={openPopup === 'text'}
                        intent={selectedTool.type === 'text' ? 'primary' : 'none'}
                        onClick={() => togglePopup('text')}
                        variant="minimal"
                        style={{ minWidth: "16px", padding: 0 }}
                    />
                </Popover>
            </ButtonGroup>

            <ButtonGroup>
                <Tooltip hoverOpenDelay={2000} content="LaTeX Tool" position={Position.TOP}>
                    <Button
                        icon="function"
                        active={selectedTool.type === 'latex'}
                        intent={selectedTool.type === 'latex' ? 'primary' : 'none'}
                        onClick={() => selectTool('latex')}
                        variant="minimal"
                    />
                </Tooltip>
                <Popover
                    isOpen={openPopup === 'latex'}
                    onInteraction={(nextOpenState) => setOpenPopup(nextOpenState ? 'latex' : null)}
                    content={<LaTeXToolPopup />}
                    position="top"
                    minimal={true}
                    autoFocus={false}
                    enforceFocus={false}
                >
                    <Button
                        icon="caret-up"
                        active={openPopup === 'latex'}
                        intent={selectedTool.type === 'latex' ? 'primary' : 'none'}
                        onClick={() => togglePopup('latex')}
                        variant="minimal"
                        style={{ minWidth: "16px", padding: 0 }}
                    />
                </Popover>
            </ButtonGroup>

            <Tooltip hoverOpenDelay={2000} content="Box Tool" position={Position.TOP}>
                <Button disabled
                    icon="square"
                    active={selectedTool.type === 'box'}
                    intent={selectedTool.type === 'box' ? 'primary' : 'none'}
                    onClick={() => selectTool('box')}
                    variant="minimal"
                />
            </Tooltip>

            <ButtonGroup>
                <Tooltip hoverOpenDelay={2000} content="Arrow Tool" position={Position.TOP}>
                    <Button
                        icon="arrow-top-right"
                        active={selectedTool.type === 'arrow'}
                        intent={selectedTool.type === 'arrow' ? 'primary' : 'none'}
                        onClick={() => selectTool('arrow')}
                        variant="minimal"
                    />
                </Tooltip>
                <Popover
                    isOpen={openPopup === 'arrow'}
                    onInteraction={(nextOpenState) => setOpenPopup(nextOpenState ? 'arrow' : null)}
                    content={<ArrowToolPopup />}
                    position="top"
                    minimal={true}
                    autoFocus={false}
                    enforceFocus={false}
                >
                    <Button
                        icon="caret-up"
                        active={openPopup === 'arrow'}
                        intent={selectedTool.type === 'arrow' ? 'primary' : 'none'}
                        onClick={() => togglePopup('arrow')}
                        variant="minimal"
                        style={{ minWidth: "16px", padding: 0 }}
                    />
                </Popover>
            </ButtonGroup>
        </div>
    );
});

export default CanvasToolToolbar;

