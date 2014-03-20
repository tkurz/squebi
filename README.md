Squebi
======

The SPARQL Interface.

Installation
------------

Squeby uses [bower](http://bower.io/) for dependency management. To get all dependencies, execute `bower install`.

Configuration
-------------

For configuration set your SPARQL endpoints (and additional parameters) by script and include it before the requirejs file like this:

```javascript
    SQUEBI = {
        selectService : "https://api.redlink.io/1.0-BETA/data/example/sparql/select",
        updateService : "https://api.redlink.io/1.0-BETA/data/example/sparql/update",
        queryParams : {
            key : "93jWHp9iQcN8ESHBvzdHqTgxuqEHIarRf06708fd"
        }
    };
```
