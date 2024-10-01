import { FormApi, ReactFormApi, useForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import DataForm from "./DataForm"
import { useTranslation } from "react-i18next"
import { Box, Button, Flex, LoadingOverlay, Notification, Stack } from "@mantine/core"
import { IconDeviceFloppy, IconRefresh, IconX } from "@tabler/icons-react"
import { useMutation, UseMutationResult, useQuery, UseQueryResult } from "@tanstack/react-query"
import { ODataResponse, ReadOperation } from "../requests/useApi"

export interface ServerDataFormProps<T> {
    children: (form: FormApi<Partial<T>, ReturnType<typeof zodValidator>> & ReactFormApi<Partial<T>, ReturnType<typeof zodValidator>>) =>
        React.ReactNode
    submitText?: string
    resetText?: string
    query?: UseQueryResult<ODataResponse<T[]> | undefined, Error>
    mutation: UseMutationResult<void, Error, Partial<T>, unknown>
}

export default function ServerDataForm<T>(props: ServerDataFormProps<T>) {
    const { t } = useTranslation()
    const item = props.query?.data?.value.at(0)

    const form = useForm<Partial<T>, ReturnType<typeof zodValidator>>({
        validatorAdapter: zodValidator(),
        defaultValues: item,
        onSubmit: ({ value }) => {
            props.mutation.mutate(value)
        }
    })

    return <DataForm<T>
        form={form}>
        <Stack gap={'lg'} >
            <Box pos={'relative'}>
                {props.children(form)}
                <LoadingOverlay
                    visible={props.query?.isFetching}
                    zIndex={1000}
                    overlayProps={{ blur: 1, bg: 'transparent' }}
                    loaderProps={{ size: 'sm' }}
                />
            </Box>
            {props.mutation.error?.message}
            <Notification icon={<IconX size={20} />} title="Error al leer los datos" color="red">
                {props.query?.error?.message}
            </Notification>
            <Flex gap={'sm'} justify={'flex-end'}>
                <Button disabled={props.query?.isFetching}
                    loading={props.mutation.isPending}
                    type="submit"
                    rightSection={<IconDeviceFloppy />}>{props.submitText ?? t('form.save')}</Button>
                <Button disabled={props.mutation.isPending || props.query?.isFetching}
                    variant="outline"
                    color="red"
                    rightSection={<IconRefresh />}>{props.submitText ?? t('form.reset')}</Button>
            </Flex>
        </Stack>
    </DataForm>
}