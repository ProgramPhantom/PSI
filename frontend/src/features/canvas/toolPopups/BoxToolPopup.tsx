import { Button, ButtonGroup, Checkbox, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import React, { useEffect, useState } from "react";
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

function hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return hex;
}

function extractHexFromRgba(rgba: string): string {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const r = parseInt(match[1], 10).toString(16).padStart(2, "0");
        const g = parseInt(match[2], 10).toString(16).padStart(2, "0");
        const b = parseInt(match[3], 10).toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
    }
    if (rgba.startsWith("#")) return rgba;
    return "#137cbd";
}

type FillMode = "none" | "tint" | "solid";

export const BoxToolPopup: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const toolConfigs = useAppSelector((state) => state.application.toolConfigs);
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const config = selectedTool.type === "box" ? selectedTool.config : toolConfigs?.box;

    const style = config?.style ?? {};
    const strokeWidth = style.strokeWidth ?? 2;
    const stroke = style.stroke ?? "#137cbd";
    const dashing: [number, number] = style.dashing ?? [0, 0];
    const rawFill: string = style.fill ?? "rgba(19, 124, 189, 0.1)";

    // Determine fill mode and base color
    let initialFillMode: FillMode = "tint";
    if (rawFill === "transparent" || rawFill === "none") {
        initialFillMode = "none";
    } else if (rawFill.startsWith("rgba")) {
        initialFillMode = "tint";
    } else {
        initialFillMode = "solid";
    }

    const [fillMode, setFillMode] = useState<FillMode>(initialFillMode);
    const baseFillColor = extractHexFromRgba(rawFill);

    const isCustomStroke = !COLOR_PRESETS.some(
        (c) => c.toLowerCase() === stroke.toLowerCase()
    );
    const [customStrokeColor, setCustomStrokeColor] = useState(
        isCustomStroke ? stroke : "#137cbd"
    );

    const isCustomFill = !COLOR_PRESETS.some(
        (c) => c.toLowerCase() === baseFillColor.toLowerCase()
    );
    const [customFillColor, setCustomFillColor] = useState(
        isCustomFill ? baseFillColor : "#137cbd"
    );

    useEffect(() => {
        if (!COLOR_PRESETS.some((c) => c.toLowerCase() === stroke.toLowerCase())) {
            setCustomStrokeColor(stroke);
        }
    }, [stroke]);

    const updateBoxConfig = (partialStyle: any) => {
        const updatedStyle = {
            strokeWidth,
            stroke,
            dashing,
            fill: rawFill,
            ...style,
            ...partialStyle
        };

        dispatch(setSelectedTool({
            type: "box",
            config: {
                ...config,
                style: updatedStyle
            }
        }));
    };

    const handleStrokeWidthSelect = (width: number) => {
        updateBoxConfig({ strokeWidth: width });
    };

    const handleStrokeSelect = (color: string) => {
        updateBoxConfig({ stroke: color });
    };

    const handleDashingSelect = (dash: [number, number]) => {
        updateBoxConfig({ dashing: dash });
    };

    const handleFillModeChange = (mode: FillMode) => {
        setFillMode(mode);
        if (mode === "none") {
            updateBoxConfig({ fill: "transparent" });
        } else if (mode === "tint") {
            updateBoxConfig({ fill: hexToRgba(baseFillColor, 0.15) });
        } else {
            updateBoxConfig({ fill: baseFillColor });
        }
    };

    const handleFillColorSelect = (hexColor: string) => {
        if (fillMode === "none") {
            setFillMode("tint");
            updateBoxConfig({ fill: hexToRgba(hexColor, 0.15) });
        } else if (fillMode === "tint") {
            updateBoxConfig({ fill: hexToRgba(hexColor, 0.15) });
        } else {
            updateBoxConfig({ fill: hexColor });
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {/* Column 1: Border Thickness & Dash Style */}
            <Menu style={{ minWidth: 130 }}>
                <MenuDivider title="Border" />
                {[0, 1, 2, 3, 4, 6].map((width) => {
                    const isActive = strokeWidth === width;
                    return (
                        <MenuItem
                            key={width}
                            shouldDismissPopover={false}
                            active={isActive}
                            onClick={() => handleStrokeWidthSelect(width)}
                            text={
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px" }}>
                                    <div
                                        style={{
                                            width: "45px",
                                            height: width === 0 ? "1px" : `${width}px`,
                                            backgroundColor: width === 0 ? "transparent" : "#182026",
                                            borderTop: width === 0 ? "1px dotted #ccc" : "none",
                                            borderRadius: "1px"
                                        }}
                                    />
                                    <span style={{ fontSize: "11px", fontFamily: "monospace" }}>
                                        {width === 0 ? "None" : `${width}px`}
                                    </span>
                                </div>
                            }
                        />
                    );
                })}

                <MenuDivider title="Dash Style" />
                {DASH_STYLES.map((dash) => {
                    const isActive = dashing[0] === dash.dashing[0];
                    return (
                        <MenuItem
                            key={dash.id}
                            shouldDismissPopover={false}
                            active={isActive}
                            onClick={() => handleDashingSelect(dash.dashing)}
                            text={
                                <div style={{ display: "flex", alignItems: "center", height: "18px", width: "70px" }}>
                                    <svg width="70" height="12" style={{ display: "block", overflow: "visible" }}>
                                        <line
                                            x1="2"
                                            y1="6"
                                            x2="68"
                                            y2="6"
                                            stroke="#182026"
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

            <div style={{ width: 1, backgroundColor: "rgba(200, 200, 200, 0.3)", margin: "4px 0" }} />

            {/* Column 2: Border Colour */}
            <Menu style={{ minWidth: 140 }}>
                <MenuDivider title="Border Colour" />
                <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 22px)", gap: "6px" }}>
                        {COLOR_PRESETS.map((c) => (
                            <div
                                key={c}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStrokeSelect(c);
                                }}
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: "4px",
                                    backgroundColor: c,
                                    cursor: "pointer",
                                    border: stroke.toLowerCase() === c.toLowerCase() ? "2px solid #106ba3" : "1px solid rgba(0,0,0,0.2)",
                                    boxShadow: stroke.toLowerCase() === c.toLowerCase() ? "0 0 0 1px #fff inset" : "none"
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        <Checkbox
                            checked={isCustomStroke}
                            onChange={(e) => {
                                const checked = (e.target as HTMLInputElement).checked;
                                handleStrokeSelect(checked ? customStrokeColor : COLOR_PRESETS[0]);
                            }}
                            style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: "12px" }}>Custom:</span>
                        <input
                            type="color"
                            key={customStrokeColor}
                            defaultValue={customStrokeColor}
                            onBlur={(e) => {
                                setCustomStrokeColor(e.target.value);
                                handleStrokeSelect(e.target.value);
                            }}
                            style={{ width: "28px", height: "24px", padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
                        />
                    </div>
                </div>
            </Menu>

            <div style={{ width: 1, backgroundColor: "rgba(200, 200, 200, 0.3)", margin: "4px 0" }} />

            {/* Column 3: Fill Style & Colour */}
            <Menu style={{ minWidth: 140 }}>
                <MenuDivider title="Fill" />
                <div style={{ padding: "6px 8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <ButtonGroup fill={true} style={{ marginBottom: "2px" }}>
                        <Button
                            size="small"
                            text="None"
                            active={fillMode === "none"}
                            intent={fillMode === "none" ? "primary" : "none"}
                            onClick={() => handleFillModeChange("none")}
                        />
                        <Button
                            size="small"
                            text="Tint"
                            active={fillMode === "tint"}
                            intent={fillMode === "tint" ? "primary" : "none"}
                            onClick={() => handleFillModeChange("tint")}
                        />
                        <Button
                            size="small"
                            text="Solid"
                            active={fillMode === "solid"}
                            intent={fillMode === "solid" ? "primary" : "none"}
                            onClick={() => handleFillModeChange("solid")}
                        />
                    </ButtonGroup>

                    {fillMode !== "none" && (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 22px)", gap: "6px" }}>
                                {COLOR_PRESETS.map((c) => (
                                    <div
                                        key={c}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFillColorSelect(c);
                                        }}
                                        style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: "4px",
                                            backgroundColor: c,
                                            cursor: "pointer",
                                            border: baseFillColor.toLowerCase() === c.toLowerCase() ? "2px solid #106ba3" : "1px solid rgba(0,0,0,0.2)",
                                            boxShadow: baseFillColor.toLowerCase() === c.toLowerCase() ? "0 0 0 1px #fff inset" : "none"
                                        }}
                                    />
                                ))}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                <Checkbox
                                    checked={isCustomFill}
                                    onChange={(e) => {
                                        const checked = (e.target as HTMLInputElement).checked;
                                        handleFillColorSelect(checked ? customFillColor : COLOR_PRESETS[0]);
                                    }}
                                    style={{ margin: 0 }}
                                />
                                <span style={{ fontSize: "12px" }}>Custom:</span>
                                <input
                                    type="color"
                                    key={customFillColor}
                                    defaultValue={customFillColor}
                                    onBlur={(e) => {
                                        setCustomFillColor(e.target.value);
                                        handleFillColorSelect(e.target.value);
                                    }}
                                    style={{ width: "28px", height: "24px", padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Menu>
        </div>
    );
});

export default BoxToolPopup;
