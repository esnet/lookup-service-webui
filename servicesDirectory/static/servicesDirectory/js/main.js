var initialized = false;

var hosts = [];
var interfaces = [];
var services = [];
var communities = [];
var people = [];

var filter = {"communities": [],
              "search": ""};

var serviceTypes = {
    "bwctl": {  "title": "BWCTL Server", 
                "defaults": [ "bwctl server" ], 
                "command": "bwctl -T iperf -t 20 -i 1 -f m -c <address>:<port>", 
                "action": "" },
    "ndt": {    "title": "NDT Server", 
                "defaults": [ "ndt server" ], 
                "command": "web100clt -n <address> -ll", 
                "action": "Test" },
    "npad": {   "title": "NPAD Server", 
                "defaults": [ "npad server" ], 
                "command": "", 
                "action": "Test" },
    "owamp": {  "title": "OWAMP Server", 
                "defaults": [ "owamp server" ], 
                "command": "owping  -c 10000 -i .01 <address>:<port>", 
                "action": "" },
    "ma": {     "title": "MA", 
                "types": {
                    "bwctl": {  "title": "BWCTL MA", 
                                "defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ], 
                                "command": "", 
                                "action": "Query" },
                    "owamp": {  "title": "OWAMP MA", 
                                "defaults": [ "perfsonarbuoy ma", "perfsonar-buoy ma" ], 
                                "command": "", 
                                "action": "Query" },
                    "traceroute": { "title": 
                                    "Traceroute MA", 
                                    "defaults": [ "traceroute ma" ], 
                                    "command": "", 
                                    "action": "Query" }
                }, 
                "defaults": [ "perfsonar-buoy ma", "perfsonarbuoy ma", "traceroute ma" ], 
                "command": "", 
                "action": "Query" },
    "ping": {   "title": "Ping Responder", 
                "defaults": [ "ping responder" ], 
                "command": "ping <address>",
                "action": "" },
    "traceroute": { 
                "title": "Traceroute Responder", 
                "defaults": [ "traceroute responder" ], 
                "command": "traceroute <address>", 
                "action": "" }
};

//
// Initialize Map
//

var mapOptions = {
    "center": new google.maps.LatLng(0, 0),
    "zoom": 2,
    "streetViewControl": false,
    "mapTypeId": google.maps.MapTypeId.ROADMAP,
    "noClear": true    
}
var map = new google.maps.Map($("#map-canvas").get(0), mapOptions);
var geocoder = new google.maps.Geocoder();
geocoder.geocode({ "address": "United States" }, function(results, status)
{
    if ((status == google.maps.GeocoderStatus.OK) && (results[0].geometry) && (results[0].geometry.viewport))
        map.fitBounds(results[0].geometry.viewport);
});
google.maps.visualRefresh = true;

var circleMarker = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 4.0,
    fillColor: '#EF706C',
    fillOpacity: 1,
    strokeColor: '#E36C65',
    strokeWeight: 1
};

var activeMarker = null;
var infoWindow = null;
var markers = {};

//
// Initialize Tree 
//

var expandedMap = {};
function initTreeNodes() {
    var treeNodes = []; 

    for (var type in serviceTypes)
    {
        var children = [];
        if (serviceTypes[type]["types"])
            for (var subtype in serviceTypes[type]["types"])
                children.push({ "title": serviceTypes[type]["types"][subtype]["title"], 
                                "type": subtype, 
                                "isFolder": true, 
                                "children": [] });

        var title = serviceTypes[type]["title"];
        var expanded = false;

        if (type in expandedMap) {
            expanded = expandedMap[type];
        } else {
            expandedMap[type] = false;
        }

        treeNodes.push({ "title": title, 
                         "type": type, 
                         "expand": expanded,
                         "isFolder": true, 
                         "children": children });
    }   
    return treeNodes;
}

function initTree(treeNodes) { 
    var tree = $("#tree").dynatree({ "onActivate": function(node) { onNodeActivate(node); }, 
                                     "onExpand": function(state, node) { onNodeExpand(state, node); },
                                     "children": treeNodes, 
                                     "debugLevel": 0 });
    return tree;
}
var treeNodes = initTreeNodes();
var tree = initTree(treeNodes);

//
// Initialize community select box
//

$("#communities").change(function() {
    updateFilter();
}) 

//
// Initialize search 
//

var update = $("#update").click(function(event) {
    updateFilter();
});

