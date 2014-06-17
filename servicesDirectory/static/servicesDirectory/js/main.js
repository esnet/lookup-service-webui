var initialized = false;

var communities = [];

var filter = "";

var filtered = {
	"communities": [],
	"records": []
};

var recordMap = {};

var serviceMap = {
	"bwctl": {
		"title": "BWCTL Server",
		"defaults": [ "bwctl server" ],
		"custom": "bwctl -T iperf -t 20 -i 1 -f m -c <address>:<port>",
		"action": "Test"
	},
	"owamp": {
		"title": "OWAMP Server",
		"defaults": [ "owamp server" ],
		"custom": "owping -c 10000 -i 0.01 <address>:<port>",
		"action": "Ping"
	},
	"ndt": {
		"title": "NDT Server",
		"defaults": [ "ndt server" ],
		"custom": "web100clt -n <address> -ll",
		"action": "Test"
	},
	"npad": {
		"title": "NPAD Server",
		"defaults": [ "npad server" ],
		"custom": "",
		"action": "Test"
	},
	"ping": {
		"title": "Ping Responder",
		"defaults": [ "ping responder" ],
		"custom": "ping <address>",
		"action": "Ping"
	},
	"traceroute": {
		"title": "Traceroute Responder",
		"defaults": [ "traceroute responder" ],
		"custom": "traceroute <address>",
		"action": "Traceroute"
	},
	"ma": {
		"title": "MA",
		"types": {
			"bwctl": {
				"title": "BWCTL MA",
				"defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ],
				"custom": "",
				"action": "Query"
			},
			"owamp": {
				"title": "OWAMP MA",
				"defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ],
				"custom": "",
				"action": "Query"
			},
			"traceroute": {
				"title": "Traceroute MA",
				"defaults": [ "traceroute ma" ],
				"custom": "",
				"action": "Query"
			}
		},
		"defaults": [ "measurement archive", "perfsonar-buoy ma", "perfsonarbuoy ma", "traceroute ma" ],
		"custom": "",
		"action": "Query"
	}
};

////////////////////////////////////////
// Initialize Map
////////////////////////////////////////

var mapOptions = {
	"center": new google.maps.LatLng(0, 0),
	"zoom": 2,
	"streetViewControl": false,
	"mapTypeId": google.maps.MapTypeId.ROADMAP,
	"noClear": true
};
var map = initMap(mapOptions);

var defaultMarkerIcon = {
	"path": google.maps.SymbolPath.CIRCLE,
	"scale": 4.0,
	"fillColor": "#EF706C",
	"fillOpacity": 1,
	"strokeColor": "#E36C65",
	"strokeWeight": 1
};

var activeMarker = null;
var markers = {};

////////////////////////////////////////
// Initialize Tree
////////////////////////////////////////

var treeNodes = initTreeNodes();
var tree = initTree(treeNodes);

////////////////////////////////////////
// Initialize Input Events
////////////////////////////////////////

$("#communities").change(function(event) {
	if (initialized)
	{
		updateFilter();
	}
});


$("#update").click(function(event) {
	if (initialized)
	{
		updateFilter();
	}
});

$("#clear").click(function(event) {
	if (initialized)
	{
		clearFilter();
		updateFilter();
	}
});

$("#search").keypress(function(event) {
	if ((initialized) && (event.keyCode == 13))
	{
		updateFilter();
		event.preventDefault();
	}
});

////////////////////////////////////////
// Load Data
////////////////////////////////////////

$.getJSON("query?filter=default&geocode=true&remap=true", function(records) { initialize(records); });

////////////////////////////////////////
// Initialize Functions
////////////////////////////////////////

function initMap(mapOptions)
{
	var map = $("#map-canvas").gmap(mapOptions);
	var content = "<div id=\"info-window-content\"><dl></dl></div>";
	map.gmap("openInfoWindow", { "content": content }, null);
	map.gmap("closeInfoWindow");
	return map;
}

function initTree(treeNodes)
{
	var tree = $("#tree").fancytree({
		"activate": function(event, data) { onNodeActivate(data.node); },
		"source": treeNodes
	});
	return tree;
}

