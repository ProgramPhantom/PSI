import { Checkbox, Menu, MenuDivider, MenuItem, NumericInput } from "@blueprintjs/core";
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

const DEFAULT_CUSTOM_COLOR = "#2962ff";

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

function parseRgba(rgbaOrHex: string): { hex: string; alpha: number } {
    if (!rgbaOrHex || rgbaOrHex === "transparent" || rgbaOrHex === "none") {
        return { hex: "#137cbd", alpha: 0 };
    }
    const match = rgbaOrHex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        const r = parseInt(match[1], 10).toString(16).padStart(2, "0");
        const g = parseInt(match[2], 10).toString(16).padStart(2, "0");
        const b = parseInt(match[3], 10).toString(16).padStart(2, "0");
        const alpha = match[4] !== undefined ? parseFloat(match[4]) : 1;
        return { hex: `#${r}${g}${b}`, alpha: Math.round(alpha * 100) };
    }
    if (rgbaOrHex.startsWith("#")) {
        return { hex: rgbaOrHex, alpha: 100 };
    }
    return { hex: "#137cbd", alpha: 100 };
}

export const BoxToolPopup: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const toolConfigs = useAppSelector((state) => state.application.toolConfigs);
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const config = selectedTool.type === "box" ? selectedTool.config : toolConfigs?.box;

    const style = config?.style ?? {};
    const strokeWidth = style.strokeWidth ?? 2;
    const stroke = style.stroke ?? "#137cbd";
    const dashing: [number, number] = style.dashing ?? [0, 0];
    const rawFill: string = style.fill ?? "#137cbd";

    // Parse fill details
    const parsedFill = parseRgba(rawFill);
    const isFillCurrentlyEnabled = rawFill !== "transparent" && rawFill !== "none" && parsedFill.alpha > 0;

    const [isFillEnabled, setIsFillEnabled] = useState(isFillCurrentlyEnabled);
    const [baseFillColor, setBaseFillColor] = useState(parsedFill.hex);
    const [fillOpacity, setFillOpacity] = useState(parsedFill.alpha > 0 ? parsedFill.alpha : 100);

    // Custom colors state
    const isCustomStroke = stroke !== "transparent" && !COLOR_PRESETS.some(
        (c) => c.toLowerCase() === stroke.toLowerCase()
    );
    const [customStrokeColor, setCustomStrokeColor] = useState(
        isCustomStroke ? stroke : DEFAULT_CUSTOM_COLOR
    );

    const isCustomFill = isFillEnabled && !COLOR_PRESETS.some(
        (c) => c.toLowerCase() === baseFillColor.toLowerCase()
    );
    const [customFillColor, setCustomFillColor] = useState(
        isCustomFill ? baseFillColor : DEFAULT_CUSTOM_COLOR
    );

    useEffect(() => {
        const p = parseRgba(rawFill);
        const enabled = rawFill !== "transparent" && rawFill !== "none" && p.alpha > 0;
        setIsFillEnabled(enabled);
        if (enabled) {
            setBaseFillColor(p.hex);
            setFillOpacity(p.alpha);
        }
    }, [rawFill]);

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

    const handleCustomStrokeCheckboxChange = (checked: boolean) => {
        if (checked) {
            const colorToApply = !COLOR_PRESETS.some(c => c.toLowerCase() === customStrokeColor.toLowerCase())
                ? customStrokeColor
                : DEFAULT_CUSTOM_COLOR;
            setCustomStrokeColor(colorToApply);
            handleStrokeSelect(colorToApply);
        } else {
            handleStrokeSelect(COLOR_PRESETS[0]);
        }
    };

    const handleCustomStrokeBlur = (color: string) => {
        setCustomStrokeColor(color);
        handleStrokeSelect(color);
    };

    const handleCustomStrokePickerActivate = () => {
        if (!isCustomStroke) {
            handleCustomStrokeCheckboxChange(true);
        }
    };

    const handleDashingSelect = (dash: [number, number]) => {
        updateBoxConfig({ dashing: dash });
    };

    const handleToggleFill = (enabled: boolean) => {
        setIsFillEnabled(enabled);
        if (!enabled) {
            updateBoxConfig({ fill: "transparent" });
        } else {
            const opacity = fillOpacity > 0 ? fillOpacity : 100;
            if (fillOpacity === 0) setFillOpacity(100);
            if (opacity === 100) {
                updateBoxConfig({ fill: baseFillColor });
            } else {
                updateBoxConfig({ fill: hexToRgba(baseFillColor, opacity / 100) });
            }
        }
    };

    const handleOpacityChange = (valueAsNumber: number) => {
        if (isNaN(valueAsNumber)) return;
        const clamped = Math.max(0, Math.min(100, Math.round(valueAsNumber)));
        setFillOpacity(clamped);
        if (clamped === 0) {
            setIsFillEnabled(false);
            updateBoxConfig({ fill: "transparent" });
        } else {
            if (!isFillEnabled) setIsFillEnabled(true);
            if (clamped === 100) {
                updateBoxConfig({ fill: baseFillColor });
            } else {
                updateBoxConfig({ fill: hexToRgba(baseFillColor, clamped / 100) });
            }
        }
    };

    const handleFillColorSelect = (hexColor: string) => {
        setBaseFillColor(hexColor);
        setIsFillEnabled(true);
        const opacity = fillOpacity > 0 ? fillOpacity : 100;
        if (fillOpacity === 0) setFillOpacity(100);
        if (opacity === 100) {
            updateBoxConfig({ fill: hexColor });
        } else {
            updateBoxConfig({ fill: hexToRgba(hexColor, opacity / 100) });
        }
    };

    const handleCustomFillCheckboxChange = (checked: boolean) => {
        if (checked) {
            const colorToApply = !COLOR_PRESETS.some(c => c.toLowerCase() === customFillColor.toLowerCase())
                ? customFillColor
                : DEFAULT_CUSTOM_COLOR;
            setCustomFillColor(colorToApply);
            handleFillColorSelect(colorToApply);
        } else {
            handleFillColorSelect(COLOR_PRESETS[0]);
        }
    };

    const handleCustomFillBlur = (color: string) => {
        setCustomFillColor(color);
        handleFillColorSelect(color);
    };

    const handleCustomFillPickerActivate = () => {
        if (!isCustomFill) {
            handleCustomFillCheckboxChange(true);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {/* Column 1: Border Thickness */}
            <Menu style={{ minWidth: 120 }}>
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
            </Menu>

            <div style={{ width: 1, backgroundColor: "rgba(200, 200, 200, 0.3)", margin: "4px 0" }} />

            {/* Column 2: Border Colour & Dash Style */}
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
                            onChange={(e) => handleCustomStrokeCheckboxChange((e.target as HTMLInputElement).checked)}
                            style={{ margin: 0 }}
                        />
                        <span
                            style={{ fontSize: "12px", cursor: "pointer" }}
                            onClick={() => handleCustomStrokeCheckboxChange(!isCustomStroke)}
                        >
                            Custom:
                        </span>
                        <input
                            type="color"
                            key={customStrokeColor}
                            defaultValue={customStrokeColor}
                            onPointerDown={handleCustomStrokePickerActivate}
                            onClick={handleCustomStrokePickerActivate}
                            onBlur={(e) => handleCustomStrokeBlur(e.target.value)}
                            style={{ width: "28px", height: "24px", padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
                        />
                    </div>
                </div>

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

            {/* Column 3: Fill Heading with Checkbox + Opacity + Fill Colours */}
            <Menu style={{ minWidth: 150 }}>
                <MenuDivider
                    title={
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <Checkbox
                                checked={isFillEnabled}
                                onChange={(e) => handleToggleFill((e.target as HTMLInputElement).checked)}
                                style={{ margin: 0 }}
                            />
                            <span
                                style={{ cursor: "pointer" }}
                                onClick={() => handleToggleFill(!isFillEnabled)}
                            >
                                Fill
                            </span>
                        </span>
                    }
                />
                <div
                    style={{
                        padding: "6px 8px 8px 8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        opacity: isFillEnabled ? 1 : 0.45,
                        pointerEvents: isFillEnabled ? "auto" : "none"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "#5f6b7c" }}>Opacity:</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                            <NumericInput
                                value={fillOpacity}
                                onValueChange={(val) => handleOpacityChange(val)}
                                min={0}
                                max={100}
                                clampValueOnBlur={true}
                                minorStepSize={1}
                                stepSize={5}
                                majorStepSize={10}
                                size="small"
                                style={{ width: "55px" }}
                                disabled={!isFillEnabled}
                            />
                            <span style={{ fontSize: "11px", color: "#5f6b7c" }}>%</span>
                        </div>
                    </div>

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
                                    border: isFillEnabled && baseFillColor.toLowerCase() === c.toLowerCase()
                                        ? "2px solid #106ba3"
                                        : "1px solid rgba(0,0,0,0.2)",
                                    boxShadow: isFillEnabled && baseFillColor.toLowerCase() === c.toLowerCase()
                                        ? "0 0 0 1px #fff inset"
                                        : "none"
                                }}
                            />
                        ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        <Checkbox
                            checked={isCustomFill}
                            onChange={(e) => handleCustomFillCheckboxChange((e.target as HTMLInputElement).checked)}
                            style={{ margin: 0 }}
                            disabled={!isFillEnabled}
                        />
                        <span
                            style={{ fontSize: "12px", cursor: isFillEnabled ? "pointer" : "default" }}
                            onClick={() => isFillEnabled && handleCustomFillCheckboxChange(!isCustomFill)}
                        >
                            Custom:
                        </span>
                        <input
                            type="color"
                            key={customFillColor}
                            defaultValue={customFillColor}
                            onPointerDown={handleCustomFillPickerActivate}
                            onClick={handleCustomFillPickerActivate}
                            onBlur={(e) => handleCustomFillBlur(e.target.value)}
                            disabled={!isFillEnabled}
                            style={{ width: "28px", height: "24px", padding: 0, border: "none", background: "transparent", cursor: isFillEnabled ? "pointer" : "default" }}
                        />
                    </div>
                </div>
            </Menu>
        </div>
    );
});

export default BoxToolPopup;
