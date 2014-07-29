////////////////////////////////////////
// Service Mappings
////////////////////////////////////////

var serviceMap = {
	"bwctl": {
		"title": "BWCTL Server",
		"defaults": [ "bwctl server" ],
		"custom": {
			"title": "Example Command-Line",
			"type": "cli",
			"formats": {
				"iperf3": "bwctl -T iperf3 -t 30 -O 4 -c \"<address>\"",
				"tracepath": "bwtraceroute -T tracepath -c \"<address>\"",
				"ping": "bwping -c \"<address>\"",
				"iperf": "bwctl -T iperf -t 30 -i 1 -f m -c \"<address>\"",
				"nuttcp": "bwctl -T nuttcp -t 30 -i 1 -f m -c \"<address>\"",
				"owamp": "bwping -T owamp -N 1000 -i 0.01 -c \"<address>\"",
				"traceroute": "bwtraceroute -c \"<address>\"",
				"default3.3": "bwctl -T iperf3 -t 30 -O 4 -c \"<address>\"",
				"default": "bwctl -T iperf -t 20 -i 1 -f m -c \"<address>\""
			}
		},
		"action": "Test"
	},
	"owamp": {
		"title": "OWAMP Server",
		"defaults": [ "owamp server" ],
		"custom": {
			"title": "Example Command-Line",
			"type": "cli",
			"formats": { 
				"default": "owping -c 10000 -i 0.01 \"<address>\""
			}
		},
		"action": "Ping"
	},
	"ndt": {
		"title": "NDT Server",
		"defaults": [ "ndt server" ],
		"custom": {
			"title": "Example Command-Line",
			"type": "cli",
			"formats": {
				"default": "web100clt -n \"<address>\" -ll"
			}
		},
		"action": "Test"
	},
	"npad": {
		"title": "NPAD Server",
		"defaults": [ "npad server" ],
		"custom": {},
		"action": "Test"
	},
	"ping": {
		"title": "Ping Responder",
		"defaults": [ "ping responder" ],
		"custom": {
			"title": "Example Command-Line",
			"type": "cli",
			"formats": {
				"default-v6": "ping6 \"<address>\"",
				"default": "ping \"<address>\""
			}
		},
		"action": "Ping"
	},
	"traceroute": {
		"title": "Traceroute Responder",
		"defaults": [ "traceroute responder" ],
		"custom": {
			"title": "Example Command-Line",
			"type": "cli",
			"formats": {
				"default-v6": "traceroute6 \"<address>\"",
				"default": "traceroute \"<address>\""
			}
		},
		"action": "Traceroute"
	},
	"ma": {
		"title": "MA",
		"types": {
			"bwctl": {
				"title": "BWCTL MA",
				"defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ],
				"custom": {
					"title": "Access URLs",
					"type": "ma"
				},
				"action": "Query"
			},
			"owamp": {
				"title": "OWAMP MA",
				"defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ],
				"custom": {
					"title": "Access URLs",
					"type": "ma"
				},
				"action": "Query"
			},
			"traceroute": {
				"title": "Traceroute MA",
				"defaults": [ "traceroute ma" ],
				"custom": {
					"title": "Access URLs",
					"type": "ma"
				},
				"action": "Query"
			}
		},
		"defaults": [ "measurement archive", "perfsonar-buoy ma", "perfsonarbuoy ma", "traceroute ma" ],
		"custom": {
			"title": "Access URLs",
			"type": "ma"
		},
		"action": "Query"
	}
};

////////////////////////////////////////
// Record Map
////////////////////////////////////////

function RecordMap(records, map)
{
	this.records = {};
	for (var i = 0 ; i < records.length ; i++)
	{
		var record = records[i];
		var type = record["type"][0];
		if (this.records[record["ls-host"]])
		{
			if (this.records[record["ls-host"]][type])
				this.records[record["ls-host"]][type].push(record);
			else
				this.records[record["ls-host"]][type] = [ record ];
		}
		else
		{
			this.records[record["ls-host"]] = {};
			this.records[record["ls-host"]][type] = [ record ];
		}
	}
	if (map)
	{
		var hosts = this.getHosts();
		for (var i = 0 ; i < hosts.length ; i++)
			this.mapHost(hosts[i]);
		var interfaces = this.getInterfaces();
		for (var i = 0 ; i < interfaces.length ; i++)
			this.mapInterface(interfaces[i]);
		var services = this.getServices();
		for (var i = 0 ; i < services.length ; i++)
			this.mapService(services[i]);
	}
}

