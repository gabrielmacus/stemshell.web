import { Button, Flex, Stack, TextInput } from "@mantine/core"
import { IconRefresh, IconSearch } from "@tabler/icons-react"
import { FormApi, ReactFormApi, useForm } from "@tanstack/react-form"
import { Column } from "@tanstack/react-table"
import { useTranslation } from "react-i18next"
import { zodValidator } from "@tanstack/zod-form-adapter"
import { useFilterPopoverContext } from "./DataTable"
import { Filter } from "odata-query"

export interface ColumnFiltersProps<TFilter, TData, TValue> {
    column: Column<TData, TValue>,
    children: (form: FormApi<Partial<TFilter>, ReturnType<typeof zodValidator>> &
        ReactFormApi<Partial<TFilter>, ReturnType<typeof zodValidator>>) => React.ReactNode
    filterParser: (value: TFilter) => Filter<TData>
    onSubmit?: (parsedFilter: Filter<TData>) => any
}

export default function ColumnFilter<TFilter, TData, TValue>(props: ColumnFiltersProps<TFilter, TData, TValue>) {
    const { t } = useTranslation()
    const filterPopoverContext = useFilterPopoverContext()
    const form = useForm<Partial<TFilter>, ReturnType<typeof zodValidator>>({
        defaultValues: {},
        validatorAdapter: zodValidator(),
        onSubmit: (({ value }) => {
            const filter = props.filterParser(value as TFilter)
            props.column.setFilterValue(filter)
            props.onSubmit?.(filter)
            filterPopoverContext.close()
        })
    })

    const resetSearch = () => {
        form.reset()
        props.column.setFilterValue(undefined)
        filterPopoverContext.close()
    }
    return <form onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
    }}>
        <Stack
            gap={'xxs'}
            mb={'md'}
        >
            {props.children(form)}
        </Stack>
        <Flex justify={'flex-end'} gap={'xxs'}>
            <Button size="xs"
                flex={1}
                variant="default"
                onClick={resetSearch}
                rightSection={<IconRefresh size={13} />}
            >
                {t('form.reset')}
            </Button>
            <Button size="xs"
                type="submit"
                flex={1}
                rightSection={<IconSearch size={13} />}>{t('form.search')}</Button>
        </Flex>
    </form>
}