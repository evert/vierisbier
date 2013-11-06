define([
  'module',
  'underscore',
  'backbone'
], function(module, _, Backbone){

    // Game Model
    // ------------

    var Game = Backbone.Model.extend(
    {
        // Default attributes for the game.
        defaults: function()
        {
            return {
                name: "Game name..",
                round: 0,
                currentUser: 0,
                countDown: 0
            };
        },
    });

    return Game;
});

