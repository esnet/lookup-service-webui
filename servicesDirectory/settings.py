# Django settings for servicesDirectory app

# Cache queries to the Lookup Service
LS_CACHE_QUERIES = True
# Cached LS query timeout in seconds
LS_CACHE_TIMEOUT = 86400
# Maximum number of records storable in single cache
# (If exceeded records will be divided into multiple caches)
LS_CACHE_MAX_RECORDS = 1024

# Allow Google geocoding of records
GEOCODE = True
# Google geocode API private key
GEOCODE_API_PRIVATE_KEY = ""
# Google geocode API client id
GEOCODE_API_CLIENT_ID = ""
# Cache queries to the Google geocoding API
GEOCODE_CACHE_QUERIES = True
# Cached geocode query timeout in seconds
GEOCODE_CACHE_TIMEOUT = 86400
