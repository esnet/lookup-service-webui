package net.es.stats.Dashboard;

import org.apache.http.HttpHost;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RestClient;

import org.elasticsearch.client.RequestOptions;

import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.*;

import static org.elasticsearch.index.query.QueryBuilders.*;

@RestController
public class Requests {
  // todo size thing

  /**
   * Get list of group communities for initially loading the dropdown
   *
   * @return list of group communities available to choose from in alphabetical order
   * @throws IOException if error getting value from database
   */
  @GetMapping("/groupCommunities")
  public Set<String> getGroupCommunities() throws IOException {
    RestHighLevelClient client = initClient();

    SearchResponse searchResponse = searchResponse(client);
    SearchHit[] searchHits = searchResponse.getHits().getHits();
    Set<String> communities = new TreeSet<>();
    for (SearchHit hit : searchHits) {
      String community;
      community = tryGet(hit.getSourceAsMap(), "group-communities");
      String[] communityArr = community.split(",");
      for (String s : communityArr) {
        if (!s.trim().equals("")) {
          communities.add(s.trim());
        }
      }
    }
    client.close();
    return communities;
  }

  /**
   * Get list of initial pscheduler tests to populate dropdown
   *
   * @return list of pScheduler Tests available to choose from in alphabetical order
   * @throws IOException if error getting value from database
   */
  @GetMapping("/pSchedulerTests")
  public Set<String> getPSchedulerTests() throws IOException {
    RestHighLevelClient client = initClient();
    SearchResponse searchResponse = searchResponse(client);
    SearchHit[] searchHits = searchResponse.getHits().getHits();
    Set<String> schedulers = new TreeSet<>();
    for (SearchHit hit : searchHits) {
      String scheduler;
      scheduler = tryGet(hit.getSourceAsMap(), "pscheduler-tests");
      String[] schedulerArr = scheduler.split(",");
      for (String s : schedulerArr) {
        if (!s.trim().equals("")) {
          schedulers.add(s.trim());
        }
      }
    }
    client.close();
    return schedulers;
  }

  /**
   * List of all available keys in the document to populate autofill search
   *
   * @return List of available keys in alphabetical order
   * @throws IOException if unable to search database
   */
  @GetMapping("/getAllKeys")
  public Set<Object> getKeys() throws IOException {
    RestHighLevelClient client = initClient();
    SearchResponse searchResponse = searchResponse(client);
    SearchHit[] searchHits = searchResponse.getHits().getHits();
    Set<Object> keys = new TreeSet<>();
    for (SearchHit hit : searchHits) {
      keys.addAll(hit.getSourceAsMap().keySet());
    }
    return keys;
  }

