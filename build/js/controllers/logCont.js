app.controller('log-cont', function($scope, $http, $state, $q, userFact) {
    $scope.noWarn = false;
    $scope.nameOkay = true;
    delete localStorage.brethUsr;
    $scope.checkTimer = false;
    $scope.goReg = () => {
        $state.go('appSimp.register')
    };
    $scope.goLog = () => {
        $state.go('appSimp.login')
    };
    $scope.forgot = () => {
        if (!$scope.user) {
            bootbox.alert('To recieve a password reset email, please enter your username!')
            return;
        }
        $http.post('/user/forgot', { user: $scope.user }).then(function(r) {
            console.log('forgot route response', r)
            bootbox.alert('Check your email! If your username is registered, you should recieve an email from us with a password reset link.')
        })
    }
    $scope.signin = () => {
        $http.post('/user/login', { user: $scope.user, pass: $scope.pwd })
            .then((r) => {
                console.log(r);
                if (!r.data) {
                    bulmabox.alert('Incorrect Login', 'Either your username or password (or both!) are incorrect');
                } else {
                    // delete r.data.msgs;
                    // console.log(io)
                    socket.emit('chatMsg',{msg:`${$scope.user} logged in!`})
                    localStorage.brethUsr = JSON.stringify(r.data);
                    $state.go('app.dash')
                }
            })
            .catch(e=>{
                bulmabox.alert('Banned', "You've been banned! We're a pretty laid-back guild, so you must have <i>really</i> done something to piss us off!")
                console.log(e);
            })
    }
    $scope.checkUser = () => {
        if ($scope.checkTimer) {
            clearTimeout($scope.checkTimer);
        }
        $scope.checkTimer = setTimeout(function() {
            $http.get('/user/nameOkay?name=' + $scope.user)
                .then((r) => {
                    $scope.nameOkay = r.data;
                })
        }, 500)
    }
    $scope.register = () => {
        if (!$scope.pwd || !$scope.pwdDup || !$scope.user) {
            bulmabox.alert('Missing Information', 'Please enter a username, and a password (twice).')
        } else if ($scope.pwd != $scope.pwdDup) {
            console.log('derp')
            bulmabox.alert('Password Mismatch', 'Your passwords don\'t match, or are missing!');
        } else {
            $http.post('/user/new', {
                    user: $scope.user,
                    pass: $scope.pwd
                })
                .then((r) => {
                    $http.post('/user/login', { user: $scope.user, pass: $scope.pwd })
                        .then(() => {
                            $state.go('app.dash')
                        })
                })
        }
    }
});