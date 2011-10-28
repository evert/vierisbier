$(function() {

        var users = [];
        var currentUser = -1;

        $('.newuser button').bind('click', function(){

            var username = $('.newuser input').val();
            users.push({
                name: username,
                score : 0 
            });
            $('.newuser input').val('');
            $('.users ul').append('<li class="user-' + username + '"><div class="username">' + username + '</div> <span class="score">0</span></li>'); 

        });

        var roll = function() {

            currentUser++;
            if (currentUser >= users.length) currentUser = 0;

            var countDown = 10;
            var lastNumber = 0;

            $('.users li').removeClass('current');
            $('li.user-' + users[currentUser].name).addClass('current');

            var interval = setInterval(function() { 
                countDown--;

                lastNumber = Math.floor(Math.random()*6) + 1;
                $('.number').text(lastNumber);

                if (countDown == 0) {
                    clearInterval(interval);
                    if (lastNumber == 4) {
                        //$('.bier').show();
                        users[currentUser].score++;
                        $('li.user-' + users[currentUser].name + ' .score').text(users[currentUser].score); 

                    }
                }

            },100);


        };

        $('button.roll').bind('click', function() {
            roll();
        });


        $(document).bind("keypress", function(e) {
            if (e.which == 32) {
                roll();
                e.preventDefault();
            }
        });

});
