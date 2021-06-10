#!/usr/bin/env python

from setuptools import setup
from setuptools import find_packages

setup(
    name="lookup-service-webui",
    version="1.3",
    description="A Web UI for the Simple Lookup Service",
    long_description=open("README.rst").read(),
    author="Andrew Sides",
    author_email="asides@es.net",
    url="https://github.com/esnet/lookup-service-webui",
    license=open("LICENSE").read(),
    packages=find_packages(),
    include_package_data=True,
    data_files=[
        ("lswebui", ["LICENSE"]),
        ("lswebui", ["README.rst"]),
        ("lswebui/apache", ["apache/apache-lswebui.conf"]),
        ("lswebui/cron", ["cron/cron-lswebui-cache_update"])
    ],
    install_requires=[
        "Django==2.2.24",
        "IPy",
        "YURL",
        "dnspython",
        "futures",
        "pygeocoder",
        "python-memcached",
        "requests",
        "wsgiref",
        "simplejson"
    ],
    zip_safe=False,
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Environment :: Web Environment",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 2.6",
        "Programming Language :: Python :: 2.7",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Networking"
    ],
)
