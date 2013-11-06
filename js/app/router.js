define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'views/app',
], function(module, $, _, Backbone, appView){

  var AppRouter = Backbone.Router.extend(
  {
    routes: {
    	'*actions': 						'defaultAction'
    },

    /*
     * Default action handler.
     */
    defaultAction: function(actions)
    {
    	
    }
  });

  var initialize = function()
  {
	  var app_router = new AppRouter;

	  // use HTML5 pushState
	  Backbone.history.start({
		  pushState: true,
		  // for browsers that don't support pushState natively (and) that use
		  // full page refreshes instead
		  //hashChange: true
	  });

	  // start app
	  appView.render();
  };

  return {
	  initialize: initialize
  };

});