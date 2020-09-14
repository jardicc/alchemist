var key = "amHack";

$.global.amHack = {
	executeAction: $.global.amHack || $.global.executeAction,
	executeActionGet: $.global.amHack || $.global.executeActionGet
}

$.global.executeAction = function(eventID, descriptor, displayDialogs){
	var desc;
	var list;
	try{
		desc = app.getCustomOptions (key);
		list = desc.getList(stringIDToTypeID("list"));
	}catch(e){
		desc = new ActionDescriptor();
		list = new ActionList();
		desc.putList(stringIDToTypeID("list"),list);
	}

	descriptor.putString(stringIDToTypeID("_obj"),eventID);
	list.putDescriptor(descriptor);
	
	return $.global.amHack.executeAction(eventID, descriptor, displayDialogs)
}

$.global.executeActionGet = function(reference){
	var desc;
	var list;
	try{
		desc = app.getCustomOptions (key);
		list = desc.getList(stringIDToTypeID("list"));
	}catch(e){
		desc = new ActionDescriptor();
		list = new ActionList();
		desc.putList(stringIDToTypeID("list"),list);
	}

	list.putDescriptor(reference);
	
	return $.global.amHack.executeActionGet(reference);
}