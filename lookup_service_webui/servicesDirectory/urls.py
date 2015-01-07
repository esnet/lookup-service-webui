from django.conf.urls import patterns, include, url

from servicesDirectory import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='index'),
    url(r'^query$', views.query, name='query'),
    url(r'^records$', views.records, name='records'),
)
