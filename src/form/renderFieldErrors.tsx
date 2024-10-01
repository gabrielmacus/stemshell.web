import { Stack } from "@mantine/core";
import { ValidationError } from "@tanstack/react-form";



export default function renderFieldErrors(errors: ValidationError[]) {
    if (errors.length == 0) return
    return <>{errors.map(e => e).join('\n')}</>
}