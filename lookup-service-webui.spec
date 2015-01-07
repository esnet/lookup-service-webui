%define _unpackaged_files_terminate_build 1
%define install_base /opt/lookup-service/django/lswebui

%define apacheconf apache-lswebui.conf
%define crontab cron-lswebui-cache_update
%define settings config/settings.py

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
python setup.py install

PY_PATH=$(python -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())")
MOD_PATH=$(python -c "import lswebui; print lswebui.__path__")
SECRET_KEY=$(python -c "import random, re, string; print re.escape(\"\".join([random.SystemRandom().choice(string.digits + string.letters + string.punctuation) for i in range(50)]))")

cp -Ra $MOD_PATH/* %{buildroot}/%{install_base}

sed -i "" "s/^SECRET_KEY = .*$/SECRET_KEY = \"$SECRET_KEY\"/" %{buildroot}/%{install_base}/%{settings}
sed -i "" "s/^WSGIPythonPath.*/WSGIPythonPath %{install_base}:$PY_PATH\\
WSGIPythonHome %{install_base}/" apache/%{apacheconf}
sed -i "" "s/^WSGIDaemonProcess.*/WSGIDaemonProcess lswebui python-path=%{install_base}:$PY_PATH processes=2 threads=8/" apache/%{apacheconf}

install -D -m 0644 apache/%{apacheconf} %{buildroot}/etc/httpd/conf.d/%{apacheconf}
install -D -m 0644 cron/%{crontab} %{buildroot}/etc/cron.d/%{crontab}

%clean
rm -rf %{buildroot}

%post
service httpd reload || :

%files
%defattr(-,root,root,-)
%doc README.rst
%doc LICENSE
%config(noreplace) %{install_base}/apache/*
%config(noreplace) %{install_base}/cron/*
%config(noreplace) %{install_base}/config/*
%{install_base}/*
/etc/cron.d/%{crontab}
/ect/httpd/conf.d/%{apacheconf}

%changelog
* Mon Jan 6 2015 Andrew Sides <asides@es.net> - 1.0-1
- Initial Services Directory specfile