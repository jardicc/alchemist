/* eslint-disable @typescript-eslint/no-empty-interface */
import React from "react";
import "./TabList.less";

export interface ITabListProps {
  activeKey: string;
  className: string;
  children: React.ReactElement[];
  postFix?: React.ReactElement;
  onChange: (id: any) => void;
}

export interface ITabListDispatch {}

interface ITabListState {}

export type TTabList = ITabListProps & ITabListDispatch;

export class TabList extends React.Component<TTabList, ITabListState> {
  constructor(props: TTabList) {
    super(props);

    this.state = {};
  }

  private renderTabs = (): JSX.Element | null => {
    const { activeKey } = this.props;
    if (Array.isArray(this.props.children)) {
      return (
        <div className="tabRow">
          {this.props.children.map((item) => (
            <div
              className={
                "tabHeader" + (item.props.id === activeKey ? " active" : "")
              }
              key={item.props.id}
              onClick={() => {
                console.log(item.props.id);
                this.props.onChange(item.props.id);
              }}
              style={item.props.marginRight && { marginRight: "auto" }}
            >
              {item.props.title}
            </div>
          ))}
          {this.props.postFix}
        </div>
      );
    }
    return null;
  };

  private renderTabContent = (): React.ReactNode => {
    const { activeKey, children } = this.props;

    let clsName = "tabContent ";

    if (Array.isArray(children)) {
      const found = children.find((item) => item.props.id === activeKey);
      if (!found) {
        return <div className={clsName}>No content</div>;
      } else if (typeof found === "object" && "props" in found) {
        clsName += found.props.showScrollbars ? "showScrollbars " : "";
        clsName += found.props.noPadding ? "noPadding " : "";
        return <div className={clsName + found.props.id}>{found}</div>;
      }
    }
    return <div className={clsName}>not array</div>;
  };

  public render(): JSX.Element {
    return (
      <div className={"TabList " + (this.props.className || "")}>
        {this.renderTabs()}
        {this.renderTabContent()}
      </div>
    );
  }
}