function initTreeNodes()
{
	var treeNodes = [];
	for (var type in serviceMap)
	{
		var children = [];
		if (serviceMap[type]["types"])
		{
			for (var subtype in serviceMap[type]["types"])
			{
				children.push({
					"title": serviceMap[type]["types"][subtype]["title"],
					"type": subtype,
					"folder": true,
					"children": []
				});
			}
		}
		treeNodes.push({
			"title": serviceMap[type]["title"],
			"type": type,
			"folder": true,
			"children": children
		});
	}
	return treeNodes;
}

function initialize(records)
{
	for (var i = 0 ; i < records.length ; i++)
	{
		var record = records[i];
		var type = record["type"][0];
		if (recordMap[record["ls-host"]])
		{
			if (recordMap[record["ls-host"]][type])
				recordMap[record["ls-host"]][type].push(record);
			else
				recordMap[record["ls-host"]][type] = [ record ];
		}
		else
		{
			recordMap[record["ls-host"]] = {};
			recordMap[record["ls-host"]][type] = [ record ];
		}
		if (hasField(record, "group-communities"))
			$.merge(communities, record["group-communities"]);
	}
	var interfaces = getInterfaces();
	for (var i = 0 ; i < interfaces.length ; i++)
	{
		mapInterface(interfaces[i]);
	}
	var services = getServices();
	for (var i = 0 ; i < services.length ; i++)
	{
		mapService(services[i]);
		addServiceNode(services[i]);
		addServiceMarker(services[i]);
	}
	updateCommunities();
	updateMap();
	updateTree();
	updateStatus();
	initialized = true;
}

function addServiceMarker(service)
{
	var latlng = getLatLng(service);
	if (latlng)
	{
		var marker = null;
		if (markers[latlng])
		{
			marker = markers[latlng];
		}
		else
		{
			marker = map.gmap("addMarker", {
				"position": latlng,
				"title": "?",
				"icon": defaultMarkerIcon,
				"optimized": false
			}).click(function() { onMarkerActivate(this); }).get(0);
			marker.filtered = [];
			marker.services = [];
			markers[latlng] = marker;
		}
		marker.filtered.push(service);
		marker.services.push(service);
	}
}

function addServiceNode(service)
{
	var type = "";
	var subtype = "";
	if (hasField(service, "service-type"))
		type = service["service-type"][0];
	if (hasField(service, type + "-type"))
		subtype = service[type + "-type"][0];
	var title = getTitle(service);
	var hostname = getHostname(service);
	if ((!title) || (!hostname))
		return;
	if (title != hostname)
		title = "<b>" + hostname + "</b> (" + title + ")";
	else
		title = "<b>" + title + "</b>";
	var node = null;
	var subnode = null;
	for (var i = 0 ; i < treeNodes.length ; i++)
	{
		if (treeNodes[i]["type"] == type.toLowerCase())
		{
			node = treeNodes[i];
			if (subtype)
			{
				for (var j = 0 ; j < node["children"].length ; j++)
				{
					if (node["children"][j]["type"] == subtype)
					{
						subnode = node["children"][j];
						break;
					}
				}
			}
			break;
		}
	}
	if ((!node) && (type))
	{
		node = treeNodes[treeNodes.push({
			"title": type,
			"type": type,
			"folder": true,
			"children": []
		}) - 1];
	}
	if ((!subnode) && (subtype))
	{
		subnode = node["children"][node["children"].push({
			"title": subtype,
			"type": subtype,
			"folder": true,
			"children": []
		}) - 1];
	}
	var serviceNode = {
		"title": title,
		"type": "service",
		"tooltip": hostname,
	};
	serviceNode.service = service;
	if (subtype)
		subnode["children"].push(serviceNode);
	else if (type)
		node["children"].push(serviceNode);
	else
		treeNodes.push(serviceNode);
}

////////////////////////////////////////
// Event Functions
////////////////////////////////////////

function onMarkerActivate(marker)
{
	if (!marker.services)
		return;
	activeMarker = marker;
	map.gmap("openInfoWindow", {}, marker);
	updateInfoWindow();
}

function onInfoWindowActivate(service)
{
	if (!activeMarker)
		return;
	showServiceInfo(service);
	showHostInfo(service.host);
}