  /**
   * List of host data to populate host table
   *
   * @param key key chosen by user
   * @param groupCommunity group community chosen by user
   * @param pSchedulers pschedulers chosen by user surrounded by [] and separated by ,
   * @param searchTerm term the user is trying to search for; Has to have particular key
   * @param limit Number of terms returned
   * @return list of values of all hosts that match the search criteria
   * @throws IOException if unable to search database
   */
  @GetMapping("/search")
  public Set<Map<String, String>> searchHosts(
      @RequestParam String key,
      @RequestParam String groupCommunity,
      @RequestParam String pSchedulers,
      @RequestParam String searchTerm,
      @RequestParam int limit)
      throws IOException {
    RestHighLevelClient client = initClient();

    SearchResponse searchResponse =
        searchHostResponse(client, key, groupCommunity, searchTerm, limit);
    SearchHit[] searchHits = searchResponse.getHits().getHits();

    Set<Map<String, String>> setMap = new HashSet<>();

    for (SearchHit hit : searchHits) {
      Map<String, Object> sourceMap = hit.getSourceAsMap();
      String uri = tryGet(sourceMap, "uri");
      String interfaces = tryGet(sourceMap, "host-net-interface");
      String hostName = tryGet(sourceMap, "host-name");
      StringBuilder hardware = new StringBuilder();
      String processor =
          "Processor: "
              + tryGet(sourceMap, "host-hardware-processorspeed")
              + ("(" + tryGet(sourceMap, "host-hardware-processorcore") + " cores)\n");
      String memory = tryGet(sourceMap, "host-hardware-memory");

      // Get interfaces of a given host
      SearchResponse interfaceSearchResponse =
          searchInterfaceResponse(client, pSchedulers.split(","), interfaces.split(","));
      SearchHit[] interfaceHits = interfaceSearchResponse.getHits().getHits();

      // next iteration on empty interface
      if (interfaceHits.length == 0) {
        continue;
      }

      int interfaceCount = 1;
      StringBuilder interfaceHardware = new StringBuilder();
      StringBuilder pschedulerTests = new StringBuilder();
      StringBuilder interfaceAddresses = new StringBuilder();
      for (SearchHit interfaceHit : interfaceHits) {
        Map<String, Object> interfaceMap = interfaceHit.getSourceAsMap();
        String speed = tryGet(interfaceMap, "interface-capacity");
        if (!speed.equals("0") && !speed.equals("unknown") && !speed.equals("")) {
          if (speed.length() >= 9) {
            speed = "" + speed.length() / 9 * 10 + "Gbit/s\n"; // todo
          } else {
            speed = speed + "bits/s\n";
          }
          interfaceHardware.append("NIC #").append(interfaceCount).append(" Speed: ").append(speed);
          interfaceHardware
              .append("NIC #")
              .append(interfaceCount)
              .append(" MTU: ")
              .append(tryGet(interfaceMap, "interface-mtu"))
              .append("\n");
          pschedulerTests.append(tryGet(interfaceMap, "pscheduler-tests"));
          interfaceCount++;
          interfaceAddresses.append(tryGet(interfaceMap, "interface-addresses"));
        }
      }

      hardware.append(processor);
      hardware.append("Memory: ");
      hardware.append(memory).append("\n");
      hardware.append(interfaceHardware);

      StringBuilder systemInfo = new StringBuilder();
      String osName = tryGet(sourceMap, "host-os-name");
      String osKernel = tryGet(sourceMap, "host-os-kernel");
      systemInfo.append("Operating System: ");
      systemInfo.append(osName);
      systemInfo.append("\n");
      systemInfo.append("Kernal: ");
      systemInfo.append(osKernel);

      String toolkitVersion = tryGet(sourceMap, "pshost-toolkitversion");
      String communities = tryGet(sourceMap, "group-communities");
      String longitude = tryGet(sourceMap, "location-longitude");
      String latitude = tryGet(sourceMap, "location-latitude");

      Map<String, String> hostMap = new TreeMap<>();
      hostMap.put("Host Name", hostName);
      hostMap.put("Hardware", hardware.toString());
      hostMap.put("System Info", systemInfo.toString());
      hostMap.put("Toolkit Version", toolkitVersion);
      hostMap.put("Communities", communities);
      hostMap.put("pSchedulers", pschedulerTests.toString());
      hostMap.put("URI", uri);
      hostMap.put("JSON", sourceMap.toString());
      hostMap.put("latitude", latitude);
      hostMap.put("longitude", longitude);
      hostMap.put("interfaceAddress", interfaceAddresses.toString());
      setMap.add(hostMap);
    }
    client.close();
    return setMap;
  }

  /**
   * list of services under a particular host
   *
   * @param hosts host for which to find services - separated by , if multiple
   * @param type type of server to search for - "all" to get all type of servers
   * @return list of services with values used to populating the services table
   * @throws IOException if unable to connect to database
   */
  @GetMapping("/searchService")
  public Set<Map<String, String>> searchService(
      @RequestParam String hosts, @RequestParam String type) throws IOException {
    RestHighLevelClient client = initClient();
    String[] hostArray = hosts.split(",");

    Set<Map<String, String>> mapSet = new HashSet<>();

    for (String host : hostArray) {

      SearchResponse searchResponse = searchServiceResponse(client, host);
      SearchHit[] searchHits = searchResponse.getHits().getHits();
      for (SearchHit searchHit : searchHits) {
        Map<String, Object> searchMap = searchHit.getSourceAsMap();
        Map<String, String> serviceMap = new HashMap<>();
        String serviceType = tryGet(searchMap, "service-type");
        if (type.equalsIgnoreCase("all") || type.equalsIgnoreCase(serviceType)) {
          String name = tryGet(searchMap, "service-name");
          String communities = tryGet(searchMap, "group-communities");
          String version = tryGet(searchMap, "service-version");
          String locationState = tryGet(searchMap, "location-state");
          String locationCity = tryGet(searchMap, "location-city");
          serviceMap.put("name", name);
          serviceMap.put("communities", communities);
          serviceMap.put("version", version);
          serviceMap.put("type", serviceType);
          serviceMap.put("locationString", locationCity + ", " + locationState);
          serviceMap.put("JSON", searchMap.toString());
          mapSet.add(serviceMap);
        }
      }
    }
    client.close();
    return mapSet;
  }

