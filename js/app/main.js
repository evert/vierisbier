define([
  'jquery',
  'underscore',
  'backbone',
  'app/router',
], function($, _, Backbone, Router)
{
  var initialize = function()
  {
    Router.initialize();
  }

  return {
    initialize: initialize
  };
  
});