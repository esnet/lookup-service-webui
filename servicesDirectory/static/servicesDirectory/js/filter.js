////////////////////////////////////////
// Filter Mappings
////////////////////////////////////////

var filterMap = {
	"address":
	{
		"getFields": function(record) {
			return getAddresses(record);
		}
	},
	"administrator":
	{
		"getFields": function(record) {
			var fields = [];
			if (hasField(record, "person-name"))
				fields.push(record["person-name"][0]);
			$.merge(fields, filterMap["email"].getFields(record));
			$.merge(fields, filterMap["organization"].getFields(record));
			return fields;
		}
	},
	"city":
	{
		"getFields": function(record) {
			if (hasField(record, "location-city"))
				return [ record["location-city"][0] ];
			return [];
		}
	},
	"community":
	{
		"getFields": function(record) {
			if (hasField(record, "group-communities"))
				return record["group-communities"];
			return [];
		}
	},
	"country":
	{
		"getFields": function(record) {
			if (hasField(record, "location-country"))
			{
				var code = record["location-country"][0];
				var country = getCountryString(code);
				if (code != country)
					return [ code, country ];
				else
					return [ country ];	
			}
			return [];
		}
	},
	"email":
	{
		"getFields": function(record) {
			if (hasField(record, "person-emails"))
				return record["person-emails"];
			return [];
		}
	},
	"hardware":
	{
		"getFields": function(record) {
			var fields = [];
			$.merge(fields, filterMap["memory"].getFields(record));
			$.merge(fields, filterMap["processor"].getFields(record));
			$.merge(fields, filterMap["nicspeed"].getFields(record));
			return fields;
		}
	},
	"hostname":
	{
		"getFields": function(record) {
			var fields = getHostnames(record);
			if (hasField(record, "group-domains"))
				$.merge(fields, record["group-domains"]);
			return fields;
		}
	},
	"kernel":
	{
		"getFields": function(record) {
			if (hasField(record, "host-os-kernel"))
				return [ record["host-os-kernel"][0] ];
			return [];
		}
	},
	"location":
	{
		"getFields": function(record) {
			var fields = [];
			$.merge(fields, filterMap["site"].getFields(record));
			$.merge(fields, filterMap["city"].getFields(record));
			$.merge(fields, filterMap["state"].getFields(record));
			$.merge(fields, filterMap["country"].getFields(record));
			$.merge(fields, filterMap["zipcode"].getFields(record));
			return fields;
		}
	},
	"memory":
	{
		"getFields": function(record) {
			if (hasField(record, "host-hardware-memory"))
			{
				var size = parseSize(record["host-hardware-memory"][0], true);
				if (size)
					return [ formatSize(size) ];
			}
			return [];
		}
	},
	"mtu":
	{
		"getFields": function(record) {
			if (hasField(record, "interface-mtu"))
				return [ record["interface-mtu"][0] ];
			return [];
		}
	},
	"name": {
		"getFields": function(record) {
			var fields = [];
			var type = record["type"][0];
			if (hasField(record, type + "-name"))
				$.merge(fields, record[type + "-name"]);
			var title = getTitle(record);
			if (title)
				fields.push(title);
			return fields;
		}
	},
	"nicspeed":
	{
		"getFields": function(record) {
			if (hasField(record, "interface-capacity"))
			{
				var rate = parseRate(record["interface-capacity"][0], true);
				if (rate)
					return [ formatRate(rate) ];
			}
			return [];
		}
	},
	"organization":
	{
		"getFields": function(record) {
			if (hasField(record, "person-organization"))
				return [ record["person-organization"][0] ];
			return [];
		}
	},
	"os":
	{
		"getFields": function(record) {
			var fields = [];
			$.merge(fields, filterMap["osname"].getFields(record));
			$.merge(fields, filterMap["osversion"].getFields(record));
			return fields;
		}
	},
	"osname":
	{
		"getFields": function(record) {
			if (hasField(record, "host-os-name"))
				return [ record["host-os-name"][0] ];
			return [];
		}
	},
	"osversion":
	{
		"getFields": function(record) {
			if (hasField(record, "host-os-version"))
				return [ record["host-os-version"][0] ];
			return [];
		}
	},
	"processor":
	{
		"getFields": function(record) {
			var fields = [];
			$.merge(fields, filterMap["processorcores"].getFields(record));
			$.merge(fields, filterMap["processorcount"].getFields(record));
			$.merge(fields, filterMap["processorspeed"].getFields(record));
			return fields;
		}
	},
	"processorcores":
	{
		"getFields": function(record) {
			if (hasField(record, "host-hardware-processorcore"))
				return [ record["host-hardware-processorcore"][0] ];
			return [];
		}
	},
	"processorcount":
	{
		"getFields": function(record) {
			if (hasField(record, "host-hardware-processorcount"))
				return [ record["host-hardware-processorcount"][0] ];
			return [];
		}
	},
	"processorspeed":
	{
		"getFields": function(record) {
			if (hasField(record, "host-hardware-processorspeed"))
			{
				var speed = parseSpeed(record["host-hardware-processorspeed"][0], true);
				if (speed)
					return [ formatSpeed(speed) ];
			}
			return [];
		}
	},
	"site":
	{
		"getFields": function(record) {
			if (hasField(record, "location-sitename"))
				return [ record["location-sitename"][0] ];
			return [];
		}
	},
	"state":
	{
		"getFields": function(record) {
			if (hasField(record, "location-state"))
			{
				var code = record["location-state"][0];
				var state = getStateString(code);
				if (code != state)
					return [ code, state ];
				else
					return [ state ];
			}
			return [];
		}
	},
	"system":
	{
		"getFields": function(record) {
			var fields = [];
			$.merge(fields, filterMap["hardware"].getFields(record));
			$.merge(fields, filterMap["kernel"].getFields(record));
			$.merge(fields, filterMap["mtu"].getFields(record));
			$.merge(fields, filterMap["os"].getFields(record));
			$.merge(fields, filterMap["version"].getFields(record));
			return fields;
		}
	},
	"type": {
		"getFields": function(record) {
			var fields = [];
			var type = record["type"][0];
			fields.push(type);
			if (hasField(record, type + "-type"))
			{
				var subtype = record[type + "-type"][0]
				fields.push(subtype);
				if (hasField(record, subtype + "-type"))
					fields.push(record[subtype + "-type"][0]);
			}
			return fields;
		}
	},
	"version":
	{
		"getFields": function(record) {
			if (hasField(record, "pshost-toolkitversion"))
				return [ record["pshost-toolkitversion"][0] ];
			if (hasField(record, "service-version"))
				return [ record["service-version"][0] ];
			return [];
		}
	},
	"zipcode":
	{
		"getFields": function(record) {
			if (hasField(record, "location-code"))
				return [ record["location-code"][0] ];
			return [];
		}
	},
	"default":
	{
		"getFields": function(record) {
			var fields = [];
			$.merge(fields, filterMap["address"].getFields(record));
			$.merge(fields, filterMap["administrator"].getFields(record));
			$.merge(fields, filterMap["community"].getFields(record));
			$.merge(fields, filterMap["hostname"].getFields(record));
			$.merge(fields, filterMap["location"].getFields(record));
			$.merge(fields, filterMap["system"].getFields(record));
			$.merge(fields, filterMap["type"].getFields(record));
			return fields;
		}
	}
};

