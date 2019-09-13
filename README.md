# Lookup Service Directory

## About

Complete redesign for the current LookupService Direcotry UI as well as back-end database - http://stats.es.net/ServicesDirectory/

## Changes

* Backend Database
  * Bakcend database now uses ElasticSearch rather than MongoDB.
* API
  * API is now converted from Python using flask to Java using spring-boot
* Front End
  * Front End now uses React-Js
  
## Software Versions

* Java - 12.0.1
* Node - 10.16.2
* SpringBoot - 2.1.7
* ElasticSearch - 7.2.0

## Config to be added before running

i. Google maps api key:
* Create file Dashboard/frontend/src/components/config/mapConfig.js
* Add line to file: 
```
export const  googleMapsApiKey = '{your key here}' ;
```

ii. ElasticSearch server for frontend:
* Update file: Dashboard/frontend/src/components/config/config.js

iii. ElasticSearch server for backend:
* Update file: Dashboard/src/main/resources/application.properties

## Frontend and Backend Services

### Front End - React JS
* Does no computation or calls to database
* Calls API for any information that needs to be dynamically allocated
* Calls API for searching and rendering map

### Back End - Java
* Does computations for Rest calls and returns results
* Queries the database and supplies initial values as well as search query results to front end


## Building and Running

i. mvn clean install

ii. mvn spring-boot:run

iii. Runs on localhost:8080

## Deploy

java -jar target/Spring-Boot-React-0.0.1-SNAPSHOT.jar
