import React, { ComponentType } from "react";
import { AccDrop, IAccDropPostFixProps } from "../AccDrop/AccDrop";
import { FilterButton, TFilterState } from "../FilterButton/FilterButton";
import {
  TSubTypes,
  IPropertyItem,
  IPropertyGroup,
  TTargetReference,
  TAllTargetReferences,
} from "../../model/types";
import { connect } from "react-redux";
import { IRootState } from "../../../shared/store";
import { Dispatch } from "redux";
import { getActiveRef } from "../../selectors/inspectorSelectors";
import { setFilterStateAction } from "../../actions/inspectorActions";

class FilterRow extends React.Component<TFilterRow, IFilterRowState> {
  constructor(props: TFilterRow) {
    super(props);

    this.state = { list: props.initialItems ?? [] };
  }

  private setList = (list: (IPropertyItem | IPropertyGroup)[]) => {
    const { initialItems } = this.props;

    this.setState({
      ...this.state,
      list: [...(initialItems || []), ...list],
    });
  };

  public render(): React.ReactNode {
    const {
      value: content,
      subtype,
      filterBy,
      onSelect,
      onUpdateList,
      initialItems,
      items,
    } = this.props;
    let newContent: (string | number)[];
    if (!Array.isArray(content)) {
      newContent = [content];
    } else {
      newContent = content;
    }

    return (
      <AccDrop
        {...this.props}
        id={subtype}
        selected={newContent}
        onSelect={(id, value, toggleProperty) =>
          onSelect(value, !!toggleProperty)
        }
        onHeaderClick={async () => {
          if (!onUpdateList) {
            // this.setList(initialItems ?? []);
            return;
          }
          const list = (await onUpdateList()) || [];
          this.setList(list);
        }}
        items={items || this.state.list}
        headerPostFix={
          <FilterButton
            subtype={subtype}
            state={filterBy}
            onClick={(subtype, state, e) => {
              this.props.onSetFilter(this.props.activeRef.type, subtype, state);
              e.stopPropagation();
            }}
          />
        }
      />
    );
  }
}
interface IFilterRowState {
  list: (IPropertyItem | IPropertyGroup)[];
}

interface IOwn {
  subtype: TSubTypes | "main";
  initialItems?: (IPropertyItem | IPropertyGroup)[];
  items?: (IPropertyItem | IPropertyGroup)[];
  icons?: boolean;
  header: string | React.ReactElement;
  filterBy: TFilterState;
  value: string | number | string[];
  showSearch?: boolean;
  ItemPostFix?: ComponentType<IAccDropPostFixProps>;
  doNotCollapse?: boolean;
  supportMultiSelect?: boolean;
  onSelect: (value: string | number, toggle: boolean) => void;
  onUpdateList?: () =>
    | Promise<(IPropertyItem | IPropertyGroup)[]>
    | (IPropertyItem | IPropertyGroup)[];
}

export type TFilterRow = IFilterRowProps & IFilterRowDispatch;

export interface IFilterRowProps extends IOwn {
  activeRef: TAllTargetReferences;
}

export type TFilterRowProps = IFilterRowProps & IOwn;

const mapStateToProps = (
  state: IRootState,
  ownProps: IOwn,
): IFilterRowProps => ({
  activeRef: getActiveRef(state),
  ...ownProps,
});

interface IFilterRowDispatch {
  onSetFilter: (
    type: TTargetReference,
    subType: TSubTypes | "main",
    state: TFilterState,
  ) => void;
}

const mapDispatchToProps = (dispatch: Dispatch): IFilterRowDispatch => ({
  onSetFilter: (type, subType, state) =>
    dispatch(setFilterStateAction(type, subType, state)),
});

export const FilterRowContainer = connect<
  IFilterRowProps,
  IFilterRowDispatch,
  IOwn,
  IRootState
>(
  mapStateToProps,
  mapDispatchToProps,
)(FilterRow);