function onNodeActivate(node)
{
	if (!node.data["service"])
		return;
	var service = node.data["service"];
	var latlng = getLatLng(service);
	if ((latlng) && (markers[latlng]))
		onMarkerActivate(markers[latlng]);
	else
		map.gmap("closeInfoWindow");
	showServiceInfo(service);
	showHostInfo(service.host);
}

////////////////////////////////////////
// GUI Functions
////////////////////////////////////////

function showServiceInfo(service)
{
	clearServiceInfo();
	if (!service)
		return;
	if (hasField(service, "service-name"))
		$("#service-name").html(service["service-name"].join("<br>"));
	if (hasField(service, "service-locator"))
	{
		var hostnames = getHostnames(service).unique().sort(function(a, b) { compareHostnames(a, b); });
		var locators = [];
		for (var i = 0 ; i < hostnames.length ; i++)
			locators.push("<a href=\"http://" + hostnames[i] + "/\" target=\"_blank\">" + hostnames[i] + "</a>");
		$("#service-locator").html(locators.join("<br>"));
	}
	var locationString = getLocationString(service);
	var latlngString = getLatLngString(service);
	$("#service-location").html(locationString + "<br><div class=\"muted\">" + latlngString + "</div");
	if (hasField(service, "group-communities"))
		$("#service-communities").html(service["group-communities"].sort().join("<br>"));
}

function clearServiceInfo()
{
	$("#service-name").empty();
	$("#service-location").empty();
	$("#service-locator").empty();
	$("#service-communities").empty();
	$("#service-custom").empty();
}

function showHostInfo(host)
{
	clearHostInfo();
	if (!host)
		return;
	if (hasField(host, "host-name"))
        $("#host-name").html(host["host-name"].join("<br>"));
	
}

function clearHostInfo()
{
	$("#host-name").empty();
	$("#host-hardware").empty();
	$("#host-os").empty();
	$("#host-version").empty();
	$("#host-communities").empty();
}

function updateCommunities()
{
	communities = communities.unique().sort();
	var options = $("#communities");
	for (var i = 0 ; i < communities.length ; i++)
	{
		options.append($("<option>").attr({
			"selected": "true",
			"value": i
		 }).text(communities[i]));
	}
}

function updateFilter()
{
	
}

function updateInfoWindow()
{
	if (!activeMarker)
		return;
	var contentMap = {};
	var services = activeMarker.services;
	for (var i = 0 ; i < services.length ; i++)
	{
		var service = services[i];
		var section = "";
		if (services[i].host)
			section = getTitle(service.host);
		else
			section = getTitle(service);
		var hostname = getHostname(service);
		if ((!section) || (!hostname))
			continue;
		if (section != hostname)
			section += " (" + hostname + ")"
		if (contentMap[section])
			contentMap[section].push(service);
		else
			contentMap[section] = [ service ];
	}
	var sections = [];
	for (var section in contentMap)
		sections.push(section);
	sections.sort();
	var content = $("dl");
	for (var i = 0 ; i < sections.length ; i++)
	{
		var section = sections[i];
		content.append($("<dt>").text(section));
		contentMap[section].sort(function(a, b) {
			var type_a = "";
			var type_b = "";
			if (hasField(a, "service-type"))
				type_a = a["service-type"][0].toLowerCase();
			if (hasField(b, "service-type"))
				type_b = b["service-type"][0].toLowerCase();
			return type_a > type_b ? 1 : type_a < type_b ? -1 : 0;
		});
		for (var j = 0 ; j < contentMap[section].length ; j++)
		{
			var service = contentMap[section][j];
			var title = getServiceTypeTitle(service);
			var hostname = getHostname(service);
			content.append($("<dd>").append($("<a>").attr({
				"title": hostname, 
				"href": "#"
			}).text(title).data("service", service).click(function(event) { onInfoWindowActivate($(this).data("service")); })));
		}
	}
}

function updateMap()
{
	zoomToFitMarkers();
}

function updateStatus()
{
	$("#status").html("Showing: " + getServices().length + " of " + getServices().length + " services.");
}

function updateTree()
{
	updateTreeNodeCounts();
	tree.fancytree("getTree").reload();
	tree.fancytree("getRootNode").sortChildren(function(a, b) {
		isFolder_a = a.isFolder();
		isFolder_b = b.isFolder();
		if ((isFolder_a) || (isFolder_b))
			return !isFolder_a && isFolder_b ? 1 : isFolder_a && !isFolder_b ? -1 : 0; 
		return compareHostnames(a.tooltip, b.tooltip);
	}, true);
}

