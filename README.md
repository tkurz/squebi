Squebi
======

The SPARQL Interface.

Installation
------------

Squeby uses [bower](http://bower.io/) for dependency management. To get all dependencies, execute `bower install`.

Configuration
-------------

For configuration set your SPARQL endpoints (and additional parameters) by script and include it before the requirejs.

### selectService : String (required)
The URI of the SPARQL select webservice (used via POST).

### updateService : String (required)
The URI of the SPARQL update webservice (used via POST).

### queryParams : Object
Additional query parameters as property:'value' pairs.

### updateAllowed : Boolean
If UI allows SPARQL update queries

**default: true**

### namespaces : Object
Namespace prefixes as path:'prefix' pairs. Als prefixes that are not defined here will be looked up on prefix.cc.

### app : String
The uri of the squebi app

**default: '.'**

### bower : String
The uri of the bower dependencies

**default: 'bower_components'**

## Sample Configuration

```javascript
SQUEBI = {
    selectService : "https://api.redlink.io/1.0-BETA/data/example/sparql/select",
    updateService : "https://api.redlink.io/1.0-BETA/data/example/sparql/update",
    queryParams : {
        key : "mykeyasadditionalqueryparameter"
    }
};
```

# Use Squebi as Webjar
You can use squebi in version 0.0.5 as webjar, too. The webjar is hosted on Maven Central. Put this dependencies to your pom

```xml
<dependency>
    <groupId>com.github.tkurz.webjars</groupId>
    <artifactId>squebi</artifactId>
    <version>0.0.5-SNAPSHOT</version>
</dependency>
```

Important: If you want to build your own webjar, please download the required bower dependencies first into the folder `bower_components`.
