import { ColumnDef, getCoreRowModel, InitialTableState, TableState, useReactTable } from "@tanstack/react-table"
import DataTable from "./DataTable"
import { useMemo, useState } from "react"
import { GroupResponse, ODataResponse, ReadOperation } from "../requests/useApi"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TableProps } from "@mantine/core"
import { QueryOptions } from "odata-query"
import { useTranslation } from "react-i18next"
import { IconExclamationCircleFilled, IconPlus, IconRefresh } from "@tabler/icons-react"

export interface ServerDataTableProps<T> {
    columnsDefs: ColumnDef<T>[]
    initialState?: InitialTableState
    options?: TableProps,
    api: ReadOperation<T>
    actions?: { icon?: React.ReactNode, label?: string, action: () => any }[]
    title?: string
    allowRefresh?: boolean
    queryKey:string
}

export default function ServerDataTable<T>(props: ServerDataTableProps<T>) {
    const { t } = useTranslation()
    const table = useReactTable({
        columns: props.columnsDefs,
        data: [],
        getCoreRowModel: getCoreRowModel(),
        manualFiltering: true,
        manualSorting: true,
        manualPagination: true,
        manualGrouping: true,
        debugAll: true,
        initialState: props.initialState
    })

    const [tableState, setTableState] = useState<TableState>({
        ...table.initialState,
    })

    const apiQuery: Partial<QueryOptions<T>> = {
        filter: tableState.columnFilters.map(f => f.value).flat(1) as string[],
        orderBy: tableState.sorting.map(s => `${s.id} ${s.desc ? 'desc' : 'asc'}`).join(','),
        top: tableState.pagination.pageSize,
        skip: tableState.pagination.pageIndex * tableState.pagination.pageSize,
        count: true,
        transform: tableState.grouping.length > 0 ? {
            groupBy: {
                properties: tableState.grouping,
                transform: {
                    aggregate: {
                        $count: {
                            as: '$count'
                        }
                    }
                }
            }
        } : undefined
    }

    const query = useQuery({
        queryKey: [props.queryKey, apiQuery],
        queryFn: () => props.api.read(apiQuery),
        placeholderData: keepPreviousData
    })

    const data = useMemo(() => {
        return query.data?.value ?? []
    }, [query.data])

    const rowCount = useMemo(() => {
        return query.data?.["@odata.count"]
    }, [query.data])

    table.setOptions(prev => ({
        ...prev,
        ...{
            onStateChange: (updater) => {
                const newTableState = updater instanceof Function ?
                    updater(tableState) : updater
                const filtersChanged = newTableState.columnFilters != tableState.columnFilters
                setTableState({
                    ...newTableState,
                    ...{
                        pagination: {
                            ...newTableState.pagination,
                            ...{
                                pageIndex: filtersChanged ? 0 : newTableState.pagination.pageIndex
                            }
                        }
                    }
                })
            },
            data,
            rowCount,
            state: tableState
        }
    }))
    const loading = query.isFetching
    const actions = [...(props.actions ?? []), ...[
        props.allowRefresh == undefined || props.allowRefresh == true ? {
            icon: <IconRefresh />,
            action: () => query.refetch(),
            disabled: loading
        } : undefined
    ]].filter(a => a != undefined)

    return <DataTable
        loading={loading}
        options={props.options}
        table={table}
        emptyMessage={query.isError ? t(`request.error.${query.error!.message}`) : undefined}
        emptyIcon={query.isError ? <IconExclamationCircleFilled size={32} /> : undefined}
        title={props.title}
        actions={actions}
    />
}