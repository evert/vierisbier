define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'collections/players',
  'collections/responses',
  'views/game',
  'views/player'
], function(module, $, _, Backbone, Players, ResponsesList, GameView,
	        PlayerView){

    // The Application
    // ---------------

    // Our overall AppView is the top-level piece of UI.
    var AppView = Backbone.View.extend(
    {
        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("body"),

        // Our template for the line of statistics at the bottom of the app.
        statsTemplate: _.template($('#stats-template').html()),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "keypress #new-player":     "createOnEnter",
            "keypress":                 "createOnSpace",
            "click #clear-completed":   "clearCompleted",
            "click #toggle-all":        "toggleAllComplete",
            "click .play":              "playRound",
        },

        // At initialization we bind to the relevant events on the Players
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in localStorage.
        initialize: function()
        {
            this.input = this.$("#new-player");
            this.allCheckbox = this.$("#toggle-all")[0];

            // setup and listen to players collection
            this.collection = Players;
            this.listenTo(this.collection, 'add', this.addOne);
            this.listenTo(this.collection, 'reset', this.addAll);
            this.listenTo(this.collection, 'all', this.render);

            // TODO: footer here is only used to pass the number of players.
            // move to div.score-card 

            this.main = $('#main');

            // setup responses collection
            this.responses = new ResponsesList;
            this._createSomeResponses();

            // initialize the game
            this.game = new GameView({
                players: this.collection,
                responses: this.responses
            });

            // fetch players collection (from local storage)
            this.collection.fetch();
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function()
        {
            var done = this.collection.done().length;
            var remaining = this.collection.remaining().length;

            if (this.collection.length)
            {
                this.main.show();
                $('.player-count .count').text(remaining);
                /*
                this.footer.show();
                this.footer.html(this.statsTemplate({
                    done: done,
                    remaining: remaining
                }));
				*/
            }
            else
            {
                //this.footer.hide();
            }

            this.allCheckbox.checked = !remaining;
        },

        // Add a single player to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(player)
        {
            var view = new PlayerView({model: player});
    
            // add to dom
            this.$("#player-list").append(view.render().el);
        },

        // Add all items in the Players collection at once.
        addAll: function()
        {
            this.collection.each(this.addOne, this);
        },

        // If you hit return in the main input field, create new Player model,
        // persisting it to localStorage.
        createOnEnter: function(e)
        {
            if (e.keyCode != 13) return;
            if (!this.input.val()) return;

            // add new player
            this.collection.create({name: this.input.val()});
            this.input.val('');
        },

        // If you hit spacebar, play new round
        createOnSpace: function(e) 
        {
            if (this.$('#new-player').is(":focus"))
            {
                return;
            } 
            if (e.keyCode == 32)
            { 
                this.playRound(e);
            }
        },

        // If you click the play button, play new round
        playRound: function(e)
        {
            this.game.roll();
        },

        // Clear all players, destroying their models.
        clearCompleted: function()
        {
            _.invoke(this.collection.done(), 'destroy');

            return false;
        },

        toggleAllComplete: function ()
        {
            var done = this.allCheckbox.checked;

            // save all players
            this.collection.each(function (player)
            {
                player.save({'done': done});
            });
        },

        // add some test responses
        _createSomeResponses: function()
        {
            // some responses that should be coming from a database at startup
            // or something
            this.responses.add([
                {
                    // won and not paused
                    description: "Keep em coming %(name)s!",
                    victory: true,
                    paused: false
                },
                {
                    // didn't win and not paused
                    description: "Go home %(name)s!",
                    victory: false,
                    paused: false
                },
                {
                    // won but paused
                    description: "You won %(name)s, but you're asleep?!",
                    victory: true,
                    paused: true
                },
                {
                    // didn't win and also paused
                    description: "Tough luck, and %(name)s is in coma anyway...",
                    victory: false,
                    paused: true
                }
            ]);
        }

    });

    // Finally, we kick things off by creating the App
    return new AppView;

});