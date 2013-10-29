$(function() {

        var users = [];
        var currentUser = -1;
        var gameRound = 1;

        var addUser = function() {
            var username = $('.new-user').val();
            if (username !== "") {
                users.push({
                    name: username,
                    score : 0
                });
                $('.newuser input').val('');
                $('.users ul').append('<li class="user-' + username + '"><div class="username">' + username + '</div> <span class="score">0</span></li>'); 
            }

            $('.new-user').focus();            
            $('body').removeClass("init");        
        };

        var roll = function() {

            $('body').removeClass("bier");

            currentUser++;
            if (currentUser >= users.length) {
                currentUser = 0;
                gameRound++;
            }
            $('.game-round .count').text(gameRound).toString();
            var countDown = 10;
            var lastNumber = 0;

            $('.users li').removeClass('current');
            $('li.user-' + users[currentUser].name).addClass('current');

            var interval = setInterval(function() { 
                countDown--;

                lastNumber = Math.floor(Math.random()*6) + 1;
                $('.dice-number').text(lastNumber);

                if (countDown == 0) {
                    $('body').removeClass("rolling");
                    clearInterval(interval);
                    if (lastNumber == 4) {
                    
                        $('body').toggleClass("bier");
                        users[currentUser].score++;
                        $('li.user-' + users[currentUser].name + ' .score').text(users[currentUser].score); 

                    }
                
                }                

            },80);


        };

        $('.newuser button').bind('click', function(){
            addUser();
        });

        $('button.roll').click(function() {
            roll();
            $('body').toggleClass("rolling");
        });

        $(document).bind("keypress", function(e) {
                if (e.which == 32) {
                    if ($(".new-user").is(":focus") || $("button.roll").is(":focus") ) {
                        return;
                    }
                    roll();
                    e.preventDefault();
                }
                if (e.which == 13) {
                    if ($(".new-user").is(":focus")) {
                        addUser();
                        e.preventDefault();
                    }
                }
            
        });

        $(".new-user").focus();


});
