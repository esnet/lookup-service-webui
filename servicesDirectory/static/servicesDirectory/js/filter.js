////////////////////////////////////////
// Filter Mappings
////////////////////////////////////////

var filterMap = {
	"address":
	{
		"getFields": function(record) {
			if (hasField(record, "host-names"))
				return record["host-names"];
			if (hasField(record, "interface-addresses"))
				return record["interface-addresses"];
			if (hasField(record, "service-locators"))
				return record["service-locators"];
			return [];
		}
	},
	"administrator":
	{
		"getFields": function(record) {
			var fields = [];
			if (hasField(record, "person-name"))
				$.merge(fields, record["person-name"]);
			$.merge(fields, filterMap["email"].getFields(record));
			$.merge(fields, filterMap["organization"].getFields(record));
			return fields;
		}
	},
	"city":
	{
		"getFields": function(record) {
			if (hasField(record, "location-city"))
				return record["location-city"];
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
			var fields = [];
			if (hasField(record, "location-country"))
			{
				for (var i = 0 ; i < record["location-country"].length ; i++)
				{
					var code = record["location-country"][i];
					var country = getCountryString(code);
					if (code != country)
						$.merge(fields, [ code, country ]);
					else
						fields.push(country);
				}	
			}
			return fields;
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
				return record["host-os-kernel"];
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
			var fields = [];
			if (hasField(record, "host-hardware-memory"))
			{
				for (var i = 0 ; i < record["host-hardware-memory"].length ; i++)
				{
					var size = parseSize(record["host-hardware-memory"][i], true);
					if (size)
						fields.push(size);
				}
			}
			return fields;
		}
	},
	"mtu":
	{
		"getFields": function(record) {
			if (hasField(record, "interface-mtu"))
				return record["interface-mtu"];
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
			var fields = [];
			if (hasField(record, "interface-capacity"))
			{
				for (var i = 0 ; i < record["interface-capacity"].length ; i++)
				{
					var rate = parseRate(record["interface-capacity"][i], true);
					if (rate)
						fields.push(rate);
				}
			}
			return fields;
		}
	},
	"organization":
	{
		"getFields": function(record) {
			if (hasField(record, "person-organization"))
				return record["person-organization"];
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
				return record["host-os-name"];
			return [];
		}
	},
	"osversion":
	{
		"getFields": function(record) {
			if (hasField(record, "host-os-version"))
				return record["host-os-version"];
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
				return record["host-hardware-processorcore"];
			return [];
		}
	},
	"processorcount":
	{
		"getFields": function(record) {
			if (hasField(record, "host-hardware-processorcount"))
				return record["host-hardware-processorcount"];
			return [];
		}
	},
	"processorspeed":
	{
		"getFields": function(record) {
			var fields = [];
			if (hasField(record, "host-hardware-processorspeed"))
			{
				for (var i = 0 ; i < record["host-hardware-processorspeed"].length ; i++)
				{
					var speed = parseSpeed(record["host-hardware-processorspeed"][i], true);
					if (speed)
						fields.push(speed);
				}
			}
			return fields;
		}
	},
	"site":
	{
		"getFields": function(record) {
			if (hasField(record, "location-sitename"))
				return record["location-sitename"];
			return [];
		}
	},
	"state":
	{
		"getFields": function(record) {
			var fields = [];
			if (hasField(record, "location-state"))
			{
				for (var i = 0 ; i < record["location-state"].length ; i++)
				{
					var code = record["location-state"][i];
					var state = getStateString(code);
					if (code != state)
						$.merge(fields, [ code, state ]);
					else
						fields.push(state);
				}	
			}
			return fields;
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
			$.merge(fields, record["type"]);
			var type = record["type"][0];
			if (hasField(record, type + "-type"))
			{
				var subtype = record[type + "-type"][0]
				$.merge(fields, record[type + "-type"]);
				if (hasField(record, subtype + "-type"))
					$.merge(fields, record[subtype + "-type"]);
			}
			return fields;
		}
	},
	"version":
	{
		"getFields": function(record) {
			if (hasField(record, "pshost-toolkitversion"))
				return record["pshost-toolkitversion"];
			return [];
		}
	},
	"zipcode":
	{
		"getFields": function(record) {
			if (hasField(record, "location-code"))
				return record["location-code"];
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
	var matcher = parser.parse(filter);
	for (var i = 0 ; i < records.length ; i++)
	{
		if (matcher(records[i]))
			filtered.push(records[i]);
	}
	return filtered;
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
	if (operator)
	{
		operator = operator.toLowerCase().replace("_", "-");
		if (filterAliases[operator])
		{
			var fields = filterAliases[operator].getFields(record);
			return matchFields(fields, operand);
		}
		else
		{
			if (record[operator] instanceof Array)
				return matchFields(record[operator], operand);
			return false;
		}
	}
	else
	{
		var fields = filterMap["default"].getFields(record);
		return matchFields(fields, operand);
	}
}
