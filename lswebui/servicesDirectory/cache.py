import pickle

from django.core.cache.backends.memcached import MemcachedCache

# Currently using -I 4m
OBJECT_IN_MEGS = 4

class LargeMemcachedCache(MemcachedCache):
    """
    Memcached cache for large objects - the django cache imposes a 1MB 
    limit on a cached object (so does the memcached default, more on that) 
    and does not allow you to pass in options in settings.py.  This is a 
    drop-in replacement for the default CACHES = {} in settings.py:

    'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',

    Should be changed to this:

    'BACKEND': 'servicesDirectory.cache.LargeMemcachedCache',

    NOTE: the instance of memcached will ALSO need to be tuned for this 
    to work. The default is similar for that, so to take advantage of 
    this, the "-I 4m" option will need to be added to memcached startup 
    options (sysconfig/memcached, memcached.conf, etc).  Use of this 
    subclass will not break anything if memcached is not tuned thusly, 
    but larger things won't cache.

    http://stackoverflow.com/questions/16490819/how-to-tell-django-that-memcached-running-with-item-size-larger-than-default
    http://stackoverflow.com/questions/11874377/django-caching-a-large-list
    """

    @property
    def _cache(self):
        if getattr(self, '_client', None) is None:
            self._client = self._lib.Client(self._servers, 
                           pickleProtocol=pickle.HIGHEST_PROTOCOL, 
                           server_max_value_length = 1024*1024*OBJECT_IN_MEGS)
        return self._client