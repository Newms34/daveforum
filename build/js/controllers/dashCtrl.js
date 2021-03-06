app.controller('dash-cont', function ($scope, $http, $state, $filter, userFact) {
    $scope.showDups = localStorage.brethDups; //show this user in 'members' list (for testing)
    userFact.getUser()
        .then(r => {
            $scope.doUser(r.data);
            console.log('user', $scope.user)
        });

    $scope.setAccount = () => {
        $http.put('/user/accountName?account=' + $scope.user.account)
            .then(rd => {
                bulmabox.alert('Account Name Saved', 'Thanks! We&rsquo;ve saved your account name!')
                userFact.getUser()
                    .then(r => {
                        $scope.doUser(r.data);
                        // console.log('user', $scope.user)
                    });
            })
    }
    $http.get('/cal/latestFive')
        .then(r => {
            $scope.latestEvents = r.data;
        })
    $scope.doUser = (u) => {
        if (!u) {
            return false;
        }
        $scope.user = u;
        console.log(u)
        $scope.possibleInterests.forEach((c, i) => {
            if (u.ints && u.ints[i] && u.ints[i] == 1) {
                c.active = true;
            }
        })
        $scope.numUnreadMsgs = u.msgs.filter(m => !m.read).length;
    }
    $scope.setPwd = u => {
        bulmabox.confirm('Reset Password', `Are you sure you wish to create a temporary, one-time-use password for ${u.user}?`, r => {
            if (!!r) {
                $http.get('/user/setPasswordMod?user=' + u.user)
                    .then(r => {
                        console.log('user', u.user, 'pwd set to', r.data)
                        bulmabox.alert('User password reset', `User ${u.user}'s password has been set to: <br><pre>${r.data.pwd}</pre><hr/> Note that this is a one-time use password!`)
                    })
            }
        })
    }
    socket.on('sentMsg', function (u) {
        console.log('SOCKET USER', u, 'this user', $scope.user)
        if (u.user == $scope.user.user || u.from == $scope.user.user) {
            console.log('re-getting user')
            userFact.getUser()
                .then(r => {
                    $scope.doUser(r.data);
                });
        }
    })
    $scope.tabs = [{
        name: 'Profile/Characters',
        icon: 'user'
    }, {
        name: 'Members',
        icon: 'users'
    }, {
        name: 'Mail',
        icon: 'envelope'
    }, {
        name: 'Upcoming Events',
        icon: 'calendar'
    }]
    //PIC STUFF
    $scope.defaultPic = defaultPic;
    $scope.loadingFile = false;
    $scope.fileName = null;
    $scope.needsResize = 65;
    $scope.loadFile = () => {
        $scope.loadingFile = true;
        const fr = new FileReader();
    }
    $scope.saveDataURI = (d) => {
        $http.post('/user/changeAva', {
            img: d
        })
            .then(r => {
                $scope.doUser(r.data);
            })
    }
    //END PIC STUFF
    $scope.possibleInterests = [{
        name: 'General PvE',
        warn: false,
        active: false,
        icon: 'pve.png'
    }, {
        name: 'sPvP',
        warn: false,
        active: false,
        icon: 'pvp.png'
    }, {
        name: 'WvW',
        warn: false,
        active: false,
        icon: 'wvw.png'
    }, {
        name: 'Fractals',
        warn: false,
        active: false,
        icon: 'fracs.png'
    }, {
        name: 'Raids',
        warn: true,
        active: false,
        icon: 'raids.png'
    }, {
        name: 'Role-Playing',
        warn: true,
        active: false,
        icon: 'rp.png'
    }]
    $scope.tzs = angular.copy(timezoneList);
    //change info stuff
    $scope.changeInterest = (intrst, ind) => {
        console.log(intrst)
        if (intrst.warn && intrst.active) {
            bulmabox.alert('Game Mode Warning', `Hey! Just so you know, Brethren generally doesn't do ${intrst.name}.<br>However, that doesn't mean we don't have people that might be interested!`);
        }
        $http.get(`/user/changeInterest?int=${ind}&act=${intrst.active}`)
            .then(function (r) {
                $scope.doUser(r.data);
            })
    }
    $scope.changeTz = () => {
        $http.get('/user/changeTz?tz=' + $scope.user.tz)
            .then(r => {
                $scope.doUser(r.data);
            })
    }
    $scope.otherInfTimer = null;
    $scope.setOtherInfTimer = () => {
        if ($scope.otherInfTimer) {
            clearTimeout($scope.otherInfTimer);
        }
        $scope.otherInfTimer = setTimeout(function () {
            $http.post('/user/changeOther', { other: $scope.user.otherInfo })
                .then(r => {
                    $scope.doUser(r.data);
                })
        }, 500)
    }
    //end info stuff
    //search stuff
    $scope.memNameSort = false;
    $scope.charSearch = '';
    $scope.pickedInts = [false, false, false, false, false, false];
    $scope.intSearchToggle = false;
    $scope.charSearchToggle = false;
    $scope.memFilter = (m) => {
        //two options to 'filter out' this item
        let hasChars = !!m.chars && !!m.chars.length && !!m.chars.filter(c => c.name.toLowerCase().indexOf($scope.charSearch.toLowerCase()) > -1);
        if ($scope.charSearch && !hasChars) {
            //char search filter has been applied, and none of the user's chars match this
            return false;
        }
        if ($scope.pickedInts.filter(r => !!r).length) {
            //picked some interests
            let okay = true;
            $scope.pickedInts.forEach((intr, idx) => {
                if (!!intr && !m.ints[idx]) {
                    okay = false;
                }
            })
            return okay;
        }
        return true;
    }
    //end search stuff
    $scope.getMembers = () => {
        userFact.getUsers()
            .then((au) => {
                console.log('all users is', au)
                $scope.allUsers = au.data;
                $scope.allUsers.forEach(usr => {
                    usr.hasInts = !!usr.ints.find(q => q == "1");//user has selected at least one interest
                })
                setTimeout(function () {
                    socket.emit('getOnline', {});
                }, 100)
            });
    }
    $scope.getMembers();
    socket.on('allNames', function (r) {
        // console.log('ALLNAMES',r)
        if (!!r.user) {
            // console.log('not for dash, returning false!')
            return false;
        }
        if ($scope.allUsers) {
            $scope.allUsers.forEach(usr => {
                // usr.hasInts = !!usr.ints.find(q=>q=="1");//user has selected at least one interest
                usr.online = !!r.find(q => q.name == usr.user) || usr.user == $scope.user.user;
            })
        }
        $scope.$digest();
    })
    $scope.getOnlineStatus = u => {
        if (!u.online) {
            return `background:#300;`
        }
        return `background:#0f0;box-shadow: 0 0 4px #0f0`;
    }
    $scope.showTab = (t) => {
        $scope.currTab = t;
    }
    $scope.currTab = 'Profile/Characters'
    $scope.explRank = () => {
        bulmabox.alert(`Member Rank`, `
        This is the guild rank of each member (viewable by pressing "G" in game).<br>
        To get <i>your</i> rank to display:<br>
        <ol>
        <li>Head on over to the Profile/Characters tab</li>
        <li>Fill in your Guild Wars 2 Account name. Note that this is <i>NOT</i> your username, and is instead the "code" that appears at the top of the window when you press "Y"!</li>
        <li>Click "<i class="fa fa-check"></i>&nbsp;Save Account"</li>
        </ol>
        `)
    }
    //admin stuffs
    $scope.makeMod = (u) => {
        console.log('wanna mod', u);
        bulmabox.confirm(`Assign Moderator Rights`, `Warning: This will give user ${u.user} full moderator rights, and prevents them from being banned. This process is <i>not</i> reversable!`, function (r) {
            if (!r || r == null) {
                return false;
            } else {
                //No thanks
                $http.get('/user/makeMod?user=' + u.user)
                    .then(tbr => {
                        $scope.allUsers = tbr.data;
                    })
            }
        })
    }
    $scope.toggleBan = (u) => {
        $http.get('/user/toggleBan?user=' + u.user)
            .then(tbr => {
                $scope.allUsers = tbr.data;
            })
    }
    $scope.confirmUsr = (u) => {
        bulmabox.confirm('Confirm User', `Are you sure you wish to confirm user ${u.user}?`, (r) => {
            if (r && r != null) {
                $http.get('/user/confirm?u=' + u.user)
                    .then(au => {
                        $scope.allUsers = au.data;
                    })
            }
        })
    }
    //end admin stuffs
    $scope.races = ['Asura', 'Charr', 'Human', 'Norn', 'Sylvari'];
    $scope.profs = ['Guardian', 'Warrior', 'Revenant', 'Thief', 'Ranger', 'Engineer', 'Elementalist', 'Mesmer', 'Necromancer']
    $scope.addChar = () => {
        const raceOptList = $scope.races.map(rc => {
            return `<label class='char-opt opt-${rc}'><input type='radio' name='char-race' value=${rc} title=${rc}><div></div></label>`
        }).join(''),
            profOptList = $scope.profs.map(rc => {
                return `<label class='char-opt opt-${rc}'><input type='radio' name='char-prof' value=${rc} title=${rc}><div></div></label>`
            }).join('');
        bulmabox.custom('Add a character',
            `<div class="field">
    <label class="label">
        Name
    </label>
    <p class="control has-icons-left">
        <input class="input" type="text" placeholder="Your character's name" id='char-name'>
        <span class="icon is-small is-left">
            <i class="fa fa-user"></i>
        </span>
    </p>
</div>
<div class="field">
    <label class='label'>
        Race
    </label>
    ${raceOptList}
</div>
<div class="field">
    <label class='label'>
        Profession
    </label>
    ${profOptList}
</div>
<div class="field">
    <label class='label'>
        Level
    </label>
    <p class="control">
        <input class='input' type='number' id='char-lvl' min='1' max='80' value='80'>
    </p>
</div>
<div class="field">
    <label class='label'>
        Other Info
    </label>
    <p class="control">
        <textarea class='textarea' id='char-other' placeholder='Any other information you wanna include (optional)'></textarea>
    </p>
</div>`,
            function () {
                const theProf = document.querySelector('input[name=char-prof]:checked'),
                    theRace = document.querySelector('input[name=char-race]:checked'),
                    theName = document.querySelector('#char-name');
                if (!theProf || !theRace || !theName) {
                    bulmabox.alert('Needs More Info', 'You need to specify a profession, race, and name! Otherwise we won\'t know who/what you are!');
                    return false;
                }
                const char = {
                    name: document.querySelector('#char-name').value,
                    prof: document.querySelector('input[name=char-prof]:checked').value,
                    race: document.querySelector('input[name=char-race]:checked').value,
                    lvl: document.querySelector('#char-lvl').value,
                    other: document.querySelector('#char-other').value
                }
                console.log('User wants to add char', char)
                $http.post('/user/addChar', char)
                    .then((r) => {
                        $scope.doUser(r.data);
                    })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Save</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    }
    $scope.autoChars = () => {
        //B9DE7B9E-9DAD-2C40-BECD-12F9BA931FE0851EA3EB-B1AA-4FBB-B4BE-CCDD28F51644
        bulmabox.prompt('Auto-Fill Characters from API', `Auto-filling characters from the Guild Wars 2 Official API will replace any existing characters you've entered with API-found characters. <br><br> - You'll need an API key to do this (click <a href='https://account.arena.net/' target='_blank'>here</a> if you dont have one). <br><br>Are you sure you wish to do this?`, function (resp) {
            if (resp && resp != null) {
                $http.get('/user/charsFromAPI?api=' + resp)
                    .then(r => {
                        console.log('Auto-char response is', r)
                        if (r && r.data && r.data != 'err') {
                            $scope.doUser(r.data)
                        } else {
                            bulmabox.alert('Error Auto-Filling', 'There was an error auto-filling your characters.<br>While it <i>may</i> be Dave\'s fault, you may also wanna check that your API key is valid. You can also always just manually add your characters!')
                        }
                    })
            }
        })
    }
    $scope.delChr = (chr) => {
        console.log('user wishes to remove character', chr)
        bulmabox.confirm('Remove Character', `Are you sure you wish to remove the character ${chr.name}?`, function (resp) {
            if (resp && resp != null) {
                $http.get('/user/remChar?id=' + chr._id)
                    .then(r => {
                        $scope.doUser(r.data);
                    }).catch(e => {
                        bulmabox.alert('Error', 'There was a problem removing this character!');
                    })
            }
        })
    }
    $scope.editChar = (chr) => {
        console.log('usr wants to', chr, Date.now())
        const raceOptList = $scope.races.map(rc => {
            return `<label class='char-opt opt-${rc}'><input type='radio' name='char-race' value=${rc} title=${rc} ${rc == chr.race ? 'checked' : ''}><div></div></label>`
        }).join(''),
            profOptList = $scope.profs.map(rc => {
                return `<label class='char-opt opt-${rc}'><input type='radio' name='char-prof' value=${rc} title=${rc} ${rc == chr.prof ? 'checked' : ''}><div></div></label>`
            }).join('');
        bulmabox.custom('Edit character',
            `<div class="field">
    <label class="label">
        Name
    </label>
    <p class="control has-icons-left">
        <input class="input" type="text" placeholder="Your character's name" id='char-name' value='${chr.name}'>
        <span class="icon is-small is-left">
            <i class="fa fa-user"></i>
        </span>
    </p>
</div>
<div class="field">
    <label class='label'>
        Race
    </label>
    ${raceOptList}
</div>
<div class="field">
    <label class='label'>
        Profession
    </label>
    ${profOptList}
</div>
<div class="field">
    <label class='label'>
        Level
    </label>
    <p class="control has-icons-left">
        <input class='input' type='number' id='char-lvl' min='1' max='${chr.lvl}' value='80'>
        <span class="icon is-small is-left">
            <i class="fa fa-signal"></i>
        </span>
    </p>
</div>
<div class="field">
    <label class='label'>
        Other Info
    </label>
    <p class="control">
        <textarea class='textarea' id='char-other' placeholder='Any other information you wanna include (optional)'>${chr.other}</textarea>
    </p>
</div>`,
            function (resp) {
                //send event!
                // const title = document.querySelector('#newTitle').value,
                // text = document.querySelector('#newMsg').value;
                const theProf = document.querySelector('input[name=char-prof]:checked'),
                    theRace = document.querySelector('input[name=char-race]:checked'),
                    theName = document.querySelector('#char-name');
                if (!theProf || !theRace || !theName) {
                    bulmabox.alert('Needs More Info', 'You need to specify a profession, race, and name! Otherwise we won\'t know who/what you are!');
                    return false;
                }
                const char = {
                    name: document.querySelector('#char-name').value,
                    prof: document.querySelector('input[name=char-prof]:checked').value,
                    race: document.querySelector('input[name=char-race]:checked').value,
                    lvl: document.querySelector('#char-lvl').value,
                    other: document.querySelector('#char-other').value
                }
                console.log('User wants to add char', char, resp)
                $http.post('/user/editChar', char)
                    .then((r) => {
                        $scope.doUser(r.data);
                    })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Save</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    }
    $scope.mail = (usr) => {

        bulmabox.custom('Send Message',
            `<div class="field">
    <label class='label'>
        Message
    </label>
    <p class="control">
        <textarea class='textarea' id='newMsg' placeholder='What do you wanna say?'></textarea>
    </p>
</div>`,
            function (resp) {
                //send event!
                // const title = document.querySelector('#newTitle').value,
                // text = document.querySelector('#newMsg').value;
                const theMsg = document.querySelector('#newMsg').value;
                if (!theMsg) {
                    bulmabox.alert('Huh?', 'Sorry, but we don\'t support uncomfortable silences currently.');
                    return false;
                }
                $http.post('/user/sendMsg', { msg: theMsg, to: usr.user })
                    .then((r) => {
                        //done
                    })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Send</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    }
    $scope.viewMsg = (m, t) => {
        bulmabox.alert(`Message from ${m.from}`, m.msg || '(No message)')
        if (t) {
            return false;
        }
        $http.get('/user/setOneRead?id=' + m._id)
            .then(r => {
                $scope.doUser(r.data);
            })
    }
    $scope.delMsg = (m) => {
        bulmabox.confirm('Delete Message', 'Are you sure you wish to delete this message?', (resp) => {
            console.log('resp', resp);
            if (resp && resp != null) {
                $http.get('/user/delMsg?id=' + m._id)
                    .then(r => {
                        $scope.doUser(r.data);
                    })
            }
        })
    }
    $scope.delMyMsg = (m) => {
        bulmabox.confirm('Delete Message', 'Are you sure you wish to delete this message?', (resp) => {
            console.log('resp', resp);
            if (resp && resp != null) {
                $http.get('/user/delMyMsg?id=' + m._id)
                    .then(r => {
                        $scope.doUser(r.data);
                    })
            }
        })
    }
    $scope.repMsg = (m) => {
        console.log('user wishes to report msg', m)
        bulmabox.confirm('Report Message', 'Reporting a message sends a notification to the moderators, including the details of the message.<br>It will then be up to the moderators to determine if you\'re being uncool to each other.<br>Are you sure you wish to report this message?', (resp) => {
            $http.post('/user/repMsg', m)
                .then(r => {
                    //done
                    if (r.data == 'dupRep') {
                        bootbox.alert("Already Reported", "You've already reported this message. Please wait while the moderator team reviews your report.")
                    }
                })
        })
    }
    $scope.newPwd = {
        pwd: null,
        pwdDup: null,
        old: null,
        changin: false
    }
    $scope.clearPwd = () => {
        $scope.newPwd = {
            pwd: null,
            pwdDup: null,
            old: null,
            changin: false
        }
    }
    $scope.editPwd = () => {
        if (!$scope.newPwd.pwd || !$scope.newPwd.pwdDup || $scope.newPwd.pwd != $scope.newPwd.pwdDup) {
            bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Password Mismatch', 'Your passwords don\'t match, or are missing!');
        } else {
            $http.put('/user/editPwd', $scope.newPwd).then(r => {
                if (r.data && r.data != 'err') {
                    $scope.clearPwd();
                    bulmabox.alert('Password Changed!', 'Your password was successfully changed!')
                    $scope.doUser(r.data)
                } else {
                    bulmabox.alert('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Error Changing Password', 'There was a problem changing your password. Your old one probably still works, but if you\'re still having an issue, contact a moderator!')
                }
            })
        }

    }
    $scope.viewEvent = (ev) => {
        bulmabox.alert(`Event: ${ev.title}`, `Date:${$filter('numToDate')(ev.eventDate)}<br>Description:${ev.text}`);
    }
    // $scope.emailTimer = () => {
    //     if ($scope.updEmail) {
    //         clearTimeout($scope.updEmail);
    //     }
    //     $scope.updEmail = setTimeout(function() {
    //         console.log($scope.user.email);
    //         $http.get('/user/setEmail?email=' + $scope.user.email)
    //             .then(r => {
    //                 console.log(r);
    //                 if (r.data && r.data != 'err') {
    //                     $scope.doUser(r.data);
    //                 }
    //             })
    //     }, 500);
    // }
})
    .filter('numToDate', function () {
        return function (num) {
            if (isNaN(num)) {
                return 'Invalid date!';
            }
            const theDate = new Date(num);
            console.log(theDate.getMinutes())
            return `${theDate.toLocaleDateString()} ${theDate.getHours() % 12}:${theDate.getMinutes().toString().length < 2 ? '0' + theDate.getMinutes() : theDate.getMinutes()} ${theDate.getHours() < 13 ? 'AM' : 'PM'}`;
        };
    })