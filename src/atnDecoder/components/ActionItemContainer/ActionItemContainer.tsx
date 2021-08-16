import "./ActionItemContainer.less"

import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IRootState } from "../../../shared/store";
import { getExpandedItemsAction, getSelectedItemsAction } from "../../selectors/atnSelectors";
import { setExpandActionAction,setSelectActionAction} from "../../actions/atnActions";
import { IActionItemUUID, IActionSetUUID, TExpandedItem, TSelectActionOperation, TSelectedItem } from "../../types/model";
import { ActionCommandContainer } from "../ActionCommandContainer/ActionCommandContainer";
import { IconArrowBottom, IconArrowRight } from "../../../shared/components/icons";

export class ActionItem extends React.Component<TActionItem, IActionItemState> { 
	constructor(props: TActionItem) {
		super(props);
	}

	private get isExpanded() {
		const { actionItem, expandedItems } = this.props;
		const expanded = expandedItems.flat().includes(actionItem.__uuid__);
		return expanded;
	}

	private onExpand = () => {
		const {expandedItems,setExpandedItem,actionItem,  parent} = this.props;
		this.props.setExpandedItem([parent.__uuid__,actionItem.__uuid__],!this.isExpanded)
	}

	public render(): React.ReactNode {
		
		const {actionItem } = this.props;

		return (
			<div className="ActionItem">
				<div className="wrap" onClick={this.onExpand}>
					{this.isExpanded  ? <IconArrowBottom /> : <IconArrowRight />}
					<span>
						{actionItem.actionItemName}
					</span>				
				</div>
				{this.isExpanded && actionItem.commands.map((item, key) => <ActionCommandContainer actionCommand={item} key={key} />)}
			</div>
		);
	}
}

type TActionItem = IActionItemProps & IActionItemDispatch

interface IActionItemState{

}

interface IOwn{
	actionItem: IActionItemUUID
	parent:IActionSetUUID
}

interface IActionItemProps{
	selectedItems: TSelectedItem[]
	expandedItems: TExpandedItem[]
	actionItem: IActionItemUUID
	parent:IActionSetUUID
}

const mapStateToProps = (state: IRootState, ownProps: IOwn): IActionItemProps => (state = state as IRootState,{
	actionItem: ownProps.actionItem,
	parent: ownProps.parent,
	expandedItems: getExpandedItemsAction(state),
	selectedItems: getSelectedItemsAction(state),
	
});

interface IActionItemDispatch {
	setSelectedItem(uuid:TSelectedItem,operation:TSelectActionOperation): void
	setExpandedItem(uuid:TExpandedItem, expand:boolean): void
}

const mapDispatchToProps = (dispatch: Dispatch): IActionItemDispatch => ({
	setExpandedItem: (uuid, expand) => dispatch(setExpandActionAction(uuid, expand)),
	setSelectedItem: (uuid, operation) => dispatch(setSelectActionAction(operation,uuid)),
});

export const ActionItemContainer = connect<IActionItemProps, IActionItemDispatch, IOwn, IRootState>(mapStateToProps, mapDispatchToProps)(ActionItem);