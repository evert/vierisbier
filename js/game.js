// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Game Model
  // ------------

  var Game = Backbone.Model.extend({

      // Default attributes for the game.
      defaults: function()
      {
          return {
              name: "Game name..",
              round: 0,
              currentUser: 0
          };
      },

      // Play a round
      roll: function()
      {
            // set round number
            this.set('round', this.get('round') + 1);
            $('.game-round .count').text(this.get('round'));
            // go to next player
            var player = Players.at(this.get('currentUser'));
            this.set('currentUser', this.get('currentUser') + 1);

            if (this.get('currentUser') >= Players.length) {
                 this.set('currentUser', 0);
            }

            var countDown = 10;
            var lastNumber;
            var interval = setInterval(_.bind(function() { 
                countDown--;

                lastNumber = Math.floor(Math.random()*6) + 1;
                $('.dice-number').text(lastNumber);

                if (countDown == 0) {
                    // this.$el.removeClass("rolling");
                    clearInterval(interval);
                    
                    if (lastNumber == 4) {
                    
                        // hoera
                        
                        $('.container').toggleClass('bier')
                        
                        // user points + 1
                        
                        player.set("score", player.get("score") + 1);
                        player.save({"score": player.get("score") });
                    } 

                }
                
            }, this), 80);

      }

  });


  // Player Model
  // ------------

  var Player = Backbone.Model.extend({

      // Default attributes for the player.
      defaults: function()
      {
          return {
              name: "Player name..",
              order: Players.nextOrder(),
              done: false,
              score: 0
          };
      },

      // Toggle the `done` state of this player.
      toggle: function()
      {
          this.save({done: !this.get("done")});
      }

  });

  // Players Collection
  // ------------------

  // The collection of players is backed by *localStorage* instead of a remote
  // server.
  var PlayerList = Backbone.Collection.extend({

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
  var PlayerView = Backbone.View.extend({

    tagName:  "li",

    // Cache the template function for a single player
    template: _.template($('#player-template').html()),

    // The DOM events specific to an item.
    events: {
        "click .toggle"   : "toggleDone",
        "dblclick .view"  : "edit",
        "click a.destroy" : "clear",
        "keypress .edit"  : "updateOnEnter",
        "blur .edit"      : "close"
    },

    // The view listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Player** and a **PlayerView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function()
    {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the player item.
    render: function()
    {
        this.$el.html(this.template(this.model.toJSON()));

        this.$el.toggleClass('done', this.model.get('done'));
        this.input = this.$('.edit');
        return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function()
    {
        this.model.toggle();
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
            this.clear();
        } else {
            this.model.save({name: value});
            this.$el.removeClass("editing");
        }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e)
    {
        if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function()
    {
        this.model.destroy();
    }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("body"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":       "createOnEnter",
      "keypress":                   "createOnSpace",
      "click #clear-completed":   "clearCompleted",
      "click #toggle-all":        "toggleAllComplete",
      "click .play":              "playRound",

    },

    // At initialization we bind to the relevant events on the Players
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];
      

      this.listenTo(Players, 'add', this.addOne);
      this.listenTo(Players, 'reset', this.addAll);
      this.listenTo(Players, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');

      this.game = new Game();

      Players.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function()
    {
        var done = Players.done().length;
        var remaining = Players.remaining().length;

        if (Players.length)
        {
            this.main.show();
            this.footer.show();
            this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
        }
        else
        {
            //this.main.hide();
            this.footer.hide();
        }

        this.allCheckbox.checked = !remaining;
    },

    // Add a single player to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(player)
    {
      var view = new PlayerView({model: player});
      this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the Players collection at once.
    addAll: function()
    {
      Players.each(this.addOne, this);


    },

    // If you hit return in the main input field, create new Player model,
    // persisting it to localStorage.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Players.create({name: this.input.val()});
      this.input.val('');
    },

    // If you hit spacebar, play new round
    createOnSpace: function(e) 
    {
        if($('#new-todo').is(":focus")){
            return;
        } 
        if (e.keyCode == 32) { 
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
      _.invoke(Players.done(), 'destroy');
      return false;
    },

    toggleAllComplete: function ()
    {
        var done = this.allCheckbox.checked;
        Players.each(function (player)
        {
            player.save({'done': done});
        });
    }

  });

  // Finally, we kick things off by creating the App
  var App = new AppView;

});
