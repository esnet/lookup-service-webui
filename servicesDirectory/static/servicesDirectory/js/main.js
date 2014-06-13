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
var infoWindow = null;
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
	var map = new google.maps.Map($("#map-canvas").get(0), mapOptions);
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
	var services = getServices();
	for (var i = 0 ; i < services.length ; i++)
	{
		addServiceNode(services[i]);
		addServiceMarker(services[i]);
	}
	updateFilter();
	updateCommunities();
	updateMap();
	updateTree();
	updateStatus();
	initialized = true;
}

function addServiceMarker(service)
{
	var host = getHost(service, getHosts(service));
	var latlng = getLatLng(service);
	if ((!latlng) && (host))
		latlng = getLatLng(host);
	if (latlng)
	{
		var marker = null;
		if (markers[latlng])
		{
			marker = markers[latlng];
		}
		else
		{
			marker = new google.maps.Marker({
				"position": latlng,
				"title": "?",
				"icon": defaultMarkerIcon,
				"optimized": false
			});
			google.maps.event.addListener(marker, 'click', function() { onMarkerActivate(this); });
			marker["records"] = { "host": [], "service": [], "filtered": [] };
			markers[latlng] = marker;
		}
		if ((host) && !(host in marker["records"]["host"]))
			marker["records"]["host"].push(host);
		marker["records"]["service"].push(service);
		marker["records"]["filtered"].push(service);
		marker.setMap(map);
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
	if (!title)
		return;
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
	if (subtype)
	{
		subnode["children"].push({
			"title": title,
			"type": "service",
			"tooltip": hostname,
			"records": [ service ]
		});
	}
	else if (type)
	{
		node["children"].push({
			"title": title,
			"type": "service",
			"tooltip": hostname,
			"records": [ service ]
		});
	}
	else
	{
		treeNodes.push({
			"title": title,
			"type": "service",
			"tooltip": hostname,
			"records": [ service ]
		});
	}
}

////////////////////////////////////////
// Event Functions
////////////////////////////////////////

function onMarkerActivate(marker)
{
	if ((!marker["records"]) || ((!marker["records"]["host"]) && (!marker["records"]["service"])))
		return;
	if (infoWindow)
		infoWindow.close();
	infoWindow = new google.maps.InfoWindow();
	google.maps.event.addListener(infoWindow, 'domready', function() {
		//updateInfoWindowContent();
		/*$(".info-window-service").click(function(event) {
			onInfoWindowActivate($(this));
			event.preventDefault(event);
		});*/
	});
	infoWindow.open(map, marker);
	activeMarker = marker;
}

function onInfoWindowActivate(service)
{
	if (!activeMarker)
		return;
	var host = getHost(service, activeMarker["records"]["host"]);
	showServiceInfo(service);
	showHostInfo(host);
}

function onNodeActivate(node)
{
	if (!node.data["records"])
		return;
	var service = node.data["records"][0];
	var host = getHost(service, getHosts(service));
	var latlng = getLatLng(service);
	if ((!latlng) && (host))
		latlng = getLatLng(host);
	if ((latlng) && (markers[latlng]))
		onMarkerActivate(markers[latlng]);
	else if (infoWindow)
			infoWindow.close();
	showServiceInfo(service);
	showHostInfo(host);
}

////////////////////////////////////////
// GUI Functions
////////////////////////////////////////

function updateCommunities()
{
	communities = communities.unique().sort();
	var options = $("#communities");
	for (var i = 0 ; i < communities.length ; i++)
		options.append($("<option>").attr("value", i).text(communities[i]).attr("selected", "true"));
}

function updateInfoWindowContent()
{
	if (!activeMarker)
		return;
	var content = "";
	var contentMap = {};
	for (var i = 0 ; i < marker["records"]["service"].length ; i++)
	{
		var service = marker["records"]["service"][i];
		var host = getHost(service, marker["records"]["host"]);
		var section = "";
		if (host)
			section = getTitle(host);
		else
			section = getTitle(service);
		if (!section)
			section = "";
		if (contentMap[section])
			contentMap[section].push(service);
		else
			contentMap[section] = [ service ];
	}
	
	
	
	content += "<dl>";
	var sections = [];
	for (var section in contentMap)
		sections.push(section);
	sections.sort();
	for (var i = 0 ; i < sections.length ; i++)
	{
		var section = sections[i];
		contentMap[section].sort(function (a,b)
		{
			var type_a = "";
			var type_b = "";
			if (hasField(a, "service-type"))
				type_a = a["service-type"][0].toLowerCase();
			if (hasField(b, "service-type"))
				type_b = b["service-type"][0].toLowerCase();
			return type_a > type_b ? 1 : type_a < type_b ? -1 : 0;
		});
		content += "<dt>" + section + "</dt>";
		for (var j = 0 ; j < contentMap[section].length ; j++)
		{
			var uri = contentMap[section][j]["ls-host"] + contentMap[section][j]["uri"];
			var locator = "";
			if (hasField(contentMap[section][j], "service-locator"))
				locator = contentMap[section][j]["service-locator"][0];
			var title = getServiceTypeTitle(contentMap[section][j]);
			content += "<dd><a class=\"info-window-service\" name=\"" + uri + "\" title=\"" + locator + "\" href=\"#\">" + title + "</a></dd>";
		}
	}
	content += "</dl>";
}

function updateFilter()
{
	
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
	
	//updateTreeNodeCounts();
	tree.fancytree("getTree").reload();
	tree.fancytree("getRootNode").sortChildren(function(a, b) {
		isFolder_a = a.isFolder();
		isFolder_b = b.isFolder();
		if ((isFolder_a) || (isFolder_b))
			return !isFolder_a && isFolder_b ? 1 : isFolder_a && !isFolder_b ? -1 : 0; 
		order = {
			"Hostname": 0,
			"IPv4": 1,
			"IPv6": 2
		};
		title_a = a.title;
		title_b = b.title;
		order_a = order[getAddressType(title_a)];
		order_b = order[getAddressType(title_b)];
		return order_a > order_b ? 1 : order_a < order_b ? -1 : title_a > title_b ? 1 : title_a < title_b ? -1 : 0;
	}, true);
}

function updateTreeNodeCounts(nodes)
{
	if (!nodes)
		nodes = tree.fancytree("getRootNode").getChildren();
	var count = 0;
	for (var i = 0 ; i < nodes.length ; i++)
	{
		var node = nodes[i];
		if ((node.isFolder()) && (node.li))
		{
			var childCount = updateTreeNodeCounts(node.getChildren());
			$(node.li).find("span.fancytree-node").append("<span class=\"badge tree-badge\">" + childCount + "</span>");
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
		map.fitBounds(bounds);
	var zoom = map.getZoom();
	zoom = zoom < 2 ? 2 : zoom > 6 ? 6 : zoom;
	map.setZoom(zoom);
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

////////////////////////////////////////
// Record Data Functions
////////////////////////////////////////

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
			if (record["ls-host"] == host[i]["ls-host"])
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
		latlng = new google.maps.LatLng(parseFloat(record["location-latitude"][0]), parseFloat(record["location-longitude"][0]));
		if (!latlng.lat() || !latlng.lng())
			latlng = null;
	}
	return latlng;
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
	return record[field] && record[field][0];
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
