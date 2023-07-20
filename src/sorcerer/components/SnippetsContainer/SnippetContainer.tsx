import "./SnippetContainer.less";
import SP from "react-uxp-spectrum";
import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import PS from "photoshop";
import {
  TSelectedItem,
  TSelectActionOperation,
} from "../../../atnDecoder/atnModel";
import {
  setSelectAction,
  setSnippetAction,
  TSetSnippetActionPayload,
} from "../../sorActions";
import { ISnippet } from "../../sorModel";
import { getActiveSnippet } from "../../sorSelectors";

export class Snippet extends React.Component<
  TSnippetContainer,
  ISnippetContainerState
> {
  constructor(props: TSnippetContainer) {
    super(props);
  }

  public render(): React.ReactNode {
    const { activeSnippet, onSet } = this.props;

    if (activeSnippet === null) {
      return null;
    }

    return (
      <div className="SnippetContainerContainer" key="snippetPanel">
        <div className="row">
          Name:{" "}
          <SP.Textfield
            value={activeSnippet.label.default}
            onInput={(e) =>
              onSet(activeSnippet.$$$uuid, {
                label: { default: e.target?.value ?? "" },
              })
            }
          />
        </div>
        <div className="row">
          Version:{" "}
          <SP.Textfield
            value={activeSnippet.version}
            onInput={(e) =>
              onSet(activeSnippet.$$$uuid, { version: e.target?.value })
            }
          />
        </div>
        <div className="row">
          Author:{" "}
          <SP.Textfield
            value={activeSnippet.author}
            onInput={(e) =>
              onSet(activeSnippet.$$$uuid, { author: e.target?.value })
            }
          />
        </div>
        <div className="row">Code:</div>
        <div className="row codeWrap">
          <SP.Textarea
            className="snippetCode"
            value={activeSnippet.code}
            onInput={(e) =>
              onSet(activeSnippet.$$$uuid, { code: e.target?.value })
            }
          />
        </div>
      </div>
    );
  }
}

type TSnippetContainer = ISnippetContainerProps & ISnippetContainerDispatch;

interface ISnippetContainerState {}

interface IOwn {}

interface ISnippetContainerProps {
  activeSnippet: ISnippet | null;
}

const mapStateToProps = (
  state: IRootState,
  ownProps: IOwn,
): ISnippetContainerProps => (
  (state = state as IRootState),
  {
    activeSnippet: getActiveSnippet(state),
  }
);

interface ISnippetContainerDispatch {
  //setSelectedItem?(uuid:TSelectedItem,operation:TSelectActionOperation): void
  onSet: (uuid: string, value: TSetSnippetActionPayload) => void;
}

const mapDispatchToProps = (dispatch: Dispatch): ISnippetContainerDispatch => ({
  //setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
  onSet: (uuid, value) => dispatch(setSnippetAction(value, uuid)),
});

export const SnippetContainer = connect<
  ISnippetContainerProps,
  ISnippetContainerDispatch,
  IOwn,
  IRootState
>(
  mapStateToProps,
  mapDispatchToProps,
)(Snippet);
