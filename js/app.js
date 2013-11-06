// This module is mainly about path configuration.

require.config({
	// The root path to use for all module lookups.
	// baseUrl is not used when loading plain .js files (indicated by a dependency
	// string starting with a slash, has a protocol, or ends in .js), those strings
	// are used as-is, so a.js and b.js will be loaded from the same directory as the
	// HTML page that contains the definition.

	// If no baseUrl is explicitly set in the configuration, the default value will
	// be the location of the HTML page that loads require.js. If a data-main attribute
	// is used, that path will become the baseUrl.

	// The baseUrl can be a URL on a different domain as the page that will load
	// require.js. RequireJS script loading works across domains. The only restriction
	// is on text content loaded by text! plugins: those paths should be on the same
	// domain as the page, at least during development. The optimization tool will
	// inline text! plugin resources so after using the optimization tool, you can
	// use resources that reference text! plugin resources from another domain.
	baseUrl: "/js",

	// Path mappings for module names not found directly under baseUrl.
	// The path settings are assumed to be relative to baseUrl, unless the paths
	// setting starts with a "/" or has a URL protocol in it ("like http:").
	// The path that is used for a module name should not include an extension,
	// since the path mapping could be for a directory. The path mapping code will
	// automatically add the .js extension when mapping the module name to a path.
	// If require.toUrl() is used, it will add the appropriate extension, if it is
	// for something like a text template.
	paths: {
		// app shortcuts
		views:                      'app/views',
		collections:                'app/collections',
		models:                     'app/models',
		templates: 					'app/templates',

		// libraries
		jquery: 					'libs/jquery-1.10.2.min',
		jqueryScrollTo: 			'libs/jquery.scrollTo-min',
		underscore: 				'libs/underscore-min',
		backbone: 					'libs/backbone-min',
		backboneLocalstorage: 		'libs/backbone.localStorage',
		sprintf: 				    'libs/sprintf.min',
		camera: 					'libs/davidwalsh.camera',
		text: 						'libs/text'
	},

	// Configure the dependencies and exports for older, traditional "browser
	// globals" scripts that do not use define() to declare the dependencies
	// and set a module value.
	shim: {
		underscore: {
			exports:	"_"
	    },

	    backbone: {
	    	deps: 		["underscore"],
	    	exports: 	"Backbone"
	    },

	    backboneLocalstorage: {
	    	deps: 		["backbone"],
	    	exports: 	"backboneLocalstorage"
	    },

	    jqueryScrollTo: {
	        deps: 		["jquery"],
	        exports: 	"jqueryScrollTo"
	    },
	    
	    sprintf: {
	        exports: 	"sprintf"
	    },

	    camera: {
	        exports: 	"camera"
	    },

	}

});

// Load the main app module to start the app
require([
	// Load our app module and pass it to our definition function
 	"app/main"

 	// Some plugins have to be loaded in order due to their non AMD compliance
 	// Because these scripts are not "modules" they do not pass any values to
	// the definition function below
 	], function(App){

    // The "app" dependency is passed in as "App"
	// Again, the other dependencies passed in are not "AMD" therefore don't
	// pass a parameter to this function
    App.initialize();
});
