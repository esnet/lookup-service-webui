==================
Services Directory
==================

Services Directory (aka. Lookup Service Web UI) is a Django based web application that presents data from the Simple Lookup Service (sLS) visually in a service oriented fashion.

To get started simply perform the following steps after cloning the project:

To set up a developer environment::

$ virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
$ python manage.py syncdb

To run a test server::

$ source venv/bin/activate
$ python manage.py runserver

In order to take advantage of caching installing and configuring memcached is strongly recommended.
