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
var markerData = {};

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
var tree = $("#tree").dynatree({ "onActivate": onNodeActivate(node), "children": treeNodes });

// Load data
$.getJSON(window.location.href + "query?filter=default&geocode=true", loadData(data));

function loadData(data)
{
	for (var i = 0 ; i < data.length ; i++)
	{
		var record = data[i];
		var type = record["type"][0].toLowerCase();
		if ((type == "host") || (type == "service"))
		{
			var marker = null;
			var latlng = null;
			if ((record["location-latitude"]) && (record["location-longitude"]))
				latlng = new google.maps.LatLng(record["location-latitude"], record["location-longitude"]);
			if (latlng)
			{
				if (markers[latlng])
				{
					markerData[latlng][record["type"]].push(record);
				}
				else
				{
					marker = map.gmap("addMarker", { "position": latlng });
					marker.click(function(){ onMarkerActivate(this) });
					markers[latlng] = marker;
					markerData[latlng] = { "marker": marker, "record": record };
				}
			}
			if (type == "service")
			{
				services.push(record);
				var node = null;
				for (var j = 0 ; j < treeNodes.length ; j++)
				{
					if (treeNodes[j]["title"].toLowerCase() == record["service-type"][0].toLowerCase())
					{
						node = treeNodes[j]
						break;
					}
				}
				if (node)
					node["children"].push({ "title": getNodeTitle(record), "record": record });
				else
					treeNodes.push({ "title": record["service-type"][0], "isFolder": true, "children": [ { "title": getTitle(record), "record": record } ] });
			}
			else
			{
				hosts.push(record);
			}
		}
		else if (type == "interface")
		{
			interfaces.push(record);
		}
	}
	$("#tree").dynatree("getTree").reload()
	$("#tree").dynatree("getRoot").sortChildren(null, true);
}

function onNodeActivate(node)
{
	if (node.data["marker"])
		map.gmap("openInfoWindow", { "content": markerData[node.data["marker"][0].getPosition()] }, node.data["marker"][0]);
	else
		map.gmap("closeInfoWindow");
}

function onMarkerActivate(marker)
{
	map.gmap("openInfoWindow", { "content": markerData[marker.getPosition()] }, marker);
}

function getTitle(record)
{
	var type = record["type"][0].toLowerCase();
	if (type == "service")
	{
		if (record["service-type"][0] == "ma")
		var defaults = [ "bwctl server", "traceroute responder", "ndt server", "npad server", "owamp server", "ping responder", "traceroute responder" ];
		if (record["service-type"] in defaults)
		{
			
		}
		else
		{
			return record["service-name"];
		}
	}
	else
	{
		return record[type + "-name"];
	}
}

function getHost(record)
{
	var type = record["type"][0].toLowerCase();
	if (type == "host")
		return record
	else if (type == "interface")
	{
		for (var i = 0 ; i < hosts.length ; i++)
		{
			if (record["uri"] in hosts[i]["hosts-net-interfaces"])
				return hosts[i];
		}
		return null;
	}
	else if (type == "service")
	{
		if (record["service-host"])
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
			var parser = document.createElement("a");
			for (var i = 0 ; i < record["service-locator"].length ; i++)
			{
				parser.href = record["service-locator"][i];
				address = parser.hostname.replace(/[\[\]]/g, "");
				for (var j = 0 ; j < interfaces.length ; j++)
				{
					if (address in interfaces[j]["interface-addresses"])
						return getHost(interfaces[j]);
				}
			}
			if (record["location-sitename"][0])
			{
				for (var i = 0 ; i < hosts.length ; i++)
				{
					if ((hosts[i]["location-sitename"][0]) && (hosts[i]["location-sitename"][0] == record["location-sitename"][0]))
						return hosts[i];
				}
			}
			return null;
		}
		return null;
	}
	else
	{
		return null;
	}
}

function showInfo(record)
{
	
}
