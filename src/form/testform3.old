import { Controller, useFormContext } from "react-hook-form";
import { IChannel } from "../vanilla/channel";



class complexObject {
    public num: number = 1;

    constructor(public prop: string) {

    }
}

interface smallDataStructure {
    name: string
}

interface dsWithClass {
    obj: complexObject[]
    name: string
}


const ChannelForm: React.FC = () => {
    const formControls = useFormContext();

    return (
        <Controller control={formControls.control}></Controller>
    )
}