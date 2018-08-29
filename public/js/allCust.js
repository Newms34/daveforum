const socket = io(),
    app = angular.module('brethren-app', ['ui.router', 'ngAnimate', 'ngSanitize']),
    resetApp = angular.module('reset-app', []);

const defaultPic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAACNCAIAAAAPTALlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAANsSURBVHhe7dVRduIwEETR7GkWmK1HhMch9giw1dWyZNf9mZwM2F3vJ1//TM1N9dxUz0313FTPTfVGb/r9Fh8azIhNCbYTXx7AWE3JE8CDDjVEU3pI8egjHN+UBgl4QXdHNmV6Ml7W0WFNWdwFr+zlgKYM7Y7X5+vdlH0H4YhkXZuy7FCckqlfUzYNgIPSdGrKmmFwVo6LNi24LEGPpowYDMclSG/KgiFxotqlmxZcKZXblMMHxqFSiU25enicq+OmN1wsktWUYyfB0SJuesPRIilNuXQqnK7gpuB0BX1TbpwQA8Lc9IkBYW66wIYYcVNOmxYzYtx0gRkxbrrAjBhlU+6aHGMC3HSNMQFuusaYADddY0yAm64xJsBNK9jTStaUc06BSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrWRNCy6aH3tauekaYwLcdI0xAW66xpgAN11jTICbrjEmQNm04K5pMSPGTReYEeOmC8yIcdMFZsSImxZcNyEGhLnpEwPC9E0LbpwKpyu4KThdIaVpwaWT4GgRN73haBE3veFokaymBfcOj3N1EpsWXD0wDpVyU73cpgW3D4kT1dKbFiwYDMcl6NG0YMdIuCzBRZtyVo5OTQvWDICD0vRrWrDpUJySqWvTgmUH4YhkvZsW7OuO1+e7SlPe3cXl/kZxTaZOTRk0Bm5Kk96UHePhvgS5TTl/YBwqldWUk2fAxTopTTl2HtwtIm7KjXNiQ5iyKafNjCUxsqYcNT/2BGiacs5ZsKqVoCmHnAvbmkSbcsIZsXC/UFNefl7s3Km9Ka89O9bu0diUF14DmzdracqrroTl27jpJizfZndTXnI97N9gX1Mef1VU+GRHUx58bbR4y033ocVbW5vySNuQdVNTHmYPdHnBTVvQ5YXPTXmMLVGnxk0bUafmQ1MeYDU0+s+7pnzVXqPUkpuGUGrpZVO+ZJ/Q6w83jaLXH24qQLKHelM+a9tQ7cFNBaj2UGnKB20P2v1yUw3a/Vo35SO2HwXdVIiCbipEwVVT/tNa3TO6qdI9o5sq3TO6qVjJ+GzK7yymlHRTsVLSTcVKSZryC1NwUz031XNTPTfVuzXlRxNxUz031XNTPTfVc1M9N9VzU70v/jWV7+8ffZYE08zo+Y8AAAAASUVORK5CYII=';

