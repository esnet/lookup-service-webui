====================
Lookup Service WebUI
====================

Lookup Service WebUI (aka. Services Directory) is a Django based web application that presents data from the Simple Lookup Service (sLS) visually in a service oriented fashion.

To get started simply perform the following steps after cloning the project:

1) Set up a developer environment::

    $ virtualenv venv
    $ source venv/bin/activate
    $ pip install -r requirements.txt

2) Run a test server::

    $ source venv/bin/activate
    $ python manage.py runserver

In order to take advantage of caching, installing and configuring *memcached* is **strongly recommended**. If data is periodically missing from the web application, try increasing the *memcached* cache size and block size.

A sample *Apache(httpd)* configuration is included in order to run the web application through *mod_wsgi* in addition to a sample *Crontab* to keep the cache primed.

Note: if using httpd with *SELinux* set to enforcing, either set *SELinux* to permissive or run the following command to ensure the web application can retrieve data from the sLS hosts::

$ setsebool -P httpd_can_network_connect=1
