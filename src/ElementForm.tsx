
import { simplePulses } from './vanilla/default/data/simplePulse';
import { svgPulses } from './vanilla/default/data/svgPulse';

import { Field, FormTemplateRenderProps, Schema, useFormApi } from '@data-driven-forms/react-form-renderer';
import SequenceHandler from './vanilla/sequenceHandler';
import LabelForm from './form/LabelForm';
import { Tab, Tabs, TabsExpander } from '@blueprintjs/core';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import ArrowForm from './form/ArrowForm';
import SimpleForm from './form/SimpleForm';

import { positionalElements } from './vanilla/default/data';
import { ISimplePulse } from './vanilla/pulses/simple/simplePulse';
import { ISvgPulse } from './vanilla/pulses/image/svgPulse';
import { IChannel } from './vanilla/channel';
import SVGForm from './form/SVGForm';
import Parser from './vanilla/parser';


type ElementType = ISimplePulse | ISvgPulse | IChannel;


function ElementForm(props: {AddCommand: (line: string) => void, commandName: string, channelName: string}) {

    var defaultValues = positionalElements[props.commandName as keyof typeof positionalElements];
    
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm<ElementType>({
        defaultValues: {...(defaultValues as any)},
        mode: "onChange"
    });
    

    var relevantForm = <h1>BROKEN</h1>;
    if (Object.keys(simplePulses).includes(props.commandName)) {
        relevantForm = <SimpleForm control={control} change={changedForm}></SimpleForm>
    } else if (Object.keys(svgPulses).includes(props.commandName)) {
        relevantForm = <SVGForm control={control} change={changedForm}></SVGForm>
    } else if (props.commandName === "span") {
        
    } else if (props.commandName === "abstract") {
         
    } else if (props.commandName === "[" || props.commandName === "]") {
        
    } else if (props.commandName === "section") {
        
    } else if (props.commandName === "~") {
        
    } else if (props.commandName === "|") {
        
    }

    function changedForm() {
        
    }
    
    const onSubmit = (data: FieldValues) => {
        CreateCommand(data)
    };

    
    function CreateCommand(values: any) {
        if (Object.keys(Parser.ChannelUtil).includes(props.commandName)) {
            // Special command!
            if (props.commandName === "~") {
                var command = props.commandName + dirty.values.identifier + "(";
                delete dirty.dirtyFields.identifier;
            } else {
                var command = props.commandName + props.channelName + "(";
            }
            
        } else {
            var command = props.channelName + "." + props.commandName + "(";
        }

        var toInclude: string[] = [];

       //for (const kv of Object.entries(dirty.dirtyFields)) {
       //    toInclude.push(kv[0]);
       //}  // Collect changed fields

        toInclude.forEach((prop) => {
            var subProps = prop.split(".");
            var obj = {...f.values};
            while(subProps.length) { obj = obj[subProps.shift()!]; }  // Access argument from prop names
            command += prop + "=" + obj + ",";
        })

        var prefix = "";
        var tempVal = {}
        function buildCommand(dirties: any, values: any, currPrefix: string) {
            Object.entries(dirties).forEach(([k, v]) => {
                
                
                

                ;
                if (typeof v === "object" && 
                    !Array.isArray(v) &&
                    v !== null) { // If object but not array
                    
                    buildCommand(v, values[k], currPrefix + k + ".");
                } else {
                    

                    
                    if (Array.isArray(values[k])) {
                        command += currPrefix + k + "=[" + values[k] as string + "],";
                    } else if (parseInt(values[k] as string)) {
                        command += currPrefix  + k + "=" + values[k] as string + ",";
                    } else {
                        command += currPrefix + k + '="' + values[k] as string + '",';
                    }
                    
                    
                }}
            )
        }
        buildCommand(dirtyFields, values, "")
        command += ")";
        

        props.AddCommand(command);
    }
    

    return (
        <>
            <form onSubmit={control.handleSubmit(onSubmit)}>
                {relevantForm}

                <input type={"submit"}></input>
            </form>
        </>
    )
}

export default ElementForm