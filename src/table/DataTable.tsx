import { ActionIcon, Box, Button, Flex, LoadingOverlay, Table as MTable, Pagination, Popover, Skeleton, Stack, TableProps, Text, Title } from "@mantine/core";
import { IconCaretUpDown, IconCaretUpDownFilled, IconDatabaseOff, IconFilterFilled, IconRefresh, IconSortAscending, IconSortDescending, IconSquareFilled, IconSquaresFilled } from "@tabler/icons-react";
import { Column, flexRender, RowData, Table } from "@tanstack/react-table";
import clsx from 'clsx';
import classes from './DataTable.module.scss'
import { createContext, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData extends RowData, TValue> {
        filterContent?: (column: Column<TData, TValue>) =>
            React.ReactNode
    }
}

export interface DataTableProps<T> {
    table: Table<T>
    options?: TableProps
    actions?: { icon?: React.ReactNode, label?: string, action: () => any, disabled?: boolean }[]
    loading?: boolean
    emptyIcon?: React.ReactNode
    emptyMessage?: string
    title?: string
}

export const FilterPopoverContext = createContext<{ close: () => void }>(undefined!)
export function useFilterPopoverContext() {
    const context = useContext(FilterPopoverContext)
    if (!context)
        throw new Error('useFilterPopoverContext must be used within a FilterPopoverContext.Provider')
    return context
}
function FilterPopover<T>(props: { column: Column<T> }) {
    const [opened, setOpened] = useState(false)
    return <FilterPopoverContext.Provider value={{ close: () => setOpened(false) }}>
        <Popover onClose={() => setOpened(false)}
            opened={opened}
            keepMounted
            withArrow
            shadow="lg">
            <Popover.Target>
                <IconFilterFilled
                    onClick={() => setOpened(true)}
                    className={clsx(classes.columnAction, {
                        [classes.active]: props.column.getIsFiltered()
                    })}
                />
            </Popover.Target>
            <Popover.Dropdown className={classes.filterPopoverContent}>
                {props.column.columnDef.meta?.filterContent
                    ?.(props.column)}
            </Popover.Dropdown>
        </Popover>
    </FilterPopoverContext.Provider>
}

export default function DataTable<T>(props: DataTableProps<T>) {
    const { t } = useTranslation()
    const isEmpty = props.table.getRowCount() == 0 && !props.loading
    const firstLoad = props.table.getRowCount() == 0 && props.loading
    const loadWithResults = props.table.getRowCount() > 0 && props.loading

    const headerGroups = !isEmpty && props.table.getHeaderGroups()
        .map(tr => <MTable.Tr key={tr.id}>
            {tr.headers.map(th => <MTable.Th
                colSpan={th.colSpan}
                key={th.id} >
                <div className={classes.headerContent}>
                    {flexRender(th.column.columnDef.header, th.getContext())}
                    {th.column.getCanSort() && <IconCaretUpDownFilled
                        onClick={() => th.column.toggleSorting()}
                        className={clsx(classes.columnAction, {
                            [classes.activeTop]: th.column.getIsSorted() == 'asc',
                            [classes.activeBottom]: th.column.getIsSorted() == 'desc'
                        })} />}
                    {th.column.getCanFilter() &&
                        th.column.columnDef.meta?.filterContent &&
                        <FilterPopover column={th.column} />}
                    {th.column.getCanGroup() &&
                        <IconSquaresFilled
                            className={clsx(classes.columnAction, {
                                [classes.active]: th.column.getIsGrouped(),
                            })}
                            onClick={() => th.column.toggleGrouping()} />}
                </div>
            </MTable.Th>)}
        </MTable.Tr>)

    const rows = props.table.getRowModel().rows
        .map(row => <MTable.Tr key={row.id}>
            {row.getVisibleCells().map(cell =>
                <MTable.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </MTable.Td>
            )}
        </MTable.Tr>)
    const skeleton = [...Array(props.table.getState().pagination.pageSize).keys()]
        .map(n => <MTable.Tr key={n}>
            {props.table.getAllColumns().map((c, idx) =>
                <MTable.Td key={idx}>
                    <Skeleton height={10} />
                </MTable.Td>)}
        </MTable.Tr>)
    const emptyMessage = <MTable.Tr key={1}>
        <MTable.Td colSpan={props.table.getAllColumns().length}>
            <Stack align="center" mt={'md'} mb={'md'} gap={'xs'} justify="center">
                {props.emptyIcon ?? <IconDatabaseOff size={32} />}
                <Text fw={700}>{props.emptyMessage ?? t('table.empty')}</Text>
            </Stack>
        </MTable.Td>
    </MTable.Tr>

    const loadingOverlay = <MTable.Tr>
        <LoadingOverlay
            visible
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }} />
    </MTable.Tr>

    return <Stack gap={'md'}>
        <Stack gap={'xs'}>
            {props.title && <Title order={4} mb={0} >{props.title}</Title>}
            <MTable {...props.options} style={{ position: 'relative' }}>
                <MTable.Thead>
                    {headerGroups}
                </MTable.Thead>
                <MTable.Tbody >
                    {rows}
                    {loadWithResults && loadingOverlay}
                    {firstLoad && skeleton}
                    {isEmpty && emptyMessage}
                </MTable.Tbody >
            </MTable>
        </Stack>
        <Flex align={'center'} justify={'space-between'}>
            <Pagination
                size={'sm'}
                total={props.table.getPageCount()}
                value={props.table.getState().pagination.pageIndex + 1}
                hideWithOnePage
                onChange={(value) => props.table.setPageIndex(value - 1)}
            />

            <Flex justify={'flex-end'} gap={'sm'}>
                {props.actions?.map(a => {
                    if (!a.label) return <ActionIcon disabled={a.disabled} size="md" onClick={a.action}>{a.icon}</ActionIcon>
                    return <Button disabled={a.disabled} size="md" rightSection={a.icon} onClick={a.action}>{a.label}</Button>
                })}
            </Flex>
        </Flex>
    </Stack>

}