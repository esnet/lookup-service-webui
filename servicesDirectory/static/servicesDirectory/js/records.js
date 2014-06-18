////////////////////////////////////////
// Record Data Functions
////////////////////////////////////////

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
	hostnames = hostnames.sort(function(a, b) { compareHostnames(a, b); }).unique();
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
		locationString += record["location-sitename"].join() + ", ";
	if (hasField(record, "location-city"))
		locationString += record["location-city"].join() + ", ";
	if (hasField(record, "location-state"))
	{
		locationString += record["location-state"].join();
		if (hasField(record, "location-code"))
			locationString += " " + record["location-code"].join() + ", ";
		else
			locationString += ", ";
	}
	else if (hasField(record, "location-code"))
	{
		locationString += record["location-code"].join() + ", ";
	}
	if (hasField(record, "location-country"))
		locationString += getCountryString(record["location-country"].join());
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
			return record["location-sitename"].join();
		hostname = getHostname(record);
		if (hostname)
			return hostname;
	}
	else if (type == "interface")
	{
		if (hasField(record, "location-sitename"))
			return record["location-sitename"].join();
		var hostname = getHostname(record);
		if (hostname)
			return hostname;
	}
	else if (type == "service")
	{
		if (hasField(record, "location-sitename"))
			return record["location-sitename"].join();
		if (hasField(record, "service-name"))
		{
			var serviceName = record["service-name"].join();
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
	if (hasField(record, type + "-name"))
		return record[type + "-name"].join();
	return null;
}

function hasField(record, field)
{
	return ((record[field]) && (record[field][0]));
}