var filterAliases = {
	"address": filterMap["address"],
	"addresses": filterMap["address"],
	"admin": filterMap["administrator"],
	"admins": filterMap["administrator"],
	"administrator": filterMap["administrator"],
	"administrators": filterMap["administrator"],
	"city": filterMap["city"],
	"cities": filterMap["city"],
	"cores": filterMap["processorcores"],
	"community": filterMap["community"],
	"communities": filterMap["community"],
	"country": filterMap["country"],
	"countries": filterMap["country"],
	"cpu": filterMap["processor"],
	"cpus": filterMap["processorcount"],
	"cpucores": filterMap["processorcores"],
	"cpucount": filterMap["processorcount"],
	"cpucounts": filterMap["processorcount"],
	"cpuspeed": filterMap["processorspeed"],
	"cpuspeeds": filterMap["processorspeed"],
	"domain": filterMap["hostname"],
	"domains": filterMap["hostname"],
	"email": filterMap["email"],
	"emails": filterMap["email"],
	"group": filterMap["community"],
	"groups": filterMap["community"],
	"hardware": filterMap["hardware"],
	"host": filterMap["hostname"],
	"hosts": filterMap["hostname"],
	"hostname": filterMap["hostname"],
	"hostnames": filterMap["hostname"],
	"kernel": filterMap["kernel"],
	"kernels": filterMap["kernel"],
	"kind": filterMap["type"],
	"kinds": filterMap["type"],
	"location": filterMap["location"],
	"locations": filterMap["location"],
	"locator": filterMap["address"],
	"locators": filterMap["address"],
	"mem": filterMap["memory"],
	"memory": filterMap["memory"],
	"mtu": filterMap["mtu"],
	"name": filterMap["name"],
	"names": filterMap["name"],
	"nicspeed": filterMap["nicspeed"],
	"nicspeeds": filterMap["nicspeed"],
	"organization": filterMap["organization"],
	"organizations": filterMap["organization"],
	"os": filterMap["os"],
	"osname": filterMap["osname"],
	"osnames": filterMap["osnames"],
	"osversion": filterMap["osversion"],
	"osversions": filterMap["osversion"],
	"processor": filterMap["processorcores"],
	"processorcores": filterMap["processorcores"],
	"processorcount": filterMap["processorcount"],
	"processorcounts": filterMap["processorcount"],
	"processorspeed": filterMap["processorspeed"],
	"processorspeeds": filterMap["processorspeed"],
	"site": filterMap["site"],
	"sites": filterMap["site"],
	"sitename": filterMap["site"],
	"sitenames": filterMap["site"],
	"software": filterMap["version"],
	"speed": filterMap["nicspeed"],
	"speeds": filterMap["nicspeed"],
	"state": filterMap["state"],
	"states": filterMap["state"],
	"system": filterMap["system"],
	"title": filterMap["name"],
	"titles": filterMap["name"],
	"toolkitversion": filterMap["version"],
	"toolkitversions": filterMap["version"],
	"type": filterMap["type"],
	"types": filterMap["type"],
	"version": filterMap["version"],
	"versions": filterMap["version"],
	"zipcode": filterMap["zipcode"],
	"zipcodes": filterMap["zipcode"]
};

