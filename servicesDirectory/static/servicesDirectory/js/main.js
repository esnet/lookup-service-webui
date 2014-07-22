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

$("#communities-update").click(function(event) {
	if (initialized)
	{
		updateCommunities();
	}
});

$("#communities-reset").click(function(event) {
	if (initialized)
	{
		resetCommunities();
	}
});

$("#search-update").click(function(event) {
	if (initialized)
	{
		updateSearch();
	}
});

$("#search-reset").click(function(event) {
	if (initialized)
	{
		resetSearch();
	}
});

$("#search").keydown(function(event) {
	if (initialized)
	{
		$("#search-control").removeClass("error");
		if (event.keyCode == 13)
		{
			updateSearch();
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
				var subnodeTitle = serviceMap[type]["types"][subtype]["title"];
				var subnode = subnodes[subnodes.push({
					"folder": true,
					"name": subnodeTitle,
					"title": subnodeTitle,
					"tooltip": subnodeTitle,
					"type": subtype,
					"visible": true
				}) - 1];
				subnode.children = [];
			}
		}
		var nodeTitle = serviceMap[type]["title"];
		var node = treeNodes[treeNodes.push({
			"folder": true,
			"name": nodeTitle,
			"title": nodeTitle,
			"tooltip": nodeTitle,
			"type": type,
			"visible": true
		}) - 1];
		node.children = subnodes;
	}
	return treeNodes;
}

function initialize(records)
{
	recordMap = new RecordMap(records, true);
	var services = recordMap.getServices();
	for (var i = 0 ; i < services.length ; i++)
	{
		addServiceNode(services[i]);
		addServiceMarker(services[i]);
	}
	var filtered = getFilteredRecords(services, "");
	filteredMap = new RecordMap(filtered);
	showCommunities();
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
	var hostname = getHostname(service);
	var title = getTitle(service);
	if ((!title) || (!hostname))
		return;
	if (hostname != title)
		title = "<b>" + hostname + "</b> (" + title + ")";
	else
		title = "<b>" + hostname + "</b>";
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
			"folder": true,
			"name": type,
			"title": type,
			"tooltip": type,
			"type": type,
			"visible": true
		}) - 1];
		node.children = [];
	}
	if ((!subnode) && (subtype))
	{
		subnode = node["children"][node["children"].push({
			"folder": true,
			"name": subtype,
			"title": subtype,
			"tooltip": subtype,
			"type": subtype,
			"visible": true
		}) - 1];
		subnode.children = [];
	}
	var serviceNode = {
		"name": hostname,
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
	activeMarker = marker;
	if (!marker.services)
		return;
	showInfoWindow(marker);
}

function onInfoWindowActivate(service)
{
	showServiceInfo(service);
	showHostInfo(service.host);
}

function onNodeActivate(node)
{
	activeNode = node;
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
	activeService = service;
	if (hasField(service, "service-name"))
		$("#service-name").html(service["service-name"][0]);
	var links = getLinks(getHostnames(service), "http://", "/");
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
		var links = getLinks(getHostnames(host), "http://", "/");
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

function showCommunities()
{
	var communities = [];
	var records = filteredMap.getServices();
	for (var i = 0 ; i < records.length ; i++)
	{
		if (hasField(records[i], "group-communities"))
			$.merge(communities, records[i]["group-communities"]);
	}
	communities = communities.sort().unique();
	var options = $("#communities").empty();
	for (var i = 0 ; i < communities.length ; i++)
		options.append($("<option>").val(communities[i]).prop("selected", true).text(communities[i]));
}

function showInfoWindow(marker)
{
	var sections = [];
	var services = marker.filtered;
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
	var content = $("<dl>").prop("id", "info-window");
	var clickEvent = function(event) {
		onInfoWindowActivate($(this).data("service"));
		event.preventDefault();
	};
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
	map.gmap("openInfoWindow", { "content": content.get(0) }, marker);
}

function updateCommunities()
{
	var selected = $("#communities option").filter(":selected");
	var communities = selected.map(function() { return $(this).val(); });
	var filtered = getFilteredRecords(recordMap.getServices(), filter);
	filteredMap = new RecordMap(filtered);
	var services = filteredMap.getServices();
	var matched = [];
	for (var i = 0 ; i < services.length ; i++)
	{
		for (var j = 0 ; j < communities.length ; j++)
		{
			if (hasField(services[i], "group-communities"))
			{
				if ($.inArray(communities[j], services[i]["group-communities"]) >= 0)
					matched.push(services[i]);
			}
		}
	}
	filtered = getFilteredRecords(matched, "");
	filteredMap = new RecordMap(filtered);
	updateMap();
	updateTree();
	updateStatus();
}

function resetCommunities()
{
	var deselected = $("#communities option").not(":selected");
	deselected.prop("selected", true);
	var filtered = getFilteredRecords(recordMap.getServices(), filter);
	filteredMap = new RecordMap(filtered);
	updateMap();
	updateTree();
	updateStatus();
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

function updateSearch()
{
	var search = $("#search").val();
	if (search != filter)
	{
		try
		{
			var filtered = getFilteredRecords(recordMap.getServices(), search);
			filteredMap = new RecordMap(filtered);
			filter = search;
		}
		catch (err)
		{
			$("#search-control").addClass("error");
			return;
		}
		showCommunities();
		updateMap();
		updateTree();
		updateStatus();
	}
}

function resetSearch()
{
	if (filter)
	{
		var filtered = getFilteredRecords(recordMap.getServices(), "");
		filteredMap = new RecordMap(filtered);
		filter = "";
		showCommunities();
		updateMap();
		updateTree();
		updateStatus();
	}
}

function updateStatus()
{
	var filteredHosts = filteredMap.getHosts().length;
	var filteredServices = filteredMap.getServices().length;
	var totalServices = recordMap.getServices().length;
	if (filteredHosts == 1)
		$("#status").html("Showing: " + filteredServices + " of " + totalServices + " services on " + filteredHosts + " host.");
	else
		$("#status").html("Showing: " + filteredServices + " of " + totalServices + " services on " + filteredHosts + " hosts.");
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
		return compareHostnames(a.data.name, b.data.name);
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
			node["title"] = node["name"] + "<span class=\"badge tree-badge\">" + childCount + "</span>";
			if (childCount > 0)
			{
				node["visible"] = true;
				count += childCount;
			}
			else
			{
				node["visible"] = false;
			}
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
