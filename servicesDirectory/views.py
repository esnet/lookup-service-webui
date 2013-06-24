from django.http import HttpResponse
from django.shortcuts import render
from django.utils import simplejson

from servicesDirectory import models

def index(request):
    return render(request, 'servicesDirectory/index.html')

def query(request):
    query = request.GET.copy()
    result = ""
    response = ""
    mimetype = "application/json"
    try:
        format = query.pop("format")[0]
        result = models.query_ls(query)
        if "html" in format:
            response = "hello world!"
            mimetype = "text/html"
        elif "pretty" in format:
            response = simplejson.dumps(result, sort_keys = True, indent = 4)
        else:
            response = simplejson.dumps(result)
    except KeyError:
        result = models.query_ls(query)
        response = simplejson.dumps(result)
    
    return HttpResponse(response, mimetype = mimetype)
