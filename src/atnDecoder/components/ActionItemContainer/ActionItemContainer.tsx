import "./ActionItemContainer.less";

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import {
  getExpandedItemsAction,
  getSelectedItemsAction,
} from "../../atnSelectors";
import { setExpandActionAction, setSelectActionAction } from "../../atnActions";
import {
  IActionItemUUID,
  IActionSetUUID,
  TExpandedItem,
  TSelectActionOperation,
  TSelectedItem,
} from "../../atnModel";
import { ActionCommandContainer } from "../ActionCommandContainer/ActionCommandContainer";
import {
  IconArrowBottom,
  IconArrowRight,
  IconCheck,
  IconChevronBottom,
  IconChevronRight,
  IconCircleCheck,
  IconEmpty,
} from "../../../shared/components/icons";
import PS from "photoshop";

export class ActionItem extends React.Component<TActionItem, IActionItemState> {
  constructor(props: TActionItem) {
    super(props);
  }

  private get combinedUUID(): [string, string] {
    const { parentSet, actionItem } = this.props;
    const res: [string, string] = [parentSet.__uuid__, actionItem.__uuid__];
    return res;
  }

  private get isSelected(): boolean {
    const { selectedItems } = this.props;
    const uuids = this.combinedUUID;
    const found = selectedItems.find(
      (item) => item[0] === uuids[0] && item[1] === uuids[1],
    );

    return !!found;
  }

  private select = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();

    let operation: TSelectActionOperation = "replace";

    if (e.shiftKey && (e.ctrlKey || e.metaKey)) {
      operation = "subtractContinuous";
    } else if (e.shiftKey) {
      operation = "addContinuous";
    } else if (e.ctrlKey || e.metaKey) {
      if (this.isSelected) {
        operation = "subtract";
      } else {
        operation = "add";
      }
    }
    this.props.setSelectedItem(this.combinedUUID, operation);
  };

  private get isExpanded() {
    const { actionItem, expandedItems } = this.props;
    const expanded = expandedItems.flat().includes(actionItem.__uuid__);
    return expanded;
  }

  private onExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    const { actionItem, parentSet: parent } = this.props;
    this.props.setExpandedItem(
      [parent.__uuid__, actionItem.__uuid__],
      !this.isExpanded,
    );
  };

  public render(): React.ReactNode {
    const { actionItem, parentSet } = this.props;

    return (
      <div className="ActionItem">
        <div
          className={"wrap " + (this.isSelected ? "selected" : "")}
          onClick={this.select}
        >
          <div className="checkmark">
            {actionItem.commands?.every((item) => item.enabled) ?? true ? (
              <IconCheck />
            ) : (
              <IconEmpty />
            )}
          </div>
          <div className="expand" onClick={this.onExpand}>
            {this.isExpanded ? <IconChevronBottom /> : <IconChevronRight />}
          </div>
          <span className="title">
            {PS.core.translateUIString(actionItem.actionItemName)}
          </span>
        </div>
        {this.isExpanded &&
          actionItem.commands?.map((item, key) => (
            <ActionCommandContainer
              parentAction={actionItem}
              parentSet={parentSet}
              actionCommand={item}
              key={key}
            />
          ))}
      </div>
    );
  }
}

type TActionItem = IActionItemProps & IActionItemDispatch;

interface IActionItemState {}

interface IOwn {
  actionItem: IActionItemUUID;
  parent: IActionSetUUID;
}

interface IActionItemProps {
  selectedItems: TSelectedItem[];
  expandedItems: TExpandedItem[];
  actionItem: IActionItemUUID;
  parentSet: IActionSetUUID;
}

const mapStateToProps = (
  state: IRootState,
  ownProps: IOwn,
): IActionItemProps => ({
  actionItem: ownProps.actionItem,
  parentSet: ownProps.parent,
  expandedItems: getExpandedItemsAction(state),
  selectedItems: getSelectedItemsAction(state),
});

interface IActionItemDispatch {
  setSelectedItem(uuid: TSelectedItem, operation: TSelectActionOperation): void;
  setExpandedItem(uuid: TExpandedItem, expand: boolean): void;
}

const mapDispatchToProps = (dispatch: Dispatch): IActionItemDispatch => ({
  setExpandedItem: (uuid, expand) =>
    dispatch(setExpandActionAction(uuid, expand)),
  setSelectedItem: (uuid, operation) =>
    dispatch(setSelectActionAction(operation, uuid)),
});

export const ActionItemContainer = connect<
  IActionItemProps,
  IActionItemDispatch,
  IOwn,
  IRootState
>(
  mapStateToProps,
  mapDispatchToProps,
)(ActionItem);
