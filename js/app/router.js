define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'views/game',
], function(module, $, _, Backbone, gameView){

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

	  // start game
	  gameView.render();
  };

  return {
	  initialize: initialize
  };

});