Array.prototype.findUser = function(u) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].user == u) {
            return i;
        }
    }
    return -1;
}

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise('/404');
        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'layouts/full.html'
            })
            .state('app.dash', {
                url: '/', //default route, if not 404
                templateUrl: 'components/dash.html'
            })
            .state('app.calendar', {
                url: '/calendar',
                templateUrl: 'components/calendar.html'
            })
            .state('app.help', {
                url: '/help',
                templateUrl: 'components/help/help.html'
            })
            //forum stuff
            .state('app.forum', {
                //cateories (main)
                url: '/forum',
                templateUrl: 'components/forums/forum.html'
            })
            .state('app.forumCat', {
                //indiv category
                url: '/forumCat?c',
                templateUrl: 'components/forums/forumCat.html'
            })
            .state('app.forumThr', {
                //indiv Thread
                url: '/forumThr?c&t',
                templateUrl: 'components/forums/forumThr.html'
            })

            //SIMPLE (login, register, forgot, 404, 500)
            .state('appSimp', {
                abstract: true,
                templateUrl: 'components/layout/simp.html'
            })
            .state('appSimp.login', {
                url: '/login',
                templateUrl: 'components/login.html'
            })
            .state('appSimp.register', {
                url: '/register',
                templateUrl: 'components/register.html'
            })
            //unconfirmed usr
            .state('appSimp.unconfirmed', {
                url: '/unconf',
                templateUrl: 'components/alt/unconfirmed.html'
            })
            //and finally, the error-handling routes!
            .state('appSimp.notfound', {
                url: '/404',
                templateUrl: 'components/alt/404.html'
            })
            .state('appSimp.err', {
                url: '/500',
                templateUrl: 'components/alt/500.html'
            })
    }])
    .directive("fileread", [function() {
        return {
            scope: {
                fileread: "="
            },
            link: function(scope, element, attributes) {
                element.bind("change", function(changeEvent) {
                    const reader = new FileReader(),
                        theFile = changeEvent.target.files[0],
                        tempName = theFile.name;
                    console.log('UPLOADING FILE', theFile);
                    reader.onload = function(loadEvent) {
                        let theURI = loadEvent.target.result;
                        console.log('URI before optional resize', theURI, theURI.length)
                        if (scope.$parent.needsResize) {
                            //needs to resize img
                            resizeDataUrl(scope, theURI, scope.$parent.needsResize, scope.$parent.needsResize,tempName);
                        } else {
                            scope.$apply(function() {
                                scope.$parent.loadingFile = false;
                                scope.$parent.fileName = 'Loaded:' + tempName;
                                scope.fileread = theURI;
                                if(scope.$parent.saveDataURI && typeof scope.$parent.saveDataURI=='function'){
                                    scope.$parent.saveDataURI(dataURI);
                                }
                            });
                        }
                    }
                    if (!theFile) {
                        scope.$apply(function() {
                            scope.fileread = '';
                            scope.$parent.fileName = false;
                            scope.$parent.loadingFile = false;
                        });
                        return false;
                    }
                    if (theFile.size > 2500000) {
                        bulmabox.alert('File too Large', `Your file ${theFile.name} is larger than 2.5MB. Please upload a smaller file!`)
                        return false;
                    }
                    reader.readAsDataURL(theFile);
                });
            }
        }
    }]);

Array.prototype.rotate = function(n) {
    let arrCop = angular.copy(this);
    for (var i = 0; i < n; i++) {
        arrCop.push(arrCop.shift());
    }
    return arrCop;
};
Date.prototype.dyMo = function() {
    return (this.getMonth() + 1) + '/' + this.getDate();
}
String.prototype.titleCase = function() {
    return this.split(/\s/).map(t => t.slice(0, 1).toUpperCase() + t.slice(1).toLowerCase()).join(' ');
}

