var java = require('java');
var cumulus_utils = require('./cumulus_utils');

var connections = {
}

var UID_CAT_NAME = false;
var UID_CAT_PARENT_ID = false;

var cumulus_init = function(cumulus_jar) {

    java.classpath.push(cumulus_jar);

    UID_CAT_NAME = java.getStaticFieldValue('com.canto.cumulus.GUID', 'UID_CAT_NAME');
    UID_CAT_PARENT_ID = java.getStaticFieldValue('com.canto.cumulus.GUID', 'UID_CAT_PARENT_ID');

    cumulus_start();
}

var cumulus_start = function() {
    java.callStaticMethodSync('com.canto.cumulus.Cumulus', 'CumulusStart');
}

var cumulus_stop = function() {
    java.callStaticMethodSync('com.canto.cumulus.Cumulus', 'CumulusStop');
}

var cumulus_terminate = function() {
    // TODO tidy up connections

    cumulus_stop();
}

var cumulus_open_connection = function(connectionName, host, username, password) {
    var connection = false;
    if (connections[connectionName]) {
        connection = connections[connectionName];
    } else {
        var connection = {};
        connection.server = java.callStaticMethodSync('com.canto.cumulus.Server', 'openConnection', true, host, username, password);
        if (connection.server) {
            connections.catalogs = [];
            connections[connectionName] = connection;
        }
    }
    return connection;
}

var cumulus_close_connection = function(connectionName) {
    if (connections[connectionName]) {
        var connection = connections[connectionName];
        connection.server.sendServerModuleMessageSync("{8c94922f-c958-4444-a232-c095b17bce17}", null);
        connections[connectionName] = null;
    }
}

var cumulus_open_catalog = function(connectionName, catalogName) {
    var connection = connections[connectionName];
    var catalog = connections.catalogs[catalogName];
    if (!catalog) {
        var catalog = {};
        catalog.name = catalogName;
        catalog.id = connection.server.findCatalogIDSync(catalogName);
        console.log('Cumulus catalogId is: '+catalog.id + ' for catalog "'+catalog.name+'"');
        catalog.catalog = connection.server.openCatalogSync(catalog.id);
        catalog.recordCollection = catalog.catalog.newRecordItemCollectionSync(true);
        catalog.categoryCollection = catalog.catalog.newCategoryItemCollectionSync();
        catalog.recordCollection.findAllSync();
        catalog.categoryCollection.findAllSync();
        catalog.recordLayout = catalog.recordCollection.getLayoutSync();
        catalog.categoryLayout = catalog.categoryCollection.getLayoutSync();
    } else {
        catalog.recordCollection.findAllSync();
        catalog.categoryCollection.findAllSync();
    }
    connections.catalogs[catalogName] = catalog;
    return catalog;
}

var cumulus_get_category = function(catalog, path, recursive, create_if_missing) {
    var category = false;
    var collection = catalog.catalog.getAllCategoriesItemCollectionSync();
    var categoryItem = false;
    try {
        categoryItem = collection.getCategoryItemByIDSync(collection.getCategoryTreeItemIDByPathSync(path));
    } catch (err) {
        // for now we assume no category, so later we try to create it
        //console.log(err);
    }
    if (categoryItem) {
        category = {};
        category.path = path;
        category.id = categoryItem.getIDSync();
        category.name = categoryItem.getStringValueSync(UID_CAT_NAME);
        category.hasChildren = categoryItem.getHasSubCategoriesSync();
        category.parentId = categoryItem.getIntValueSync(UID_CAT_PARENT_ID);
    } else if (create_if_missing) {
        var rootCategory = collection.getCategoryTreeCatalogRootCategorySync();
        categoryItem = rootCategory.createCategoryItemsSync(path);
        category = {};
        category.path = path;
        category.id = categoryItem.getIDSync();
        category.name = categoryItem.getStringValueSync(UID_CAT_NAME);
        category.hasChildren = categoryItem.getHasSubCategoriesSync();
        category.parentId = categoryItem.getIntValueSync(UID_CAT_PARENT_ID);
    }
    return category;
}

var cumulus_create_category = function(catalog, path) {
    var category = false;
    var collection = catalog.catalog.getAllCategoriesItemCollectionSync();
    var categoryItem = false;
    try {
        categoryItem = collection.getCategoryItemByIDSync(collection.getCategoryTreeItemIDByPathSync(path));
    } catch (err) {
        // for now we assume no category, so later we try to create it
        var rootCategory = collection.getCategoryTreeCatalogRootCategorySync();
        categoryItem = rootCategory.createCategoryItemsSync(path);
        category = {};
        category.path = path;
        category.id = categoryItem.getIDSync();
        category.name = categoryItem.getStringValueSync(UID_CAT_NAME);
        category.hasChildren = categoryItem.getHasSubCategoriesSync();
        category.parentId = categoryItem.getIntValueSync(UID_CAT_PARENT_ID);
    }
    return category;
}

var cumulus_find_category_assets = function(catalog, path) {
    var assets = [];
    return assets;
}

exports.init = cumulus_init;
exports.terminate = cumulus_terminate;
exports.open_connection = cumulus_open_connection;
exports.close_connection = cumulus_close_connection;
exports.open_catalog = cumulus_open_catalog;
exports.get_category = cumulus_get_category;
exports.create_category = cumulus_create_category;
exports.find_category_assets = cumulus_find_category_assets;

