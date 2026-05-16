import {useAppSelector} from "../../shared/store";
import {getGeneratedCode} from "../selectors/inspectorCodeSelectors";

import React from "react";
import "./GeneratedCodeContainer.less";
import SP from "react-uxp-spectrum";


export const GeneratedCode: React.FC = () => {
	const code = useAppSelector(getGeneratedCode);
	return (
		<div className="GeneratedCode">
			<SP.Textarea
				className="generatedCodeBox"
				value={code}
			/>
		</div>
	);
};