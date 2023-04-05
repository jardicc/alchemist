// Trick to find what string ID is command. Simply brute force all stringIDs and read error messages.

/*

const stack = [];

async function actionCommands() {
	for (const id of stringIDs) {
		const item = {id, value: "$ERROR"};
		try {
			item.value = await batchPlay(
				[{
					_obj: id,
					_options: {
               		dialogOptions: "silent",
            	},
				}], {},
			);         
		} catch (e) {}
      
		stack.push(item);
	}

}

async function runModalFunction() {
	await executeAsModal(actionCommands, {
		"commandName": "Action Commands",
	});
}

await runModalFunction();

stack.filter(s=>!s.value[0]?.message?.includes("<unknown>"));

found.map(f => ({id:f.id, name: f?.value?.[0]?.message ?? "N/A"}));
const cleaned = found.map(f => ({id:f.id, name: f?.value?.[0]?.message ?? "N/A"}));

*/