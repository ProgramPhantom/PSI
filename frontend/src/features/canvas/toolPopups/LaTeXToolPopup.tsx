import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setSelectedTool } from "../../../redux/slices/applicationSlice";

export const LaTeXToolPopup: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();
    const toolConfigs = useAppSelector((state) => state.application.toolConfigs);
    const selectedTool = useAppSelector((state) => state.application.selectedTool);
    const config = selectedTool.type === 'latex' ? selectedTool.config : toolConfigs?.latex;

    const selectedFontSize = config?.fontSize ?? 35;

    const handleLaTeXFontSizeSelect = (fontSize: number) => {
        dispatch(setSelectedTool({
            type: 'latex',
            config: {
                ...config,
                fontSize
            }
        }));
    };

    return (
        <Menu style={{ minWidth: 110 }}>
            <MenuDivider title="Font Size" />
            <MenuItem
                text="XS (15)"
                shouldDismissPopover={false}
                active={selectedFontSize === 15}
                onClick={() => handleLaTeXFontSizeSelect(15)}
            />
            <MenuItem
                text="S (25)"
                shouldDismissPopover={false}
                active={selectedFontSize === 25}
                onClick={() => handleLaTeXFontSizeSelect(25)}
            />
            <MenuItem
                text="M (35)"
                shouldDismissPopover={false}
                active={selectedFontSize === 35}
                onClick={() => handleLaTeXFontSizeSelect(35)}
            />
            <MenuItem
                text="L (45)"
                shouldDismissPopover={false}
                active={selectedFontSize === 45}
                onClick={() => handleLaTeXFontSizeSelect(45)}
            />
            <MenuItem
                text="XL (55)"
                shouldDismissPopover={false}
                active={selectedFontSize === 55}
                onClick={() => handleLaTeXFontSizeSelect(55)}
            />
            <MenuItem
                text="XXL (70)"
                shouldDismissPopover={false}
                active={selectedFontSize === 70}
                onClick={() => handleLaTeXFontSizeSelect(70)}
            />
        </Menu>
    );
});

export default LaTeXToolPopup;
