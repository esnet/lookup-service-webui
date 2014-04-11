import json
import logging

from django.http import HttpResponse
from django.middleware.gzip import GZipMiddleware
from django.shortcuts import render

from servicesDirectory import models
from servicesDirectory import settings
from servicesDirectory.simplels_client import hash_to_query

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'servicesDirectory/index.html')

def query(request):
    query = request.GET.copy()
    records = None
    cache_key = "UI_REQUEST(%s)" % hash_to_query(query)
    
    record_filter = query.pop("filter", ["none"])[0]
    record_format = query.pop("format", ["json"])[0]
    record_sort = query.pop("sort", ["false"])[0]
    
    cached_records = query.pop("cached", ["true"])[0].lower() in ("yes", "true",)
    compress_records = query.pop("compress", ["true"])[0].lower() in ("yes", "true",)
    geocode_records = query.pop("geocode", ["false"])[0].lower() in ("yes", "true",)
    pretty_records = query.pop("pretty", ["false"])[0].lower() in ("yes", "true",)
    remap_records = query.pop("remap", ["false"])[0].lower() in ("yes", "true",)
    
    if settings.UI_CACHE_REQUESTS and cached_records:
        records = models.cache_get_records(cache_key)
        
    if records is None:
        logger.info("Not using UI cache for %s" % cache_key)
        records = models.query_ls(query=query, cached_records=cached_records)    
        if record_filter.lower() in ("default",):
            records = list(models.get_default_filter(records))
        if geocode_records:
            records = models.geocode_records(records)
        if remap_records:
            records = models.remap_records(records)
        if record_sort.lower() not in ("false", "no",):
            records = sorted(records, key = lambda v: v.get(record_sort, ""))
        if settings.UI_CACHE_REQUESTS:
            models.cache_set_records(cache_key, records, settings.UI_CACHE_TIMEOUT)
    else:
        logger.info("Using UI cache for %s" % cache_key)
    
    content = ""
    if record_format.lower() in ("html",):
        context = {}
        if pretty_records:
            context = { "records": records, "pretty": True }
        else:
            context = { "records": records, "pretty": False }
        response = render(request, 'servicesDirectory/query.html', context)
    else:
        if pretty_records or record_format.lower() in ("pretty",):
            content = json.dumps(records, sort_keys = True, indent = 4)
        else:
            content = json.dumps(records)
        response = HttpResponse(content, content_type = "application/json")
    if compress_records:
        gzip = GZipMiddleware()
        return gzip.process_response(request, response)
    else:
        return response
