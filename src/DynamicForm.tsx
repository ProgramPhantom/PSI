import React, { ChangeEvent, useState } from 'react'
import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import componentMapper from '@data-driven-forms/mui-component-mapper/component-mapper';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';


//import * as schema from "./vanilla/default/types/testSchema.json"
import {simplePulseSchema} from "./vanilla/default/types/simplePulseSchema";
import {svgPulseSchema} from "./vanilla/default/types/svgPulseSchema";
import {spanSchema} from "./vanilla/default/types/spanSchema";
import {abstractSchema} from "./vanilla/default/types/abstractSchema";

import { simplePulses } from './vanilla/default/data/simplePulse';
import { svgPulses } from './vanilla/default/data/svgPulse';
import { allTemporal } from './vanilla/default/data';

import { Schema } from '@data-driven-forms/react-form-renderer';



function DynamicForm(props: {AddCommand: (line: string) => void, temporalName: string, channelName: string,}) {

    var currSchema: Schema = {"fields": []};
    if (Object.keys(simplePulses).includes(props.temporalName)) {
        currSchema = simplePulseSchema({...(simplePulses[props.temporalName as keyof typeof simplePulses] as any)});
    } else if (Object.keys(svgPulses).includes(props.temporalName)) {
        currSchema = svgPulseSchema({...(svgPulses[props.temporalName as keyof typeof svgPulses] as any)});
    } else if (props.temporalName === "span") {
        currSchema = spanSchema({...(allTemporal[props.temporalName as keyof typeof allTemporal] as any)});
    } else if (props.temporalName === "abstract") {
         currSchema = abstractSchema({...(allTemporal[props.temporalName as keyof typeof allTemporal] as any)});
    }
    


    function CreateCommand(f: any) {
        
        
        var command = props.channelName + "." + props.temporalName + "(";
        var toInclude: string[] = [];

        for (const kv of Object.entries(f.dirtyFields)) {
            toInclude.push(kv[0]);
        }

        toInclude.forEach((prop) => {
            var subProps = prop.split(".");
            var obj = {...f.values};
            while(subProps.length) { obj = obj[subProps.shift()!]; }
            command += prop + "=" + obj + ",";
        })
        command += ")";

        props.AddCommand(command);
    }

    return (
        
            
        <FormRenderer schema={currSchema}
                        componentMapper={componentMapper}
                        FormTemplate={FormTemplate}
                        onSubmit={(values, form) => CreateCommand(form.getState())}
                        
                        ></FormRenderer>
            
        
    )
}

export default DynamicForm