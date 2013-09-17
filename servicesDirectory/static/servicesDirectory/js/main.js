var initialized = false;

var hosts = [];
var interfaces = [];
var services = [];
var communities = [];

var serviceTypes = {
	"bwctl": { "title": "BWCTL Server", "defaults": [ "bwctl server" ], "command": "bwctl -T iperf -t 20 -i 1 -c -f m <address>:<port>", "action": "" },
	"ndt": { "title": "NDT Server", "defaults": [ "ndt server" ], "command": "web100clt -n <address> -ll", "action": "Test" },
	"npad": { "title": "NPAD Server", "defaults": [ "npad server" ], "command": "", "action": "Test" },
	"owamp": { "title": "OWAMP Server", "defaults": [ "owamp server" ], "command": "owping <address>:<port>", "action": "" },
	"ma": { "title": "MA", "types": {
		"bwctl": { "title": "BWCTL MA", "defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ], "command": "", "action": "Query" },
		"owamp": { "title": "OWAMP MA", "defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ], "command": "", "action": "Query" },
		"traceroute": { "title": "Traceroute MA", "defaults": [ "traceroute ma" ], "command": "", "action": "Query" }
	}, "defaults": [ "perfsonar-buoy ma", "perfsonarbuoy ma", "traceroute ma" ], "command": "", "action": "Query" },
	"ping": { "title": "Ping Responder", "defaults": [ "ping responder" ], "command": "ping <address>", "action": "" },
	"traceroute": { "title": "Traceroute Responder", "defaults": [ "traceroute responder" ], "command": "traceroute <address>", "action": "" }
};

// Initialize Map
var map = $("#map-canvas").gmap({
	"center": new google.maps.LatLng(0, 0),
	"zoom": 2,
	"streetViewControl": false,
	"mapTypeId": google.maps.MapTypeId.ROADMAP,
	"noClear": true
});
var geocoder = new google.maps.Geocoder();
geocoder.geocode({ "address": "United States" }, function(results, status)
{
	if ((status == google.maps.GeocoderStatus.OK) && (results[0].geometry) && (results[0].geometry.viewport))
		map.gmap("get", "map").fitBounds(results[0].geometry.viewport);
});
var activeMarker = null;
var markers = {};

// Initialize Tree
var treeNodes = [];
for (var type in serviceTypes)
{
	var children = [];
	if (serviceTypes[type]["types"])
		for (var subtype in serviceTypes[type]["types"])
			children.push({ "title": serviceTypes[type]["types"][subtype]["title"], "type": subtype, "isFolder": true, "children": [] });
	treeNodes.push({ "title": serviceTypes[type]["title"], "type": type, "isFolder": true, "children": children });
}
var tree = $("#tree").dynatree({ "onActivate": function(node) { onNodeActivate(node); }, "children": treeNodes, "debugLevel": 0 });

// Load data
// $.getJSON(window.location.href + "query?filter=default&geocode=true&remap=true", function(records) { initialize(records) });
$.getJSON(window.location.href + "query?filter=default&geocode=true", function(records) { initialize(records); });

function initialize(records)
{
	for (var i = 0 ; i < records.length ; i++)
	{
		var record = records[i];
		var type = record["type"][0];
		if (type == "service")
			services.push(record);
		else if (type == "host")
			hosts.push(record);
		else if (type == "interface")
			interfaces.push(record);
		if ((record["group-communities"]) && (record["group-communities"][0]))
			communities = communities.concat(record["group-communities"]);
	}
	for (var i = 0 ; i < services.length ; i++)
	{
		var service = services[i];
		try
		{
			addServiceNode(service);
			addServiceMarker(service);
		}
		catch (error) {}
	}
	updateCommunities();
	updateTree();
	initialized = true;
}

function filterResults()
{
	
}

function resetResults()
{
	$("#search").val("");
	
}

function updateCommunities()
{
	communities = uniqueSort(communities);
	var options = $("#communities");
	for (var i = 0 ; i < communities.length ; i++)
		options.append($("<option>", { "value": i }).text(communities[i]).attr("selected", "true"));
}

function updateTree()
{
	tree.dynatree("getTree").reload();
	tree.dynatree("getRoot").sortChildren(null, true);
}

function addServiceMarker(service)
{
	var marker = null;
	var host = getHost(service, hosts);
	var latlng = getLatLng(service, host);
	if (latlng)
	{
		if (markers[latlng])
		{
			marker = markers[latlng];
		}
		else
		{
			marker = map.gmap("addMarker", { "position": latlng });
			marker.click(function() { onMarkerActivate(this); });
			marker[0]["records"] = { "hosts": [], "services": [] };
			markers[latlng] = marker;
		}
		if (host)
			marker[0]["records"]["hosts"].push(host);
		marker[0]["records"]["services"].push(service);
	}
}

function addServiceNode(service)
{
	var node = null;
	var subnode = null;
	var type = service["service-type"][0];
	var subtype = "";
	if ((service[type + "-type"]) && (service[type + "-type"][0]))
		subtype = service[type + "-type"][0];
	var title = getTitle(service);
	if (!title)
		return;
	for (var i = 0 ; i < treeNodes.length ; i++)
	{
		if (treeNodes[i]["type"].toLowerCase() == type.toLowerCase())
		{
			node = treeNodes[i];
			if (subtype)
			{
				for (var j = 0 ; j < node["children"].length ; j++)
				{
					if (node["children"][j]["type"].toLowerCase() == subtype.toLowerCase())
					{
						subnode = node["children"][j];
						break;
					}
				}
			}
			break;
		}
	}
	if (!node)
		node = treeNodes[treeNodes.push({ "title": type, "type": type, "isFolder": true, "children": [] }) - 1];
	if ((!subnode) && (subtype))
		subnode = node["children"][node["children"].push({ "title": subtype, "type": subtype, "isFolder": true, "children": [] }) - 1];
	if (subtype)
		subnode["children"].push({ "title": title, "type": "service", "records": [ service ] });
	else
		node["children"].push({ "title": title, "type": "service", "records": [ service ] });
}

function onMarkerActivate(marker)
{
	if ((!marker["records"]) || ((!marker["records"]["hosts"]) && (!marker["records"]["services"])))
		return;
	var content = "";
	var contentMap = {};
	var sorter = function (a,b)
	{
		var type_a = a["service-type"][0];
		var type_b = b["service-type"][0];
		if (type_a < type_b) return -1;
		else if (type_a > type_b) return 1;
		else return 0;
	};
	for (var i = 0 ; i < marker["records"]["services"].length ; i++)
	{
		var service = marker["records"]["services"][i];
		var host = getHost(service, marker["records"]["hosts"]);
		var title = "";
		if (host)
			title = getTitle(host);
		else
			title = getTitle(service);
		if (contentMap[title])
			contentMap[title].push(service);
		else
			contentMap[title] = [ service ];
	}
	content += "<dl>";
	for (var key in contentMap)
	{
		contentMap[key].sort(sorter);
		content += "<dt>" + key + "</dt>";
		for (var i = 0 ; i < contentMap[key].length ; i++)
		{
			var uri = contentMap[key][i]["uri"];
			var locator = "";
			if ((contentMap[key][i]["service-locator"]) && (contentMap[key][i]["service-locator"][0]))
				locator = contentMap[key][i]["service-locator"][0];
			var title = getServiceTypeTitle(contentMap[key][i]);
			content += "<dd><a href=\"#\" class=\"info-window-service\" name=\"" + uri + "\" title=\"" + locator + "\">" + title + "</a></dd>";
		}
	}
	content += "</dl>";
	map.gmap("openInfoWindow", { "content": content }, marker, function(infoWindow)
	{
		if (!activeMarker)
		{
			google.maps.event.addListener(infoWindow, 'domready', function()
			{
				$(".info-window-service").click(function(event)
				{
					onInfoWindowActivate($(this));
					event.preventDefault(event);
				});
			});
		}
	});
	activeMarker = marker;
}

function onNodeActivate(node)
{
	if ((!node.data["records"]) || (!node.data["records"][0]))
		return;
	var service = node.data["records"][0];
	var host = getHost(service, hosts);
	var latlng = getLatLng(service, host);
	if ((latlng) && (markers[latlng]) && (markers[latlng])[0])
		onMarkerActivate(markers[latlng][0]);
	else
		map.gmap("closeInfoWindow");
	showServiceInfo(service);
	showHostInfo(host);
}

function onInfoWindowActivate(element)
{
	if (!activeMarker)
		return;
	var uri = element.prop("name");
	for (var i = 0 ; i < activeMarker["records"]["services"].length ; i++)
	{
		var service = activeMarker["records"]["services"][i];
		if (service["uri"] == uri)
		{
			var host = getHost(service, activeMarker["records"]["hosts"]);
			showServiceInfo(service);
			showHostInfo(host);
			return;
		}
	}
}

function showServiceInfo(service)
{
	if (service["service-name"])
		$("#service-name").html(service["service-name"].join("<br />"));
	else
		$("#service-name").html("");
	if (service["service-locator"])
		$("#service-locator").html(service["service-locator"].join("<br />"));
	else
		$("#service-locator").html("");
	var locationString = getLocationString(service);
	var latlngString = getLatLngString(service);
	if ((locationString) && (latlngString))
		$("#service-location").html(locationString + "<br />" + latlngString);
	else if (locationString)
		$("#service-location").html(locationString);
	else if (latlngString)
		$("#service-location").html(latlngString);
	else
		$("#service-location").html("");
	if (service["group-communities"])
		$("#service-communities").html(service["group-communities"].sort().join("<br />"));
	else
		$("#service-communities").html("");
	$("#service-command-line").html(getCommandLine(service).join("<br />"));
}

function showHostInfo(host)
{
	if (!host)
		host = { "type": "host" };
	if (host["host-name"])
		$("#host-name").html(host["host-name"].join("<br />"));
	else
		$("#host-name").html("");
	var cpuString = getCPUString(host);
	var memoryString = getMemoryString(host);
	if ((cpuString) && (memoryString))
		$("#host-hardware").html("CPU: " + cpuString + "<br />" + "Memory: " + memoryString);
	else if (cpuString)
		$("#host-hardware").html("CPU: " + cpuString);
	else if (memoryString)
		$("#host-hardware").html("Memory: " + memoryString);
	else
		$("#host-hardware").html("");
	var osString = getOSString(host);
	var kernelString = getKernelString(host);
	if ((osString) && (kernelString))
		$("#host-os").html("Operating System: " + osString + "<br />" + "Kernel: " + kernelString);
	else if (osString)
		$("#host-os").html("Operating System: " + osString);
	else if (kernelString)
		$("#host-os").html("Kernel: " + kernelString);
	else
		$("#host-os").html("");
	if (host["pshost-toolkitversion"])
		$("#host-version").html(host["pshost-toolkitversion"].join("<br />"));
	else
		$("#host-version").html("");
	if (host["group-communities"])
		$("#host-communities").html(host["group-communities"].sort().join("<br />"));
	else
		$("#host-communities").html("");
}

function getCommandLine(service)
{
	if (!service["service-locator"])
		return [];
	var type = service["service-type"][0];
	var subtype = "";
	if ((service[type + "-type"]) && (service[type + "-type"][0]))
		subtype = service[type + "-type"][0];
	if (!serviceTypes[type])
		return [];
	var format = "";
	if ((subtype) && (serviceTypes[type]["types"][subtype]))
		format = serviceTypes[type]["types"][subtype]["command"];
	else
		format = serviceTypes[type]["command"];
	var commands = [];
	for (var i = 0 ; i < service["service-locator"].length ; i++)
	{
		var address = getHostname(service["service-locator"][i]);
		var port = getURLParser(service["service-locator"][i]).port;
		commands.push(format.replace("<address>", address).replace("<port>", port));
	}
	return commands;
}

function getHost(record, hosts)
{
	var type = record["type"][0];
	if (type == "host")
	{
		return record;
	}
	else if (type == "interface")
	{
		for (var i = 0 ; i < hosts.length ; i++)
		{
			if ($.inArray(record["uri"], hosts[i]["host-net-interfaces"]))
				return hosts[i];
		}
	}
	else if (type == "service")
	{
		for (var i = 0 ; i < hosts.length ; i++)
		{
			if (hosts[i]["uri"] == record["service-host"])
				return hosts[i];
		}
	}
	return null;
}

function getHostname(url)
{
	var hostname = getURLParser(url).hostname;
	if ((hostname) && (hostname != window.location.hostname))
		return hostname;
	else
		return url;
}

function getLatLng(record, host)
{
	var latlng = null;
	if ((record["location-latitude"]) && (record["location-latitude"][0]) && (record["location-longitude"]) && (record["location-longitude"][0]))
		latlng = new google.maps.LatLng(record["location-latitude"][0], record["location-longitude"][0]);
	if ((!latlng) && (host) && (host["location-latitude"]) && (host["location-latitude"][0]) && (host["location-longitude"]) && (host["location-longitude"][0]))
		latlng = new google.maps.LatLng(host["location-latitude"][0], host["location-longitude"][0]);
	return latlng;
}

function getCPUString(record)
{
	var cpuString = "";
	var type = record["type"][0];
	if ((record[type + "-hardware-processorcount"]) && (record[type + "-hardware-processorcount"][0]))
		cpuString += record[type + "-hardware-processorcount"][0] + " ";
	if ((record[type + "-hardware-processorspeed"]) && (record[type + "-hardware-processorspeed"][0]))
		cpuString += record[type + "-hardware-processorspeed"][0] + " ";
	if ((record[type + "-hardware-processorcore"]) && (record[type + "-hardware-processorcore"][0]))
		cpuString += record[type + "-hardware-processorcore"][0] + " core(s)";
	return cpuString;
}

function getKernelString(record)
{
	var kernelString = "";
	var type = record["type"][0];
	if ((record[type + "-os-kernel"]) && (record[type + "-os-kernel"][0]))
		kernelString += record[type + "-os-kernel"][0];
	return kernelString;
}

function getLatLngString(record)
{
	var latlngString = "";
	if ((record["location-latitude"]) && (record["location-latitude"][0]))
		if ((record["location-longitude"]) && (record["location-longitude"][0]))
			latlngString += "(" + record["location-latitude"][0] + ", " + record["location-longitude"][0] + ")";
	return latlngString;
}

function getLocationString(record)
{
	var locationString = "";
	if ((record["location-sitename"]) && (record["location-sitename"][0]))
		locationString += record["location-sitename"][0] + ", ";
	if ((record["location-city"]) && (record["location-city"][0]))
		locationString += record["location-city"][0] + ", ";
	if ((record["location-state"]) && (record["location-state"][0]))
	{
		locationString += record["location-state"][0];
		if ((record["location-code"]) && (record["location-code"][0]))
			locationString += " " + record["location-code"][0] + ", ";
		else
			locationString += ", ";
	}
	else if ((record["location-code"]) && (record["location-code"][0]))
	{
		locationString += record["location-code"][0] + ", ";
	}
	if ((record["location-country"]) && (record["location-country"][0]))
		locationString += record["location-country"][0];
	return $.trim(locationString);
}

function getMemoryString(record)
{
	var memoryString = "";
	var type = record["type"][0];
	if ((record[type + "-hardware-memory"]) && (record[type + "-hardware-memory"][0]))
		memoryString += record[type + "-hardware-memory"][0];
	return memoryString;
}

function getOSString(record)
{
	var osString = "";
	var type = record["type"][0];
	if ((record[type + "-os-name"]) && (record[type + "-os-name"][0]))
		osString += record[type + "-os-name"][0] + " ";
	if ((record[type + "-os-version"]) && (record[type + "-os-version"][0]))
		osString += record[type + "-os-version"][0];
	return osString;
}

function getServiceTypeTitle(service)
{
	var type = service["service-type"][0];
	var subtype = "";
	if ((service[type + "-type"]) && (service[type + "-type"][0]))
		subtype = service[type + "-type"][0];
	if (subtype)
	{
		if (serviceTypes[type])
			if (serviceTypes[type]["types"][subtype])
				return serviceTypes[type]["types"][subtype]["title"];
			else
				return subtype + " " + serviceTypes[type]["title"];
		else
			return subtype + " " + type;
	}
	else
	{
		if (serviceTypes[type])
			return serviceTypes[type]["title"];
		else
			return type;
	}
}

function getTitle(record)
{
	var type = record["type"][0];
	if ((record[type + "-name"]) && (record[type + "-name"][0]))
	{
		if (type == "host")
		{
			if ((record["location-sitename"]) && (record["location-sitename"][0]))
				return record["location-sitename"][0];
		}
		else if (type == "interface")
		{
			if ((record["location-sitename"]) && (record["location-sitename"][0]))
				return record["location-sitename"][0];
			var host = getHost(record, hosts);
			if (host)
			{
				if ((host["location-sitename"]) && (host["location-sitename"][0]))
					return host["location-sitename"][0];
				else if ((host["host-name"]) && (host["host-name"][0]))
					return host["host-name"][0];
			}
		}
		else if (type == "service")
		{
			for (type in serviceTypes)
			{
				if ($.inArray(record["service-name"][0].toLowerCase(), serviceTypes[type]["defaults"]) >= 0)
				{
					if ((record["location-sitename"]) && (record["location-sitename"][0]))
						return record["location-sitename"][0];
					var host = getHost(record, hosts);
					if (host)
					{
						if ((host["location-sitename"]) && (host["location-sitename"][0]))
							return host["location-sitename"][0];
						else if ((host["host-name"]) && (host["host-name"][0]))
							return host["host-name"][0];
					}
					if ((record["service-locator"]) && (record["service-locator"][0]))
						return getHostname(record["service-locator"][0]).replace("/[[]]/", "");
				}
			}
			if ((record["service-type"]) && record["service-type"][0])
				return $.trim(record["service-name"][0].replace(record["service-type"][0] + ":", "").replace(getServiceTypeTitle(record), ""));
		}
		return record[type + "-name"][0];
	}
	return null;
}

function getURLParser(url)
{
	var parser = document.createElement("a");
	parser.href = url;
	return parser;
}

function uniqueSort(array)
{
	var arr = array.concat();
	for (var i = 0 ; i < arr.length ; i++)
	{
		for(var j = i + 1 ; j < arr.length ; j++)
		{
			if(arr[i] == arr[j])
				arr.splice(j--, 1);
		}
	}
    return arr.sort();
}
