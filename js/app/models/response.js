define([
  'module',
  'underscore',
  'backbone',
  'sprintf'
], function(module, _, Backbone, sprintf){

	// Response Model
    // ------------

    var Response = Backbone.Model.extend(
    {
        // Default attributes for the response.
        defaults: function()
        {
            return {
                // general one-liner supporting interpolation for the player data using
                // '%(name)s', see http://www.diveintojavascript.com/projects/javascript-sprintf
                description: "Thanks %(name)s, what a great %(score)s...",
                // boolean indicating whether the response should be used for a victory or
                // not.
                victory: false,
                // boolean indicating whether the response happened in a paused state or
                // not.
                paused: false
            };
        },

        // get the response with the player's data interpolated.
        toString: function(player)
        {
            var responseString = this.get('description');

            // interpolate the player data if it's available
            if (!_.isUndefined(player))
            {
                responseString = sprintf(responseString, player.attributes);
            }

            return responseString;
        }

    });

	return Response;
});
