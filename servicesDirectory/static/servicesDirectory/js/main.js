////////////////////////////////////////
// Declare Variables
////////////////////////////////////////

var initialized = false;

var recordMap = null;

var filteredMap = null;

var filter = "";

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
var activeNode = null;

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
	}
});

$("#search").click(function(event) {
	if (initialized)
	{
		$("#search-control").removeClass("error");
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
		"extensions": [ "filter" ],
		"filter": { "mode": "hide" },
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
	recordMap = new RecordMap(records, true);
	filteredMap = new RecordMap(recordMap.getServices(), false);
	var services = recordMap.getServices();
	for (var i = 0 ; i < services.length ; i++)
	{
		addServiceNode(services[i]);
		addServiceMarker(services[i]);
	}
	updateFilter();
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
		"tooltip": hostname
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
	activeNode = node;
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
		$("#service-name").html(service["service-name"][0]);
	if (hasField(service, "service-locator"))
	{
		var links = getLinks(getHostnames(service), "http://");
		$("#service-locator").html(links.join("<br>"));
	}
	var locationString = getLocationString(service);
	var latlngString = getLatLngString(service);
	$("#service-location").html(locationString + "<br><div class=\"muted\">" + latlngString + "</div");
	if (hasField(service, "group-communities"))
		$("#service-communities").html(service["group-communities"].sort().join("<br>"));
	showCustomInfo(service);
}

function showCustomInfo(service)
{
	var mapping = getServiceMapping(service);
	if ((mapping) && (mapping["custom"]) && (mapping["custom"]["type"]))
	{
		var custom = mapping["custom"];
		if (custom["title"])
			$("#service-custom-header").text(custom["title"]);
		else
			$("#service-custom-header").text("Custom");
		if (custom["type"] == "cli")
		{
			var commandLine = getCommandLine(service, custom["format"]);
			$("#service-custom").html(commandLine.join("<br>"));
		}
		else if (custom["type"] == "ma")
		{
			var accessURLs = getAccessURLs(service);
			$("#service-custom").html(accessURLs.join("<br>"));
		}
		$("#service-custom-header").show();
		$("#service-custom").parent().show();
	}
	else
	{
		$("#service-custom-header").hide();
		$("#service-custom").parent().hide();
	}
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
	{
		var links = getLinks(getHostnames(host), "http://");
		$("#host-name").html(links.join("<br>"));
	}
	var processorStrings = getProcessorStrings(host);
	for (var i = 0 ; i < processorStrings.length ; i++)
		$("#host-hardware").append("Processor #" + (i + 1) + ": " + processorStrings[i] + "<br>");
	var memoryString = getMemoryString(host);
	if (memoryString)
		$("#host-hardware").append("Memory: " + memoryString + "<br>");
	if (host.interfaces)
	{
		for (var i = 0 ; i < host.interfaces.length ; i++)
		{
			var interface = host.interfaces[i];
			var NICSpeedString = getNICSpeedString(interface);
			if (NICSpeedString)
				$("#host-hardware").append("NIC #" + (i + 1) + " Speed: " + NICSpeedString + "<br>");
			if (hasField(interface, "interface-mtu"))
				$("#host-hardware").append("NIC #" + (i + 1) + " MTU: " + interface["interface-mtu"][0] + "<br>");
		}
	}
	var OSString = getOSString(host);
	if (OSString)
		$("#host-os").append("Operating System: " + OSString + "<br>");
	if (hasField(host, "host-os-kernel"))
		$("#host-os").append("Kernel: " + host["host-os-kernel"][0] + "<br>");
	if (host.administrators)
	{
		for (var i = 0 ; i < host.administrators.length ; i++)
		{
			var person = host.administrators[i];
			var contact = "Contact #" + (i + 1) + ": ";
			if (hasField(person, "person-name"))
				contact += person["person-name"] + " ";
			if (hasField(person, "person-emails"))
			{
				var emails = getLinks(person["person-emails"], "mailto:");
				contact += "(" + emails.join() + ")";
			}
			$("#host-os").append($.trim(contact) + "<br>");
		}
	}
	if (hasField(host, "pshost-toolkitversion"))
		$("#host-version").html(host["pshost-toolkitversion"][0]);
	if (hasField(host, "group-communities"))
		$("#host-communities").html(host["group-communities"].sort().join("<br>"));
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
	var communities = [];
	var records = filteredMap.getRecords();
	for (var i = 0 ; i < records.length ; i++)
	{
		if (hasField(records[i], "group-communities"))
			$.merge(communities, records[i]["group-communities"]);
	}
	communities = communities.sort().unique();
	var options = $("#communities").empty();
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
	var search = $("#search").val();
	if (search != filter)
	{
		try
		{
			filter = search;
			var filtered = getFilteredRecords(recordMap.getRecords(), filter);
			filteredMap = new RecordMap(filtered, false);
		}
		catch (err)
		{
			$("#search-control").addClass("error");
		}
	}
	updateCommunities();
	updateMap();
	updateTree();
	updateStatus();
}

function clearFilter()
{
	filter = "";
	filteredMap = new RecordMap(recordMap.getRecords(), false);
	updateCommunities();
	updateMap();
	updateTree();
	updateStatus();
}

function updateInfoWindow()
{
	if (!activeMarker)
		return;
	var contentMap = {};
	var services = activeMarker.filtered;
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
			section += " (" + hostname + ")";
		if (contentMap[section])
			contentMap[section].push(service);
		else
			contentMap[section] = [ service ];
	}
	var sections = [];
	for (var section in contentMap)
		sections.push(section);
	sections.sort();
	var clickEvent = function(event) {
		onInfoWindowActivate($(this).data("service"));
		event.preventDefault();
	};
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
			}).text(title).data("service", service).click(clickEvent)));
		}
	}
}

function updateMap()
{
	map.gmap("closeInfoWindow");
	activeMarker = null;
	for (var latlng in markers)
	{
		var marker = markers[latlng];
		marker.filtered = [];
		for (var i = 0 ; i < marker["services"].length ; i++)
		{
			var service = marker["services"][i];
			if ($.inArray(service, filteredMap.getServices(service)) >= 0)
				marker.filtered.push(service);
		}
		if (marker.filtered.length > 0)
			marker.setVisible(true);
		else
			marker.setVisible(false);
	}
	zoomToFitMarkers();
}

function updateStatus()
{
	var filtered = filteredMap.getServices().length;
	var total = recordMap.getServices().length;
	$("#status").html("Showing: " + filtered + " of " + total + " services.");
}

function updateTree()
{
	activeNode = null;
	tree.fancytree("getTree").reload();
	tree.fancytree("getTree").filterNodes(function(node) {
		var service = node.data.service;
		if (node.isFolder())
			return true;
		else if ($.inArray(service, filteredMap.getServices(service)) >= 0)
			return true;
		return false;
	});
	tree.fancytree("getRootNode").sortChildren(function(a, b) {
		var isFolder_a = a.isFolder();
		var isFolder_b = b.isFolder();
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
			var title = $("<div>" + node["title"] + "</div>").children().remove().end().text();
			node["title"] = title + "<span class=\"badge tree-badge\">" + childCount + "</span>";
			count += childCount;
		}
		else if (node.isVisible())
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
	{
		if (markers[latlng].visible)
			bounds.extend(markers[latlng].getPosition());
	}
	if (!bounds.isEmpty())
		map.gmap("get", "map").fitBounds(bounds);
	var zoom = map.gmap("get", "map").getZoom();
	zoom = zoom < 2 ? 2 : zoom > 6 ? 6 : zoom;
	map.gmap("option", "zoom", zoom);
}
