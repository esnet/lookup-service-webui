import math

from django.db import models
from django.core.cache import cache

from servicesDirectory import settings

import simplels_client

def get_services():
	hash = { "type": "service" }
	return query_ls(hash)

def get_communities():
	communities = set()
	for service in get_services():
		for community in service.get("group-communities", {}):
			communities.add(community)
	return communities

def query_ls(query = ""):
	try:
		query = simplels_client.hash_to_query(query)
	except TypeError:
		pass
	if settings.CACHE_LS_QUERIES:
		json = cache_get_list("LS_QUERY(" + query + ")")
		if json is None:
			json = simplels_client.query(query)
			cache_set_list("LS_QUERY(" + query + ")", json)
	else:
		json = simplels_client.query(query)
	return json

def cache_set_list(key, list, timeout = settings.CACHE_DATA_TIMEOUT):
	max_length = settings.CACHE_MAX_LIST_LENGTH
	chunks = int(math.ceil(len(list) / float(max_length)))
	for i in range(0, chunks):
		cache.set(key + "." + str(i), list[i * max_length : (i + 1) * max_length], timeout)

def cache_get_list(key):
	list = []
	i = 0
	while True:
		chunk = cache.get(key + "." + str(i))
		if chunk is not None:
			list += chunk
			i += 1
		else:
			break
	if i == 0:
		return None
	else:
		return list
