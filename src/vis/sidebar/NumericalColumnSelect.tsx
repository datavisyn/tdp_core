import * as React from 'react';
import {MouseEventHandler, useMemo, useState} from 'react';
import Select, {
    components,
    MultiValueProps,
    Props,
  } from 'react-select';


import {VisCategoricalColumn, ColumnInfo, EColumnTypes, VisNumericalColumn, VisColumn} from '../interfaces';
import {formatOptionLabel} from './utils';
import {
    SortableContainer,
    SortableContainerProps,
    SortableElement,
    SortEndHandler,
    SortableHandle,
  } from 'react-sortable-hoc';
import {MultiValueGenericProps} from 'react-select/src/components/MultiValue';


interface NumericalColumnSelectProps {
    callback: (s: ColumnInfo[]) => void;
    columns: VisColumn[];
    currentSelected: ColumnInfo[];
}

function arrayMove<T>(array: readonly T[], from: number, to: number) {
    const slicedArray = array.slice();
    slicedArray.splice(
      to < 0 ? array.length + to : to,
      0,
      slicedArray.splice(from, 1)[0]
    );
    return slicedArray;
}

// tslint:disable-next-line:variable-name
const SortableMultiValue = SortableElement(
    (props: MultiValueProps<ColumnInfo>) => {
        // this prevents the menu from being opened/closed when the user clicks
        // on a value to begin dragging it. ideally, detecting a click (instead of
        // a drag) would still focus the control and toggle the menu
        const onMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        };
        const innerProps = { ...props.innerProps, onMouseDown };
        return <components.MultiValue {...props} innerProps={innerProps} />;
    }
);

// tslint:disable-next-line:variable-name
const SortableMultiValueLabel = SortableHandle(
    (props: MultiValueGenericProps<ColumnInfo>) => <components.MultiValueLabel {...props} />
);

// tslint:disable-next-line:variable-name
const SortableSelect = SortableContainer(Select) as unknown as React.ComponentClass<Props<ColumnInfo, boolean> & SortableContainerProps>;

export function NumericalColumnSelect(props: NumericalColumnSelectProps) {
    const selectNumOptions = useMemo(() => {
        return props.columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => c.info);
    }, [props.columns.length]);

    const onSortEnd: SortEndHandler = ({ oldIndex, newIndex }) => {
      const newValue = arrayMove(props.currentSelected, oldIndex, newIndex);
      props.callback(newValue);
    };

    return (
        <>
            <label className="pt-2 pb-1">Numerical Columns</label>
            <SortableSelect
                useDragHandle
                axis="xy"
                onSortEnd={onSortEnd}
                distance={4}
                getHelperDimensions={({ node }) => node.getBoundingClientRect()}
                closeMenuOnSelect={false}
                isMulti
                formatOptionLabel={formatOptionLabel}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                onChange={(e: ColumnInfo[]) => {
                    props.callback(e.map((c) => c));
                }}
                components={{
                    MultiValue: SortableMultiValue,
                    MultiValueLabel: SortableMultiValueLabel,
                  }}
                name="numColumns"
                options={selectNumOptions}
                value={props.currentSelected}
            />
        </>
    );
}
