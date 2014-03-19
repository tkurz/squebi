Squebi
======

The SPARQL Interface.

Installation
------------

Squeby uses [bower](http://bower.io/) for dependency management. To get all dependencies, execute `bower install`.

Configuration
-------------

As minimal configuration set your SPARQL endpoints by creating a file named `config.json` in your Squebi root like this:

```json
{
    "serviceURL": {
        "select": "http://my.server.org/sparql/select",
        "update": "http://my.server.org/sparql/update"
    }
}
```