RecordMap.prototype = {
	"getRecords": function(type, record) {
		var records = [];
		if (type)
		{
			if (record)
			{
				if (this.records[record["ls-host"]])
				{
					if (this.records[record["ls-host"]][type])
						$.merge(records, this.records[record["ls-host"]][type]);
				}
			}
			else
			{
				for (var lsHost in this.records)
				{
					if (this.records[lsHost][type])
						$.merge(records, this.records[lsHost][type]);
				}
			}
		}
		else
		{
			if (record)
			{
				if (this.records[record["ls-host"]])
				{
					for (var type in this.records[record["ls-host"]])
						$.merge(records, this.records[record["ls-host"]]);
				}
			}
			else
			{
				for (var lsHost in this.records)
				{
					for (var type in this.records[lsHost])
						$.merge(records, this.records[lsHost][type]);
				}
			}
		}
		return records;
	},
	"getHosts": function(record) {
		return this.getRecords("host", record);
	},
	"getInterfaces": function(record) {
		return this.getRecords("interface", record);
	},
	"getPersons": function(record) {
		return this.getRecords("person", record);
	},
	"getServices": function(record) {
		return this.getRecords("service", record);
	},
	"getAdministrators": function(record, persons) {
		if (!persons)
			persons = this.getPersons(record);
		var type = record["type"][0];
		if (hasField(record, type + "-administrators"))
		{
			var administrators = [];
			for (var i = 0 ; i < persons.length ; i++)
			{
				if ($.inArray(persons[i]["uri"], record[type + "-administrators"]) >= 0)
					administrators.push(persons[i]);
			}
			if (administrators[0])
				return administrators;
		}
		return null;
	},
	"getHost": function(record, hosts) {
		if (!hosts)
			hosts = this.getHosts(record);
		var type = record["type"][0];
		if (type == "host")
		{
			return record;
		}
		else if (type == "interface")
		{
			for (var i = 0 ; i < hosts.length ; i++)
			{
				if (record["ls-host"] == hosts[i]["ls-host"])
				{
					if (hasField(hosts[i], "host-net-interfaces"))
					{
						if ($.inArray(record["uri"], hosts[i]["host-net-interfaces"]) >= 0)
							return hosts[i];
					}
				}
			}
		}
		else if (type == "service")
		{
			if (hasField(record, "service-host"))
			{
				for (var i = 0 ; i < hosts.length ; i++)
				{
					if (record["ls-host"] == hosts[i]["ls-host"])
					{
						if ($.inArray(hosts[i]["uri"], record["service-host"]) >= 0)
							return hosts[i];
					}
				}
			}
		}
		return null;
	},
	"mapHost": function(host) {
		var administrators = this.getAdministrators(host);
		if (administrators)
		{
			for (var i = 0 ; i < administrators.length ; i++)
			{
				if (administrators[i].hosts)
					administrators[i].hosts.push(host);
				else
					administrators[i].hosts = [ host ];
			}
			host.administrators = administrators;
		}
	},
	"mapInterface": function(interface) {
		var host = this.getHost(interface);
		if (host)
		{
			if (host.interfaces)
				host.interfaces.push(interface);
			else
				host.interfaces = [ interface ];
			interface.host = host;
		}
	},
	"mapService": function(service) {
		var host = this.getHost(service);
		if (host)
		{
			if (host.services)
				host.services.push(service);
			else
				host.services = [ service ];
			service.host = host;
		}
		var administrators = this.getAdministrators(service);
		if (administrators)
		{
			for (var i = 0 ; i < administrators.length ; i++)
			{
				if (administrators[i].services)
					administrators[i].services.push(service);
				else
					administrators[i].services = [ service ];
			}
			service.administrators = administrators;
		}
	}
};

////////////////////////////////////////
// Record Data Functions
////////////////////////////////////////

function getAddresses(record)
{
	var addresses = [];
	var type = record["type"][0];
	if (type == "host")
	{
		if (hasField(record, "host-name"))
			addresses = record["host-name"];
	}
	else if (type == "interface")
	{
		if (hasField(record, "interface-addresses"))
			addresses = record["interface-addresses"];
	}
	else if (type == "service")
	{
		if (hasField(record, "service-locator"))
			addresses = record["service-locator"];
	}
	return addresses;
}

