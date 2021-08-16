import "./ActionSetContainer.less"

import React, { MouseEventHandler } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import { setExpandActionAction, setSelectActionAction } from "../../actions/atnActions";
import { getExpandedItemsSet, getSelectedItemsSet } from "../../selectors/atnSelectors";
import { IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem } from "../../types/model";
import { ActionItemContainer } from "../ActionItemContainer/ActionItemContainer";
import { IconArrowBottom, IconArrowRight } from "../../../shared/components/icons";

export class ActionSet extends React.Component<TActionSet, IActionSetState> { 
	constructor(props: TActionSet) {
		super(props);
	}

	private get isExpanded() {
		const { actionSet, expandedItems } = this.props;
		const expanded = expandedItems.flat().includes(actionSet.__uuid__);
		return expanded;
	}

	private onExpand = () => {
		const {expandedItems,setExpandedItem,actionSet } = this.props;
		this.props.setExpandedItem([actionSet.__uuid__],!this.isExpanded)
	}

	public render(): React.ReactNode {
		
		const { actionSet, expandedItems } = this.props;
		

		return (
			<div className="ActionSet">
				<div className="wrap" onClick={this.onExpand}>
					{this.isExpanded ? <IconArrowBottom /> : <IconArrowRight />}
					<span>
						{actionSet.actionSetName}
					</span>
				</div>
				{this.isExpanded && actionSet.actionItems.map((item,key)=><ActionItemContainer actionItem={item} parent={actionSet} key={key} />)}
			</div>
		);
	}
}

type TActionSet = IActionSetProps & IActionSetDispatch

interface IActionSetState{

}

interface IOwn{
	actionSet:IActionSetUUID
}

interface IActionSetProps{
	selectedItems: TSelectedItem[]
	expandedItems: TExpandedItem[]
	actionSet:IActionSetUUID
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IActionSetProps => (state = state as IRootState,{
	actionSet: ownProps.actionSet,
	expandedItems: getExpandedItemsSet(state),
	selectedItems: getSelectedItemsSet(state),
	
});

interface IActionSetDispatch {
	setSelectedItem(uuid:TSelectedItem,operation:TSelectActionOperation): void
	setExpandedItem(uuid:TExpandedItem, expand:boolean): void
}

const mapDispatchToProps = (dispatch:Dispatch):IActionSetDispatch => ({
	setExpandedItem: (uuid, expand) => dispatch(setExpandActionAction(uuid, expand)),
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
});

export const ActionSetContainer = connect<IActionSetProps, IActionSetDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(ActionSet);