function sendToAlchemist(value, property){
	var list = getList();
	var desc = wrapData(value, property);
	list.putObject(stringIDToTypeID("item"),desc);
	putList(list);
}


function getList(){
	try{
		var desc = app.getCustomOptions(stringIDToTypeID("cz-bereza-alchemist-list"));
	}catch(e){
		return new ActionList();
	}	
	var list = desc.getList(stringIDToTypeID("list"));
	return list || new ActionList();
}

function putList(list){
	const desc = new ActionDescriptor();
	desc.putList(stringIDToTypeID("list"),list);
	app.putCustomOptions (stringIDToTypeID("cz-bereza-alchemist-list"), desc, false);
}

function wrapData(value, property){
	if(!property){
		var counter = readCounter();
		property = "ExtendScript value: " + counter;
		setCounter (counter+1);
	}
	var desc = new ActionDescriptor();
	desc.putString(stringIDToTypeID("propertyName"),property);
	var valueKey = stringIDToTypeID("propertyValue");
	if(typeof value === "number"){
		desc.putDouble(valueKey,value);
	} else if (typeof value === "string"){
		desc.putString(valueKey,value);
	} else if (typeof value === "boolean"){
		desc.putBoolean(valueKey,value);
	} else if (value.typename === "ActionDescriptor"){
		desc.putObject(valueKey,valueKey,value);
	} else if (value.typename === "ActionList"){
		desc.putList(valueKey,valueKey,value);
	} else if (value.typename === "ActionReference"){
		desc.putReference(valueKey,valueKey,value);
	}
	return desc;
}


function readCounter(){
	try{
		var desc = app.getCustomOptions(stringIDToTypeID("cz-bereza-alchemist-counter"));
	}catch(e){
		return 1;
	}	
	var counter = desc.getInteger(stringIDToTypeID("counter"));
	return counter || 1;
}

function setCounter(counter){
	const desc = new ActionDescriptor();
	desc.putInteger(stringIDToTypeID("counter"),counter);
	app.putCustomOptions (stringIDToTypeID("cz-bereza-alchemist-counter"), desc, true);
}

var value = new ActionDescriptor();
value.putBoolean(stringIDToTypeID("ccc"),true);

sendToAlchemist (value, "abc");
sendToAlchemist (value);
sendToAlchemist (value, "xyz");