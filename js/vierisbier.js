$(function() {

        var users = [];
        var currentUser = -1;
        var gameRound = 1;

        var addUser = function() {
            var username = $('.new-user input').val();
            if (username !== "") {
                users.push({
                    name: username,
                    score : 0
                });
                
                $('.score-card ol').append('<li class="user user-' + username + '">' + username + '<span class="score">0</span></li>'); 
            }

            $('.new-user').focus();            
            $('body').removeClass("init");        
        };

        var roll = function() {
            $('body').toggleClass("rolling");
            $('body').removeClass("bier");

            currentUser++;
            if (currentUser >= users.length) {
                currentUser = 0;
                gameRound++;
            }
            $('.game-round .count').text(gameRound).toString();
            var countDown = 10;
            var lastNumber = 0;

            $('.score-card li').removeClass('current');
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

        $('.new-user button').bind('click', function(){
            $('.new-user input').focus();
            $('.new-user').removeClass('minimized');
        });

        $('button.play').click(function() {
            $('.new-user').addClass('minimized'); 
        });

        $(document).keyup(function(e) {

            if (e.keyCode == 27) { 
                if ($(".new-user input").is(":focus")) {
                    $('.new-user input').blur();
                    $('.new-user').addClass('minimized');
                }

            }   

            if (e.keyCode == 13) {
                    if ($(".new-user input").is(":focus")) {
                        addUser();
                        e.preventDefault();
                    } else {
                        roll();
                        e.preventDefault();
                    }
                }
        
        });

        $(document).bind("keypress", function(e) {
            
                if (e.which == 32) {
                    if ($(".new-user").is(":focus") || $("button.roll").is(":focus") ) {
                        return;
                    }
                    roll();
                    e.preventDefault();
                }
                
            
        });

});
