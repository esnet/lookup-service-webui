%define _unpackaged_files_terminate_build 1
%define install_base /opt/lookup-service/django/lookup-service-webui

%define apacheconf apache-lswebui.conf

%define crontab cron-lswebui-cache_update

%define relnum 1

Name:			Lookup Service WebUI
Version:		1.0
Release:		%{relnum}.%{dist}
Summary:		Lookup Service WebUI
License:		Distributable, see LICENSE
Group:			Applications/Internet
URL:			http://github.com/esnet/lookup-service-webui
Source0:		services-directory-%{version}.%{relnum}.tar.gz
BuildRoot:		%{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
BuildArch:		noarch
Requires:		httpd
Requires:		python
Requires:		python-pip
Requires:		python-setuptools
Requires:		python-virtualenv
Requires:		memcached
Requires:		mod_wsgi
Requires:		sqlite
Requires:		sqlite-devel

%description
Lookup Service WebUI (aka. Services Directory) is a Django based web
application that presents data from the Simple Lookup Service (sLS) visually
in a service oriented fashion.

%pre

%prep
%setup -q -n %{name}-%{version}.%{relnum}

%build

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}/%{install_base}

virtualenv %{buildroot}/%{install_base}
source %{buildroot}/%{install_base}/bin/activate
./setup.py install

cd %{buildroot}/%{install_base}
ln -s $(python -c "import os, lookup_service_webui; print os.path.dirname(lookup_service_webui.__file__)")

%clean
rm -rf %{buildroot}

%post

%files
%defattr(-,root,root,-)


%changelog
* Mon Jan 6 2015 Andrew Sides <asides@es.net> - 1.0-1
- Initial Services Directory specfile