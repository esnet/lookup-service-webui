var hosts = [];
var interfaces = [];
var services = [];

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
	if ((status == google.maps.GeocoderStatus.OK) && results[0].geometry && results[0].geometry.viewport)
		map.gmap("get", "map").fitBounds(results[0].geometry.viewport);
});
var markers = {};

// Initialize Tree
var treeNodes = [
	{ "title": "BWCTL", "isFolder": true, "children": [] },
	{ "title": "MA", "isFolder": true, "children": [] },
	{ "title": "NDT", "isFolder": true, "children": [] },
	{ "title": "NPAD", "isFolder": true, "children": [] },
	{ "title": "OWAMP", "isFolder": true, "children": [] },
	{ "title": "Ping", "isFolder": true, "children": [] },
	{ "title": "Traceroute", "isFolder": true, "children": [] },
];
var tree = $("#tree").dynatree({ "onActivate": function(node) { onNodeActivate(node) }, "children": treeNodes, "debugLevel": 0 });

// Load data
$.getJSON(window.location.href + "query?filter=default&geocode=true&remap=true", function(data) { initialize(data) });

function initialize(data)
{
	for (var i = 0 ; i < data.length ; i++)
	{
		var record = data[i];
		var type = record["type"][0].toLowerCase();
		if (type == "service")
			services.push(record);
		else if (type == "host")
			hosts.push(record);
		else if (type == "interface")
			interfaces.push(record);
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
	$("#tree").dynatree("getTree").reload()
	$("#tree").dynatree("getRoot").sortChildren(null, true);
}

function addServiceMarker(service)
{
	var marker = null;
	var latlng = null;
	host = getHost(service, hosts);
	if ((service["location-latitude"]) && (service["location-latitude"][0]) && (service["location-longitude"]) && (service["location-longitude"][0]))
		latlng = new google.maps.LatLng(service["location-latitude"][0], service["location-longitude"][0]);
	if ((!latlng) && (host) && (host["location-latitude"]) && (host["location-latitude"][0]) && (host["location-longitude"]) && (host["location-longitude"][0]))
		latlng = new google.maps.LatLng(host["location-latitude"][0], host["location-longitude"][0]);
	if (latlng)
	{
		if (markers[latlng])
		{
			marker = markers[latlng];
		}
		else
		{
			marker = map.gmap("addMarker", { "position": latlng });
			marker.click(function(){ onMarkerActivate(this) });
			markers[latlng] = marker;
		}
		if (!marker["records"])
			marker["records"] = [];
		if (host)
			marker["records"].push(host);
		marker["records"].push(service);
	}
}

function addServiceNode(service)
{
	var node = null;
	var type = service["service-type"][0].toLowerCase();
	var title = getTitle(service)
	if (!title)
		return;
	for (var j = 0 ; j < treeNodes.length ; j++)
	{
		if (treeNodes[j]["title"].toLowerCase() == type)
		{
			node = treeNodes[j]
			break;
		}
	}
	if (node)
		node["children"].push({ "title": getTitle(service), "records": [ service ] });
	else
		treeNodes.push({ "title": type, "isFolder": true, "children": [ { "title": getTitle(service), "records": [ service ] } ] });
}

function onNodeActivate(node)
{
	if (node.data["marker"])
		onMarkerActivate(node.data["marker"])
	else
		map.gmap("closeInfoWindow");
	showServiceInfo(node.data["records"][0])
}

function onMarkerActivate(marker)
{
	
	map.gmap("openInfoWindow", { "content": "blah" }, marker);
}

function showServiceInfo(service)
{
	$("#service-name").html(service["service-name"].join("<br />"));
	$("#service-locator").html(service["service-locator"].join("<br />"));
	$("#service-location").html("test");
	$("#group-communities").html(service["group-communities"].join("<br />"));
}

function getTitle(record)
{
	var type = record["type"][0].toLowerCase();
	if ((record[type + "-name"]) && (record[type + "-name"][0]))
	{
		if (type == "service")
		{
			var defaults = [ "bwctl server", "ndt server", "npad server", "owamp server", "perfsonar-buoy ma", "perfsonarbuoy ma", "ping responder", "traceroute ma", "traceroute responder" ];
			if ($.inArray(record["service-name"][0].toLowerCase(), defaults) >= 0)
			{
				if ((record["location-sitename"]) && (record["location-sitename"][0]))
					return record["location-sitename"][0];
				host = getHost(record, hosts);
				if (host)
				{
					if ((host["location-sitename"]) && (host["location-sitename"][0]))
						return host["location-sitename"][0];
					else if ((host["host-name"]) && (host["host-name"][0]))
						return host["host-name"][0];
				}
				if ((record["service-locator"]) && (record["service-locator"][0]))
				{
					domain = getDomain(record["service-locator"][0]);
					if ((domain) && (domain != "localhost"))
						return domain;
					else
						return record["service-locator"][0];
				}
			}
			else if ((record["service-type"]) && record["service-type"][0])
			{
				return $.trim(record["service-name"][0].replace(record["service-type"][0] + ":", ""));
			}
			else
			{
				return record["service-name"][0];
			}
		}
		else
		{
			return record[type + "-name"][0];
		}
	}
	else
	{
		return null
	}
}

function getHost(record, hosts)
{
	var type = record["type"][0].toLowerCase();
	if (type == "host")
		return record
	else if (type == "interface")
	{
		for (var i = 0 ; i < hosts.length ; i++)
		{
			if (record["uri"] in hosts[i]["host-net-interfaces"])
				return hosts[i];
		}
		return null;
	}
	else if (type == "service")
	{
		for (var i = 0 ; i < hosts.length ; i++)
		{
			if (hosts[i]["uri"] == record["service-host"])
				return hosts[i];
		}
		return null;
	}
	else
	{
		return null;
	}
}

function getDomain(url)
{
	var parser = document.createElement("a");
	parser.href = url;
	return parser.hostname.replace("/[\[\]]/", "");
}
