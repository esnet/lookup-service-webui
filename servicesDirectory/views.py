from operator import itemgetter

from django.http import HttpResponse
from django.shortcuts import render
from django.utils import simplejson

from servicesDirectory import models

def index(request):
    return render(request, 'servicesDirectory/index.html')

def query(request):
    query = request.GET.copy()
    mimetype = "application/json"
    
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
        response = json_to_html(result)
        mimetype = "text/html"
    elif "pretty" in format:
        response = simplejson.dumps(result, sort_keys = True, indent = 4)
    else:
        response = simplejson.dumps(result)
    
    return HttpResponse(response, mimetype = mimetype)

def json_to_html(json):
    html = ""
    for record in json:
        html += "<table border=1>"
        for key, values in record.iteritems():
            html += "<tr><td>" + key + "</td><td>"
            if isinstance(values, list):
                for value in values:
                    html += value + "<br />"
            else:
                html += values + "<br />"
            html += "</td></tr>"
        html += "</table><br />\n\n"
    return html
