define([
  'module',
  'jquery',
  'jqueryScrollTo',
  'underscore',
  'backbone'
], function(module, $, jqueryScrollTo, _, Backbone){

    // Player Item View
    // --------------

    // The DOM element for a player
    var PlayerView = Backbone.View.extend(
    {
        tagName: "li",

        // Cache the template function for a single player
        template: _.template($('#player-template').html()),

        // The DOM events specific to an item.
        events: {
            "click .toggle":    "toggleDone",
            "click .paused":    "togglePaused",
            "dblclick .view":   "edit",
            "click a.destroy":  "clear",
            "keypress .edit":   "updateOnEnter",
            "blur .edit":       "close"
        },

        // The view listens for changes to its model, re-rendering. Since there's
        // a one-to-one correspondence between a Player and a PlayerView in this
        // app, we set a direct reference on the model for convenience.
        initialize: function()
        {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'setPlayer', this.setPlayer);
        },

        // Re-render the titles of the player item.
        render: function()
        {
            console.info('render update for player:', this.model.get('name'));

            // render template with injected model data
            this.$el.html(this.template(this.model.toJSON()));

            // toggle done state
            this.$el.toggleClass('done', this.model.get('done'));

            // toggle pause state
            this.$el.toggleClass('paused', this.model.get('paused'));

            // set input
            this.input = this.$('.edit');
            return this;
        },

        // Invoked when it's the player's turn, and the dice is about to be thrown
        setPlayer: function()
        {
            if (!this.model.get('paused'))
            {
                // user isn't paused
                /*console.log(
                    "TODO: highlight the player row for action by adding css class or something for player:",
                    this.model.get('name')
                );*/
            }
            else
            {
                // user is paused
                /*console.log(
                    "TODO: dim the player row for pause by adding css class or something for player:",
                    this.model.get('name')
                );*/
            }

            // remove 'playing' class for all player elements
            $("#player-list li").each(function()
            {
                $(this).removeClass('playing');
            });

            // add 'playing' class for current player element
            this.$el.toggleClass('playing');

            // animated scroll to player element in list
            $('#player-list').scrollTo(this.$el, 500);
        },

        // Toggle the `done` state of the model.
        toggleDone: function()
        {
            this.model.toggle();
        },

        // Toggle the `paused` state of the model.
        togglePaused: function()
        {
            this.model.pause();
        },

        // Switch this view into `editing` mode, displaying the input field.
        edit: function()
        {
            this.$el.addClass("editing");
            this.input.focus();
        },

        // Close the `editing` mode, saving changes to the player.
        close: function()
        {
            var value = this.input.val();
            if (!value)
            {
                // remove item and destroy model
                this.clear();
            }
            else
            {
                // save player (changes)
                this.model.save({name: value});

                this.$el.removeClass("editing");
            }
        },

        // If you hit `enter`, we're through editing the item.
        updateOnEnter: function(e)
        {
            if (e.keyCode == 13)
            {
                this.close();
            }
        },

        // Remove the item, destroy the model.
        clear: function()
        {
            this.model.destroy();
        }

    });

    return PlayerView;

});