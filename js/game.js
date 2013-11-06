// Load the application once the DOM is ready, using `jQuery.ready`:
$(function()
{
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

            // start roll dice animation    
            this.interval = setInterval(_.bind(this._rollDice, this), 80);
        },

        _rollDice: function()
        {
            // increment dice roll animation count
            this.model.set('countDown', this.model.get('countDown') - 1);

            // throw dice and get random nr
            this.lastNumber = _.random(1,6);

            // update view with random nr
            this.$('.dice-number').text(this.lastNumber);

            if (this.model.get('countDown') == 0)
            {
                this.$el.removeClass("rolling");
                this.$("button.play").attr('disabled', null);

                clearInterval(this.interval);
                
                // won
                if (this.lastNumber == 4)
                {
                    // hoera
                    this.$el.toggleClass('bier');
                    
                    // update user model's points + 1 when he's not paused
                    // triggers 'change' event that re-renders the row
                    if (!this.currentPlayer.get('paused'))
                    {
                        // increment player score with 1
                        this.currentPlayer.save({
                            "score": this.currentPlayer.get("score") + 1
                        });
                    }
                    else
                    {
                        // unfortunately the user is paused so
                        // don't add score
                    }
                }

            }
        },

    });

    // Player Model
    // ------------

    var Player = Backbone.Model.extend(
    {
        // Default attributes for the player.
        defaults: function()
        {
            return {
                name: "Player name..",
                order: Players.nextOrder(),
                done: false,
                paused: false,
                score: 0
            };
        },

        // Toggle the `done` state of the player.
        toggle: function()
        {
            this.save({done: !this.get("done")});
        },

        // Toggle the `paused` state of the player.
        pause: function()
        {
            this.save({paused: !this.get("paused")})
        }

    });

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

        // Filter down the list of all players that are finished.
        done: function()
        {
            return this.where({done: true});
        },

        // Filter down the list to only players that are still not finished.
        remaining: function()
        {
            return this.where({done: false});
        },

        // We keep the players in sequential order, despite being saved by unordered
        // GUID in the database. This generates the next order number for new items.
        nextOrder: function()
        {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        // Players are sorted by the order they joined.
        comparator: 'order'

    });

    // Create our global collection of players
    var Players = new PlayerList;


    // Player Item View
    // --------------

    // The DOM element for a player
    var PlayerView = Backbone.View.extend(
    {
        tagName:  "li",

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
        // a one-to-one correspondence between a **Player** and a **PlayerView** in this
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
            console.log('render update for player:', this.model.get('name'));
            
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

        // Switch this view into `"editing"` mode, displaying the input field.
        edit: function()
        {
            this.$el.addClass("editing");
            this.input.focus();
        },

        // Close the `"editing"` mode, saving changes to the player.
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

    // Response Model
    // ------------

    var Response = Backbone.Model.extend(
    {
        // Default attributes for the response.
        defaults: function()
        {
            return {
                description: "Description..",
            };
        },

        // get the response with the player's name interpolated.
        response: function(player)
        {
            return this.get('description');
        }

    });

    // Responses Collection
    // ------------------

    var ResponsesList = Backbone.Collection.extend(
    {

        // Reference to this collection's model.
        model: Response,

        // Get a random response.
        randomResponse: function()
        {
            // return a single random item from the collection.
            return this.sample();
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
        // loading any preexisting todos that might be saved in *localStorage*.
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

            // initialize the game
            this.game = new GameView({
                players: this.collection
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
            if ($('#new-player').is(":focus"))
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
            this.collection.each(function (player)
            {
                player.save({'done': done});
            });
        }

    });

    // Finally, we kick things off by creating the App
    var App = new AppView;

});
