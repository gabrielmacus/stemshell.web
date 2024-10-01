import { Button } from "@mantine/core";
import { FormApi, ReactFormApi } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";

export interface DataFormProps<T> {
    form: FormApi<Partial<T>, ReturnType<typeof zodValidator>> & ReactFormApi<Partial<T>, ReturnType<typeof zodValidator>>
    children: React.ReactNode
}

export default function DataForm<T>(props: DataFormProps<T>) {
    return <form onSubmit={(e) => {
        e.preventDefault()
        props.form.handleSubmit()
    }}>
        {props.children}
    </form>
}