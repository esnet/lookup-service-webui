# Maximum number of records storable in single cache
# (If exceeded records will be divided into multiple caches)
SINGLE_CACHE_MAX_RECORDS = 512

# Cache queries to the Lookup Service
LS_CACHE_QUERIES = True
# Cached Lookup Service query timeout in seconds
LS_CACHE_TIMEOUT = 3600

# Cache requests from the web interface
UI_CACHE_REQUESTS = True
# Cached web interface request timeout in seconds
UI_CACHE_TIMEOUT = 3600

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

# Allow reverse DNS lookup of records
RDNS = True
# Cache reverse DNS queries
RDNS_CACHE_QUERIES = True
# Cached reverse DNS query timeout in seconds
RDNS_CACHE_TIMEOUT = 86400
