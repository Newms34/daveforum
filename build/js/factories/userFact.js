app.factory('userFact', function($http) {
    return {
        makeGroup: function() {
            //do stuff
        },
        getDefaultLoc: function() {
            return $http.get('//freegeoip.net/json/').then(function(r) {
                return r.data;
            })
        },
        getUser: function() {
            return $http.get('/user/chkLog').then(function(s) {
                console.log('getUser in fac says:', s)
                return s;
            })
        },
        inspectUsr: function(name) {
        },
        writeMsg: function(to, from, isRepl) {
            bootbox.dialog({
                title: 'Send a ' + (isRepl ? 'Reply' : 'Message') + ' to ' + to,
                message: 'Type your message below, and then click "Send"<hr><textarea id="send-msg-txt" style="width:100%;" placeholder="Your message text"></textarea>',
                buttons: {
                    okay: {
                        label: 'Send',
                        className: 'btn-success',
                        callback: function() {
                            var sndMsgTxt = document.querySelector('#send-msg-txt').value;
                            console.log(to, from, sndMsgTxt)
                            $http.post('/user/sendMsg', {
                                to: to,
                                from: from,
                                msg: sndMsgTxt
                            }).then(function(r) {
                                if (r.data == 'err') {
                                    bootbox.alert('There was an error sending your message to ' + to + '!');
                                } else {
                                    bootbox.alert('Message sent!');
                                }
                            })
                        }
                    },
                    cancel: {
                        label: 'Cancel',
                        className: 'btn-default'
                    }
                }
            });
        }
    };
});