function updateTreeNodeCounts(nodes)
{
	if (!nodes)
		nodes = treeNodes;
	var count = 0;
	for (var i = 0 ; i < nodes.length ; i++)
	{
		var node = nodes[i];
		if (node["folder"])
		{
			var childCount = updateTreeNodeCounts(node["children"]);
			var title = node["title"].split("<span")[0];
			node["title"] = title + "<span class=\"badge tree-badge\">" + childCount + "</span>";
			count += childCount;
		}
		else
		{
			count++;
		}
	}
	return count;
}

function zoomToFitMarkers()
{
	var bounds = new google.maps.LatLngBounds();
	for (var latlng in markers)
		bounds.extend(markers[latlng].getPosition());
	if (!bounds.isEmpty())
		map.gmap("get", "map").fitBounds(bounds);
	var zoom = map.gmap("option", "zoom");
	zoom = zoom < 2 ? 2 : zoom > 6 ? 6 : zoom;
	map.gmap("option", "zoom", zoom);
}

////////////////////////////////////////
// Record Map Functions
////////////////////////////////////////

function getRecords(type, record)
{
	var records = [];
	if (type)
	{
		if (record)
		{
			if (recordMap[record["ls-host"]])
			{
				if (recordMap[record["ls-host"]][type])
					$.merge(records, recordMap[record["ls-host"]][type]);
			}
		}
		else
		{
			for (var lsHost in recordMap)
			{
				if (recordMap[lsHost][type])
					$.merge(records, recordMap[lsHost][type]);
			}
		}
	}
	else
	{
		if (record)
		{
			if (recordMap[record["ls-host"]])
			{
				for (var type in recordMap[record["ls-host"]])
					$.merge(records, recordMap[record["ls-host"]]);
			}
		}
		else
		{
			for (var lsHost in recordMap)
			{
				for (var type in recordMap[lsHost])
					$.merge(records, recordMap[lsHost][type]);
			}
		}
	}
	return records;
}

function getHosts(record)
{
	return getRecords("host", record);
}

function getInterfaces(record)
{
	return getRecords("interface", record);
}

function getPersons(record)
{
	return getRecords("person", record);
}

function getServices(record)
{
	return getRecords("service", record);
}

function getAdministrators(record, persons)
{
	var type = record["type"][0];
	if (hasField(record, type + "-administrators"))
	{
		var administrators = [];
		for (var i = 0 ; i < persons.length ; i++)
		{
			if ($.inArray(persons[i]["uri"], record[type + "-administrators"]))
				administrators.push(persons[i]);
		}
		return administrators;
	}
	return null;
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
}

function mapInterface(record)
{
	var host = getHost(record, getHosts(record));
	if (host)
	{
		if (host.interfaces)
			host.interfaces.push(record);
		else
			host.interfaces = [ record ];
		record.host = host;
	}
}

function mapService(record)
{
	var host = getHost(record, getHosts(record));
	if (host)
	{
		if (host.services)
			host.services.push(record);
		else
			host.services = [ record ];
		record.host = host;
	}
}

////////////////////////////////////////
// Record Data Functions
////////////////////////////////////////

function getHostname(record)
{
	var type = record["type"][0];
	if (hasField(record, type + "-hostname"))
		return record[type + "-hostname"];
	var hostnames = getHostnames(record).sort(function(a, b) {
		a = a.replace("-v6", "~");
		b = b.replace("-v6", "~");
		return a > b ? 1 : a < b ? -1 : 0;
	});
	for (var i = 0 ; i < hostnames.length ; i++)
	{
		if (getAddressType(hostnames[i]) == "Hostname")
			return hostnames[i];
	}
	if (hostnames[0])
		return hostnames[0];
	else
		return null;
}