  /**
   * returns list of coordinates of all hosts
   *
   * @return list of coordinates of all hosts
   * @throws IOException if unable to connect to database
   */
  @GetMapping("/getCoordinates")
  public Set<Map<String, String>> getAllCoordinates() throws IOException {
    RestHighLevelClient client = initClient();

    Set<Map<String, String>> mapSet = new HashSet<>();

    SearchResponse searchResponse = getLocationResponse(client);
    SearchHit[] searchHits = searchResponse.getHits().getHits();
    for (SearchHit searchHit : searchHits) {
      Map<String, Object> searchMap = searchHit.getSourceAsMap();
      String latitude = tryGet(searchMap, "location-latitude");
      String longitude = tryGet(searchMap, "location-longitude");
      String hostName = tryGet(searchMap, "host-name");
      String uri = tryGet(searchMap, "uri");
      Map<String, String> outputMap = new HashMap<>();
      outputMap.put("latitude", latitude);
      outputMap.put("longitude", longitude);
      outputMap.put("Host Name", hostName);
      outputMap.put("URI", uri);
      mapSet.add(outputMap);
    }
    client.close();
    return mapSet;
  }

  /**
   * Returns the type of services offered by a given host
   *
   * @param hosts host for which services need to be found
   * @return List of services offered by a given host
   * @throws IOException if error getting results from database
   */
  @GetMapping("/getTypeOfServiceHost")
  public Set<String> getTypesofServiceHost(@RequestParam String hosts) throws IOException {
    RestHighLevelClient client = initClient();

    Set<String> mapSet = new HashSet<>();
    for (String host : hosts.split(",")) {
      SearchResponse searchResponse = searchServiceResponse(client, host);
      SearchHit[] searchHits = searchResponse.getHits().getHits();
      for (SearchHit searchHit : searchHits) {
        Map<String, Object> searchMap = searchHit.getSourceAsMap();
        String serviceType = tryGet(searchMap, "service-type");
        mapSet.add(serviceType);
      }
    }

    client.close();
    return mapSet;
  }

  /**
   * Gets the location of all hosts from database
   *
   * @param client database client from which to get hosts from
   * @return Search response of query to get location of hosts with fields location-longitude,
   *     location-latitude, host-name, uri
   * @throws IOException if unable to get results from database
   */
  private SearchResponse getLocationResponse(RestHighLevelClient client) throws IOException {
    SearchRequest searchRequest = new SearchRequest("lookup");
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    BoolQueryBuilder query = QueryBuilders.boolQuery();
    query.must(termQuery("type.keyword", "host"));
    String[] includeFields =
        new String[] {"location-longitude", "location-latitude", "host-name", "uri"};
    String[] excludeFields = new String[0];
    searchSourceBuilder.fetchSource(includeFields, excludeFields);
    searchSourceBuilder.query(query);
    searchSourceBuilder.from(0);
    searchSourceBuilder.size(10000);
    searchRequest.source(searchSourceBuilder);
    return client.search(searchRequest, RequestOptions.DEFAULT);
  }

  /**
   * Returns all documents from the database (0-10000)
   *
   * @param client database client from which documents need to be returned
   * @return Search response of query getting all results from database
   * @throws IOException if unable to query database
   */
  private SearchResponse searchResponse(RestHighLevelClient client) throws IOException {
    SearchRequest searchRequest = new SearchRequest("lookup");
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.query(QueryBuilders.matchAllQuery());
    searchSourceBuilder.from(0);
    searchSourceBuilder.size(10000);

    searchRequest.source(searchSourceBuilder);
    return client.search(searchRequest, RequestOptions.DEFAULT);
  }

