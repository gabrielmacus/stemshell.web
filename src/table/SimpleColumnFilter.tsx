import { Column } from "@tanstack/react-table";
import ColumnFilter from "./ColumnFilter";
import { z } from 'zod'
import { NumberInput, TextInput } from "@mantine/core";
import { FieldValidators, Validator } from "@tanstack/react-form";
import renderFieldErrors from "../form/renderFieldErrors";

export interface SimpleColumnFilterProps<TData, TValue> {
    column: Column<TData, TValue>,
    inputType: 'string' | 'number',
    criteria: 'equals' | 'contains' | 'startsWith' | 'endsWith'
    label?: string
    placeholder?: string
    prop: string
    validators?: FieldValidators<Partial<{
        filter: any;
    }>, "filter", undefined, Validator<unknown, z.ZodType<any, z.ZodTypeDef, any>>, any>
}

export default function SimpleColumnFilter<TData, TValue>
    (props: SimpleColumnFilterProps<TData, TValue>) {
    const Input = props.inputType == 'string' ? TextInput : NumberInput

    return <ColumnFilter<{ filter: any }, TData, TValue>
        column={props.column}
        filterParser={(value) => {
            const filter = value.filter
            if (filter == '' || !filter) return []
            const val = props.inputType == 'number' ? `${filter}` : `'${filter}'`
            switch (props.criteria) {
                case 'contains': return [`contains(${props.prop}, ${val})`]
                case 'equals': return [`${props.prop} eq ${val}`]
                case 'endsWith': return [`endswith(${props.prop}, ${val})`]
                case 'startsWith': return [`startswith(${props.prop}, ${val})`]
            }
        }}
    >
        {(form) => <>
            <form.Field
                name="filter"
                validators={props.validators}
            >
                {(field) => <>
                    <Input
                        value={field.state.value ?? ''}
                        error={renderFieldErrors(field.state.meta.errors)}
                        onChange={(evt: any) => evt.target ?
                            field.handleChange(evt.target.value == '' ? undefined : evt.target.value) :
                            field.handleChange(evt == '' ? undefined : evt)}
                        onBlur={field.handleBlur}
                        placeholder={props.placeholder}
                        label={props.label}
                    />
                </>}
            </form.Field>
        </>}
    </ColumnFilter>
}