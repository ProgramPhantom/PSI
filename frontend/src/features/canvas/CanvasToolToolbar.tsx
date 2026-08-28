import { Button, ButtonGroup, Position, Tooltip, Popover, Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
import React from "react";
import { defaultLine } from "../../logic/default/index";
import { HeadStyle } from "../../logic/line";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSelectedTool, CanvasToolType } from "../../redux/slices/applicationSlice";
import styles from "./styles/toolbars.module.scss";

const COLOR_PRESETS = [
    "#000000",
    "#5c7080",
    "#137cbd",
    "#0f9960",
    "#d9822b",
    "#db3737",
    "#7157d9",
    "#d13913"
];

const DASH_STYLES: { dashing: [number, number]; id: string }[] = [
    { dashing: [0, 0], id: "solid" },
    { dashing: [6, 6], id: "dashed" },
    { dashing: [2, 4], id: "dotted" }
];

export const CanvasToolToolbar: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const textToolConfig = React.useRef({ fontFamily: 'sans-serif', fontSize: 20 });
    const latexToolConfig = React.useRef({ fontSize: 35 });
    const arrowToolConfig = React.useRef<{
        thickness: number;
        lineStyle: {
            stroke: string;
            dashing: [number, number];
            headStyle: [HeadStyle, HeadStyle];
        };
    }>({
        thickness: defaultLine.thickness ?? 2,
        lineStyle: {
            stroke: (defaultLine.lineStyle?.stroke as string) ?? "#000000",
            dashing: (defaultLine.lineStyle?.dashing as [number, number]) ?? [0, 0],
            headStyle: (defaultLine.lineStyle?.headStyle as [HeadStyle, HeadStyle]) ?? ["none", "default"]
        }
    });

    const selectedFont = selectedTool.type === 'text'
        ? (selectedTool.config?.fontFamily ?? 'sans-serif')
        : textToolConfig.current.fontFamily;

    const selectedFontSize = selectedTool.type === 'text'
        ? (selectedTool.config?.fontSize ?? 20)
        : textToolConfig.current.fontSize;

    const selectedLaTeXFontSize = selectedTool.type === 'latex'
        ? (selectedTool.config?.fontSize ?? 35)
        : latexToolConfig.current.fontSize;

    const selectedThickness = selectedTool.type === 'arrow'
        ? (selectedTool.config?.thickness ?? arrowToolConfig.current.thickness)
        : arrowToolConfig.current.thickness;

    const selectedHeadStyle: [HeadStyle, HeadStyle] = selectedTool.type === 'arrow'
        ? (selectedTool.config?.lineStyle?.headStyle ?? arrowToolConfig.current.lineStyle.headStyle)
        : arrowToolConfig.current.lineStyle.headStyle;

    const selectedStroke = selectedTool.type === 'arrow'
        ? (selectedTool.config?.lineStyle?.stroke ?? arrowToolConfig.current.lineStyle.stroke)
        : arrowToolConfig.current.lineStyle.stroke;

    const selectedDashing = selectedTool.type === 'arrow'
        ? (selectedTool.config?.lineStyle?.dashing ?? arrowToolConfig.current.lineStyle.dashing)
        : arrowToolConfig.current.lineStyle.dashing;

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

    const handleStartHeadSelect = (startHead: HeadStyle) => {
        const newHeadStyle: [HeadStyle, HeadStyle] = [startHead, selectedHeadStyle[1]];
        arrowToolConfig.current = {
            ...arrowToolConfig.current,
            lineStyle: {
                ...arrowToolConfig.current.lineStyle,
                headStyle: newHeadStyle
            }
        };
        dispatch(setSelectedTool({
            type: 'arrow',
            config: arrowToolConfig.current
        }));
    };

    const handleEndHeadSelect = (endHead: HeadStyle) => {
        const newHeadStyle: [HeadStyle, HeadStyle] = [selectedHeadStyle[0], endHead];
        arrowToolConfig.current = {
            ...arrowToolConfig.current,
            lineStyle: {
                ...arrowToolConfig.current.lineStyle,
                headStyle: newHeadStyle
            }
        };
        dispatch(setSelectedTool({
            type: 'arrow',
            config: arrowToolConfig.current
        }));
    };

    const handleThicknessSelect = (thickness: number) => {
        arrowToolConfig.current = {
            ...arrowToolConfig.current,
            thickness
        };
        dispatch(setSelectedTool({
            type: 'arrow',
            config: arrowToolConfig.current
        }));
    };

    const handleStrokeSelect = (stroke: string) => {
        arrowToolConfig.current = {
            ...arrowToolConfig.current,
            lineStyle: {
                ...arrowToolConfig.current.lineStyle,
                stroke
            }
        };
        dispatch(setSelectedTool({
            type: 'arrow',
            config: arrowToolConfig.current
        }));
    };

    const handleDashingSelect = (dashing: [number, number]) => {
        arrowToolConfig.current = {
            ...arrowToolConfig.current,
            lineStyle: {
                ...arrowToolConfig.current.lineStyle,
                dashing
            }
        };
        dispatch(setSelectedTool({
            type: 'arrow',
            config: arrowToolConfig.current
        }));
    };

    const selectTool = (toolType: CanvasToolType) => {
        if (toolType === 'arrow') {
            dispatch(setSelectedTool({
                type: 'arrow',
                config: arrowToolConfig.current
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
                    content={
                        <div style={{ display: 'flex', flexDirection: 'row', padding: '4px' }}>
                            {/* Column 1: Arrowheads with Start and End dropdowns */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 10px', minWidth: 140 }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#5f6b7c', textTransform: 'uppercase' }}>
                                    Arrowheads
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#5f6b7c' }}>Start</span>
                                    <Popover
                                        minimal={true}
                                        position="bottom-left"
                                        content={
                                            <Menu style={{ minWidth: 100 }}>
                                                <MenuItem
                                                    text="None"
                                                    active={selectedHeadStyle[0] === 'none'}
                                                    onClick={() => handleStartHeadSelect('none')}
                                                />
                                                <MenuItem
                                                    text="Default"
                                                    active={selectedHeadStyle[0] === 'default'}
                                                    onClick={() => handleStartHeadSelect('default')}
                                                />
                                                <MenuItem
                                                    text="Thin"
                                                    active={selectedHeadStyle[0] === 'thin'}
                                                    onClick={() => handleStartHeadSelect('thin')}
                                                />
                                            </Menu>
                                        }
                                    >
                                        <Button
                                            text={selectedHeadStyle[0].charAt(0).toUpperCase() + selectedHeadStyle[0].slice(1)}
                                            endIcon="caret-down"
                                            size="small"
                                            variant="outlined"
                                            style={{ justifyContent: 'space-between', minWidth: '100px' }}
                                        />
                                    </Popover>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#5f6b7c' }}>End</span>
                                    <Popover
                                        minimal={true}
                                        position="bottom-left"
                                        content={
                                            <Menu style={{ minWidth: 100 }}>
                                                <MenuItem
                                                    text="None"
                                                    active={selectedHeadStyle[1] === 'none'}
                                                    onClick={() => handleEndHeadSelect('none')}
                                                />
                                                <MenuItem
                                                    text="Default"
                                                    active={selectedHeadStyle[1] === 'default'}
                                                    onClick={() => handleEndHeadSelect('default')}
                                                />
                                                <MenuItem
                                                    text="Thin"
                                                    active={selectedHeadStyle[1] === 'thin'}
                                                    onClick={() => handleEndHeadSelect('thin')}
                                                />
                                            </Menu>
                                        }
                                    >
                                        <Button
                                            text={selectedHeadStyle[1].charAt(0).toUpperCase() + selectedHeadStyle[1].slice(1)}
                                            endIcon="caret-down"
                                            size="small"
                                            variant="outlined"
                                            style={{ justifyContent: 'space-between', minWidth: '100px' }}
                                        />
                                    </Popover>
                                </div>
                            </div>

                            <div style={{ width: 1, backgroundColor: 'rgba(200, 200, 200, 0.3)', margin: '4px 0' }} />

                            {/* Column 2: Thickness with horizontal rects and pixel count */}
                            <Menu style={{ minWidth: 130 }}>
                                <MenuDivider title="Thickness" />
                                {[1, 2, 3, 4, 6, 8].map((thickness) => {
                                    const isActive = selectedThickness === thickness;
                                    return (
                                        <MenuItem
                                            key={thickness}
                                            active={isActive}
                                            onClick={() => handleThicknessSelect(thickness)}
                                            text={
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '14px' }}>
                                                    <div
                                                        style={{
                                                            width: '45px',
                                                            height: `${thickness}px`,
                                                            backgroundColor: isActive ? '#fff' : '#182026',
                                                            borderRadius: '1px'
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{thickness}px</span>
                                                </div>
                                            }
                                        />
                                    );
                                })}
                            </Menu>

                            <div style={{ width: 1, backgroundColor: 'rgba(200, 200, 200, 0.3)', margin: '4px 0' }} />

                            {/* Column 3: Color & Dash Style (visual SVG path) */}
                            <div style={{ minWidth: 140, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#5f6b7c', textTransform: 'uppercase', marginBottom: '2px' }}>
                                    Color
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 22px)', gap: '6px', marginBottom: '4px' }}>
                                    {COLOR_PRESETS.map((c) => (
                                        <div
                                            key={c}
                                            onClick={() => handleStrokeSelect(c)}
                                            style={{
                                                width: 22,
                                                height: 22,
                                                borderRadius: '4px',
                                                backgroundColor: c,
                                                cursor: 'pointer',
                                                border: selectedStroke.toLowerCase() === c.toLowerCase() ? '2px solid #106ba3' : '1px solid rgba(0,0,0,0.2)',
                                                boxShadow: selectedStroke.toLowerCase() === c.toLowerCase() ? '0 0 0 1px #fff inset' : 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '12px' }}>Custom:</span>
                                    <input
                                        type="color"
                                        value={selectedStroke}
                                        onChange={(e) => handleStrokeSelect(e.target.value)}
                                        style={{ width: '28px', height: '24px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                                    />
                                </div>

                                <MenuDivider />

                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#5f6b7c', textTransform: 'uppercase', marginBottom: '2px' }}>
                                    Dash Style
                                </div>
                                <Menu style={{ padding: 0, minWidth: 'unset' }}>
                                    {DASH_STYLES.map((dash) => {
                                        const isActive = selectedDashing[0] === dash.dashing[0];
                                        const strokeColor = isActive ? '#fff' : '#182026';
                                        return (
                                            <MenuItem
                                                key={dash.id}
                                                active={isActive}
                                                onClick={() => handleDashingSelect(dash.dashing)}
                                                text={
                                                    <div style={{ display: 'flex', alignItems: 'center', height: '18px', width: '70px' }}>
                                                        <svg width="70" height="12" style={{ display: 'block', overflow: 'visible' }}>
                                                            <line
                                                                x1="2"
                                                                y1="6"
                                                                x2="68"
                                                                y2="6"
                                                                stroke={strokeColor}
                                                                strokeWidth="2.5"
                                                                strokeDasharray={dash.dashing[0] > 0 ? `${dash.dashing[0]} ${dash.dashing[1]}` : undefined}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </div>
                                                }
                                            />
                                        );
                                    })}
                                </Menu>
                            </div>
                        </div>
                    }
                    position="top"
                    minimal={true}
                >
                    <Button
                        icon="caret-up"
                        active={selectedTool.type === 'arrow'}
                        intent={selectedTool.type === 'arrow' ? 'primary' : 'none'}
                        variant="minimal"
                        style={{ minWidth: "16px", padding: 0 }}
                    />
                </Popover>
            </ButtonGroup>
        </div>
    );
});

export default CanvasToolToolbar;

