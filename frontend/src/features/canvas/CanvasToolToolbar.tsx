import { Button, ButtonGroup, Position, Tooltip, Popover, Menu, MenuItem } from "@blueprintjs/core";
import React from "react";
import { defaultLine } from "../../logic/default/index";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedTool, CanvasToolType } from "../../redux/slices/applicationSlice";

export const CanvasToolToolbar: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const textToolConfig = React.useRef({ fontFamily: 'sans-serif' });

    const selectedFont = selectedTool.type === 'text'
        ? (selectedTool.config?.fontFamily ?? 'sans-serif')
        : textToolConfig.current.fontFamily;

    const handleFontSelect = (fontFamily: string) => {
        textToolConfig.current = { fontFamily };
        dispatch(setSelectedTool({
            type: 'text',
            config: { fontFamily }
        }));
    };

    const selectTool = (toolType: CanvasToolType) => {
        if (toolType === 'arrow') {
            dispatch(setSelectedTool({
                type: 'arrow',
                config: { lineStyle: defaultLine.lineStyle, mode: 'bind' }
            }));
        } else if (toolType === 'text') {
            dispatch(setSelectedTool({
                type: 'text',
                config: textToolConfig.current
            }));
        } else {
            dispatch(setSelectedTool({
                type: toolType,
                config: {}
            }));
        }
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                padding: "4px",
                borderRadius: "6px",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(200, 200, 200, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "4px"
            }}
        >
            <Tooltip hoverOpenDelay={2000} content="Select Tool" position={Position.TOP}>
                <Button
                    icon="select"
                    active={selectedTool.type === 'select'}
                    intent={selectedTool.type === 'select' ? 'primary' : 'none'}
                    onClick={() => selectTool('select')}
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
                    content={
                        <Menu>
                            <MenuItem
                                text="Sans Serif"
                                active={selectedFont === 'sans-serif'}
                                onClick={() => handleFontSelect('sans-serif')}
                                style={{ fontFamily: 'sans-serif' }}
                            />
                            <MenuItem
                                text="Serif"
                                active={selectedFont === 'serif'}
                                onClick={() => handleFontSelect('serif')}
                                style={{ fontFamily: 'serif' }}
                            />
                            <MenuItem
                                text="Monospace"
                                active={selectedFont === 'monospace'}
                                onClick={() => handleFontSelect('monospace')}
                                style={{ fontFamily: 'monospace' }}
                            />
                            <MenuItem
                                text="Georgia"
                                active={selectedFont === 'Georgia, serif'}
                                onClick={() => handleFontSelect('Georgia, serif')}
                                style={{ fontFamily: 'Georgia, serif' }}
                            />
                            <MenuItem
                                text="Arial"
                                active={selectedFont === 'Arial, sans-serif'}
                                onClick={() => handleFontSelect('Arial, sans-serif')}
                                style={{ fontFamily: 'Arial, sans-serif' }}
                            />
                            <MenuItem
                                text="Times New Roman"
                                active={selectedFont === 'Times New Roman, serif'}
                                onClick={() => handleFontSelect('Times New Roman, serif')}
                                style={{ fontFamily: 'Times New Roman, serif' }}
                            />
                        </Menu>
                    }
                    position="top"
                    minimal={true}
                >
                    <Button
                        icon="caret-up"
                        active={selectedTool.type === 'text'}
                        intent={selectedTool.type === 'text' ? 'primary' : 'none'}
                        variant="minimal"
                        style={{ minWidth: "16px", padding: 0 }}
                    />
                </Popover>
            </ButtonGroup>

            <Tooltip hoverOpenDelay={2000} content="LaTeX Tool" position={Position.TOP}>
                <Button
                    icon="function"
                    active={selectedTool.type === 'latex'}
                    intent={selectedTool.type === 'latex' ? 'primary' : 'none'}
                    onClick={() => selectTool('latex')}
                    variant="minimal"
                />
            </Tooltip>

            <Tooltip hoverOpenDelay={2000} content="Box Tool" position={Position.TOP}>
                <Button
                    icon="square"
                    active={selectedTool.type === 'box'}
                    intent={selectedTool.type === 'box' ? 'primary' : 'none'}
                    onClick={() => selectTool('box')}
                    variant="minimal"
                />
            </Tooltip>

            <Tooltip hoverOpenDelay={2000} content="Arrow Tool" position={Position.TOP}>
                <Button
                    icon="arrow-top-right"
                    active={selectedTool.type === 'arrow'}
                    intent={selectedTool.type === 'arrow' ? 'primary' : 'none'}
                    onClick={() => selectTool('arrow')}
                    variant="minimal"
                />
            </Tooltip>
        </div>
    );
});

export default CanvasToolToolbar;
