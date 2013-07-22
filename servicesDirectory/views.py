from operator import itemgetter

from django.http import HttpResponse
from django.shortcuts import render
from django.utils import simplejson

from servicesDirectory import models

def index(request):
	return render(request, 'servicesDirectory/index.html')

def detail(request, uri):
	record = models.query_ls({ "uri": "lookup/service/" + uri })[0]
	context = { "service_name": record.get("service-name", ""),
				"service_locator": record.get("service-locator", ""),
				"location": record.get("location-sitename", ""),
				"group_communities": record.get("group-communities", ""),
				"command_line": record.get("command-line", "test"),
				"actions": record.get("psservice-eventtypes", "") }
	return render(request, 'servicesDirectory/index.html', context)

def query(request):
	query = request.GET.copy()
	format = ""
	try:
		format = query.pop("format")[0]
	except KeyError, IndexError:
		pass
	geocode = ""
	try:
		geocode = query.pop("geocode")[0]
	except KeyError, IndexError:
		pass
	pretty = ""
	try:
		pretty = query.pop("pretty")[0]
	except KeyError, IndexError:
		pass
	sort = ""
	try:
		sort = query.pop("sort")[0]
	except KeyError, IndexError:
		pass
	
	records = models.query_ls(query)
	
	if geocode.lower() in ("yes", "true"):
		records = models.geocode_records(records)
	if sort:
		records = sorted(records, key = lambda v: v.get(sort, ""))
	
	response = ""
	if "html" in format.lower():
		context = {}
		if pretty.lower() in ("yes", "true"):
			context = { "records": records, "pretty": True }
		else:
			context = { "records": records, "pretty": False }
		return render(request, 'servicesDirectory/query.html', context)
	else:
		if pretty.lower() in ("yes", "true") or "pretty" in format.lower():
			response = simplejson.dumps(records, sort_keys = True, indent = 4)
		else:
			response = simplejson.dumps(records)
		return HttpResponse(response, mimetype = "application/json")
