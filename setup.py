#!/usr/bin/env python

from setuptools import setup
from setuptools import find_packages

setup(
    name="lookup-service-webui",
    version="1.0",
    description="A Web UI for the Simple Lookup Service",
    long_description=open("README.rst").read(),
    author="Andrew Sides",
    author_email="asides@es.net",
    url="https://github.com/esnet/lookup-service-webui",
    license=open("LICENSE").read(),
    packages=find_packages(),
    include_package_data=True,
    data_files=[
        ("", ["LICENSE"]),
        ("", ["README.rst"]),
        ("apache", ["apache-lswebui.conf"]),
        ("cron", ["cron-lswebui-cache_update"])
    ],
    install_requires=[
        "Django==1.6.7",
        "IPy",
        "YURL",
        "dnspython",
        "futures",
        "pygeocoder",
        "python-memcached",
        "requests",
        "wsgiref"
    ],
    zip_safe=False,
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Web Environment",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 2.6",
        "Programming Language :: Python :: 2.7",
        "Topic :: System :: Networking",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application"
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
)