const resizeDataUrl = (scope, datas, wantedWidth, wantedHeight,tempName) => {
    // We create an image to receive the Data URI
    const img = document.createElement('img');

    // When the event "onload" is triggered we can resize the image.
    img.onload = function() {
        // We create a canvas and get its context.
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // We set the dimensions at the wanted size.
        canvas.width = wantedWidth;
        canvas.height = wantedHeight;

        // We resize the image with the canvas method drawImage();
        ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);

        const dataURI = canvas.toDataURL();

        /////////////////////////////////////////
        // Use and treat your Data URI here !! //
        /////////////////////////////////////////
        scope.$apply(function() {
            scope.$parent.loadingFile = false;
            scope.$parent.fileName = 'Loaded:' + tempName;
            scope.fileread = dataURI;
            if(scope.$parent.saveDataURI && typeof scope.$parent.saveDataURI=='function'){
                scope.$parent.saveDataURI(dataURI);
            }
        });
    };

    // We put the Data URI in the image's src attribute
    img.src = datas;
}
app.factory('socketFac', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () { 
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
app.run(['$rootScope', '$state', '$stateParams', '$transitions', '$q','userFact', function($rootScope, $state, $stateParams, $transitions, $q,userFact) {
    $transitions.onBefore({ to: 'app.**' }, function(trans) {
        let def = $q.defer();
        console.log('TRANS',trans)
        const usrCheck = trans.injector().get('userFact')
        usrCheck.getUser().then(function(r) {
            console.log('response from login chck',r)
            if (r.data && r.data.confirmed) {
                // localStorage.twoRibbonsUser = JSON.stringify(r.user);
                def.resolve(true)
            } else if(r.data){
                def.resolve($state.target('appSimp.unconfirmed',undefined, {location:true}))
            }else{
                // User isn't authenticated. Redirect to a new Target State
                def.resolve($state.target('appSimp.login', undefined, { location: true }))
            }
        });
        return def.promise;
    });
    // $transitions.onFinish({ to: '*' }, function() {
    //     document.body.scrollTop = document.documentElement.scrollTop = 0;
    // });
}]);
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

app.controller('cal-cont', function($scope, $http, userFact) {
    $scope.cal = [];
    $scope.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    $scope.calLoaded = false;
    $scope.refCal = () => {
        $http.get('/cal/all')
            .then((r) => {
                console.log('calendar events response:', r);
                $scope.makeCalendar(r.data);
            })
    };
    $scope.refCal();
    $scope.makeCalendar = (data) => {
    	//make the calendar object using the data from /cal/all
        $scope.offsetDays = $scope.days.rotate(new Date().getDay());
        let wks = 6,
            days = 7,
            i = 0,
            j = 0,
            today = new Date(),
            tDay;
        today.setHours(0,0,0,0);//set day to beginning of the day (12am)
        today = today.getTime();
        $scope.cal = []
        for (i; i < wks; i++) {
            let newWk = {
                wk: i,
                wkSt: new Date(today + ((7 * i) * 1000 * 3600 * 24)),
                wkEn: new Date(today + (((7 * (i + 1)) - 1) * 1000 * 3600 * 24)),
                days: []
            }
            for (j = 0; j < days; j++) {
                // for each day, add that number of days to our 'current' day (today)
                let theDate = new Date(today+(((7*i)+j))*1000*3600*24);
                newWk.days.push({
                    d: j,
                    evts: data.filter(et=>{
                    	let dtNum = new Date(et.eventDate).getTime();
                    	console.log('THIS DATE DTNUM',dtNum,theDate.getTime())
                    	return dtNum>theDate.getTime() && dtNum<(theDate.getTime()+(1000*3600*24));
                    	// && dtNum<(theDate.getTime()+(1000*3600*24))
                    }),
                    date: theDate
                })
            }
            $scope.cal.push(newWk);
        }
        console.log('CAL STUFF', $scope.cal, $scope.offsetDays)
    };
    $scope.viewEvent=(ev)=>{
    	console.log('View event',ev)
    	bulmabox.alert(`Event: ${ev.title}`,`Time:${new Date(ev.eventDate).toString()}<hr>${ev.text}`)
    };
    $scope.editEvent=(ev)=>{
    	console.log('Edit event',ev)
        let opts = '';
        let theDate = new Date(ev.eventDate)
        for (let i=0;i<24;i++){
            let hr = i<13?i:i-12,
            ampm = i<12?' am':' pm';
            if(!hr||hr==0){
                hr=12;
            }
            opts+='<option value ='+i+' '+(theDate.getHours()==i && theDate.getMinutes()==0?'selected':'')+'>'+hr+':00'+ampm+'</options><option value ='+(i+0.5)+' '+(theDate.getHours()==i && theDate.getMinutes()==30?'selected':'')+'>'+hr+':30'+ampm+'</options>'
        }
    	 bulmabox.custom('Edit Event',
            `<div class="field">
            	<label class='label'>
                Event Title
                </label>
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="A title for your event" id='newTitle' value='${ev.title}'>
                        <span class="icon is-small is-left">
                            <i class="fa fa-puzzle-piece"></i>
                        </span>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
               Description of Event
                </label>
                    <p class="control">
                        <textarea class='textarea' id='newMsg' placeholder='A description for your event (optional)'>${ev.text}</textarea>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
                When should this event occur?
                </label>
                    <p class="select">
                        <select id='newTime'>
                        	${opts}
                        </select>
                    </p>
                </div>`,
            function() {
                //send event!
                const title = document.querySelector('#newTitle').value,
                msg = document.querySelector('#newMsg').value,
                today = new Date();
                today.setHours(0,0,0,0);
                //add hours in day, today, and day offset
                let time = (parseInt(document.querySelector('#newTime').value)*3600*1000)+today.getTime()+(((7*wk.wk)+dy.d)*1000*3600*24);
                console.log('Sending event',title,msg,time,)
                $http.post('/cal/new',{
                	title:title,
                	text:msg,
                	eventDate:time,
                })
                .then(function(r){
                	console.log('new event response',r)
                	$scope.refCal()
                })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Add</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    };
    $scope.delEvent=(ev)=>{
    	console.log('Delete event',ev)
    	bulmabox.confirm('Delete Event',`Are you sure you wish to delete the following event?<br> Title: ${ev.title}<br>Description: ${ev.text}`,function(r){
    		if(!r||r==null){
    			return false;
    		}else{
    			//delete!
    			$http.get('/cal/del?id='+ev._id).then(function(r){
    				console.log('delete response',r)
    				$scope.refCal();
    			})
    		}
    	})
    };

    $scope.addEvent = (wk,dy) => {
        console.log('DAY is', dy);
        let opts = '';
        for (let i=0;i<24;i++){
        	let hr = i<13?i:i-12,
        	ampm = i<12?' am':' pm';
        	if(!hr||hr==0){
        		hr=12;
        	}
        	opts+='<option value ='+i+'>'+hr+':00'+ampm+'</options><option value ='+(i+0.5)+'>'+hr+':30'+ampm+'</options>'
        }
        bulmabox.custom('Add Event',
            `<div class="field">
            	<label class='label'>
                Event Title
                </label>
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="A title for your event" id='newTitle'>
                        <span class="icon is-small is-left">
                            <i class="fa fa-puzzle-piece"></i>
                        </span>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
               Description of Event
                </label>
                    <p class="control">
                        <textarea class='textarea' id='newMsg' placeholder='A description for your event (optional)'></textarea>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
                When should this event occur?
                </label>
                    <p class="select">
                        <select id='newTime'>
                        	<option disabled selected>Select a time</option>
                        	${opts}
                        </select>
                    </p>
                </div>`,
            function() {
                //send event!
                const title = document.querySelector('#newTitle').value,
                msg = document.querySelector('#newMsg').value,
                today = new Date();
                today.setHours(0,0,0,0);
                //add hours in day, today, and day offset
                let time = (parseInt(document.querySelector('#newTime').value)*3600*1000)+today.getTime()+(((7*wk.wk)+dy.d)*1000*3600*24);
                console.log('Sending event',title,msg,time,)
                $http.post('/cal/new',{
                	title:title,
                	text:msg,
                	eventDate:time,
                })
                .then(function(r){
                	console.log('new event response',r)
                	$scope.refCal()
                })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Add</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)

    }
})
app.controller('dash-cont', function($scope, $http, $state, userFact, $filter) {
        $scope.showDups = localStorage.brethDups; //show this user in 'members' list (for testing)
        $http.get('/user/getUsr')
            .then(r => {
                $scope.doUser(r.data);
                console.log('user', $scope.user)
            });
        $http.get('/cal/latestFive')
            .then(r => {
                $scope.latestEvents = r.data;
            })
        $scope.doUser = (u) => {
            if (!u) {
                return false;
            }
            $scope.user = u;
            console.log(u, )
            $scope.possibleInterests.forEach((c, i) => {
                if (u.ints && u.ints[i] && u.ints[i] == 1) {
                    c.active = true;
                }
            })
        }
        $scope.tabs = [{
            name: 'Profile/Characters',
            icon: 'user'
        }, {
            name: 'Members',
            icon: 'users'
        }, {
            name: 'Inbox',
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
        $scope.saveDataURI = (d)=>{
            $http.post('/user/changeAva',{
                img:d
            })
            .then(r=>{
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
                .then(function(r) {
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
            $scope.otherInfTimer = setTimeout(function() {
                $http.post('/user/changeOther', { other: $scope.user.otherInfo })
                    .then(r => {
                        $scope.doUser(r.data);
                    })
            }, 500)
        }
        //end info stuff
        $http.get('/user/allUsrs')
            .then((au) => {
                //Auch!
                console.log('all users is', au)
                $scope.allUsers = au.data;
            });
        $scope.showTab = (t) => {
            $scope.currTab = t;
        }
        $scope.currTab = 'Profile/Characters'
        //admin stuffs
        $scope.makeMod = (u) => {
            console.log('wanna mod', u);
            bulmabox.confirm(`Assign Moderator Rights`, `Warning: This will give user ${u.user} full moderator rights, and prevents them from being banned. This process is <i>not</i> reversable!`, function(r) {
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
        $scope.confirmUsr = (u)=>{
            bulmabox.confirm('Confirm User',`Are you sure you wish to confirm user ${u.user}?`,(r)=>{
                if(r && r!=null){
                    $http.get('/user/confirm?u='+u.user)
                        .then(au=>{
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
                function() {
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
        $scope.delChr = (chr) => {
            console.log('user wishes to remove character', chr)
            bulmabox.confirm('Remove Character', `Are you sure you wish to remove the character ${chr.name}?`, function(resp) {
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
                    return `<label class='char-opt opt-${rc}'><input type='radio' name='char-race' value=${rc} title=${rc} ${rc==chr.race?'checked':''}><div></div></label>`
                }).join(''),
                profOptList = $scope.profs.map(rc => {
                    return `<label class='char-opt opt-${rc}'><input type='radio' name='char-prof' value=${rc} title=${rc} ${rc==chr.prof?'checked':''}><div></div></label>`
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
                function(resp) {
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
                function(resp) {
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
                }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Save</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
        }
        $scope.viewMsg = (m) => {
            console.log('user wishes to view msg', m)
            bulmabox.alert(`Message from ${m.from}`, m.msg || '(No message)')
        }
        $scope.delMsg = (m) => {
            console.log('user wishes to delete msg', m)
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
        $scope.repMsg = (m) => {
            console.log('user wishes to report msg', m)
            bulmabox.confirm('Report Message', 'Reporting a message sends a notification to the moderators, including the details of the message.<br>It will then be up to the moderators to determine if you\'re being uncool to each other.<br>Are you sure you wish to report this message?', (resp) => {
                console.log('resp', resp)
                $http.post('/user/repMsg', m)
                    .then(r => {
                        //done
                        if (r.data == 'dupRep') {
                            bootbox.alert("Already Reported", "You've already reported this message. Please wait while the moderator team reviews your report.")
                        }
                    })
            })
        }
        $scope.viewEvent = (ev) => {
            bulmabox.alert(`Event: ${ev.title}`, `Date:${$filter('numToDate')(ev.eventDate)}<br>Description:${ev.text}`);
        }
    })
    .filter('numToDate', function() {
        return function(num) {
            if (isNaN(num)) {
                return 'Invalid date!';
            }
            const theDate = new Date(num);
            return `${theDate.toLocaleDateString()} ${theDate.getHours()%12}:${theDate.getMinutes().toString.length<2?'0'+theDate.getMinutes():theDate.getMinutes()} ${theDate.getHours()<13?'AM':'PM'}`;
        };
    })
app.controller('forum-cat-cont', function($scope, $http, userFact, $state, $location) {
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    $scope.newThr = {};
    $scope.fileName = null;
    //how do we wanna structure the forum obj?
    //structure is gonna be categories --> threads ---> indiv posts
    $scope.currCat = $location.search().c;
    $http.get('/forum/byCat?grp=' + $scope.currCat)
        .then(function(r) {
            console.log('thrds in this cat', r)
            $scope.threads = r.data;
        })
    $scope.newThrDial = () => {
        $scope.makingThread = true;
    }
    $scope.clearThread=()=>{
        $scope.newThr = {};
        $scope.makingThread =false;
        $scope.loadingFile=false;
    }
    $scope.loadFile=()=>{
       $scope.loadingFile= true;
       const fr = new FileReader();
    }
    $scope.makeThread=()=>{
        $scope.newThr.md = $scope.newThr.txt;
        $scope.newThr.text = new showdown.Converter().makeHtml($scope.newThr.txt);
        $scope.newThr.grp = $scope.currCat;
        $http.post('/forum/newThread',$scope.newThr)
        .then(function(r){
            console.log('new thred response', r )
            //$state.go($state.current, {}, {reload: true});
        })
    }
})

// const handleUpload = function(postBtn,fileInp,fr) {
//     console.log('disabling submit until we get the file!')
//     console.log('File info', fileInp.files[0])
//     postBtn.disabled = true;
//     fr.readAsDataURL(fileInp.files[0]);
//     fr.addEventListener('load', function() {
//         postBtn.disabled = false;
//         console.log(fr.result)
//     })
// }
app.controller('forum-cont', function($scope, $http, userFact, $state) {
    $scope.currMsg = 0;
    $scope.forObj = {};
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    //how do we wanna structure the forum obj?
    //structure is gonna be categories --> threads ---> indiv posts
        //main page
        $http.get('/forum/cats')
            .then((r) => {
                const forCats = Object.keys(r.data);
                $scope.forObj = forCats.map(ct => {
                    return {
                        name: ct,
                        count: r.data[ct].n,
                        time: r.data[ct] > 0 ? new Date(r.data[ct]) : null
                    }
                })
            })
    $scope.goCat = function(n){
    	$state.go('app.forumCat',{c:n})
    }
})
app.controller('forum-thr-cont', function($scope, $http, userFact, $state, $location, $sce) {
    $scope.currMsg = 0;
    $scope.defaultPic = defaultPic;
    $scope.forObj = {};
    $scope.fileName = null
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    $scope.loadingFile = false;
    $scope.loadFile=()=>{
       $scope.loadingFile= true;
       const fr = new FileReader();
    }
    $scope.currCat = $location.search().c;
    $scope.id = $location.search().t;
    console.log($scope.currCat,)
    $scope.refThred = () => {
        console.log('info to back:',$scope.id)
        $http.get('/forum/thread?id=' + $scope.id)
            .then((r) => {
                console.log('response',r)
                $scope.thr = r.data.thrd;
                r.data.psts.map(ps => {
                    ps.rawText = ps.text;
                    ps.text = $sce.trustAsHtml(ps.text);
                    ps.date = new Date(ps.lastUpd).toLocaleString();
                    ps.wasEdited = ps.lastUpd != ps.createDate;
                    return ps;
                });
                $scope.thr.posts = $scope.thr.posts.map(psth => {
                    console.log('PSTH', psth, r.data.psts.filter(psps => psps._id == psth.id)[0])
                    const thePst = r.data.psts.filter(psps => psps._id == psth.id)[0];
                    thePst.votesUp = psth.votesUp;
                    thePst.votesDown = psth.votesDown;
                    thePst.order = psth.order;
                    return r.data.psts.filter(psps => psps._id == psth.id)[0];
                }).sort((a, b) => {
                    return a.order - b.order;
                })
                console.log('thred response', $scope.thr, r);
            })
    }
    $scope.refThred();
    $http.get('/user/getUsr').then((r) => {
        $scope.user = r.data;
        console.log('user', $scope.user)
    })
    $scope.newPost = () => {
        let theText = document.querySelector('#postTxt').value;
        $http.post('/forum/newPost', {
                thread: $scope.thr._id,
                text: new showdown.Converter().makeHtml(theText),
                md:theText,
                file:$scope.file||null
            })
            .then((r) => {
                window.location.reload();
            })
    };
    $scope.vote = (pst, dir) => {
        console.log('voting for', pst, 'direction', dir, 'which is', typeof dir)
        $http.post('/forum/vote', {
            thread:pst.thread,
            post:pst._id,
            voteUp:!!dir
        })
            .then((r) => {
                console.log('vote response is:',r)
                $scope.refThred();
            })
    }
    $scope.quoteMe=(pst)=>{
        document.querySelector('#postTxt').value = '>'+ pst.md;
    }
})
app.controller('inbox-cont',function($scope,$http,userFact){
	$scope.currMsg = 0;
	console.log('PARENT USER IS:',$scope.$parent.user);
	$scope.chMsg = function(dir){
		if(dir && $scope.currMsg<$scope.$parent.user.msgs.length-1){
			console.log('goin up 1 msg')
			$scope.currMsg++;
		}else if(!dir && $scope.currMsg>0){
			$scope.currMsg--;
		}
		$scope.$digest();
	};
	$scope.interpDate =function(d){
		return new Date(d).toUTCString();
	}
	$scope.reply=function(){
		userFact.writeMsg($scope.$parent.user.msgs[$scope.currMsg].from,$scope.$parent.user.name,true);
	}
	$scope.deleteMsg = function(){
		bootbox.confirm('Are you sure you wish to delete this message? Deleted messages are <i>not</i> recoverable!',function(r){
			if(!r || r==null){
				return;
			}else{
				$http.post('/user/delMsg',{
					user:$scope.$parent.user.name,
					id:$scope.$parent.user.msgs[$scope.currMsg].id
				}).then(function(r){
					if(r.data && r.data.name){
						//refresh user.
						$scope.$parent.user = r.data;
						console.log('affected user',$scope.$parent.user)
						angular.element('body').scope().$digest();
						$scope.currMsgs = Math.min($scope.$parent.user.msgs.length-1,$scope.currMsgs);
					}else if (r.data=='err'){
						bootbox.alert('Error deleting message!')
					}
				})
			}
		});
	}
})
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
                    delete r.data.msgs;
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
String.prototype.capMe = function() {
    return this.slice(0, 1).toUpperCase() + this.slice(1);
}
app.controller('main-cont', function($scope, $http, $state, userFact) {
    console.log('main controller registered!')
})

app.controller('nav-cont',function($scope,$http,$state){
	$scope.logout = function() {
        bulmabox.confirm('Logout','Are you sure you wish to logout?', function(resp) {
            if (!resp || resp == null) {
                return true;
            } else {
                $http.get('/user/logout').then(function(r) {
                    console.log(r);
                    $state.go('appSimp.login');
                })
            }
        })
    }
})
resetApp.controller('reset-contr',function($scope,$http){
	$scope.key = window.location.href.slice(window.location.href.lastIndexOf('/')+1)
	$http.get('/user/resetUsr/'+$scope.key).then(function(u){
		$scope.user=u.data;
	});
	$scope.doReset = function(){
		if(!$scope.user || !$scope.pwd || !$scope.pwdDup || $scope.pwdDup!=$scope.pwd ||!$scope.key){
			bootbox.alert('Error: Missing data. Make sure you&rsquo;ve reached this page from a password reset link, and that you have entered the same password in both fields!');
		}else{
			$http.post('/user/resetPwd',{
				acct:$scope.user.name,
				pwd:$scope.pwd,
				key:$scope.key
			}).then(function(r){
				if(r.data=='err'){
					bootbox.alert('There was an error resetting your password.');
				}else{
					window.location.href='../../login';
				}
			})
		}
	}
})
const timezoneList = [
   {
      "value": -12,
      "text": "(GMT -12:00) Eniwetok, Kwajalein"
   },
   {
      "value": -11,
      "text": "(GMT -11:00) Midway Island, Samoa"
   },
   {
      "value": -10,
      "text": "(GMT -10:00) Hawaii"
   },
   {
      "value": -9,
      "text": "(GMT -9:00) Alaska"
   },
   {
      "value": -8,
      "text": "(GMT -8:00) Pacific Time (US & Canada)"
   },
   {
      "value": -7,
      "text": "(GMT -7:00) Mountain Time (US & Canada)"
   },
   {
      "value": -6,
      "text": "(GMT -6:00) Central Time (US & Canada), Mexico City"
   },
   {
      "value": -5,
      "text": "(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima"
   },
   {
      "value": -4,
      "text": "(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz"
   },
   {
      "value": -3.5,
      "text": "(GMT -3:30) Newfoundland"
   },
   {
      "value": -3,
      "text": "(GMT -3:00) Brazil, Buenos Aires, Georgetown"
   },
   {
      "value": -2,
      "text": "(GMT -2:00) Mid-Atlantic"
   },
   {
      "value": -1,
      "text": "(GMT -1:00) Azores, Cape Verde Islands"
   },
   {
      "value": 0,
      "text": "(GMT) Western Europe Time, London, Lisbon, Casablanca"
   },
   {
      "value": 1,
      "text": "(GMT +1:00) Brussels, Copenhagen, Madrid, Paris"
   },
   {
      "value": 2,
      "text": "(GMT +2:00) Kaliningrad, South Africa"
   },
   {
      "value": 3,
      "text": "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"
   },
   {
      "value": 3.5,
      "text": "(GMT +3:30) Tehran"
   },
   {
      "value": 4,
      "text": "(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"
   },
   {
      "value": 4.5,
      "text": "(GMT +4:30) Kabul"
   },
   {
      "value": 5,
      "text": "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"
   },
   {
      "value": 5.5,
      "text": "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"
   },
   {
      "value": 5.75,
      "text": "(GMT +5:45) Kathmandu"
   },
   {
      "value": 6,
      "text": "(GMT +6:00) Almaty, Dhaka, Colombo"
   },
   {
      "value": 7,
      "text": "(GMT +7:00) Bangkok, Hanoi, Jakarta"
   },
   {
      "value": 8,
      "text": "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"
   },
   {
      "value": 9,
      "text": "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"
   },
   {
      "value": 9.5,
      "text": "(GMT +9:30) Adelaide, Darwin"
   },
   {
      "value": 10,
      "text": "(GMT +10:00) Eastern Australia, Guam, Vladivostok"
   },
   {
      "value": 11,
      "text": "(GMT +11:00) Magadan, Solomon Islands, New Caledonia"
   },
   {
      "value": 12,
      "text": "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"
   }
]
app.controller('unconf-cont', function($scope, $http, $state) {
    // $scope.usr = JSON.parse(localStorage.brethUsr).user;
    $scope.logout = function() {
        $http.get('/user/logout').then(function(r) {
            console.log(r);
            $state.go('appSimp.login');
        })
    }
})