import { FormGroup, InputGroup, Tabs } from "@blueprintjs/core";
import { Controller, useForm } from "react-hook-form";


function TestForm() {
    const { control, handleSubmit, formState: {isDirty, dirtyFields} } = useForm();

    return (
        <form>
            <Tabs>
                <FormGroup>
                    <Controller name="test" control={control} render={({field}) => (
                        <InputGroup {...field} id="text" placeholder="hello" small={true}></InputGroup>
                    )}></Controller>
                </FormGroup>
            </Tabs>
        </form>
    )
}