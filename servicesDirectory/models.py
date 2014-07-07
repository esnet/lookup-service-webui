import logging
import math
import re
import socket
from urlparse import urlparse

from django.db import models
from django.core.cache import cache

from servicesDirectory import settings
from servicesDirectory import simplels_client

_ip_enabled = False
try:
    from IPy import IP
    _ip_enabled = True
except ImportError:
    pass

_url_enabled = False
try:
    from yurl import URL
    _url_enabled = True
except ImportError:
    pass

_concurrency_enabled = False
try:
    import concurrent.futures
    _MAX_CONCURRENT_REQUESTS = 16
    _concurrency_enabled = True
except ImportError:
    pass

_geocoder_enabled = False
try:
    from pygeocoder import Geocoder
    from pygeolib import GeocoderResult
    _geocoder = None
    _geocoder_enabled = True
except ImportError:
    pass

_dns_enabled = False
try:
    from dns import reversename
    from dns import resolver
    _dns_resolver = None
    _dns_enabled = True
except ImportError:
    pass

logger = logging.getLogger(__name__)

##############################
# Query Lookup Service
##############################
def get_services():
    return query_ls({ "type": "service" })

def get_communities():
    communities = set()
    for service in get_services():
        for community in service.get("group-communities", []):
            communities.add(community)
    return communities

def query_ls(query = "", cached_records=True):
    try:
        query = simplels_client.hash_to_query(query)
    except:
        pass
    records = None
    if settings.LS_CACHE_QUERIES:
        cache_key = "LS_QUERY(%s)" % query
        if cached_records:
            records = cache_get_records(cache_key)
        if records is None:
            records = simplels_client.query(query)
            cache_set_records(cache_key, records)
    else:
        records = simplels_client.query(query)
    return records

##############################
# Record Caching
##############################
def cache_set_records(cache_key, records, timeout = settings.LS_CACHE_TIMEOUT):
    max_records = settings.SINGLE_CACHE_MAX_RECORDS
    if max_records < 1:
        max_records = 512
    if len(records) == 0:
        cache.set(cache_key + ".0", records)
    else:
        chunks = int(math.ceil(len(records) / float(max_records))) + 1
        for i in range(0, chunks):
            cache.set(cache_key + "." + str(i), records[i * max_records : (i + 1) * max_records], timeout)

def cache_get_records(cache_key):
    max_records = settings.SINGLE_CACHE_MAX_RECORDS
    if max_records < 1:
        max_records = 512
    records = []
    i = 0
    while True:
        chunk = cache.get(cache_key + "." + str(i))
        if chunk is not None:
            records += chunk
            i += 1
            if len(chunk) < max_records:
                break
        else:
            break
    if i == 0:
        return None
    else:
        return records

##############################
# Record Filtering
##############################
def filter_default(records):
    for record in records[:]:
        record_type = record["type"][0]
        if record_type == "host":
            pass
        elif record_type == "interface":
            interface_name = record.get("interface-name", [ "" ])[0]
            if interface_name.startswith("MA:"):
                records.remove(record)
                continue
        elif record_type == "person":
            pass
        elif record_type == "service":
            service_type = record.get("service-type", [ "" ])[0]
            if service_type == "phoebus":
                records.remove(record)
                continue
            service_locators = record.get("service-locators", [ "" ])[0]
            if service_locators:
                private_addresses = False
                for locator in service_locators:
                    hostname = get_hostname_from_url(locator)
                    try:
                        ip_form = IP(address)
                        if ip_form.iptype() == "PRIVATE":
                            record["service-locators"].remove(locator)
                            private_addresses = True
                    except:
                        pass
                if private_addresses and not record["service-locators"]:
                    records.remove(record)
            record.pop("ma-tests", None)
            record.pop("psservice-eventtypes", None)
        else:
            records.remove(record)
            continue
        record.pop("expires", None)
        record.pop("state", None)
        record.pop("ttl", None)
    return records

##############################
# Record Geocoding
##############################
def geocode_records(records):
    if settings.GEOCODE and _geocoder_enabled:
        if _concurrency_enabled:
            with concurrent.futures.ThreadPoolExecutor(max_workers = _MAX_CONCURRENT_REQUESTS) as pool:
                list(pool.map(geocode_record, records))
        else:
            for record in records:
                geocode_record(record)
    return records

def geocode_record(record):
    result = {}
    reverse = False
    latitude = record.get("location-latitude", [ False ])[0]
    longitude = record.get("location-longitude", [ False ])[0]
    sitename = record.get("location-sitename", [ False ])[0]
    city = record.get("location-city", [ False ])[0]
    state = record.get("location-state", [ False ])[0]
    code = record.get("location-code", [ False ])[0]
    country = record.get("location-country", [ False ])[0]
    if latitude and longitude:
        reverse = True
        result = reverse_geocode(latitude, longitude)
    else:
        query = ""
        if sitename:
            query += sitename + ", "
        if city:
            query += city + ", "
        if state:
            query += state
            if code:
                query += " " + code + ", "
            else:
                query += ", "
        elif code:
            query += code + ", "
        if country:
            query += country
        if query:
            result = geocode(query)
    if result:
        result = GeocoderResult(result)
        record["location-city"] = [ city or result.city or "" ]
        record["location-state"] = [ state or result.state or "" ]
        record["location-code"] = [ code or result.postal_code or "" ]
        record["location-country"] = [ country or result.country__short_name or "" ]
        if not reverse:
            record["location-latitude"] = [ str(result.coordinates[0]) ]
            record["location-longitude"] = [ str(result.coordinates[1]) ]