  /**
   * Returns results of doing a search using the fields key, groupCommunity, value of a key if key
   * is specified, searchTerm can't be empty
   *
   * @param client database client to be searched
   * @param key key in the key-value store of the database
   * @param groupCommunity value of the group community key
   * @param searchTerm value of the key being searched
   * @param limit number of results to be returned
   * @return results of querying the database
   * @throws IOException if unable to query the database
   */
  private SearchResponse searchHostResponse(
      RestHighLevelClient client, String key, String groupCommunity, String searchTerm, int limit)
      throws IOException {
    BoolQueryBuilder query = QueryBuilders.boolQuery();
    SearchRequest searchRequest = new SearchRequest("lookup");
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
    searchSourceBuilder.size(limit);
    if (key.length() > 0 && !key.equals(" ")) {
      query.must(regexpQuery(key + ".keyword", searchTerm + ".*"));
    }
    if (groupCommunity.length() > 0) {
      query.must(termQuery("group-communities.keyword", groupCommunity));
    }

    query.must(termQuery("type.keyword", "host"));
    searchSourceBuilder.query(query);
    searchRequest.source(searchSourceBuilder);
    return client.search(searchRequest, RequestOptions.DEFAULT);
  }

  /**
   * Returns the documents that contain the given pSchedulers for the given interfaces
   *
   * @param client database client to be queried
   * @param pSchedulers pScheduler-tests that must be available
   * @param interfaces interfaces to find the pScheduler tests in
   * @return search response of the query
   * @throws IOException if unable to query the database
   */
  private SearchResponse searchInterfaceResponse(
      RestHighLevelClient client, String[] pSchedulers, String[] interfaces) throws IOException {
    BoolQueryBuilder query = QueryBuilders.boolQuery();
    SearchRequest searchRequest = new SearchRequest("lookup");
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

    for (String pScheduler : pSchedulers) {
      if (pScheduler.length() > 0) {
        query.must(termQuery("pscheduler-tests.keyword", pScheduler));
      }
    }

    for (String interfaceURI : interfaces) {
      if (interfaceURI.length() > 0) {
        query.must(termQuery("uri.keyword", interfaceURI));
      }
    }

    query.must(termQuery("type.keyword", "interface"));
    searchSourceBuilder.query(query);
    searchRequest.source(searchSourceBuilder);
    return client.search(searchRequest, RequestOptions.DEFAULT);
  }

  /**
   * Returns all services for a given host URI
   *
   * @param client database client to be queried
   * @param host URI of host for which clients are to be found
   * @return search response of the query
   * @throws IOException if unable to query database
   */
  private SearchResponse searchServiceResponse(RestHighLevelClient client, String host)
      throws IOException {
    BoolQueryBuilder query = QueryBuilders.boolQuery();
    SearchRequest searchRequest = new SearchRequest("lookup");
    SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

    query.must(termQuery("service-host.keyword", host));
    query.must(termQuery("type.keyword", "service"));
    searchSourceBuilder.query(query);
    searchRequest.source(searchSourceBuilder);
    return client.search(searchRequest, RequestOptions.DEFAULT);
  }

  /**
   * Gets value of a given key from a map
   *
   * @param map map from which value needs to be extracted
   * @param toGet key for which value needs to be gotten
   * @return String for value of key empty String if value doesn't exist in map
   */
  private String tryGet(Map<String, Object> map, String toGet) {
    try {
      return map.get(toGet).toString().replace("[", "").replace("]", "");
    } catch (Exception e) {
      return "";
    }
  }

  /**
   * initializing the client
   *
   * @return returns rest high level client for elasticSearch
   */
  private RestHighLevelClient initClient() throws IOException {
    GetConfigurationProperties props = new GetConfigurationProperties();
    Map<String, String> propertyMap = props.getPropValues();
    return new RestHighLevelClient(
        RestClient.builder(
            new HttpHost(
                propertyMap.get("host"), Integer.parseInt(propertyMap.get("port1")), "http"),
            new HttpHost(
                propertyMap.get("host"), Integer.parseInt(propertyMap.get("port2")), "http")));
  }
}
