import * as React from 'react';
import Select, {components, MultiValueProps, Props} from 'react-select';
import {MultiValueGenericProps} from 'react-select/src/components/MultiValue';
import {SortableContainer, SortableContainerProps, SortableElement, SortableHandle, SortEndHandler} from 'react-sortable-hoc';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { formatOptionLabel } from './utils';

interface CategoricalColumnSelectProps {
  callback: (s: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
}


function arrayMove<T>(array: readonly T[], from: number, to: number) {
  const slicedArray = array.slice();
  slicedArray.splice(to < 0 ? array.length + to : to, 0, slicedArray.splice(from, 1)[0]);
  return slicedArray;
}

const SortableMultiValue = SortableElement((props: MultiValueProps<ColumnInfo>) => {
  // this prevents the menu from being opened/closed when the user clicks
  // on a value to begin dragging it. ideally, detecting a click (instead of
  // a drag) would still focus the control and toggle the menu
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const innerProps = { ...props.innerProps, onMouseDown };
  return <components.MultiValue {...props} innerProps={innerProps} />;
});

const SortableMultiValueLabel = SortableHandle((props: MultiValueGenericProps<ColumnInfo>) => <components.MultiValueLabel {...props} />);

const SortableSelect = SortableContainer(Select) as unknown as React.ComponentClass<Props<ColumnInfo, boolean> & SortableContainerProps>;

export function CategoricalColumnSelect({ callback, columns, currentSelected }: CategoricalColumnSelectProps) {
  const selectCatOptions = React.useMemo(() => {
    return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => c.info);
  }, [columns]);

  const onSortEnd: SortEndHandler = ({ oldIndex, newIndex }) => {
    const newValue = arrayMove(currentSelected, oldIndex, newIndex);
    callback(newValue);
  };

  return (
    <>
      <label className="pt-2 pb-1">Categorical Columns</label>
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
          callback(e.map((c) => c));
        }}
        components={{
          MultiValue: SortableMultiValue,
          MultiValueLabel: SortableMultiValueLabel,
        }}
        name="catColumns"
        options={selectCatOptions}
        value={currentSelected}
      />
    </>
  );
}
