import { useState } from 'react';
import { Calendar, DatePickerInput, DayProps } from '@mantine/dates';
import dayjs from 'dayjs';
import type { ComponentProps } from "react";

export interface WeekPickerInputProps extends Omit<ComponentProps<typeof DatePickerInput>,
    'value' | 'getDayProps' | 'onChange' | 'withCellSpacing'> {
    value?: Date
    onChange?: (value?: Date) => any
}

export default function WeekPickerInput({ onChange, firstDayOfWeek, ...props }: WeekPickerInputProps) {
    const [hovered, setHovered] = useState<Date>();
    const firstDOW = firstDayOfWeek ?? 1

    function getDay(date: Date) {
        const day = date.getDay();
        return day === 0 ? 6 : day - 1;
    }

    function startOfWeek(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() - getDay(date) - 2 + firstDOW);
    }

    function endOfWeek(date: Date) {
        return dayjs(new Date(date.getFullYear(), date.getMonth(), date.getDate() + (5 - getDay(date) + firstDOW)))
            .endOf('date')
            .toDate();
    }

    function isInWeekRange(date: Date, value?: Date) {
        return value
            ? dayjs(date).isBefore(endOfWeek(value)) && dayjs(date).isAfter(startOfWeek(value))
            : false;
    }

    function getDayProps(date: Date): Partial<DayProps> {
        const isHovered = isInWeekRange(date, hovered);
        const isSelected = isInWeekRange(date, props.value);
        const isInRange = isHovered || isSelected;

        return {
            onMouseEnter: () => setHovered(date),
            onMouseLeave: () => setHovered(undefined),
            inRange: isInRange,
            firstInRange: isInRange && date.getDay() === firstDOW,
            lastInRange: isInRange && date.getDay() === Math.abs(firstDOW - 1),
            selected: isSelected,
            onClick: () => onChange?.(dayjs(startOfWeek(date)).add(1, 'day').toDate())
        }
    }

    return (<DatePickerInput
        {...props}
        firstDayOfWeek={firstDOW}
        withCellSpacing={false}
        getDayProps={getDayProps}
    />)
}