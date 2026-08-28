import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setSelectedTool } from "../../../redux/slices/applicationSlice";

export const TextToolPopup: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const config = selectedTool.type === 'text' ? selectedTool.config : undefined;

    const selectedFont = config?.fontFamily ?? 'sans-serif';
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

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Menu style={{ minWidth: 130 }}>
                <MenuDivider title="Font Family" />
                <MenuItem
                    text="Sans Serif"
                    shouldDismissPopover={false}
                    active={selectedFont === 'sans-serif'}
                    onClick={() => handleFontSelect('sans-serif')}
                    style={{ fontFamily: 'sans-serif' }}
                />
                <MenuItem
                    text="Serif"
                    shouldDismissPopover={false}
                    active={selectedFont === 'serif'}
                    onClick={() => handleFontSelect('serif')}
                    style={{ fontFamily: 'serif' }}
                />
                <MenuItem
                    text="Monospace"
                    shouldDismissPopover={false}
                    active={selectedFont === 'monospace'}
                    onClick={() => handleFontSelect('monospace')}
                    style={{ fontFamily: 'monospace' }}
                />
                <MenuItem
                    text="Georgia"
                    shouldDismissPopover={false}
                    active={selectedFont === 'Georgia, serif'}
                    onClick={() => handleFontSelect('Georgia, serif')}
                    style={{ fontFamily: 'Georgia, serif' }}
                />
                <MenuItem
                    text="Arial"
                    shouldDismissPopover={false}
                    active={selectedFont === 'Arial, sans-serif'}
                    onClick={() => handleFontSelect('Arial, sans-serif')}
                    style={{ fontFamily: 'Arial, sans-serif' }}
                />
                <MenuItem
                    text="Times New Roman"
                    shouldDismissPopover={false}
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
