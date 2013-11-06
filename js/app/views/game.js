define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'models/game'
], function(module, $, _, Backbone, GameModel){

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
            this.model = new GameModel();
        },

        // Play a game round
        roll: function()
        {   
            // set round number for game, incrementing by 1
            // TODO: round numbers increases after everybody's had a turn?
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

    return GameView;

});