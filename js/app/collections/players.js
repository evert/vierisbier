define([
  'module',
  'underscore',
  'backbone',
  'backboneLocalstorage',
  'models/player',
], function(module, _, Backbone, BackboneLocalStorage, Player){

	// Players Collection
    // ------------------

    // The collection of players is backed by localStorage instead of a remote
    // server.
    var PlayerList = Backbone.Collection.extend(
    {

        // Reference to this collection's model.
        model: Player,

        // Save all of the players under a dedicated namespace.
        localStorage: new Backbone.LocalStorage("vierisbier"),

        // Filter down the list of all players that are finished,
        // regardless whether they are paused or not.
        done: function()
        {
            return this.where({
                done: true
            });
        },

        // Filter down the list to only players that are still not finished.
        remaining: function()
        {
            return this.where({
                done: false,
                paused: false
            });
        },

        // We keep the players in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function()
        {
            if (!this.length)
            {
                return 1;
            }

            return this.last().get('order') + 1;
        },

        // Players are sorted by the order they joined.
        comparator: 'order'

    });

	return new PlayerList;
});