function getCommandLine(service, formats)
{
	var commandLine = [];
	var type = "";
	if (hasField(service, "service-type"))
		type = service["service-type"][0];
	var locators = getAddresses(service);
	var addresses = [];
	for (var i = 0 ; i < locators.length ; i++)
		addresses.push(getHostFromURI(locators[i]));
	addresses.sort(function(a, b) { return compareHostnames(a, b); });
	var version = "";
	if ((service.host) && (hasField(service.host, "pshost-toolkitversion")))
		version += parseFloat(service.host["pshost-toolkitversion"]);
	for (var i = 0 ; i < addresses.length ; i++)
	{
		var address = addresses[i];
		var v6 = "";
		if ((hostnamev6.test(address)) || (getAddressType(address) == "IPv6"))
			v6 = "-v6";
		if (hasField(service, type + "-tools"))
		{
			for (var format in formats)
			{
				if ($.inArray(format, service[type + "-tools"]) >= 0)
				{
					if (formats[format + version + v6])
						format += version + v6;
					else if (formats[format + version])
						format += version;
					else if (formats[format + v6])
						format += v6;
					commandLine.push(formats[format].replace("<address>", addresses[i]));
				}
			}
		}
		else
		{
			var format = "default";
			if (formats[format + version + v6])
				format += version + v6;
			else if (formats[format + version])
				format += version;
			else if (formats[format + v6])
				format += v6;
			commandLine.push(formats[format].replace("<address>", addresses[i]));
		}
	}
	return commandLine;
}

function getHostname(record)
{
	var type = record["type"][0];
	if (hasField(record, type + "-hostname"))
		return record[type + "-hostname"];
	var hostnames = getHostnames(record);
	if (hostnames[0])
		return hostnames[0];
	else
		return null;
}

function getHostnames(record)
{
	var hostnames = [];
	var addresses = getAddresses(record);
	var type = record["type"][0];
	if (hasField(record, type + "-hostname"))
		hostnames.push(record[type + "-hostname"]);
	for (var i = 0 ; i < addresses.length ; i++)
		hostnames.push(getHostnameFromURI(addresses[i]));
	hostnames = hostnames.sort(function(a, b) { return compareHostnames(a, b); }).unique();
	return hostnames;
}

function getLatLng(record)
{
	var latlng = null;
	if ((hasField(record, "location-latitude")) && (hasField(record, "location-longitude")))
	{
		var lat = parseFloat(record["location-latitude"][0]);
		var lng = parseFloat(record["location-longitude"][0]);
		latlng = new google.maps.LatLng(lat, lng);
		if (!latlng.lat() || !latlng.lng())
			latlng = null;
		if (record.host)
			latlng = getLatLng(record.host);
	}
	return latlng;
}

function getLatLngString(record)
{
	var latlngString = "";
	if ((hasField(record, "location-latitude")) && (hasField(record, "location-longitude")))
	{
		var lat = (parseFloat(record["location-latitude"][0])).toFixed(4);
		var lng = (parseFloat(record["location-longitude"][0])).toFixed(4);
		latlngString += "(" + lat + ", " + lng + ")";
	}
	return latlngString;
}

function getLocationString(record)
{
	var locationString = "";
	if (hasField(record, "location-sitename"))
		locationString += record["location-sitename"][0] + ", ";
	if (hasField(record, "location-city"))
		locationString += record["location-city"][0] + ", ";
	if (hasField(record, "location-state"))
	{
		locationString += record["location-state"][0];
		if (hasField(record, "location-code"))
			locationString += " " + record["location-code"][0] + ", ";
		else
			locationString += ", ";
	}
	else if (hasField(record, "location-code"))
	{
		locationString += record["location-code"][0] + ", ";
	}
	if (hasField(record, "location-country"))
		locationString += getCountryString(record["location-country"][0]);
	return locationString.replace(/^[\s,]+|[\s,]+$/g, "");
}

function getMemoryString(host)
{
	var memoryString = "";
	if (hasField(host, "host-hardware-memory"))
	{
		var size = parseSize(host["host-hardware-memory"][0]);
		memoryString += formatSize(size, 2, "GB");
	}
	return memoryString;
}

