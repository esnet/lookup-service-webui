from operator import itemgetter

import requests
import grequests

_LS_HINTS = 'http://ps1.es.net:8096/lookup/activehosts.json'

def get_hosts():
    hosts = [host for host in get_hosts_gen()]
    return hosts

def get_hosts_gen():
    hosts = requests.get(_LS_HINTS).json()["hosts"]
    hosts = sorted(hosts, key=itemgetter("priority"), reverse=True)
    for host in hosts:
        if host["status"] == "alive":
            yield host["locator"]

def refresh_hosts():
    _ls_hosts = get_hosts()

_ls_hosts = get_hosts()

def query(query = "", hosts = _ls_hosts):
    try:
        query = hash_to_query(query)
    except AttributeError:
        pass
    json = []
    responses = (grequests.get(url + query) for url in hosts)
    for response in grequests.map(responses):
         json += response.json()
    return json

def hash_to_query(hash = {}):
    query = ""
    for k, v in hash.items():
        query += k + "=" + v + "&"
    if query:
        query = "?" + query[:-1]
    return query

def query_to_hash(query = ""):
    hash = {}
    if query[0] == "?":
        query = query[1:]
    for pair in query.split("&"):
        pair = pair.split("=")
        k = pair[0]
        v = ""
        if len(pair) > 1:
            v = pair[1]
        hash[k] = v
    return hash
