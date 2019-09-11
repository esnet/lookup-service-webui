package net.es.stats.Dashboard;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class GetConfigurationProperties {
  private InputStream inputStream;

  public Map<String, String> getPropValues() throws IOException {
    Map<String, String> propertyMap = new HashMap<>();

    try {
      Properties prop = new Properties();
      String propFileName = "application.properties";

      inputStream = getClass().getClassLoader().getResourceAsStream(propFileName);

      if (inputStream != null) {
        prop.load(inputStream);
      } else {
        throw new FileNotFoundException(
            "property file '" + propFileName + "' not found in the classpath");
      }

      String host = prop.getProperty("ElasticHost");
      String port1 = prop.getProperty("ElasticPrimaryPort");
      String port2 = prop.getProperty("ElasticSecondaryPort");

      propertyMap.put("host", host);
      propertyMap.put("port1", port1);
      propertyMap.put("port2", port2);

    } catch (Exception e) {
      System.out.println("Exception: " + e);
    } finally {
        assert inputStream != null;
        inputStream.close();
    }
    return propertyMap;
  }
}