$("#search").keypress(function(e) 
{
    if (e.keyCode == 13) 
    {
        updateFilter();
        e.preventDefault();
    }
});
$('#search').tooltip({
    text: "Some sample text"
})

//
// Load data
//

$.getJSON(window.location.href + "query?filter=default&geocode=false&remap=true", function(records) { initialize(records); });

//
// Once data is loaded...
//

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
        else if (type == "person")
            people.push(record);
        if ((record["group-communities"]) && (record["group-communities"][0]))
            communities = communities.concat(record["group-communities"]);
    }

    $("#info").html("Processing...");

    for (var i = 0 ; i < services.length ; i++)
    {
        var service = services[i];
        services[i]["search"] = buildSearchString(service);
    }

    updateFilter();
    rebuild();
    updateCommunities();

    initialized = true;
}

function updateFilter() {
    $("#info").html("Updating...");

    var searchString = $("#search").val();
    filter.search = searchString.toLowerCase();

    var communities = []; 
    $('#communities :selected').each(function(i, selected){ 
        communities.push($(selected).text()); 
    });
    filter.communities = communities;

    clearServiceInfo();
    clearHostInfo() 
    clearServiceMarkers();

    rebuild();
}

function buildSearchString(service) {
    var communitiesString = service["group-communities"] ? service["group-communities"].join(" ") : "";
    var city = service["location-city"] ? service["location-city"] : "";
    var country = service["location-country"] ? getCountryString(service["location-country"][0]) : "";
    var state = service["location-state"] && service["location-state"][0] ? service["location-state"][0] : "";
    if (country === "USA") {
        state = getStateString(state);
    }
    var locationString = city + " " + state + " " + country;
    var titleString = getTitle(service);
    var serviceName = service["service-name"] && service["service-name"][0] ? service["service-name"] : "";
    var hostName = service["service-locator"] && service["service-locator"][0] ? getAddressString(getHostname(service["service-locator"][0])): "";
    var host = getHost(service, hosts);

    if (host) {
        var hostToolkitString = host["pshost-toolkitversion"] ? host["pshost-toolkitversion"] : "";

        var iface = getInterface(host, interfaces);
        if (iface)
        {
            var speedString = iface["interface-capacity"] ? parseInt(iface["interface-capacity"]/1000000000,10) : "";
            if (speedString !== "")
                speedString += "g";
        }
    }

    return [serviceName, titleString, locationString, hostName, hostToolkitString, communitiesString, speedString].join(" ").toLowerCase();
}

//
// Returns the intersection of two arrays
//

function intersect(firstArray, secondArray) {
    var result = [];
    var map = {};
    var val;
    var i; 

    //Make an associative array of the second array to
    //speed things up below
    var l2 = secondArray.length;
    for (i = 0; i < l2; i++) {
        map[secondArray[i]] = true;
    }

    //Loop through first array and find what is in second array map
    var l1 = firstArray.length;
    for (i = 0; i < l1; i++) {
        val = firstArray[i];
        if (val in map) {
            result.push(val);
        }
    }
    return result;
}

//
// Returns the services list, but filtered with the current filter
//

function filteredServices() {
    var filtered = [];

    for (var i = 0; i < services.length; i++) {
        var matched = true;
        var service = services[i];

        //Substring match the filter text string against the records searchFields string
        //If there's no searchString, match anyway.

        var searchFields = service["search"].toLowerCase();
        if (filter.search && filter.search !== "" && searchFields.search(filter.search) == -1) {
            matched = false;
        }

        //Only test the communities lists against each other if
        //  - the filter has less that all the communities possible to select (communities.length)
        //    since when we select ALL in the filter we want to match everything, even services with
        //    no communities listed. But if we select a specific filter we don't want to match services
        //    with no communities.
        //  - some type of filter is specified (at least one community is selected)

        var groupCommunities = service["group-communities"] ? service["group-communities"] : [];
        if (filter.communities.length < communities.length) {
            if (filter.communities.length > 0 && intersect(filter.communities, groupCommunities).length == 0) {
                matched = false;
            }
        }

        if (matched)
            filtered.push(service);
    }

    return filtered;
}

