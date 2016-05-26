%define _unpackaged_files_terminate_build 1
%define install_base /opt/lookup-service/django/lswebui

%define settings config/settings.py
%define static	/var/www/html/static/lswebui

%define apacheconf apache-lswebui.conf
%define crontab cron-lswebui-cache_update

%define relnum 1

Name:			lookup-service-webui
Version:		1.2
Release:		%{relnum}%{dist}
Summary:		Lookup Service WebUI
License:		Distributable, see LICENSE
Group:			Applications/Internet
URL:			http://github.com/esnet/lookup-service-webui
Source0:		%{name}-%{version}.tar.gz
BuildRoot:		%{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
BuildRequires:	python
BuildRequires:	python-pip
BuildRequires:	python-setuptools
BuildRequires:	python-virtualenv
#need gcc to get c json speed-ups
BuildRequires:	gcc
Requires:		httpd
Requires:		python
Requires:		python-setuptools
Requires:		python-virtualenv
Requires:		mod_wsgi
Requires:		sqlite
Requires:		sqlite-devel
Requires:		wget

%description
Lookup Service WebUI (aka. Services Directory) is a Django based web
application that presents data from the Simple Lookup Service (sLS) visually
in a service oriented fashion.

%pre

%prep
%setup -q -n %{name}-%{version}

%build

%install
rm -rf %{buildroot}

mkdir -p %{buildroot}/%{install_base}

virtualenv %{buildroot}/%{install_base}
source %{buildroot}/%{install_base}/bin/activate
python setup.py install

cd %{buildroot}/%{install_base}

MOD_PATH=$(python -c 'import lswebui; print lswebui.__path__[0]')

cp -Ra $MOD_PATH/* .

install -D -m 0644 apache/%{apacheconf} %{buildroot}/etc/httpd/conf.d/%{apacheconf}
install -D -m 0644 cron/%{crontab} %{buildroot}/etc/cron.d/%{crontab}

mkdir -p %{buildroot}/%{static}

find %{buildroot} -type f -exec sed -i"" "s|%{buildroot}||g" {} \;

%clean
rm -rf %{buildroot}

%post
cd %{install_base}

source bin/activate

PY_PATH=$(python -c 'from distutils.sysconfig import get_python_lib; print get_python_lib()')
SECRET_KEY=$(python -c 'import random, re; print re.escape("".join([random.SystemRandom().choice("abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)") for i in range(50)]))')

sed -i"" "s|^SECRET_KEY = .*$|SECRET_KEY = \"$SECRET_KEY\"|" %{settings}
sed -i"" "s|^WSGIPythonPath.*$|WSGIPythonPath %{install_base}:$PY_PATH\\
WSGIPythonHome %{install_base}|" /etc/httpd/conf.d/%{apacheconf}
sed -i"" "s|^WSGIDaemonProcess.*$|WSGIDaemonProcess lswebui python-path=%{install_base}:$PY_PATH processes=10 threads=5|" /etc/httpd/conf.d/%{apacheconf}

ln -sf /etc/httpd/conf.d/%{apacheconf} apache/%{apacheconf}
ln -sf /etc/cron.d/%{crontab} cron/%{crontab}

python manage.py collectstatic --noinput

touch /var/log/lswebui.log
chown apache:apache /var/log/lswebui.log

%files
%defattr(-,root,root,-)
%doc README.rst
%doc LICENSE
%config(noreplace) /etc/httpd/conf.d/%{apacheconf}
%config(noreplace) /etc/cron.d/%{crontab}
%config(noreplace) %{install_base}/config/settings.py
%{install_base}/*
%{static}/

%changelog
* Mon Jan 6 2015 Andrew Sides <asides@es.net> - 1.0-1
- Initial lookup-service-webui specfile
