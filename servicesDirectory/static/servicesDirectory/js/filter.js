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
				for (var i ; i < record["location-country"].length ; i++)
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
	"domain":
	{
		"getFields": function(record) {
			var fields = getHostnames(record);
			if (hasField(record, "group-domains"))
				$.merge(fields, record["group-domains"]);
			return fields;
		}
	},
	"email":
	{
		"getFields": function(record) {
			if (hasField(record, "person-email"))
				return record["person-email"];
			return [];
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
	"name": {
		"getFields": function(record) {
			var type = record["type"][0];
			if (hasField(record, type + "-name"))
				return record[type + "-name"];
			return [];
		}
	},
	"memory":
	{
		"getFields": function(record) {
			
		}
	},
	"mtu":
	{
		"getFields": function(record) {
			
		}
	},
	"nicspeed":
	{
		"getFields": function(record) {
			
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
	"osname":
	{
		"getFields": function(record) {
			var fields = [];
			if (hasField(record, "host-os-name"))
				$.merge(fields, record["host-os-name"]);
			$.merge(fields, filterMap["osversion"].getFields(record));
			return fields;
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
			
		}
	},
	"processorcount":
	{
		"getFields": function(record) {
			
		}
	},
	"processorspeed":
	{
		"getFields": function(record) {
			
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
				for (var i ; i < record["location-state"].length ; i++)
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
	"toolkitversion":
	{
		"getFields": function(record) {
			if (hasField(record, "pshost-toolkitversion"))
				return record["pshost-toolkitversion"];
			return [];
		}
	},
	"type": {
		"getFields": function(record) {
			return record["type"];
		}
	},
	"version":
	{
		"getFields": function(record) {
			
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
	"cpuspeed": filterMap["processorspeed"],
	"cpuspeeds": filterMap["processorspeed"],
	"domain": filterMap["domain"],
	"domains": filterMap["domain"],
	"email": filterMap["email"],
	"emails": filterMap["emails"],
	"group": filterMap["community"],
	"groups": filterMap["community"],
	"hostname": filterMap["domain"],
	"hostnames": filterMap["domain"],
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
	"os": filterMap["osname"],
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
	"speed": filterMap["nicspeed"],
	"speeds": filterMap["nicspeed"],
	"state": filterMap["state"],
	"states": filterMap["state"],
	"title": filterMap["title"],
	"titles": filterMap["title"],
	"toolkitversion": filterMap["toolkitversion"],
	"toolkitversions": filterMap["toolkitversion"],
	"type": filterMap["type"],
	"types": filterMap["type"],
	"version": filterMap["version"],
	"versions": filterMap["version"],
	"zipcode": filterMap["zipcode"],
	"zipcodes": filterMap["zipcode"]
};