////////////////////////////////////////
// Filter Functions
////////////////////////////////////////

function getFilteredRecords(records, filter)
{
	var filtered = [];
	var matched = [];
	var matcher = parser.parse(filter);
	for (var i = 0 ; i < records.length ; i++)
	{
		if (matcher(records[i]))
			matched.push(records[i]);
	}
	for (var i = 0 ; i < matched.length ; i++)
	{
		var type = matched[i]["type"][0];
		if (type == "host")
		{
			if (matched[i].administrators)
				$.merge(filtered, matched[i].administrators);
			if (matched[i].interfaces)
				$.merge(filtered, matched[i].interfaces);
			if (matched[i].services)
				$.merge(filtered, matched[i].services);
		}
		else if (type == "interface")
		{
			if (matched[i].host)
				matched.push(matched[i].host);
		}
		else if (type == "person")
		{
			if (matched[i].services)
				$.merge(filtered, matched[i].services);
			if (matched[i].hosts)
				$.merge(matched, matched[i].hosts);
		}
		else if (type == "service")
		{
			if (matched[i].host)
				filtered.push(matched[i].host);
			if (matched[i].administrators)
				$.merge(filtered, matched[i].administrators);
		}
		filtered.push(matched[i]);
	}
	return filtered.unique();
}

function matchFields(fields, operand)
{
	var regex = new RegExp(operand, "i");
	for (var i = 0 ; i < fields.length ; i++)
	{
		if (fields[i].search(regex) >= 0)
			return true;
	}
	return false;
}

function matchRecord(record, operator, operand)
{
	var fields = [];
	if (operator)
	{
		operator = operator.toLowerCase();
		if (filterAliases[operator])
			fields = filterAliases[operator].getFields(record);
		else if (record[operator] instanceof Array)
			fields = record[operator];
	}
	else
	{
		fields = filterMap["default"].getFields(record);
	}
	var parsed = parseOperand(operand);
	if (parsed)
		return matchFields(fields, parsed) || matchFields(fields, operand);
	else
		return matchFields(fields, operand);
}

function parseOperand(operand)
{
	var rate = parseRate(operand, true);
	if (rate)
		return formatRate(rate);
	var size = parseSize(operand);
	if (size)
		return formatSize(size);
	var speed = parseSpeed(operand);
	if (speed)
		return formatSpeed(speed);
	return null;
}
