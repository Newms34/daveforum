app.controller('log-cont', function ($scope, $http, $state, $q, userFact, $log) {
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
    $scope.doForgot = () => {
        // $log.debug('USER ATTEMPTING TO REMEMBER PWD')
        bulmabox.kill('bulmabox')
        $http.get('/user/forgotToMods?u=' + $scope.user)
            .then(r => {
                bulmabox.alert
            })
    }
    $scope.forgot = () => {
        $http.get('/user/okayToReset?u=' + $scope.user)
            .then(r => {
                if (!$scope.user) {
                    return bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Need Username', "We can't help you reset your password if you don't tell us who you are!")
                }
                bulmabox.custom('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Forgot Password',
                    `Forgot your password? Click the magic button below, and one of the [PAIN] moderators will reset your password! <br>NOTE: You'll need to talk to a PAIN officer in game to recieve your temporary password.`, () => {
                        $http.get('/user/requestReset?u=' + $scope.user)
                            .then(r => {
                                alert('Done!');
                            })
                    }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb,true)'><i class='fa fa-check'></i>&nbsp;Ask for reset</button>`)
            })
            .catch(e => {
                bulmabox.alert(`<i class="fa fa-exclamation-triangle is-size-3"></i>&nbspCan't reset password`, "Unfortunately, we can't reset the password for that username. Please contact a [PAIN] officer in-game for further details.")
            })

        // if (!$scope.user) {
        //     bulmabox.alert('<i class="fa fa-exclamation-triangle isas-size-3"></i>&nbsp;Forgot Password', 'To recieve a password reset email, please enter your username!')
        //     return;
        // }
        // $http.post('/user/forgot', { user: $scope.user }).then(function(r) {
        //     $log.debug('forgot route response', r)
        //     if (r.data == 'err') {
        //         bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Forgot Password Error', "It looks like that account either doesn't exist, or doesn't have an email registered with it! Contact a mod for further help.")
        //     } else {
        //         bulmabox.alert('Forgot Password', 'Check your email! If your username is registered, you should recieve an email from us with a password reset link.')
        //     }
        // })
    }
    $scope.backHome = () => {
        $state.go('appSimp.home')
    }
    $scope.signin = () => {
        userFact.login({ user: $scope.user, pass: $scope.pwd })
            .then((r) => {
                $log.debug(r);
                if (r.data == 'authErr') {
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Incorrect Login', 'Either your username or password (or both!) are incorrect.');
                } else if (r.data == 'banned') {
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Banned', "You've been banned! We're a pretty laid-back guild, so you must have <i>really</i> done something to piss us off!")
                } else if (r.data == 'expPwd') {
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Expired Password', "That password's expired! Please ask a moderator to reset your password, and this time <i>remember</i> to change it!")
                } else {
                    // delete r.data.msgs;
                    $log.debug('LOGIN RESPONSE', r.data)
                    socket.emit('chatMsg', { msg: `${$scope.user} logged in!` })
                    if (r.data.news) {
                        bulmabox.alert('Updates/News', `Since you last logged in, the following updates have been implemented:<br><ul style='list-style:disc;'><li>${r.data.news.join('</li><li>')}</li></ul>`)
                    }
                    localStorage.brethUsr = JSON.stringify(r.data.usr);
                    $state.go('app.dash');
                }
            })
            .catch(e => {
                bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Error', "There's been some sort of error logging in. This is <i>probably</i> not an issue necessarily with your credentials. Blame Dave!")
                $log.debug(e);
            })
    }
    $scope.checkUser = () => {
        if ($scope.checkTimer) {
            clearTimeout($scope.checkTimer);
        }
        $scope.checkTimer = setTimeout(function () {
            $http.get('/user/nameOkay?name=' + $scope.user)
                .then((r) => {
                    $scope.nameOkay = r.data;
                })
        }, 500)
    }
    $scope.register = () => {
        if (!$scope.pwd || !$scope.pwdDup || !$scope.user) {
            bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Missing Information', 'Please enter a username, and a password (twice).')
        } else if ($scope.pwd != $scope.pwdDup) {
            $log.debug('derp')
            bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Password Mismatch', 'Your passwords don\'t match, or are missing!');
        } else if (!$scope.account) {
            bulmabox.confirm('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Send Without Account?', `You've not included Guild Wars 2 account! <br>While you can register without a gw2 account name, certain features will be unavailable.<br>Register anyway?`, function (resp) {
                if (!resp || resp == null) {
                    return false;
                }
                userFact.signup({ user: $scope.user, pass: $scope.pwd, account: $scope.account })
                    .then((r) => {
                        userFact.login({ user: $scope.user, pass: $scope.pwd })
                            .then(() => {
                                $state.go('app.dash')
                            })
                    })
                    .catch(e => {
                        $log.debug(e)
                        bulmabox.alert(`<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Problem Registering`, `Sorry, but there was an issue with registering your account. Please contact HealyUnit (me) in game/on discord if this continues to happen, and tell me the following error info:<br/>
                    <div class='message has-background-grey-lighter'>
                        Error:{<br/>
                        &nbsp;status:${e.status},<br/>
                        &nbsp;data:'${JSON.stringify(e.data)}'<br/>
                        }
                    </div><br/>
                    Thanks!
                    `)
                    })
            })
        } else {
            userFact.signup({ user: $scope.user, pass: $scope.pwd, account: $scope.account })
                .then((r) => {
                    userFact.login({ user: $scope.user, pass: $scope.pwd })
                        .then(() => {
                            $state.go('app.dash')
                        })
                })
                .catch(e => {
                    $log.debug(e)
                    bulmabox.alert(`<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Problem Registering`, `Sorry, but there was an issue with registering your account. Please contact HealyUnit in game if you have further issues. Please tell him<br/>`)
                })
        }
    }
});