function getHostnames(record)
{
	var addresses = [];
	var hostnames = [];
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
	if (hasField(record, type + "-hostname"))
		hostnames.push(record[type + "-hostname"]);
	for (var i = 0 ; i < addresses.length ; i++)
		hostnames.push(getHostnameFromURL(addresses[i]));
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
	return $.trim(locationString);
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
	else if (type == "service")
	{
		if (hasField(record, "location-sitename"))
			return record["location-sitename"][0];
		if (hasField(record, "service-name"))
		{
			var defaultName = false;
			for (type in serviceMap)
			{
				if ($.inArray(record["service-name"][0].toLowerCase(), serviceMap[type]["defaults"]) >= 0)
				{
					defaultName = true;
					break;
				}
			}
			if (!defaultName)
			{
				if (hasField(record, "service-type"))
					return $.trim(record["service-name"][0].replace(record["service-type"][0] + ":", "").replace(getServiceTypeTitle(record), ""));
				else
					return record["service-name"][0];
			}
		}
		var hostname = getHostname(record);
		if (hostname)
			return hostname;
	}
	if (hasField(record, type + "-name"))
		return record[type + "-name"][0];
	return null;
}

function hasField(record, field)
{
	return ((record[field]) && (record[field][0]));
}

////////////////////////////////////////
// Utility Functions
////////////////////////////////////////

Array.prototype.contains = function(key) {
	for (var i = 0 ; i < this.length ; i++)
	{
		if(this[i] === key)
			return true;
	}
	return false;
};

Array.prototype.unique = function() {
	var arr = [];
	for (var i = 0 ; i < this.length ; i++)
	{
		if(!arr.contains(this[i]))
			arr.push(this[i]);
	}
	return arr; 
};

function compareHostnames(hostname_a, hostname_b)
{
	order = {
		"Hostname": 0,
		"IPv4": 1,
		"IPv6": 2
	};
	order_a = order[getAddressType(hostname_a)];
	order_b = order[getAddressType(hostname_b)];
	return order_a > order_b ? 1 : order_a < order_b ? -1 : hostname_a > hostname_b ? 1 : hostname_a < hostname_b ? -1 : 0;
}

function getAddressType(address)
{
	var IPv4Format = /^\[?([\d]{1,3}\.){3}[\d]{1,3}\]?(:\d*){0,1}$/;
	var IPv6Format = /^\[?([\da-fA-F]{0,4}:){3,7}[\da-fA-F]{0,4}\]?(:\d*){0,1}$/;
	if (IPv4Format.test(address))
		return "IPv4";
	else if (IPv6Format.test(address))
		return "IPv6";
	else
		return "Hostname";
}

function getHostnameFromURL(url)
{
	var hostname = getURLParser(url).hostname;
	if ((hostname) && (hostname != window.location.hostname))
		return hostname.replace(/[\[\]]+/g, "");
	else
		return url;
}

function getURLParser(url)
{
	var parser = document.createElement("a");
	parser.href = url;
	return parser;
}

