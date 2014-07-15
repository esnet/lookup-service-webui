////////////////////////////////////////
// Declare Variables
////////////////////////////////////////

var initialized = false;
var recordMap = null;
var filteredMap = null;
var filter = "";
var activeService = null;
var activeHost = null;

////////////////////////////////////////
// Loading
////////////////////////////////////////

$("#loading").modal("show");

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
var markers = {};
var activeMarker = null;

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

$("#search").keypress(function(event) {
	if (initialized)
	{
	    $("#search-control").removeClass("error");
	    if (event.keyCode == 13)
		{
		    updateFilter();
		    event.preventDefault();
		}
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
		var subnodes = [];
		if (serviceMap[type]["types"])
		{
			for (var subtype in serviceMap[type]["types"])
			{
				var subnode = subnodes[subnodes.push({
					"title": serviceMap[type]["types"][subtype]["title"],
					"tooltip": serviceMap[type]["types"][subtype]["title"],
					"type": subtype,
					"folder": true,
					"visible": true
				}) - 1];
				subnode.children = [];
			}
		}
		var node = treeNodes[treeNodes.push({
			"title": serviceMap[type]["title"],
			"tooltip": serviceMap[type]["title"],
			"type": type,
			"folder": true,
			"visible": true
		}) - 1];
		node.children = subnodes;
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
				for (var j = 0 ; j < node.children.length ; j++)
				{
					if (node.children[j]["type"] == subtype)
					{
						subnode = node.children[j];
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
			"tooltip": type,
			"type": type,
			"folder": true,
			"visible": true
		}) - 1];
		node.children = [];
	}
	if ((!subnode) && (subtype))
	{
		subnode = node["children"][node["children"].push({
			"title": subtype,
			"tooltip": subtype,
			"type": subtype,
			"folder": true,
			"visible": true
		}) - 1];
		subnode.children = [];
	}
	var serviceNode = {
		"title": title,
		"tooltip": hostname,
		"type": "service",
		"visible": true
	};
	serviceNode.service = service;
	if (subtype)
		subnode.children.push(serviceNode);
	else if (type)
		node.children.push(serviceNode);
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
	activeService = service;
	if (hasField(service, "service-name"))
		$("#service-name").html(service["service-name"][0]);
	var links = getLinks(getHostnames(service), "http://");
	$("#service-locator").html(links.join("<br>"));
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
			var links = getLinks(getAddresses(service));
			$("#service-custom").html(links.join("<br>"));
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
	activeService = null;
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
	activeHost = host;
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
	activeHost = null;
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
		options.append($("<option>").val(i).prop("selected", true).text(communities[i]));
}

function updateFilter()
{
	var search = $("#search").val();
	if (search != filter)
	{
		try
		{
			filter = search;
			var filtered = getFilteredRecords(recordMap.getServices(), filter);
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
	filteredMap = new RecordMap(recordMap.getServices(), false);
	updateCommunities();
	updateMap();
	updateTree();
	updateStatus();
}

function updateInfoWindow()
{
	if (!activeMarker)
		return;
	var sections = [];
	var services = activeMarker.filtered;
	for (var i = 0 ; i < services.length ; i++)
	{
		var service = services[i];
		var host = null;
		var title = "";
		var hostname = "";
		if (service.host)
		{
			host = service.host;
			title = getTitle(service.host);
			hostname = getHostname(service.host);
		}
		if (!title)
			title = getTitle(service);
		if (!hostname)
			hostname = getHostname(service);
		if ((!title) || (!hostname))
			continue;
		if (title != hostname)
			title += " (" + hostname + ")";
		var section = null;
		for (var j = 0 ; j < sections.length ; j++)
		{
			if (sections[j].host && sections[j].host == host)
				section = sections[j];
			else if (sections[j]["hostname"] == hostname)
				section = sections[j];
		}
		if (section)
		{
			section.services.push(service);
		}
		else
		{
			section = sections[sections.push({
				"title": title,
				"hostname": hostname
			}) - 1];
			section.host = host;
			section.services = [ service ];
		}
	}
	sections.sort(function(a, b) { return compareHostnames(a["hostname"], b["hostname"]); });
	var clickEvent = function(event) {
		onInfoWindowActivate($(this).data("service"));
		event.preventDefault();
	};
	var content = $("dl");
	for (var i = 0 ; i < sections.length ; i++)
	{
		var section = sections[i];
		content.append($("<dt>").text(section["title"]));
		section.services.sort(function(a, b) {
			var type_a = "";
			var type_b = "";
			if (hasField(a, "service-type"))
				type_a = a["service-type"][0].toLowerCase();
			if (hasField(b, "service-type"))
				type_b = b["service-type"][0].toLowerCase();
			return type_a > type_b ? 1 : type_a < type_b ? -1 : 0;
		});
		for (var j = 0 ; j < section.services.length ; j++)
		{
			var service = section.services[j];
			var name = getServiceTypeTitle(service);
			content.append($("<dd>").append($("<a>").prop({
				"title": name, 
				"href": "#"
			}).text(name).data("service", service).click(clickEvent)));
		}
	}
}

function updateMap()
{
	map.gmap("closeInfoWindow");
    updateMarkers();
	zoomToFitMarkers();
}

function updateMarkers()
{
    activeMarker = null;
	for (var latlng in markers)
	{
		var marker = markers[latlng];
		marker.filtered = [];
		var titles = [];
		for (var i = 0 ; i < marker.services.length ; i++)
		{
			var service = marker.services[i];
			if ($.inArray(service, filteredMap.getServices(service)) >= 0)
			{
			    marker.filtered.push(service);
				if (service.host)
				    titles.push(getTitle(service.host));
				else
				    titles.push(getTitle(service));
			}
		}
		titles = titles.sort(function(a, b) { return compareHostnames(a, b); }).unique();
		if (titles.length == 1)
		    marker.setTitle(titles[0]);
		else if (titles.length > 1)
		    marker.setTitle(titles[0] + "...");
		if (marker.filtered.length > 0)
			marker.setVisible(true);
		else
			marker.setVisible(false);
	}
}

function updateStatus()
{
    var filtered = filteredMap.getServices().length;
    var total = recordMap.getServices().length;
    $("#status").html("Showing: " + filtered + " of " + total + " services.");
    $("#loading").modal("hide");
}

function updateTree()
{
	activeNode = null;
	updateTreeNodes();
	tree.fancytree("getTree").reload();
	tree.fancytree("getTree").filterNodes(function(node) { return node.data.visible; });
	tree.fancytree("getRootNode").sortChildren(function(a, b) {
		var isFolder_a = a.isFolder();
		var isFolder_b = b.isFolder();
		if ((isFolder_a) || (isFolder_b))
			return !isFolder_a && isFolder_b ? 1 : isFolder_a && !isFolder_b ? -1 : 0; 
		return compareHostnames(a.tooltip, b.tooltip);
	}, true);
}

function updateTreeNodes(nodes)
{
	if (!nodes)
		nodes = treeNodes;
	var count = 0;
	for (var i = 0 ; i < nodes.length ; i++)
	{
		var node = nodes[i];
		if (node["folder"])
		{
			var childCount = updateTreeNodes(node.children);
			var title = $("<div>" + node["title"] + "</div>").children().remove().end().text();
			node["title"] = title + "<span class=\"badge tree-badge\">" + childCount + "</span>";
			count += childCount;
		}
		else if (node.service)
		{
			if ($.inArray(node.service, filteredMap.getServices(node.service)) >= 0)
			{
				node["visible"] = true;
				count++;
			}
			else
			{
				node["visible"] = false;
			}
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
