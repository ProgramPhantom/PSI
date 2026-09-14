import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setSelectedTool } from "../../../redux/slices/applicationSlice";

export const TextToolPopup: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const toolConfigs = useAppSelector((state) => state.application.toolConfigs);
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const config = selectedTool.type === 'text' ? selectedTool.config : toolConfigs?.text;

    const selectedFont = config?.fontFamily ?? 'Helvetica, Arial, sans-serif';
    const selectedFontSize = config?.fontSize ?? 20;

    const handleFontSelect = (fontFamily: string) => {
        dispatch(setSelectedTool({
            type: 'text',
            config: {
                ...config,
                fontFamily
            }
        }));
    };

    const handleFontSizeSelect = (fontSize: number) => {
        dispatch(setSelectedTool({
            type: 'text',
            config: {
                ...config,
                fontSize
            }
        }));
    };

    const isFontActive = (font: string) => {
        if (selectedFont === font) return true;
        if (font === 'Helvetica, Arial, sans-serif' && (
            selectedFont === 'Helvetica, Arial, sans-serif' ||
            selectedFont === 'sans-serif' ||
            selectedFont === 'Arial' ||
            selectedFont === 'Arial, sans-serif' ||
            selectedFont === 'Helvetica' ||
            selectedFont === 'Helvetica, sans-serif'
        )) return true;
        if (font === 'Georgia, serif' && selectedFont === 'Georgia') return true;
        if (font === 'Times New Roman, serif' && selectedFont === 'Times New Roman') return true;
        return false;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Menu style={{ minWidth: 140 }}>
                <MenuDivider title="Font Family" />
                <MenuItem
                    text="Arial (Helvetica)"
                    shouldDismissPopover={false}
                    active={isFontActive('Helvetica, Arial, sans-serif')}
                    onClick={() => handleFontSelect('Helvetica, Arial, sans-serif')}
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                />
                <MenuItem
                    text="Serif"
                    shouldDismissPopover={false}
                    active={isFontActive('serif')}
                    onClick={() => handleFontSelect('serif')}
                    style={{ fontFamily: 'serif' }}
                />
                <MenuItem
                    text="Monospace"
                    shouldDismissPopover={false}
                    active={isFontActive('monospace')}
                    onClick={() => handleFontSelect('monospace')}
                    style={{ fontFamily: 'monospace' }}
                />
                <MenuItem
                    text="Georgia"
                    shouldDismissPopover={false}
                    active={isFontActive('Georgia, serif')}
                    onClick={() => handleFontSelect('Georgia, serif')}
                    style={{ fontFamily: 'Georgia, serif' }}
                />
                <MenuItem
                    text="Times New Roman"
                    shouldDismissPopover={false}
                    active={isFontActive('Times New Roman, serif')}
                    onClick={() => handleFontSelect('Times New Roman, serif')}
                    style={{ fontFamily: 'Times New Roman, serif' }}
                />
            </Menu>
            <div style={{ width: 1, backgroundColor: 'rgba(200, 200, 200, 0.3)', margin: '4px 0' }} />
            <Menu style={{ minWidth: 110 }}>
                <MenuDivider title="Font Size" />
                <MenuItem
                    text="XS (12)"
                    shouldDismissPopover={false}
                    active={selectedFontSize === 12}
                    onClick={() => handleFontSizeSelect(12)}
                />
                <MenuItem
                    text="S (16)"
                    shouldDismissPopover={false}
                    active={selectedFontSize === 16}
                    onClick={() => handleFontSizeSelect(16)}
                />
                <MenuItem
                    text="M (20)"
                    shouldDismissPopover={false}
                    active={selectedFontSize === 20}
                    onClick={() => handleFontSizeSelect(20)}
                />
                <MenuItem
                    text="L (28)"
                    shouldDismissPopover={false}
                    active={selectedFontSize === 28}
                    onClick={() => handleFontSizeSelect(28)}
                />
                <MenuItem
                    text="XL (36)"
                    shouldDismissPopover={false}
                    active={selectedFontSize === 36}
                    onClick={() => handleFontSizeSelect(36)}
                />
                <MenuItem
                    text="XXL (48)"
                    shouldDismissPopover={false}
                    active={selectedFontSize === 48}
                    onClick={() => handleFontSizeSelect(48)}
                />
            </Menu>
        </div>
    );
});

export default TextToolPopup;
