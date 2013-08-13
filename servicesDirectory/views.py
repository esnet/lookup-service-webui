from django.http import HttpResponse
from django.middleware.gzip import GZipMiddleware
from django.shortcuts import render
from django.utils import simplejson

from servicesDirectory import models

def index(request):
	return render(request, 'servicesDirectory/index.html')

def query(request):
	query = request.GET.copy()
	compress = query.pop("compress", ["true"])[0]
	record_filter = query.pop("filter", ["none"])[0]
	format = query.pop("format", ["json"])[0]
	geocode = query.pop("geocode", ["false"])[0]
	record_remap = query.pop("remap", ["false"])[0]
	pretty = query.pop("pretty", ["false"])[0]
	sort = query.pop("sort", [False])[0]
	
	records = models.query_ls(query)
	
	if record_filter.lower() in ("default",):
		records = list(models.get_default_filter(records))
	if geocode.lower() in ("yes", "true",):
		records = models.geocode_records(records)
	if record_remap.lower() in ("yes", "true",):
		records = models.remap_records(records)
	if sort:
		records = sorted(records, key = lambda v: v.get(sort, ""))
	
	content = ""
	if format.lower() in ("html",):
		context = {}
		if pretty.lower() in ("yes", "true",):
			context = { "records": records, "pretty": True }
		else:
			context = { "records": records, "pretty": False }
		response = render(request, 'servicesDirectory/query.html', context)
	else:
		if pretty.lower() in ("yes", "true",) or format.lower() in ("pretty",):
			content = simplejson.dumps(records, sort_keys = True, indent = 4)
		else:
			content = simplejson.dumps(records)
		response = HttpResponse(content, content_type = "application/json")
	if compress.lower() in ("yes", "true",):
		gzip = GZipMiddleware()
		return gzip.process_response(request, response)
	else:
		return response
