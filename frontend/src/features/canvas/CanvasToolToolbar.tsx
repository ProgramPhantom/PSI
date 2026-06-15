import { Button, ButtonGroup, Position, Tooltip, Popover, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
import React from "react";
import { defaultLine } from "../../logic/default/index";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedTool, CanvasToolType } from "../../redux/slices/applicationSlice";
import styles from "./styles/toolbars.module.scss";

export const CanvasToolToolbar: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const textToolConfig = React.useRef({ fontFamily: 'sans-serif', fontSize: 20 });
    const latexToolConfig = React.useRef({ fontSize: 35 });

    const selectedFont = selectedTool.type === 'text'
        ? (selectedTool.config?.fontFamily ?? 'sans-serif')
        : textToolConfig.current.fontFamily;

    const selectedFontSize = selectedTool.type === 'text'
        ? (selectedTool.config?.fontSize ?? 20)
        : textToolConfig.current.fontSize;

    const selectedLaTeXFontSize = selectedTool.type === 'latex'
        ? (selectedTool.config?.fontSize ?? 35)
        : latexToolConfig.current.fontSize;

    const handleFontSelect = (fontFamily: string) => {
        textToolConfig.current = { ...textToolConfig.current, fontFamily };
        dispatch(setSelectedTool({
            type: 'text',
            config: textToolConfig.current
        }));
    };

    const handleFontSizeSelect = (fontSize: number) => {
        textToolConfig.current = { ...textToolConfig.current, fontSize };
        dispatch(setSelectedTool({
            type: 'text',
            config: textToolConfig.current
        }));
    };

    const handleLaTeXFontSizeSelect = (fontSize: number) => {
        latexToolConfig.current = { fontSize };
        dispatch(setSelectedTool({
            type: 'latex',
            config: { fontSize }
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
        } else if (toolType === 'latex') {
            dispatch(setSelectedTool({
                type: 'latex',
                config: latexToolConfig.current
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
            className={styles["frosted-toolbar"]}
        >
            <Tooltip hoverOpenDelay={2000} content="Select Tool" position={Position.TOP}>
                <Button
                    icon="move"
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
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <Menu style={{ minWidth: 130 }}>
                                <MenuDivider title="Font Family" />
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
                            <div style={{ width: 1, backgroundColor: 'rgba(200, 200, 200, 0.3)', margin: '4px 0' }} />
                            <Menu style={{ minWidth: 110 }}>
                                <MenuDivider title="Font Size" />
                                <MenuItem
                                    text="XS (12)"
                                    active={selectedFontSize === 12}
                                    onClick={() => handleFontSizeSelect(12)}
                                />
                                <MenuItem
                                    text="S (16)"
                                    active={selectedFontSize === 16}
                                    onClick={() => handleFontSizeSelect(16)}
                                />
                                <MenuItem
                                    text="M (20)"
                                    active={selectedFontSize === 20}
                                    onClick={() => handleFontSizeSelect(20)}
                                />
                                <MenuItem
                                    text="L (28)"
                                    active={selectedFontSize === 28}
                                    onClick={() => handleFontSizeSelect(28)}
                                />
                                <MenuItem
                                    text="XL (36)"
                                    active={selectedFontSize === 36}
                                    onClick={() => handleFontSizeSelect(36)}
                                />
                                <MenuItem
                                    text="XXL (48)"
                                    active={selectedFontSize === 48}
                                    onClick={() => handleFontSizeSelect(48)}
                                />
                            </Menu>
                        </div>
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
                    content={
                        <Menu style={{ minWidth: 110 }}>
                            <MenuDivider title="Font Size" />
                            <MenuItem
                                text="XS (15)"
                                active={selectedLaTeXFontSize === 15}
                                onClick={() => handleLaTeXFontSizeSelect(15)}
                            />
                            <MenuItem
                                text="S (25)"
                                active={selectedLaTeXFontSize === 25}
                                onClick={() => handleLaTeXFontSizeSelect(25)}
                            />
                            <MenuItem
                                text="M (35)"
                                active={selectedLaTeXFontSize === 35}
                                onClick={() => handleLaTeXFontSizeSelect(35)}
                            />
                            <MenuItem
                                text="L (45)"
                                active={selectedLaTeXFontSize === 45}
                                onClick={() => handleLaTeXFontSizeSelect(45)}
                            />
                            <MenuItem
                                text="XL (55)"
                                active={selectedLaTeXFontSize === 55}
                                onClick={() => handleLaTeXFontSizeSelect(55)}
                            />
                            <MenuItem
                                text="XXL (70)"
                                active={selectedLaTeXFontSize === 70}
                                onClick={() => handleLaTeXFontSizeSelect(70)}
                            />
                        </Menu>
                    }
                    position="top"
                    minimal={true}
                >
                    <Button
                        icon="caret-up"
                        active={selectedTool.type === 'latex'}
                        intent={selectedTool.type === 'latex' ? 'primary' : 'none'}
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

            <Tooltip hoverOpenDelay={2000} content="Arrow Tool" position={Position.TOP}>
                <Button disabled
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
