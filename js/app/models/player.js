define([
  'module',
  'underscore',
  'backbone'
], function(module, _, Backbone){

	// Player Model
	// ------------

	var Player = Backbone.Model.extend(
	{
	    // Default attributes for the player.
	    defaults: function()
	    {
	        return {
	            name: "Player name..",
	            order: this.collection.nextOrder(),
	            done: false,
	            paused: false,
	            score: 0
	        };
	    },

	    // Toggle the `done` state of the player.
	    toggle: function()
	    {
	        this.save({
	            done: !this.get("done")
	        });
	    },

	    // Toggle the `paused` state of the player.
	    pause: function()
	    {
	        this.save({
	            paused: !this.get("paused")
	        })
	    }

	});

	return Player;
});

