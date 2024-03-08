import React, { ChangeEvent, useState } from 'react'
import { allTemporal } from './vanilla/default/data';
import {definitions} from "./vanilla/default/types"

import FormRenderer from '@data-driven-forms/react-form-renderer/form-renderer';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import componentMapper from '@data-driven-forms/mui-component-mapper/component-mapper';
import FormTemplate from '@data-driven-forms/pf4-component-mapper/form-template';

import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';


//import * as schema from "./vanilla/default/types/testSchema.json"
import {schema} from "./vanilla/default/types/simplePulseSchema"


function DynamicForm(props: {AddCommand: (line: string) => void, temporalName: string, channelName: string,}) {
    const [element, setElement] = useState<string>("pulse90");
    const formOptions = useFormApi();
    const [values, setValues] = useState({});

    function CreateCommand(v: any, f: any) {
        
        console.log(f)
        var command = props.channelName + "." + element + "(";
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
        <>
        <div>
            <FormRenderer schema={schema}
                componentMapper={componentMapper}
                FormTemplate={FormTemplate}
                onSubmit={(values, form) => CreateCommand(values, form.getState())}></FormRenderer>
        </div>
          
                
        </>
    )
}

export default DynamicForm