function getNICSpeedString(interface)
{
	var NICSpeedString = "";
	if (hasField(interface, "interface-capacity"))
	{
		var rate = parseRate(interface["interface-capacity"][0], true);
		if (rate >= Math.pow(10, 9))
			NICSpeedString += formatRate(rate, 0, "Gbit/s");
		else
			NICSpeedString += formatRate(rate, 0, "Mbit/s");
	}
	return NICSpeedString;
}

function getOSString(host)
{
	var OSString = "";
	if (hasField(host, "host-os-name"))
		OSString += host["host-os-name"][0] + " ";
	if (hasField(host, "host-os-version"))
		OSString += host["host-os-version"][0];
	return $.trim(OSString);
}

function getProcessorStrings(host)
{
	var processorStrings = [];
	var processors = 1;
	if (hasField(host, "host-hardware-processorcount"))
		processors = parseInt(host["host-hardware-processorcount"][0]);
	var speed = "";
	if (hasField(host, "host-hardware-processorspeed"))
		speed += formatSpeed(parseSpeed(host["host-hardware-processorspeed"][0]), 2, "GHz") + " ";
	var cores = 0;
	if (hasField(host, "host-hardware-processorcore"))
		cores = Math.ceil(parseInt(host["host-hardware-processorcore"][0]) / processors);
	var processorString = "";
	if (speed)
	{
		if (cores)
		{
			if (cores == 1)
				processorString = speed + "(" + cores + " core)";
			else
				processorString = speed + "(" + cores + " cores)";
		}
		else
		{
			processorString = speed;
		}
	}
	else if (cores)
	{
		if (cores == 1)
			processorString = cores + " core";
		else
			processorString = cores + " cores";
	}
	if (processorString)
	{
		for (var i = 0 ; i < processors ; i++)
			processorStrings.push(processorString);
	}
	return processorStrings;
}

function getServiceMapping(service)
{
	var type = "";
	var subtype = "";
	if (hasField(service, "service-type"))
		type = service["service-type"][0];
	if (hasField(service, type + "-type"))
		subtype = service[type + "-type"][0];
	if (serviceMap[type])
	{
		if ((subtype) && (serviceMap[type]["types"]) && (serviceMap[type]["types"][subtype]))
			return serviceMap[type]["types"][subtype];
		else
			return serviceMap[type];
	}
	return null;
}

function getServiceTypeTitle(service)
{
	var type = "";
	var subtype = "";
	if (hasField(service, "service-type"))
		type = service["service-type"][0];
	if (hasField(service, type + "-type"))
		subtype = service[type + "-type"][0];
	if (subtype)
	{
		if (serviceMap[type])
		{
			if (serviceMap[type]["types"][subtype])
				return serviceMap[type]["types"][subtype]["title"];
			else
				return subtype + " " + serviceMap[type]["title"];
		}
		else
		{
			return subtype + " " + type;
		}
	}
	else
	{
		if (serviceMap[type])
			return serviceMap[type]["title"];
		else
			return type;
	}
}

function getTitle(record)
{
	var type = record["type"][0];
	if (type == "host")
	{
		if (hasField(record, "location-sitename"))
			return record["location-sitename"][0];
		hostname = getHostname(record);
		if (hostname)
			return hostname;
	}
	else if (type == "interface")
	{
		if (hasField(record, "location-sitename"))
			return record["location-sitename"][0];
		var hostname = getHostname(record);
		if (hostname)
			return hostname;
	}
	else if (type == "person")
	{
		if (hasField(record, "person-name"))
			return record["person-name"][0];
		if (hasField(record, "person-emails"))
			return record["person-emails"][0];
	}
	else if (type == "service")
	{
		if (hasField(record, "location-sitename"))
			return record["location-sitename"][0];
		if (hasField(record, "service-name"))
		{
			var serviceName = record["service-name"][0];
			var defaultName = false;
			for (var type in serviceMap)
			{
				if ($.inArray(serviceName.toLowerCase(), serviceMap[type]["defaults"]) >= 0)
				{
					defaultName = true;
					break;
				}
			}
			if (!defaultName)
			{
				if (hasField(record, "service-type"))
					return $.trim(serviceName.replace(record["service-type"][0] + ":", "").replace(getServiceTypeTitle(record), ""));
				else
					return serviceName;
			}
		}
		var hostname = getHostname(record);
		if (hostname)
			return hostname;
	}
	else
	{
		if (hasField(record, type + "-name"))
			return record[type + "-name"][0];
	}
	return null;
}

function hasField(record, field)
{
	return ((record[field]) && (record[field][0]));
}
