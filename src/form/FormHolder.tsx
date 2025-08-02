import { DefaultValues, FormProvider, useForm } from "react-hook-form";
import IForm, { FormDescriptor } from "./FormBase";
import { IElement } from "../vanilla/point";
import { IVisual, Visual } from "../vanilla/visual";
import { IChannel } from "../vanilla/channel";
import { defaultChannel } from "../vanilla/default/data";
import ChannelForm from "./ChannelForm";
import ENGINE from "../vanilla/engine";


interface FormHolder {
    target?:  Visual,
}

export interface FormRequirements {
    onSubmit: (data: IChannel) => void;
}


export function FormHolder(props: FormHolder) {
    var channelData: IChannel = (defaultChannel as any);


    const formControls = useForm<IVisual>({
        defaultValues: props.target?.state! as DefaultValues<IVisual>,
        mode: "onChange"
    });
    var form: React.FC | undefined = (props.target?.constructor as typeof Visual)?.form;

    if (form === undefined) {
        form = ChannelForm
    }

    return (
        <>
        <FormProvider {...formControls}>
            <form onSubmit={() => {}}>
                <div style={{display: "flex", flexDirection: "row", width: "100%"}}>
                    <h3>{props.target ? props.target.refName : "New Channel"}</h3>

                    {props.target !== undefined ? (
                        <button style={{width: "30", height: "30", justifySelf: "end"}} onClick={() => deleteMe()}>
                                Delete
                        </button>
                    ) : <></>}
                </div>
                
                {formControls ? form({}) : <></>}

                <input style={{width: "100%", margin: "4px 2px 18px 2px", height: "30px"}} 
                    type={"submit"} value={props.target !== undefined ? "Modify" : "Add"}></input>
            </form>
        </FormProvider>

        </>
    );
}