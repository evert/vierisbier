define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'collections/players',
  'collections/responses',
  'views/player'
], function(module, $, _, Backbone, Players, ResponsesList, PlayerView){

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

    // Game View
    // ---------------

    var GameView = Backbone.View.extend(
    {
        // Instead of generating a new element, bind to the existing skeleton of
        // the view already present in the HTML.
        el: $("#vierisbierapp"),

        initialize: function(options)
        {
            this.players = options.players;
            this.responses = options.responses;
            this.model = new Game();
        },

        // Play a game round
        roll: function()
        {   
            // set round number for game
            this.model.set('round', this.model.get('round') + 1);
            this.$('.game-round .count').text(this.model.get('round'));

            // go to next player
            this.currentPlayer = this.players.at(this.model.get('currentUser'));
            this.model.set('currentUser', this.model.get('currentUser') + 1);

            // trigger event for current player
            this.currentPlayer.trigger('setPlayer');

            // go to beginning of player list
            if (this.model.get('currentUser') >= this.players.length)
            {
                this.model.set('currentUser', 0);
            }

            // set countdown for animation interval
            this.model.set('countDown', 10);

            // set root node class to rolling, hide PLAY button with css accordingly
            this.$el.addClass("rolling").removeClass('bier');
            this.$("button.play").attr('disabled', 'disabled');

            // reset response
            this.$(".round-response").text('');

            // start roll dice animation    
            this.interval = setInterval(_.bind(this._rollDice, this), 80);
        },

        _rollDice: function()
        {
            // increment dice roll animation count
            this.model.set('countDown', this.model.get('countDown') - 1);

            // throw dice and get random nr
            this.lastNumber = _.random(1, 6);

            // update view with random nr
            this.$('.dice-number').text(this.lastNumber);

            // animation ended
            if (this.model.get('countDown') == 0)
            {
                // stop animation
                clearInterval(this.interval);
                this.$el.removeClass("rolling");

                // disable ui
                this.$("button.play").attr('disabled', null);

                var response;

                // 4 = beer
                if (4 == this.lastNumber)
                {
                    // show animation
                    this.$el.toggleClass('bier');

                    // check if user is paused
                    if (!this.currentPlayer.get('paused'))
                    {
                        // get victorious response
                        response = this.responses.random(true);

                        // update user model's points + 1 when he's not paused
                        // triggers 'change' event that re-renders the player's row
                        this.currentPlayer.save(
                        {
                            "score": this.currentPlayer.get("score") + 1
                        });
                    }
                    else
                    {
                        // unfortunately the user is paused so
                        // don't add score. get coma victorious response
                        // instead
                        response = this.responses.random(true, true);
                    }
                }
                else
                {
                    // tough luck, check if user is paused
                    if (!this.currentPlayer.get('paused'))
                    {
                        // get fail response
                        response = this.responses.random(false);
                    }
                    else
                    {
                        // the user is paused so get coma fail response
                        // instead
                        response = this.responses.random(false, true);
                    }
                }

                // show response with player data
                response = response.toString(this.currentPlayer);
                this.$(".round-response").text(response);
            }
        },

    });


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

            this.footer = this.$('footer');
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
                this.footer.show();
                this.footer.html(this.statsTemplate({
                    done: done,
                    remaining: remaining
                }));
            }
            else
            {
                this.footer.hide();
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