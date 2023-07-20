import "./ActionCommandContainer.less";

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import { setSelectActionAction } from "../../atnActions";
import { getSelectedItemsCommand } from "../../atnSelectors";
import {
  IActionCommandUUID,
  IActionItemUUID,
  IActionSetUUID,
  TSelectActionOperation,
  TSelectedItem,
} from "../../atnModel";
import { IconCheck, IconEmpty } from "../../../shared/components/icons";
import PS from "photoshop";

export class ActionCommand extends React.Component<
  TActionCommand,
  IActionCommandState
> {
  constructor(props: TActionCommand) {
    super(props);
  }

  private get combinedUUID(): [string, string, string] {
    const { parentSet, parentAction, actionCommand } = this.props;
    const res: [string, string, string] = [
      parentSet.__uuid__,
      parentAction.__uuid__,
      actionCommand.__uuid__,
    ];
    return res;
  }

  private get isSelected(): boolean {
    const { selectedItems } = this.props;
    const uuids = this.combinedUUID;
    const found = selectedItems.find(
      (item) =>
        item[0] === uuids[0] && item[1] === uuids[1] && item[2] === uuids[2],
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

  public render(): React.ReactNode {
    const { actionCommand } = this.props;

    return (
      <div className="ActionCommandContainer">
        <div
          className={"wrap " + (this.isSelected ? "selected" : "")}
          onClick={this.select}
        >
          <div className="checkmark">
            {actionCommand.enabled ? <IconCheck /> : <IconEmpty />}
          </div>
          <span className="title">
            {PS.core.translateUIString(actionCommand.commandName)}
          </span>
        </div>
      </div>
    );
  }
}

type TActionCommand = IActionCommandProps & IActionCommandDispatch;

interface IActionCommandState {}

interface IOwn {
  actionCommand: IActionCommandUUID;
  parentSet: IActionSetUUID;
  parentAction: IActionItemUUID;
}

interface IActionCommandProps {
  parentSet: IActionSetUUID;
  parentAction: IActionItemUUID;
  selectedItems: TSelectedItem[];
  actionCommand: IActionCommandUUID;
}

const mapStateToProps = (
  state: IRootState,
  ownProps: IOwn,
): IActionCommandProps => (
  (state = state as IRootState),
  {
    actionCommand: ownProps.actionCommand,
    selectedItems: getSelectedItemsCommand(state),
    parentSet: ownProps.parentSet,
    parentAction: ownProps.parentAction,
  }
);

interface IActionCommandDispatch {
  setSelectedItem(uuid: TSelectedItem, operation: TSelectActionOperation): void;
}

const mapDispatchToProps = (dispatch: Dispatch): IActionCommandDispatch => ({
  setSelectedItem: (uuid, operation) =>
    dispatch(setSelectActionAction(operation, uuid)),
});

export const ActionCommandContainer = connect<
  IActionCommandProps,
  IActionCommandDispatch,
  IOwn,
  IRootState
>(
  mapStateToProps,
  mapDispatchToProps,
)(ActionCommand);
