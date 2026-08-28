import { Button, Menu, MenuDivider, MenuItem, Popover } from "@blueprintjs/core";
import React from "react";
import { defaultLine } from "../../../logic/default/index";
import { HeadStyle } from "../../../logic/line";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setSelectedTool } from "../../../redux/slices/applicationSlice";

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

export const ArrowToolPopup: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const config = selectedTool.type === 'arrow' ? selectedTool.config : undefined;

    const selectedThickness = config?.thickness ?? (defaultLine.thickness ?? 2);
    const selectedHeadStyle: [HeadStyle, HeadStyle] = (config?.lineStyle?.headStyle as [HeadStyle, HeadStyle]) ??
        ((defaultLine.lineStyle?.headStyle as [HeadStyle, HeadStyle]) ?? ["none", "default"]);
    const selectedStroke = (config?.lineStyle?.stroke as string) ??
        ((defaultLine.lineStyle?.stroke as string) ?? "#000000");
    const selectedDashing = (config?.lineStyle?.dashing as [number, number]) ??
        ((defaultLine.lineStyle?.dashing as [number, number]) ?? [0, 0]);

    const updateArrowConfig = (partial: any) => {
        const currentConfig = {
            thickness: selectedThickness,
            lineStyle: {
                stroke: selectedStroke,
                dashing: selectedDashing,
                headStyle: selectedHeadStyle,
                ...(config?.lineStyle ?? {})
            },
            ...partial
        };

        if (partial.lineStyle) {
            currentConfig.lineStyle = {
                stroke: selectedStroke,
                dashing: selectedDashing,
                headStyle: selectedHeadStyle,
                ...partial.lineStyle
            };
        }

        dispatch(setSelectedTool({
            type: 'arrow',
            config: currentConfig
        }));
    };

    const handleStartHeadSelect = (startHead: HeadStyle) => {
        updateArrowConfig({
            lineStyle: {
                stroke: selectedStroke,
                dashing: selectedDashing,
                headStyle: [startHead, selectedHeadStyle[1]]
            }
        });
    };

    const handleEndHeadSelect = (endHead: HeadStyle) => {
        updateArrowConfig({
            lineStyle: {
                stroke: selectedStroke,
                dashing: selectedDashing,
                headStyle: [selectedHeadStyle[0], endHead]
            }
        });
    };

    const handleThicknessSelect = (thickness: number) => {
        updateArrowConfig({ thickness });
    };

    const handleStrokeSelect = (stroke: string) => {
        updateArrowConfig({
            lineStyle: {
                stroke,
                dashing: selectedDashing,
                headStyle: selectedHeadStyle
            }
        });
    };

    const handleDashingSelect = (dashing: [number, number]) => {
        updateArrowConfig({
            lineStyle: {
                stroke: selectedStroke,
                dashing,
                headStyle: selectedHeadStyle
            }
        });
    };

    return (
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
    );
});

export default ArrowToolPopup;
