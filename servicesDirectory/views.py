from operator import itemgetter

from django.http import HttpResponse
from django.shortcuts import render
from django.utils import simplejson

from servicesDirectory import models

def index(request):
	return render(request, 'servicesDirectory/index.html')

def detail(request, uri):
	result = models.query_ls({ "uri": "lookup/service/" + uri })[0]
	context = { "service_name": result.get("service-name", ""),
				"service_locator": result.get("service-locator", ""),
				"location": result.get("location-sitename", ""),
				"group_communities": result.get("group-communities", ""),
				"command_line": result.get("command-line", "test"),
				"actions": result.get("psservice-eventtypes", "") }
	return render(request, 'servicesDirectory/index.html', context)

def query(request):
	query = request.GET.copy()
	sort = ""
	try:
		sort = query.pop("sort")[0]
	except KeyError, IndexError:
		pass
	format = ""
	try:
		format = query.pop("format")[0]
	except KeyError, IndexError:
		pass
	result = models.query_ls(query)
	if sort:
		result = sorted(result, key = lambda v: v.get(sort, ""))
	
	response = ""
	if "html" in format:
		context = { "json": result }
		return render(request, 'servicesDirectory/query.html', context)
	elif "pretty" in format:
		response = simplejson.dumps(result, sort_keys = True, indent = 4)
		return HttpResponse(response, mimetype = "application/json")
	else:
		response = simplejson.dumps(result)
		return HttpResponse(response, mimetype = "application/json")
