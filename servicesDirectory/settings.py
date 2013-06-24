# Django settings for servicesDirectory app

# Cache queries to the Lookup Service
CACHE_LS_QUERIES = True
# Cached data timeout time in seconds
CACHE_DATA_TIMEOUT = 3600
# Maximum list length storable in cache
# (Longer lists will be split up into multiple parts)
CACHE_MAX_LIST_LENGTH = 1024