def get_geocoder():
    global _geocoder
    if not _geocoder:
        if settings.GEOCODE_API_PRIVATE_KEY and settings.GEOCODE_API_CLIENT_ID:
            _geocoder = Geocoder(settings.GEOCODE_API_CLIENT_ID, settings.GEOCODE_API_PRIVATE_KEY)
        else:
            _geocoder = Geocoder
    return _geocoder

def geocode(query):
    result = {}
    if settings.GEOCODE_CACHE_QUERIES:
        cache_key = "GEO_QUERY(%s)" % "".join(query.lower().split())
        result = cache.get(cache_key)
        if result is None:
            try:
                results = get_geocoder().geocode(query)
                result = results[0].raw
                cache.set(cache_key, result, settings.GEOCODE_CACHE_TIMEOUT)
            except:
                cache.set(cache_key, {}, settings.GEOCODE_CACHE_TIMEOUT)
    else:
        try:
            results = get_geocoder().geocode(query)
            result = results[0].raw
        except:
            pass
    return result

def reverse_geocode(latitude, longitude):
    result = {}
    if settings.GEOCODE_CACHE_QUERIES:
        cache_key = "GEO_QUERY(%s)" % "".join((latitude +  "," + longitude).split())
        result = cache.get(cache_key)
        if result is None:
            try:
                results = get_geocoder().reverse_geocode(float(latitude), float(longitude))
                result = results[0].raw
                cache.set(cache_key, result, settings.GEOCODE_CACHE_TIMEOUT)
            except:
                cache.set(cache_key, {}, settings.GEOCODE_CACHE_TIMEOUT)
    else:
        try:
            results = get_geocoder().reverse_geocode(latitude, longitude)
            result = results[0].raw
        except:
            pass
    return result

##############################
# Record Remapping
##############################
def remap_records(records):
    record_map = {}
    for record in records:
        record_type = record["type"][0]
        if record_map.get(record["ls-host"], []):
            if record_map[record["ls-host"]].get(record_type, []):
                record_map[record["ls-host"]][record_type].append(record)
            else:
                record_map[record["ls-host"]][record_type] = [ record ]
        else:
            record_map[record["ls-host"]] = { record_type: [ record ] }
    for ls_host in record_map:
        hosts = record_map[ls_host].get("host", [])
        interfaces = record_map[ls_host].get("interface", [])
        services = record_map[ls_host].get("service", [])
        def remap_interface_helper(interface):
            remap_interface(interface, hosts, interfaces, services)
        def remap_service_helper(service):
            remap_service(service, hosts, interfaces, services)
        if _concurrency_enabled:
            # with concurrent.futures.ThreadPoolExecutor(max_workers = _MAX_CONCURRENT_REQUESTS) as pool:
            #    list(pool.map(remap_interface_helper, interfaces))
            with concurrent.futures.ThreadPoolExecutor(max_workers = _MAX_CONCURRENT_REQUESTS) as pool:
                list(pool.map(remap_service_helper, services))
        else:
            # for interface in interfaces:
            #     remap_interface_helper(interface)
            for service in services:
                remap_service_helper(service)
    return records

def remap_interface(interface, hosts, interfaces = [], services = []):
    host = get_host(interface, hosts, interfaces, services)
    # hostname = get_hostname(interface, host)
    # if hostname:
    #     interface["interface-hostname"] = hostname
    # if not host:
    #     host = get_host(interface, hosts, interfaces, services)
    if host:
        host_interfaces = host.get("host-net-interfaces", [])
        if host_interfaces:
            if interface["uri"] not in host_interfaces:
                host["host-net-interfaces"].insert(0, interface["uri"])
        else:
            host["host-net-interfaces"] = [ interface["uri"] ]

def remap_service(service, hosts, interfaces = [], services = []):
    host = get_host(service, hosts, interfaces, services)
    hostname = get_hostname(service, host)
    if hostname:
        service["service-hostname"] = hostname
    if not host:
        host = get_host(service, hosts, interfaces, services) 
    if host:
        service_hosts = service.get("service-host", [])
        if service_hosts:
            if host["uri"] not in service_hosts:
                service["service-host"].insert(0, host["uri"])
        else:
            service["service-host"] = [ host["uri"] ]

