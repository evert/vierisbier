define([
  'module',
  'underscore',
  'backbone',
  'models/response',
], function(module, _, Backbone, Response){

	// Responses Collection
    // ------------------

    var ResponsesList = Backbone.Collection.extend(
    {

        // Reference to this collection's model.
        model: Response,

        // Get a random response.
        random: function(victory, paused)
        {
            if (_.isUndefined(victory))
            {
                victory = false;
            }
            if (_.isUndefined(paused))
            {
                paused = false;
            }
            // return a single random item from the collection.
            return _.sample(this.where({
                victory: victory,
                paused: paused
            }));
        },

    });

	return ResponsesList;
});