function getCountryString(country)
{
	var countryCodes = {
		"AC": "Ascension Island",
		"AD": "Andorra",
		"AE": "United Arab Emirates",
		"AF": "Afghanistan",
		"AG": "Antigua and Barbuda",
		"AI": "Anguilla",
		"AL": "Albania",
		"AM": "Armenia",
		"AN": "Netherlands Antilles",
		"AO": "Angola",
		"AQ": "Antarctica",
		"AR": "Argentina",
		"AS": "American Samoa",
		"AT": "Austria",
		"AU": "Australia",
		"AW": "Aruba",
		"AZ": "Azerbaijan",
		"BA": "Bosnia and Herzegovina",
		"BB": "Barbados",
		"BD": "Bangladesh",
		"BE": "Belgium",
		"BF": "Burkina Faso",
		"BG": "Bulgaria",
		"BH": "Bahrain",
		"BI": "Burundi",
		"BJ": "Benin",
		"BM": "Bermuda",
		"BN": "Brunei",
		"BO": "Bolivia",
		"BR": "Brazil",
		"BS": "Bahamas",
		"BT": "Bhutan",
		"BV": "Bouvet Island",
		"BW": "Botswana",
		"BY": "Belarus",
		"BZ": "Belize",
		"CA": "Canada",
		"CC": "Cocos (Keeling) Islands",
		"CD": "Congo, Democratic People's Republic",
		"CF": "Central African Republic",
		"CG": "Congo, Republic of",
		"CH": "Switzerland",
		"CI": "C&ocirc;te d'Ivoire",
		"CK": "Cook Islands",
		"CL": "Chile",
		"CM": "Cameroon",
		"CN": "China",
		"CO": "Colombia",
		"CR": "Costa Rica",
		"CU": "Cuba",
		"CV": "Cape Verde",
		"CX": "Christmas Island",
		"CY": "Cyprus",
		"CZ": "Czech Republic",
		"DE": "Germany",
		"DJ": "Djibouti",
		"DK": "Denmark",
		"DM": "Dominica",
		"DO": "Dominican Republic",
		"DZ": "Algeria",
		"EC": "Ecuador",
		"EE": "Estonia",
		"EG": "Egypt",
		"EH": "Western Sahara",
		"ER": "Eritrea",
		"ES": "Spain",
		"ET": "Ethiopia",
		"FI": "Finland",
		"FJ": "Fiji",
		"FK": "Falkland Islands (Malvina)",
		"FM": "Micronesia, Federal State of",
		"FO": "Faroe Islands",
		"FR": "France",
		"GA": "Gabon",
		"GD": "Grenada",
		"GE": "Georgia",
		"GF": "French Guiana",
		"GG": "Guernsey",
		"GH": "Ghana",
		"GI": "Gibraltar",
		"GL": "Greenland",
		"GM": "Gambia",
		"GN": "Guinea",
		"GP": "Guadeloupe",
		"GQ": "Equatorial Guinea",
		"GR": "Greece",
		"GS": "South Georgia and the South Sandwich Islands",
		"GT": "Guatemala",
		"GU": "Guam",
		"GW": "Guinea-Bissau",
		"GY": "Guyana",
		"HK": "Hong Kong",
		"HM": "Heard and McDonald Islands",
		"HN": "Honduras",
		"HR": "Croatia/Hrvatska",
		"HT": "Haiti",
		"HU": "Hungary",
		"ID": "Indonesia",
		"IE": "Ireland",
		"IL": "Israel",
		"IM": "Isle of Man",
		"IN": "India",
		"IO": "British Indian Ocean Territory",
		"IQ": "Iraq",
		"IR": "Iran",
		"IS": "Iceland",
		"IT": "Italy",
		"JE": "Jersey",
		"JM": "Jamaica",
		"JO": "Jordan",
		"JP": "Japan",
		"KE": "Kenya",
		"KG": "Kyrgyzstan",
		"KH": "Cambodia",
		"KI": "Kiribati",
		"KM": "Comoros",
		"KN": "Saint Kitts and Nevis",
		"KP": "North Korea",
		"KR": "South Korea",
		"KW": "Kuwait",
		"KY": "Cayman Islands",
		"KZ": "Kazakstan",
		"LA": "Laos",
		"LB": "Lebanon",
		"LC": "Saint Lucia",
		"LI": "Liechtenstein",
		"LK": "Sri Lanka",
		"LR": "Liberia",
		"LS": "Lesotho",
		"LT": "Lithuania",
		"LU": "Luxembourg",
		"LV": "Latvia",
		"LY": "Lybia",
		"MA": "Morocco",
		"MC": "Monaco",
		"MD": "Modolva",
		"MG": "Madagascar",
		"MH": "Marshall Islands",
		"MK": "Macedonia, Former Yugoslav Republic",
		"ML": "Mali",
		"MM": "Myanmar",
		"MN": "Mongolia",
		"MO": "Macau",
		"MP": "Northern Mariana Islands",
		"MQ": "Martinique",
		"MR": "Mauritania",
		"MS": "Montserrat",
		"MT": "Malta",
		"MU": "Mauritius",
		"MV": "Maldives",
		"MW": "Malawi",
		"MX": "Mexico",
		"MY": "Maylaysia",
		"MZ": "Mozambique",
		"NA": "Namibia",
		"NC": "New Caledonia",
		"NE": "Niger",
		"NF": "Norfolk Island",
		"NG": "Nigeria",
		"NI": "Nicaragua",
		"NL": "Netherlands",
		"NO": "Norway",
		"NP": "Nepal",
		"NR": "Nauru",
		"NU": "Niue",
		"NZ": "New Zealand",
		"OM": "Oman",
		"PA": "Panama",
		"PE": "Peru",
		"PF": "French Polynesia",
		"PG": "Papua New Guinea",
		"PH": "Philippines",
		"PK": "Pakistan",
		"PL": "Poland",
		"PM": "St. Pierre and Miquelon",
		"PN": "Pitcairn Island",
		"PR": "Puerto Rico",
		"PS": "Palestinian Territories",
		"PT": "Portugal",
		"PW": "Palau",
		"PY": "Paraguay",
		"QA": "Qatar",
		"RE": "Reunion",
		"RO": "Romania",
		"RU": "Russian Federation",
		"RW": "Twanda",
		"SA": "Saudi Arabia",
		"SB": "Solomon Islands",
		"SC": "Seychelles",
		"SU": "Sudan",
		"SE": "Sweden",
		"SG": "Singapore",
		"SH": "St. Helena",
		"SI": "Slovenia",
		"SJ": "Svalbard and Jan Mayan Islands",
		"SK": "Slovakia",
		"SL": "Sierra Leone",
		"SM": "San Marino",
		"SN": "Senegal",
		"SO": "Somalia",
		"SR": "Suriname",
		"ST": "S&atilde;o Tome and Principe",
		"SV": "El Salvador",
		"SY": "Syria",
		"SZ": "Swaziland",
		"TC": "Turks and Ciacos Islands",
		"TD": "Chad",
		"TF": "French Southern Territories",
		"TG": "Togo",
		"TH": "Thailand",
		"TJ": "Tajikistan",
		"TK": "Tokelau",
		"TM": "Turkmenistan",
		"TN": "Tunisia",
		"TO": "Tonga",
		"TP": "East Timor",
		"TR": "Turkey",
		"TT": "Trinidad and Tobago",
		"TV": "Tuvalu",
		"TW": "Taiwan",
		"TZ": "Tanzania",
		"UA": "Ukraine",
		"UG": "Uganda",
		"UK": "UK",
		"UM": "US Minor Outlying Islands",
		"US": "USA",
		"UY": "Uruguay",
		"UZ": "Uzbekistan",
		"VA": "Vatican City",
		"VC": "Saint Vincent and the Grenadines",
		"VE": "Venezuela",
		"VG": "British Virgin Islands",
		"VI": "US Virgin Islands",
		"VN": "Vietnam",
		"VU": "Vanuatu",
		"WF": "Wallis and Futuna Islands",
		"WS": "Western Samoa",
		"YE": "Yemen",
		"YT": "Mayotte",
		"YU": "Yugoslavia",
		"ZA": "South Africa",
		"ZM": "Zambia",
		"ZR": "Zaire",
		"ZW": "Zimbabwe"
	}
	if (countryCodes[country])
		return countryCodes[country];
	else
		return country;
}

