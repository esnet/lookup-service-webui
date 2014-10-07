import json
import logging

from django.http import HttpResponse
from django.middleware.gzip import GZipMiddleware
from django.shortcuts import render

from servicesDirectory import config
from servicesDirectory import models
from servicesDirectory.simplels_client import hash_to_query

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'servicesDirectory/index.html')

def query(request):
    return HttpResponse("There doesn't seem to be anything here yet...", content_type="text/plain")

def records(request):
    query = request.GET.copy()
    records = None
    
    record_filter = query.pop("filter", ["none"])[0].lower()
    record_format = query.pop("format", ["json"])[0].lower()
    record_sort = query.pop("sort", ["none"])[0].lower()
    
    cached_records = query.pop("cached", ["true"])[0].lower() in ("yes", "true",)
    compress_records = query.pop("compress", ["true"])[0].lower() in ("yes", "true",)
    pretty_records = query.pop("pretty", ["false"])[0].lower() in ("yes", "true",)
    
    cache_key = "UI_REQUEST(%s)" % hash_to_query(query)
    
    geocode_records = query.pop("geocode", ["false"])[0].lower() in ("yes", "true",)
    remap_records = query.pop("remap", ["false"])[0].lower() in ("yes", "true",)
    
    if config.UI_CACHE_REQUESTS and cached_records:
        records = models.cache_get_records(cache_key)
        
    if records is None:
        logger.info("Not using UI cache for %s" % cache_key)
        records = models.query_ls(query=query, cached_records=cached_records)
        if geocode_records:
            records = models.geocode_records(records)
        if remap_records:
            records = models.remap_records(records)
        if config.UI_CACHE_REQUESTS:
            models.cache_set_records(cache_key, records, config.UI_CACHE_TIMEOUT)
    else:
        logger.info("Using UI cache for %s" % cache_key)
    
    if record_filter in ("default",):
        records = models.filter_default(records)
    if record_sort not in ("none",):
        records = sorted(records, key = lambda v: v.get(record_sort, ""))
    if record_format in ("html",):
        context = {}
        if pretty_records:
            context = { "records": records, "pretty": True }
        else:
            context = { "records": records, "pretty": False }
        response = render(request, 'servicesDirectory/records.html', context)
    else:
        content = ""
        if pretty_records or record_format in ("pretty",):
            content = json.dumps(records, sort_keys = True, indent = 4)
        else:
            content = json.dumps(records)
        response = HttpResponse(content, content_type = "application/json")
    if compress_records:
        gzip = GZipMiddleware()
        return gzip.process_response(request, response)
    else:
        return response
