##Overview
Provide access to Canto Cumulus Digital Asset Management (DAM) Installations. In order to use this module, you need access to a Canto Cumulus installation, and have the Canto Cumulus Java API installed. The Canto Cumulus Java API is available without cost from Canto.

**node-cumulus** is tested against Canto Cumulus Version 9.x, and should work with Version 8.x installations also.

###Implementation Status
The current version of **node-cumulus** has only a minimal set of features implemented. See the reference section below for information on available methods. However as I port more methods from my Cumulus Digital Integration Server (DIS) Java driver they will become available in **node-cumulus**.

Anybody willing to contribute to the development of features, please contact me to discuss becoming  a contributor to this module.

##Installation

```
npm install node-cumulus
```

###Important  Information

You need to have the Canto Cumulus Java SDK installed. When you initialise the node-cumulus module, you pass in the location of the CumulusJC.jar file.

##Getting Started

Here is a simple example node.js script that connects to a Cumulus catalog, and looks for a category.

```
var cumulus = require('node-cumulus');

cumulus.init('/usr/local/Cumulus_Java_SDK/CumulusJC.jar');
var connection = cumulus.open_connection('nodeTest', 'my-cumulus-server', 'user', 'password');
var testCatalog = cumulus.open_catalog('nodeTest', 'Sample Catalog');

var category = cumulus.get_category(testCatalog, '$Categories:Projects', false, true);
console.log(JSON.stringify(category, null, 3));
cumulus.close_connection('nodeTest');

cumulus.terminate();

```

Obviously **my-cumulus-server** needs to be replaced with a real server IP address or DNS name. I have a test server that is publically available for testing, contact me for details.

In the above example, after initialising the module with the Cumulus Java SDK, we open a connection, grab a reference to a Cumulus catalog, and try to get a reference to a category *$Categories:Projects*, which will br created if it does not exist.

It is very important to close the catalog, and terminate the module, as otherwise you will leak Cumulus licenses. For now, each connection grabs a read/write license form the Cumulus server, later there will be an option to grab a read-only license also.

###Important Information

As the Canto Cumulus Java classes are actually a wrapper on the Canto Cumulus native libraries, you will need to ensure that your application has the required environment libraries setup to ensure the Java classes find the Canto cumulus native libraries on your operating system. A sample shell script is provided here that shows how to run an application on Mac OSX.

```
#!/bin/bash
DYLD_LIBRARY_PATH="/usr/local/Cumulus_Java_SDK/lib"
export DYLD_LIBRARY_PATH

node $1 $*

```

and you can run your script with something like:

```
./bin/runapp.sh app.js param1, param2
```

On Linux, the same script works, just replace **DYLD_LIBRARY_PATH** with **LD_LIBRARY_PATH**

##Reference

*Coming Soon*

