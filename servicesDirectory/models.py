import logging
import math
import socket
from urlparse import urlparse

from django.db import models
from django.core.cache import cache

from IPy import IP

from servicesDirectory import settings
from servicesDirectory import simplels_client

try:
    import concurrent.futures
    from pygeocoder import Geocoder
    from pygeolib import GeocoderResult
    _MAX_CONCURRENT_GEOCODES = 8
    _geocoder = None
except ImportError:
    pass

logger = logging.getLogger(__name__)

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
    except TypeError:
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
    
def cache_set_records(cache_key, records, timeout = settings.LS_CACHE_TIMEOUT):
    max_records = settings.SINGLE_CACHE_MAX_RECORDS
    if max_records < 1:
        max_records = 512
    if len(records) == 0:
        cache.set(cache_key + ".0", records)
    else:
        chunks = int(math.ceil(len(records) / float(max_records)))
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

def get_default_filter(records):
    for record in records:
        record_type = record["type"][0]
        if record_type != "pstest":
            if record_type == "service":
                record.pop("ma-tests", None)
                record.pop("psservice-eventtypes", None)
            record.pop("ttl", None)
            record.pop("expires", None)
            yield record

def geocode_records(records):
    global _MAX_CONCURRENT_GEOCODES
    if not settings.GEOCODE:
        return records
    with concurrent.futures.ThreadPoolExecutor(max_workers = _MAX_CONCURRENT_GEOCODES) as pool:
        list(pool.map(geocode_record, records))
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
        record["location-city"] = [ city or result.city or u"" ]
        record["location-state"] = [ state or result.state or u"" ]
        record["location-code"] = [ code or result.postal_code or u"" ]
        record["location-country"] = [ country or result.country__short_name or u"" ]
        if not reverse:
            record["location-latitude"] = [ str(result.coordinates[0]) ]
            record["location-longitude"] = [ str(result.coordinates[1]) ]

def get_geocoder():
    if _geocoder:
        return _geocoder
    else:    
        if settings.GEOCODE_API_PRIVATE_KEY and settings.GEOCODE_API_CLIENT_ID:
            return Geocoder(settings.GEOCODE_API_CLIENT_ID, settings.GEOCODE_API_PRIVATE_KEY)
        else:
            return Geocoder

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
                cache.set(cache_key, [ False ], settings.GEOCODE_CACHE_TIMEOUT)
        elif not result[0]:
            result = {}
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
        cache_key = "GEO_QUERY(%s)" % "".join(query.lower().split())
        result = cache.get(cache_key)
        if result is None:
            try:
                results = get_geocoder().reverse_geocode(float(latitude), float(longitude))
                result = results[0].raw
                cache.set(cache_key, result, settings.GEOCODE_CACHE_TIMEOUT)
            except:
                cache.set(cache_key, [ False ], settings.GEOCODE_CACHE_TIMEOUT)
        elif not result[0]:
            result = {}
    else:
        try:
            results = get_geocoder().reverse_geocode(latitude, longitude)
            result = results[0].raw
        except:
            pass
    return result

def remap_records(records):
    hosts = []
    interfaces = []
    services = []
    for record in records:
        record_type = record["type"][0]
        if record_type == "host":
            hosts.append(record)
        elif record_type == "interface":
            interfaces.append(record)
        elif record_type == "service":
            services.append(record)
    for service in services:
        host = get_host(service, hosts, interfaces)
        service_locators = service.get("service-locator", [])
        for locator in service_locators:
            service_hostname = urlparse(locator).hostname
            if service_hostname is None:
                service_hostname = locator
            elif service_hostname.startswith('['):
                service_hostname = locator[(locator.find('[')+1):locator.find(']')]
            try:
                ip_form = IP(service_hostname)
                if(ip_form.iptype() == 'PRIVATE'):
                    records.remove(service)
                else:
                    service['service-display-title'] = socket.gethostbyaddr(ip_form.strNormal())[0]
            except:
                pass
            break
            
    return records

def get_host(record, hosts, interfaces = []):
    record_type = record["type"][0]
    if record_type == "host":
        return record
    elif record_type == "interface":
        for host in hosts:
            if record["uri"] in host.get("host-net-interfaces", []):
                return host
        interface_addresses = record.get("interface-addresses", [])
        if interface_addresses:
            for address in interface_addresses:
                hostname = urlparse(address).hostname
                for host in hosts:
                    if hostname in host.get("host-name", []) or address in host.get("host-name", []):
                        return host
    elif record_type == "service":
        service_hosts = record.get("service-host", [])
        if service_hosts and service_hosts[0]:
            for host in hosts:
                if host["uri"] in service_hosts:
                    return host
        service_locators = record.get("service-locator", [])
        if service_locators:
            for locator in service_locators:
                hostname = urlparse(locator).hostname
                for host in hosts:
                    if hostname in host.get("host-name", []) or locator in host.get("host-name", []):
                        return host
                for interface in interfaces:
                    if hostname in interface.get("interface-addresses", []) or locator in interface.get("interface-addresses", []):
                        host = get_host(interface, hosts)
                        if host is not None:
                            return host
        service_sitename = record.get("location-sitename", [])
        if service_sitename:
            for host in hosts:
                if service_sitename == host.get("location-sitename", []):
                    return host
    return None