function rebuild() { 
    $("#tree").dynatree("getRoot").removeChildren();
    treeNodes = initTreeNodes();
    tree = initTree(treeNodes); 
    tree.dynatree("getTree").reload();
    var filtered = filteredServices();
    for (var i = 0 ; i < filtered.length ; i++)
    {
        var service = filtered[i];
        try
        {
            addServiceNode(service);
            addServiceMarker(service);
        }
        catch (error) {
            console.warn(error);
        }
    }

    serviceNodeCounts();
    $("#info").html("Showing: " + filtered.length + " of " + services.length + " services");

    updateTree();
    zoomToServiceMarkers();

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

function clearServiceMarkers()
{
    for (var latlong in markers) 
    {
        var marker = markers[latlong];
        marker.setMap(null);
        delete markers[latlong];
    }
}

function addServiceMarker(service)
{
    var marker = null;
    var host = getHost(service, hosts);
    var latlng = getLatLng(service, host);
    var title = getTitle(service);
    if (latlng)
    {
        if (markers[latlng])
        {
            marker = markers[latlng];
        }
        else
        {
            var marker = new google.maps.Marker({
                position: latlng,
                title: title,
                icon: circleMarker,
                optimized: false
            });
            google.maps.event.addListener(marker, 'click', function() { onMarkerActivate(this);} );
            marker["records"] = { "hosts": [], "services": [] };
            markers[latlng] = marker;
        }
        if (host)
            marker["records"]["hosts"].push(host);
        marker["records"]["services"].push(service);
    }
}

function zoomToServiceMarkers()
{
    map.setZoom(1);

    var bounds = new google.maps.LatLngBounds();
    for (var latlong in markers) 
    {
        var marker = markers[latlong];
        var pos = marker.getPosition();

        //don't zoom down to Antarctica
        if (pos.lat() < 70 &&  pos.lat() > -70)
            bounds.extend (marker.getPosition());
    }

    var zoom = 2;

    var zoomOut = false;
    if (!bounds.isEmpty())
        map.fitBounds (bounds);
    else
        zoomOut = true;

    var currentZoom = map.getZoom();

    if (zoomOut) {
        if (currentZoom < 4)
            zoom = 4;
    }
    else 
    {
        zoom = currentZoom;
        if (currentZoom > 6) {
            zoom = 6;
        }
        if (currentZoom < 2) {
            zoom = 2;
        }
    }

    map.setZoom(zoom);

    for (latlong in markers) 
    {
        marker = markers[latlong];
        marker.setMap(map);
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

function serviceNodeCounts()
{
    for (var i = 0 ; i < treeNodes.length ; i++)
    {
        var childCount = 0;
        var treeNode = treeNodes[i];
        for (var childIndex = 0; childIndex < treeNode.children.length; childIndex++)
        {
            childCount += serviceNodeChildCount(treeNode.children[childIndex]);
        }
        //If there's any children then we display a child number
        if (treeNode.children.length)
            treeNode.title = treeNode.title + "<span class='badge' pull-right>" + childCount + "</span>";
    }
}

function serviceNodeChildCount(node)
{
    if (node.isFolder && node.isFolder == true && node.children.length == 0) {
        return 0;
    }
    if (!node.children || node.children.length == 0) //leaf node
        return 1;

    var childCount = 0;
    if (node.children) 
    {
        for (var childIndex = 0; childIndex < node.children.length; childIndex++)
        {
            childCount += serviceNodeChildCount(node.children[childIndex]);
        } 
    }
    //If there's any children then we display a child number
    if (node.children.length)
        node.title = node.title + "<span class='badge' pull-right>" + childCount + "</span>";

    return childCount;
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

    if (infoWindow) {
        infoWindow.close();
    }
    infoWindow = new google.maps.InfoWindow({
        content: content
    });
    google.maps.event.addListener(infoWindow, 'domready', function() {
        $(".info-window-service").click(function(event)
        {
            onInfoWindowActivate($(this));
            event.preventDefault(event);
        });
    });
    infoWindow.open(map, marker);
    activeMarker = marker;
}

function onNodeActivate(node)
{
    if ((!node.data["records"]) || (!node.data["records"])) {
        return;
    }
    var service = node.data["records"][0];
    var host = getHost(service, hosts);
    var latlng = getLatLng(service, host);

    if ((latlng) && (markers[latlng]) && (markers[latlng])) {
        onMarkerActivate(markers[latlng]);
    }
    else
    {
        if (infoWindow)
            infoWindow.close();
    }

    showServiceInfo(service);
    showHostInfo(host);
}

function onNodeExpand(expanded, dtnode) {
    var folder = dtnode.data.type;
    expandedMap[folder] = expanded;
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

    $("#service-locator").html("");
    if (service["service-locator"]) {
        for (var s = 0; s < service["service-locator"].length; s++) {
            var address = service["service-locator"][s];
            $("#service-locator").append("<a href='" + getAddressLink(address) + "' target='_blank'>" + 
                getAddressString(address) + "</a><br />");
        }
    }
    else
        $("#service-locator").html("");

    var locationString = getLocationString(service);
    var latlngString = getLatLngString(service);
    if ((locationString) && (latlngString))
        $("#service-location").html(locationString + "<br /><div class='muted'>" + latlngString + "</div");
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

function clearServiceInfo() 
{
    $("#service-name").empty();
    $("#service-location").empty();
    $("#service-locator").empty();
    $("#service-communities").empty();
    $("#service-command-line").empty();
}

function getAddressLink(address)
{
    var url;

    //Fix URLs that start with tcp://
    if (address.indexOf("tcp://") != -1 || address.indexOf("http://") != -1) 
    {
        var parts = address.split(':');
        if (parts.length >= 2) {
            url = "http:" + parts.slice(1,parts.length-1).join(":");
        }
        if (parts.length > 2) {
            var leftParts = parts[parts.length-1].split("/");
            url += leftParts.length > 1 ? leftParts[leftParts.length-1] : "";
        }
    } else {
        url = "http://" + address + "/";
    }

    return url;
}

function getAddressString(address)
{
    if (address.indexOf("tcp://") != -1 || address.indexOf("http://") != -1) 
    {
        var parts = address.split(':');
        if (parts.length >= 2) {
            return parts.slice(1,parts.length-1).join(":").replace("//","").replace("[","").replace("]","");
        }
    }
    return address;
}

function showHostInfo(host)
{
    if (!host)
        host = { "type": "host" };

    if (host["host-name"])
        $("#host-name").html(host["host-name"].join("<br />"));
    else
        $("#host-name").html("");

    //
    // Hardware section
    //

    var hardwareString = "";
    var cpuString = getCPUString(host);
    var memoryString = getMemoryString(host);
    var speedString = getTrafficRate(host);

    if (cpuString)
        hardwareString += "CPU: " + cpuString;

    if (memoryString) {
        hardwareString += hardwareString ? "<br>" : "";
        hardwareString += "Memory: " + memoryString;
    }

    if (speedString) {
        hardwareString += hardwareString ? "<br>" : "";
        hardwareString += "NIC Speed: " + speedString;
    }
    $("#host-hardware").html(hardwareString);
    
    //
    // System Info
    //

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

    var contact = getContactInfo(host);
    if (contact)
        $("#host-os").append("<br>" + "Contact: " + contact);

    //
    // Toolkit version
    //

    if (host["pshost-toolkitversion"])
        $("#host-version").html(host["pshost-toolkitversion"].join("<br />"));
    else
        $("#host-version").html("");

    //
    // Communities
    //

    if (host["group-communities"])
        $("#host-communities").html(host["group-communities"].sort().join("<br />"));
    else
        $("#host-communities").html("");
}

function clearHostInfo() 
{
    $("#host-name").empty();
    $("#host-hardware").empty();
    $("#host-os").empty();
    $("#host-version").empty();
    $("#host-communities").empty();
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
        var address = getAddressString(service["service-locator"][i]);
        var port = getURLParser(service["service-locator"][i]).port;

        commands.push(format.replace("<address>", address).replace(":<port>", port === "" ? "" : ":" + port));
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

function getInterface(host, interfaces)
{
    var type = host["type"][0];
    if (type !== "host")
        return null;

    for (var i = 0 ; i < interfaces.length ; i++)
    {
        var iface = interfaces[i]; 
        if ($.inArray(iface["uri"], host["host-net-interfaces"]))
            return iface;
    }

    return null;
}

function getAdministrators(host, people)
{
    var result = [];
    var administrators = host["host-administrators"]; 
    if (administrators) {
        for (var j = 0 ; j < administrators.length; j++) {
            var administrator = administrators[j];
            for (var i = 0 ; i < people.length ; i++)
            {
                var person = people[i]; 
                if (person["uri"] == administrator)
                    result.push(person);
            }
        }
    }
    return result;
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

function getTrafficRate(record, places) {
    var host = getHost(record);
    if (host)
    {
        var iface = getInterface(host, interfaces);
        if (iface)
        {
            if (iface["interface-capacity"] && iface["interface-capacity"][0])
            {
                var bitsPerSecond = parseInt(iface["interface-capacity"][0], 10);
                if (bitsPerSecond <= 0 || isNaN(bitsPerSecond))
                    return 0;
                if (bitsPerSecond < 1000)
                    return bitsPerSecond.toFixed(places) + "bps";
                else if (bitsPerSecond < 1000000)
                    return (bitsPerSecond/1000).toFixed(places) + "kbps";
                else if (bitsPerSecond < 1000000000)
                    return (bitsPerSecond/1000000).toFixed(places) + "Mbps";
                else if (bitsPerSecond < 1000000000000)
                    return (bitsPerSecond/1000000000).toFixed(places) + "Gbps";
                else
                    return (bitsPerSecond/1000000000000).toFixed(places) + "Tbps";
            }
        }
    }
    return null;
}

function getContactInfo(host) {
    var name;
    var email;
    if (host)
    {
        adminList = getAdministrators(host, people);
        if (adminList[0]) {
            name = adminList[0]["person-name"] ? adminList[0]["person-name"][0] : null;
            email = adminList[0]["person-emails"] ? adminList[0]["person-emails"][0] : null;

            if (name && email)
                return name + " (" + email + ")";
            else if (email)
                return email;
            else if (name)
                return name;
            else
                return null;
        }
    }
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
            latlngString += "(" + (parseFloat(record["location-latitude"][0])).toFixed(4) + ", " + (parseFloat(record["location-longitude"][0])).toFixed(4) + ")";
    return latlngString;
}

function getStateString(code) {
    switch (code.toUpperCase()) {
       case "AL": code = "Alabama"; break;        
       case "AK": code = "Alaska"; break;         
       case "AZ": code = "Arizona"; break;        
       case "AR": code = "Arkansas"; break;       
       case "CA": code = "California"; break;     
       case "CO": code = "Colorado"; break;       
       case "CT": code = "Connecticut"; break;    
       case "DE": code = "Delaware"; break;       
       case "FL": code = "Florida"; break;        
       case "GA": code = "Georgia"; break;        
       case "HI": code = "Hawaii"; break;         
       case "ID": code = "Idaho"; break;          
       case "IL": code = "Illinois"; break;       
       case "IN": code = "Indiana"; break;        
       case "IA": code = "Iowa"; break;           
       case "KS": code = "Kansas"; break;         
       case "KY": code = "Kentucky"; break;       
       case "LA": code = "Louisiana"; break;      
       case "ME": code = "Maine"; break;          
       case "MD": code = "Maryland"; break;       
       case "MA": code = "Massachusetts"; break;  
       case "MI": code = "Michigan"; break;       
       case "MN": code = "Minnesota"; break;      
       case "MS": code = "Mississippi"; break;    
       case "MO": code = "Missouri"; break;       
       case "MT": code = "Montana"; break;        
       case "NE": code = "Nebraska"; break;       
       case "NV": code = "Nevada"; break;         
       case "NH": code = "New Hampshire"; break;  
       case "NJ": code = "New Jersey"; break;     
       case "NM": code = "New Mexico"; break;     
       case "NY": code = "New York"; break;       
       case "NC": code = "North Carolina"; break; 
       case "ND": code = "North Dakota"; break;   
       case "OH": code = "Ohio"; break;           
       case "OK": code = "Oklahoma"; break;       
       case "OR": code = "Oregon"; break;         
       case "PA": code = "Pennsylvania"; break;   
       case "RI": code = "Rhode Island"; break;   
       case "SC": code = "South Carolina"; break; 
       case "SD": code = "South Dakota"; break;   
       case "TN": code = "Tennessee"; break;      
       case "TX": code = "Texas"; break;          
       case "UT": code = "Utah"; break;           
       case "VT": code = "Vermont"; break;        
       case "VA": code = "Virginia"; break;       
       case "WA": code = "Washington"; break;     
       case "WV": code = "West Virginia"; break;  
       case "WI": code = "Wisconsin"; break;      
       case "WY": code = "Wyoming"; break;        
       default:   code = null;
    }
    return code;
}

function getCountryString(code) {
    switch (code.toUpperCase()) {
        case "AC": code = "Ascension Island"; break;
        case "AD": code = "Andorra"; break;
        case "AE": code = "United Arab Emirates"; break;
        case "AF": code = "Afghanistan"; break;
        case "AG": code = "Antigua and Barbuda"; break;
        case "AI": code = "Anguilla"; break;
        case "AL": code = "Albania"; break;
        case "AM": code = "Armenia"; break;
        case "AN": code = "Netherlands Antilles"; break;
        case "AO": code = "Angola"; break;
        case "AQ": code = "Antarctica"; break;
        case "AR": code = "Argentina"; break;
        case "AS": code = "American Samoa"; break;
        case "AT": code = "Austria"; break;
        case "AU": code = "Australia"; break;
        case "AW": code = "Aruba"; break;
        case "AZ": code = "Azerbaijan"; break;
        case "BA": code = "Bosnia and Herzegovina"; break;
        case "BB": code = "Barbados"; break;
        case "BD": code = "Bangladesh"; break;
        case "BE": code = "Belgium"; break;
        case "BF": code = "Burkina Faso"; break;
        case "BG": code = "Bulgaria"; break;
        case "BH": code = "Bahrain"; break;
        case "BI": code = "Burundi"; break;
        case "BJ": code = "Benin"; break;
        case "BM": code = "Bermuda"; break;
        case "BN": code = "Brunei"; break;
        case "BO": code = "Bolivia"; break;
        case "BR": code = "Brazil"; break;
        case "BS": code = "Bahamas"; break;
        case "BT": code = "Bhutan"; break;
        case "BV": code = "Bouvet Island"; break;
        case "BW": code = "Botswana"; break;
        case "BY": code = "Belarus"; break;
        case "BZ": code = "Belize"; break;
        case "CA": code = "Canada"; break;
        case "CC": code = "Cocos (Keeling) Islands"; break;
        case "CD": code = "Congo, Democratic People's Republic"; break;
        case "CF": code = "Central African Republic"; break;
        case "CG": code = "Congo, Republic of"; break;
        case "CH": code = "Switzerland"; break;
        case "CI": code = "C&ocirc;te d'Ivoire"; break;
        case "CK": code = "Cook Islands"; break;
        case "CL": code = "Chile"; break;
        case "CM": code = "Cameroon"; break;
        case "CN": code = "China"; break;
        case "CO": code = "Colombia"; break;
        case "CR": code = "Costa Rica"; break;
        case "CU": code = "Cuba"; break;
        case "CV": code = "Cape Verde"; break;
        case "CX": code = "Christmas Island"; break;
        case "CY": code = "Cyprus"; break;
        case "CZ": code = "Czech Republic"; break;
        case "DE": code = "Germany"; break;
        case "DJ": code = "Djibouti"; break;
        case "DK": code = "Denmark"; break;
        case "DM": code = "Dominica"; break;
        case "DO": code = "Dominican Republic"; break;
        case "DZ": code = "Algeria"; break;
        case "EC": code = "Ecuador"; break;
        case "EE": code = "Estonia"; break;
        case "EG": code = "Egypt"; break;
        case "EH": code = "Western Sahara"; break;
        case "ER": code = "Eritrea"; break;
        case "ES": code = "Spain"; break;
        case "ET": code = "Ethiopia"; break;
        case "FI": code = "Finland"; break;
        case "FJ": code = "Fiji"; break;
        case "FK": code = "Falkland Islands (Malvina)"; break;
        case "FM": code = "Micronesia, Federal State of"; break;
        case "FO": code = "Faroe Islands"; break;
        case "FR": code = "France"; break;
        case "GA": code = "Gabon"; break;
        case "GD": code = "Grenada"; break;
        case "GE": code = "Georgia"; break;
        case "GF": code = "French Guiana"; break;
        case "GG": code = "Guernsey"; break;
        case "GH": code = "Ghana"; break;
        case "GI": code = "Gibraltar"; break;
        case "GL": code = "Greenland"; break;
        case "GM": code = "Gambia"; break;
        case "GN": code = "Guinea"; break;
        case "GP": code = "Guadeloupe"; break;
        case "GQ": code = "Equatorial Guinea"; break;
        case "GR": code = "Greece"; break;
        case "GS": code = "South Georgia and the South Sandwich Islands"; break;
        case "GT": code = "Guatemala"; break;
        case "GU": code = "Guam"; break;
        case "GW": code = "Guinea-Bissau"; break;
        case "GY": code = "Guyana"; break;
        case "HK": code = "Hong Kong"; break;
        case "HM": code = "Heard and McDonald Islands"; break;
        case "HN": code = "Honduras"; break;
        case "HR": code = "Croatia/Hrvatska"; break;
        case "HT": code = "Haiti"; break;
        case "HU": code = "Hungary"; break;
        case "ID": code = "Indonesia"; break;
        case "IE": code = "Ireland"; break;
        case "IL": code = "Israel"; break;
        case "IM": code = "Isle of Man"; break;
        case "IN": code = "India"; break;
        case "IO": code = "British Indian Ocean Territory"; break;
        case "IQ": code = "Iraq"; break;
        case "IR": code = "Iran"; break;
        case "IS": code = "Iceland"; break;
        case "IT": code = "Italy"; break;
        case "JE": code = "Jersey"; break;
        case "JM": code = "Jamaica"; break;
        case "JO": code = "Jordan"; break;
        case "JP": code = "Japan"; break;
        case "KE": code = "Kenya"; break;
        case "KG": code = "Kyrgyzstan"; break;
        case "KH": code = "Cambodia"; break;
        case "KI": code = "Kiribati"; break;
        case "KM": code = "Comoros"; break;
        case "KN": code = "Saint Kitts and Nevis"; break;
        case "KP": code = "North Korea"; break;
        case "KR": code = "South Korea"; break;
        case "KW": code = "Kuwait"; break;
        case "KY": code = "Cayman Islands"; break;
        case "KZ": code = "Kazakstan"; break;
        case "LA": code = "Laos"; break;
        case "LB": code = "Lebanon"; break;
        case "LC": code = "Saint Lucia"; break;
        case "LI": code = "Liechtenstein"; break;
        case "LK": code = "Sri Lanka"; break;
        case "LR": code = "Liberia"; break;
        case "LS": code = "Lesotho"; break;
        case "LT": code = "Lithuania"; break;
        case "LU": code = "Luxembourg"; break;
        case "LV": code = "Latvia"; break;
        case "LY": code = "Lybia"; break;
        case "MA": code = "Morocco"; break;
        case "MC": code = "Monaco"; break;
        case "MD": code = "Modolva"; break;
        case "MG": code = "Madagascar"; break;
        case "MH": code = "Marshall Islands"; break;
        case "MK": code = "Macedonia, Former Yugoslav Republic"; break;
        case "ML": code = "Mali"; break;
        case "MM": code = "Myanmar"; break;
        case "MN": code = "Mongolia"; break;
        case "MO": code = "Macau"; break;
        case "MP": code = "Northern Mariana Islands"; break;
        case "MQ": code = "Martinique"; break;
        case "MR": code = "Mauritania"; break;
        case "MS": code = "Montserrat"; break;
        case "MT": code = "Malta"; break;
        case "MU": code = "Mauritius"; break;
        case "MV": code = "Maldives"; break;
        case "MW": code = "Malawi"; break;
        case "MX": code = "Mexico"; break;
        case "MY": code = "Maylaysia"; break;
        case "MZ": code = "Mozambique"; break;
        case "NA": code = "Namibia"; break;
        case "NC": code = "New Caledonia"; break;
        case "NE": code = "Niger"; break;
        case "NF": code = "Norfolk Island"; break;
        case "NG": code = "Nigeria"; break;
        case "NI": code = "Nicaragua"; break;
        case "NL": code = "Netherlands"; break;
        case "NO": code = "Norway"; break;
        case "NP": code = "Nepal"; break;
        case "NR": code = "Nauru"; break;
        case "NU": code = "Niue"; break;
        case "NZ": code = "New Zealand"; break;
        case "OM": code = "Oman"; break;
        case "PA": code = "Panama"; break;
        case "PE": code = "Peru"; break;
        case "PF": code = "French Polynesia"; break;
        case "PG": code = "Papua New Guinea"; break;
        case "PH": code = "Philippines"; break;
        case "PK": code = "Pakistan"; break;
        case "PL": code = "Poland"; break;
        case "PM": code = "St. Pierre and Miquelon"; break;
        case "PN": code = "Pitcairn Island"; break;
        case "PR": code = "Puerto Rico"; break;
        case "PS": code = "Palestinian Territories"; break;
        case "PT": code = "Portugal"; break;
        case "PW": code = "Palau"; break;
        case "PY": code = "Paraguay"; break;
        case "QA": code = "Qatar"; break;
        case "RE": code = "Reunion"; break;
        case "RO": code = "Romania"; break;
        case "RU": code = "Russian Federation"; break;
        case "RW": code = "Twanda"; break;
        case "SA": code = "Saudi Arabia"; break;
        case "SB": code = "Solomon Islands"; break;
        case "SC": code = "Seychelles"; break;
        case "SU": code = "Sudan"; break;
        case "SE": code = "Sweden"; break;
        case "SG": code = "Singapore"; break;
        case "SH": code = "St. Helena"; break;
        case "SI": code = "Slovenia"; break;
        case "SJ": code = "Svalbard and Jan Mayan Islands"; break;
        case "SK": code = "Slovakia"; break;
        case "SL": code = "Sierra Leone"; break;
        case "SM": code = "San Marino"; break;
        case "SN": code = "Senegal"; break;
        case "SO": code = "Somalia"; break;
        case "SR": code = "Suriname"; break;
        case "ST": code = "S&atilde;o Tome and Principe"; break;
        case "SV": code = "El Salvador"; break;
        case "SY": code = "Syria"; break;
        case "SZ": code = "Swaziland"; break;
        case "TC": code = "Turks and Ciacos Islands"; break;
        case "TD": code = "Chad"; break;
        case "TF": code = "French Southern Territories"; break;
        case "TG": code = "Togo"; break;
        case "TH": code = "Thailand"; break;
        case "TJ": code = "Tajikistan"; break;
        case "TK": code = "Tokelau"; break;
        case "TM": code = "Turkmenistan"; break;
        case "TN": code = "Tunisia"; break;
        case "TO": code = "Tonga"; break;
        case "TP": code = "East Timor"; break;
        case "TR": code = "Turkey"; break;
        case "TT": code = "Trinidad and Tobago"; break;
        case "TV": code = "Tuvalu"; break;
        case "TW": code = "Taiwan"; break;
        case "TZ": code = "Tanzania"; break;
        case "UA": code = "Ukraine"; break;
        case "UG": code = "Uganda"; break;
        case "UK": code = "UK"; break;
        case "UM": code = "US Minor Outlying Islands"; break;
        case "US": code = "USA"; break;
        case "UY": code = "Uruguay"; break;
        case "UZ": code = "Uzbekistan"; break;
        case "VA": code = "Vatican City"; break;
        case "VC": code = "Saint Vincent and the Grenadines"; break;
        case "VE": code = "Venezuela"; break;
        case "VG": code = "British Virgin Islands"; break;
        case "VI": code = "US Virgin Islands"; break;
        case "VN": code = "Vietnam"; break;
        case "VU": code = "Vanuatu"; break;
        case "WF": code = "Wallis and Futuna Islands"; break;
        case "WS": code = "Western Samoa"; break;
        case "YE": code = "Yemen"; break;
        case "YT": code = "Mayotte"; break;
        case "YU": code = "Yugoslavia"; break;
        case "ZA": code = "South Africa"; break;
        case "ZM": code = "Zambia"; break;
        case "ZR": code = "Zaire"; break;
        case "ZW": code = "Zimbabwe"; break;
        default:   code = null;
     }
    return code;
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
        locationString += getCountryString(record["location-country"][0]);
    return $.trim(locationString);
}

function getMemoryString(record)
{
    var memoryString = "";
    var type = record["type"][0];
    if ((record[type + "-hardware-memory"]) && (record[type + "-hardware-memory"][0]))
        memoryString += record[type + "-hardware-memory"][0];
    var memoryParts = memoryString.split(' ');
    if (memoryParts.length == 2) {
        memoryString = parseInt(memoryParts[0]) + " " + memoryParts[1];
    }
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
            if(record["service-display-title"]){
                return record["service-display-title"];
            }
            for (type in serviceTypes)
            {
                var address = record["service-locator"][0];
                return getAddressString(address).toLowerCase();

                /*
                if ($.inArray(record["service-name"][0].toLowerCase(), serviceTypes[type]["defaults"]) >= 0)
                {
                    if ((record["location-sitename"]) && (record["location-sitename"][0])) {
                        return record["location-sitename"][0];
                    }
                    var host = getHost(record, hosts);
                    if (host)
                    {
                        if ((host["location-sitename"]) && (host["location-sitename"][0])) {
                            return host["location-sitename"][0];
                        } else if ((host["host-name"]) && (host["host-name"][0])) {
                            return host["host-name"][0];
                        }
                    }
                    if ((record["service-locator"]) && (record["service-locator"][0])) {
                        return getHostname(record["service-locator"][0]).replace("/[[]]/", "");
                    }
                }
                */

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
