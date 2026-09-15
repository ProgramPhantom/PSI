import { Button, ButtonGroup, Menu, MenuItem, Popover } from "@blueprintjs/core";
import React from "react";
import ENGINE from "../../logic/engine";
import { CHANNEL_13C, CHANNEL_19F, CHANNEL_1H, CHANNEL_Gz, CHANNEL_15N, CHANNEL_2H, CHANNEL_31P, CHANNEL_29Si, CHANNEL_11B, CHANNEL_27Al, CHANNEL_RF } from "../../logic/default/channels";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";
import styles from "./styles/toolbars.module.scss";

export const ChannelAddToolbar: React.FC = React.memo(() => {
    const dispatch = useAppDispatch();

    const addChannel = (channelTemplate: any) => {
        const newChannel = JSON.parse(JSON.stringify(channelTemplate));

        // Generate IDs for the channel and its children to prevent conflicts
        newChannel.id = Math.random().toString(16).slice(2);

        if (ENGINE.handler.diagram.sequences.length > 0) {
            newChannel.parentId = ENGINE.handler.diagram.sequences[0].id;
        } else {
            newChannel.parentId = ENGINE.handler.diagram.id;
        }

        if (newChannel.children) {
            newChannel.children = newChannel.children.map((child: any) => ({
                ...child,
                id: Math.random().toString(16).slice(2)
            }));
        }

        ENGINE.handler.act({
            type: "add",
            input: {
                child: newChannel
            }
        });

        dispatch(setSelectedElementId(newChannel.id));
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={styles["frosted-toolbar"]}
        >
            <ButtonGroup>
                <Button variant="minimal" size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_13C)}>
                    <span><sup>13</sup>C</span>
                </Button>
                <Button variant="minimal" size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_1H)}>
                    <span><sup>1</sup>H</span>
                </Button>
                <Button variant="minimal" size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_19F)}>
                    <span><sup>19</sup>F</span>
                </Button>
                <Button variant="minimal" size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_Gz)}>
                    <span>G<sub>z</sub></span>
                </Button>
                <Button variant="minimal" size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_RF)}>
                    <span>RF</span>
                </Button>
                <Popover minimal position={"bottom-right"} content={
                    <Menu size="small" style={{ minWidth: "0px", width: "fit-content" }}>
                        <MenuItem onClick={() => addChannel(CHANNEL_15N)} text={<span><sup>15</sup>N</span>} />
                        <MenuItem onClick={() => addChannel(CHANNEL_2H)} text={<span><sup>2</sup>H</span>} />
                        <MenuItem onClick={() => addChannel(CHANNEL_31P)} text={<span><sup>31</sup>P</span>} />
                        <MenuItem onClick={() => addChannel(CHANNEL_29Si)} text={<span><sup>29</sup>Si</span>} />
                        <MenuItem onClick={() => addChannel(CHANNEL_11B)} text={<span><sup>11</sup>B</span>} />
                        <MenuItem onClick={() => addChannel(CHANNEL_27Al)} text={<span><sup>27</sup>Al</span>} />
                    </Menu>
                }>
                    <Button variant="minimal" size="small" style={{ width: "36px" }}>...</Button>
                </Popover>
            </ButtonGroup>
        </div>
    );
});