function getStateString(state)
{
	var stateCodes = {
		"AL": "Alabama",
		"AK": "Alaska",
		"AZ": "Arizona",
		"AR": "Arkansas",
		"CA": "California",
		"CO": "Colorado",
		"CT": "Connecticut",
		"DE": "Delaware",
		"FL": "Florida",
		"GA": "Georgia",
		"HI": "Hawaii",
		"ID": "Idaho",
		"IL": "Illinois",
		"IN": "Indiana",
		"IA": "Iowa",
		"KS": "Kansas",
		"KY": "Kentucky",
		"LA": "Louisiana",
		"ME": "Maine",
		"MD": "Maryland",
		"MA": "Massachusetts",
		"MI": "Michigan",
		"MN": "Minnesota",
		"MS": "Mississippi",
		"MO": "Missouri",
		"MT": "Montana",
		"NE": "Nebraska",
		"NV": "Nevada",
		"NH": "New Hampshire",
		"NJ": "New Jersey",
		"NM": "New Mexico",
		"NY": "New York",
		"NC": "North Carolina",
		"ND": "North Dakota",
		"OH": "Ohio",
		"OK": "Oklahoma",
		"OR": "Oregon",
		"PA": "Pennsylvania",
		"RI": "Rhode Island",
		"SC": "South Carolina",
		"SD": "South Dakota",
		"TN": "Tennessee",
		"TX": "Texas",
		"UT": "Utah",
		"VT": "Vermont",
		"VA": "Virginia",
		"WA": "Washington",
		"WV": "West Virginia",
		"WI": "Wisconsin",
		"WY": "Wyoming"
	};
	if (stateCodes[state])
		return stateCodes[state];
	else
		return state;
}
