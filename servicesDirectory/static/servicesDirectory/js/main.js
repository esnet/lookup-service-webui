var hosts = [];
var interfaces = [];
var services = [];

var serviceTypes = {
	"bwctl": { "title": "BWCTL Server", "defaults": [ "bwctl server" ] },
	"ndt": { "title": "NDT Server", "defaults": [ "ndt server" ] },
	"npad": { "title": "NPAD Server", "defaults": [ "npad server" ] },
	"owamp": { "title": "OWAMP Server", "defaults": [ "owamp server" ] },
	"ma": { "title": "MA", "types": {
		"bwctl": { "title": "BWCTL MA", "defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ] },
		"owamp": { "title": "OWAMP MA", "defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ] },
		"traceroute": { "title": "Traceroute MA", "defaults": [ "traceroute ma" ] }
	}, "defaults": [ "perfsonar-buoy ma", "perfsonarbuoy ma", "traceroute ma" ] },
	"ping": { "title": "Ping Responder", "defaults": [ "ping responder" ] },
	"traceroute": { "title": "Traceroute Responder", "defaults": [ "traceroute responder" ] }
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
	if ((status == google.maps.GeocoderStatus.OK) && results[0].geometry && results[0].geometry.viewport)
		map.gmap("get", "map").fitBounds(results[0].geometry.viewport);
});
var markers = {};

// Initialize Tree
var treeNodes = [];
for (type in serviceTypes)
{
	var children = [];
	if (serviceTypes[type]["types"])
		for (subtype in serviceTypes[type]["types"])
			children.push({ "title": serviceTypes[type]["types"][subtype]["title"], "type": subtype, "isFolder": true, "children": [] });
	treeNodes.push({ "title": serviceTypes[type]["title"], "type": type, "isFolder": true, "children": children });
}
var tree = $("#tree").dynatree({ "onActivate": function(node) { onNodeActivate(node) }, "children": treeNodes, "debugLevel": 0 });
tree.dynatree("getRoot").sortChildren(null, true);

// Load data
// $.getJSON(window.location.href + "query?filter=default&geocode=true&remap=true", function(data) { initialize(data) });
$.getJSON(window.location.href + "query?filter=default&geocode=true", function(data) { initialize(data) });

function initialize(data)
{
	for (var i = 0 ; i < data.length ; i++)
	{
		var record = data[i];
		var type = record["type"][0];
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
	tree.dynatree("getTree").reload()
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
			marker.click(function() { onMarkerActivate(this) });
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
	var title = getTitle(service)
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
		contentMap[key].sort(function (a,b) {
			var type_a = a["service-type"][0];
			var type_b = b["service-type"][0];
			if (type_a < type_b) return -1;
			else if (type_a > type_b) return 1;
			else return 0;
		});
		content += "<dt>" + key + "</dt>";
		for (var i = 0 ; i < contentMap[key].length ; i++)
			content += "<dd>" + getServiceType(contentMap[key][i]) + "</dd>";
	}
	content += "</dl>";
	map.gmap("openInfoWindow", { "content": content }, marker);
}

function onNodeActivate(node)
{
	if ((!node.data["records"]) || (!node.data["records"][0]))
		return;
	var service = node.data["records"][0];
	var host = getHost(service, hosts);
	var latlng = getLatLng(service, host)
	if ((latlng) && (markers[latlng]) && (markers[latlng])[0])
		onMarkerActivate(markers[latlng][0]);
	else
		map.gmap("closeInfoWindow");
	showServiceInfo(service)
}

function showServiceInfo(service)
{
	$("#service-name").html(service["service-name"].join("<br />"));
	$("#service-locator").html(service["service-locator"].join("<br />"));
	$("#service-location").html("test");
	// $("#group-communities").html(service["group-communities"].join("<br />"));
}

function getDomain(url)
{
	var parser = document.createElement("a");
	parser.href = url;
	return parser.hostname.replace("/[\[\]]/", "");
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

function getLatLng(record, host)
{
	var latlng = null;
	if ((record["location-latitude"]) && (record["location-latitude"][0]) && (record["location-longitude"]) && (record["location-longitude"][0]))
		latlng = new google.maps.LatLng(record["location-latitude"][0], record["location-longitude"][0]);
	if ((!latlng) && (host) && (host["location-latitude"]) && (host["location-latitude"][0]) && (host["location-longitude"]) && (host["location-longitude"][0]))
		latlng = new google.maps.LatLng(host["location-latitude"][0], host["location-longitude"][0]);
	return latlng;
}

function getServiceType(service)
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
			host = getHost(record, hosts);
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
			}
			if ((record["service-type"]) && record["service-type"][0])
				return record["service-name"][0].replace(record["service-type"][0] + ":", "").replace(getServiceType(record), "");
		}
		return record[type + "-name"][0];
	}
	return null;
}
