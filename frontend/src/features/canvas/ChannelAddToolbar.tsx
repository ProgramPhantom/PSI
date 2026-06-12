import { Button, ButtonGroup, Menu, MenuItem, Popover } from "@blueprintjs/core";
import { MathJax } from "better-react-mathjax";
import React from "react";
import ENGINE from "../../logic/engine";
import { CHANNEL_13C, CHANNEL_19F, CHANNEL_1H, CHANNEL_Gz, CHANNEL_15N, CHANNEL_2H, CHANNEL_31P, CHANNEL_29Si, CHANNEL_11B, CHANNEL_27Al } from "../../logic/default/channels";
import { useAppDispatch } from "../../redux/hooks";
import { setSelectedElementId } from "../../redux/slices/applicationSlice";

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
        >
            <ButtonGroup>
            <Button size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_13C)}>
                <MathJax>{`\\(^{13}\\textrm{C}\\)`}</MathJax>
            </Button>
            <Button size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_1H)}>
                <MathJax>{`\\(^{1}\\textrm{H}\\)`}</MathJax>
            </Button>
            <Button size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_19F)}>
                <MathJax>{`\\(^{19}\\textrm{F}\\)`}</MathJax>
            </Button>
            <Button size="small" style={{ width: "36px" }} onClick={() => addChannel(CHANNEL_Gz)}>
                <MathJax>{`\\(\\textrm{G}_z\\)`}</MathJax>
            </Button>
            <Popover minimal position={"bottom-right"} content={
                <Menu size="small" style={{ minWidth: "0px", width: "fit-content" }}>
                    <MenuItem onClick={() => addChannel(CHANNEL_15N)} text={<MathJax>{`\\(^{15}\\textrm{N}\\)`}</MathJax>} />
                    <MenuItem onClick={() => addChannel(CHANNEL_2H)} text={<MathJax>{`\\(^{2}\\textrm{H}\\)`}</MathJax>} />
                    <MenuItem onClick={() => addChannel(CHANNEL_31P)} text={<MathJax>{`\\(^{31}\\textrm{P}\\)`}</MathJax>} />
                    <MenuItem onClick={() => addChannel(CHANNEL_29Si)} text={<MathJax>{`\\(^{29}\\textrm{Si}\\)`}</MathJax>} />
                    <MenuItem onClick={() => addChannel(CHANNEL_11B)} text={<MathJax>{`\\(^{11}\\textrm{B}\\)`}</MathJax>} />
                    <MenuItem onClick={() => addChannel(CHANNEL_27Al)} text={<MathJax>{`\\(^{27}\\textrm{Al}\\)`}</MathJax>} />
                </Menu>
            }>
                <Button size="small" style={{ width: "36px" }}>...</Button>
            </Popover>
        </ButtonGroup>
        </div>
    );
});