def get_host(record, hosts, interfaces = [], services = [], depth = 1):
    record_type = record["type"][0]
    if record_type == "host":
        return record
    elif record_type == "interface":
        interface_name = record.get("interface-name", [ "" ])[0]
        if interface_name.startswith("MA:"):
            return None
        for host in hosts:
            if record["ls-host"] == host["ls-host"]:
                if record["uri"] in host.get("host-net-interfaces", []):
                    return host
        if depth != 0:
            hostnames = get_hostnames(record)
            for host in hosts:
                if record["ls-host"] == host["ls-host"]:
                    if any(i in get_hostnames(host) for i in hostnames):
                        return host
            interfaces = interfaces[:]
            interfaces.remove(record)
            for service in services:
                if record["ls-host"] == service["ls-host"]:
                    if any(i in get_hostnames(service) for i in hostnames):
                        host = get_host(service, hosts, interfaces, services, depth - 1)
                        if host is not None:
                            return host
    elif record_type == "service":
        service_hosts = record.get("service-host", [])
        if service_hosts:
            for host in hosts:
                if record["ls-host"] == host["ls-host"]:
                    if host["uri"] in service_hosts:
                        return host
        if depth != 0:
            hostnames = get_hostnames(record)
            for host in hosts:
                if record["ls-host"] == host["ls-host"]:
                    if any(i in get_hostnames(host) for i in hostnames):
                        return host
            services = services[:]
            services.remove(record)
            for interface in interfaces:
                if record["ls-host"] == interface["ls-host"]:
                    if any(i in get_hostnames(interface) for i in hostnames):
                        host = get_host(interface, hosts, interfaces, services, depth - 1)
                        if host is not None:
                            return host
            # for service in services:
            #     if record["ls-host"] == service["ls-host"]:
            #         if any(i in get_hostnames(service) for i in hostnames):
            #             host = get_host(service, hosts, interfaces, services, depth - 1)
            #             if host is not None:
            #                 return host
            service_sitename = record.get("location-sitename", [])
            if service_sitename:
                for host in hosts:
                    if record["ls-host"] == host["ls-host"]:
                        if service_sitename == host.get("location-sitename", []):
                            return host
    return None

def get_hostname(record, host, depth = 1):
    record_type = record["type"][0]
    hostname = record.get(record_type + "-hostname", "")
    if hostname:
        return hostname
    hostnames = sorted(get_hostnames(record), key = lambda v: v.replace("-v6", "~"))
    for hostname in hostnames:
        if not is_ip_address(hostname):
            return hostname
    if depth != 0:
        if host is not None:
            hostname = get_hostname(host, None, depth - 1)
            if hostname is not None:
                return hostname
        if settings.RDNS:
            for hostname in hostnames:
                hostname = get_hostname_from_ip(hostname)
                if hostname:
                    return hostname
    return None

def get_hostnames(record):
    addresses = []
    hostnames = []
    record_type = record["type"][0]
    if record_type == "host":
        addresses = record.get("host-name", [])
    elif record_type == "interface":
        addresses = record.get("interface-addresses", [])
    elif record_type == "service":
        addresses = record.get("service-locator", [])
    hostname = record.get(record_type + "-hostname", "")
    if hostname:
        hostnames.append(hostname)
    for address in addresses:
        hostnames.append(get_hostname_from_url(address))
    return hostnames

def get_dns_resolver():
    global _dns_resolver
    if not _dns_resolver:
        _dns_resolver = resolver.Resolver()
        _dns_resolver.timeout = 0.5
        _dns_resolver.lifetime = 0.5
    return _dns_resolver

def gethostbyaddr(ip):
    if _dns_enabled:
        reverse_name = reversename.from_address(ip)
        return get_dns_resolver().query(reverse_name, "PTR")[0].to_text()[:-1]
    else:
        return socket.gethostbyaddr(ip)[0]
        
def get_hostname_from_ip(ip):
    result = ""
    if settings.RDNS_CACHE_QUERIES:
        cache_key = "RDNS_QUERY(%s)" % ip
        result = cache.get(cache_key)
        if result is None:
            try:
                result = gethostbyaddr(ip)
                cache.set(cache_key, result, settings.RDNS_CACHE_TIMEOUT)
            except:
                cache.set(cache_key, "", settings.RDNS_CACHE_TIMEOUT)
    else:
        try:
            result = gethostbyaddr(ip)
        except:
            pass
    return result

def get_hostname_from_url(url):
    hostname = ""
    if _url_enabled:
        hostname = URL(url).host.strip("[]")
    else:
        hostname = urlparse(url).hostname
    if hostname is None:
        hostname = url.lower()
    return hostname

def is_ip_address(address):
    ip_form = None
    if _ip_enabled:
        try:
            ip_form = IP(address)
        except:
            pass
    else:
        ipv4_format = r"^\[?([\d]{1,3}\.){3}[\d]{1,3}\]?(:\d*){0,1}$"
        ipv6_format = r"^\[?([\da-fA-F]{0,4}:){3,7}[\da-fA-F]{0,4}\]?(:\d*){0,1}$"
        ip_form = re.match(ipv4_format, address) or re.match(ipv6_format, address)
    if ip_form:
        return True
    else:
        return False
