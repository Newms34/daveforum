;(function() {
"use strict";

const socket = io(),
    app = angular.module('brethren-app', ['ui.router', 'ngAnimate', 'ngSanitize', 'ngMessages', 'chart.js']),
    resetApp = angular.module('reset-app', []),
    snps = [
        {
            t: '<',
            s: '&lt;'
        },
        {
            t: '>',
            s: '&gt;'
        },
        {
            t: `\[&amp;D[\w+/]+=*\]`,
            s: `<build-template build='$&'></build-template>;`
        }
    ],
    cv = new showdown.Converter();

const defaultPic = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHEAAACNCAIAAAAPTALlAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAANsSURBVHhe7dVRduIwEETR7GkWmK1HhMch9giw1dWyZNf9mZwM2F3vJ1//TM1N9dxUz0313FTPTfVGb/r9Fh8azIhNCbYTXx7AWE3JE8CDDjVEU3pI8egjHN+UBgl4QXdHNmV6Ml7W0WFNWdwFr+zlgKYM7Y7X5+vdlH0H4YhkXZuy7FCckqlfUzYNgIPSdGrKmmFwVo6LNi24LEGPpowYDMclSG/KgiFxotqlmxZcKZXblMMHxqFSiU25enicq+OmN1wsktWUYyfB0SJuesPRIilNuXQqnK7gpuB0BX1TbpwQA8Lc9IkBYW66wIYYcVNOmxYzYtx0gRkxbrrAjBhlU+6aHGMC3HSNMQFuusaYADddY0yAm64xJsBNK9jTStaUc06BSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrdy0gkmt3LSCSa3ctIJJrWRNCy6aH3tauekaYwLcdI0xAW66xpgAN11jTICbrjEmQNm04K5pMSPGTReYEeOmC8yIcdMFZsSImxZcNyEGhLnpEwPC9E0LbpwKpyu4KThdIaVpwaWT4GgRN73haBE3veFokaymBfcOj3N1EpsWXD0wDpVyU73cpgW3D4kT1dKbFiwYDMcl6NG0YMdIuCzBRZtyVo5OTQvWDICD0vRrWrDpUJySqWvTgmUH4YhkvZsW7OuO1+e7SlPe3cXl/kZxTaZOTRk0Bm5Kk96UHePhvgS5TTl/YBwqldWUk2fAxTopTTl2HtwtIm7KjXNiQ5iyKafNjCUxsqYcNT/2BGiacs5ZsKqVoCmHnAvbmkSbcsIZsXC/UFNefl7s3Km9Ka89O9bu0diUF14DmzdracqrroTl27jpJizfZndTXnI97N9gX1Mef1VU+GRHUx58bbR4y033ocVbW5vySNuQdVNTHmYPdHnBTVvQ5YXPTXmMLVGnxk0bUafmQ1MeYDU0+s+7pnzVXqPUkpuGUGrpZVO+ZJ/Q6w83jaLXH24qQLKHelM+a9tQ7cFNBaj2UGnKB20P2v1yUw3a/Vo35SO2HwXdVIiCbipEwVVT/tNa3TO6qdI9o5sq3TO6qVjJ+GzK7yymlHRTsVLSTcVKSZryC1NwUz031XNTPTfVuzXlRxNxUz031XNTPTfVc1M9N9VzU70v/jWV7+8ffZYE08zo+Y8AAAAASUVORK5CYII=';

Array.prototype.findUser = function (u) {
    for (let i = 0; i < this.length; i++) {
        if (this[i].user == u) {
            return i;
        }
    }
    return -1;
}
let hadDirect = false;
const dcRedirect = ['$location', '$q', '$injector', function ($location, $q, $injector) {
    //if we get a 401 response, redirect to login
    let currLoc = '';
    return {
        request: function (config) {
            console.log('STATE', $injector.get('$state'));
            currLoc = $location.path();
            return config;
        },
        requestError: function (rejection) {
            return $q.reject(rejection);
        },
        response: function (result) {
            return result;
        },
        responseError: function (response) {
            console.log('Something bad happened!', response,currLoc, $location.path())
            hadDirect = true;
            bulmabox.alert(`App Restarting`, `Hi! I've made some sort of change just now to make this app more awesome! Unfortunately, this also means I've needed to restart it. I'm gonna log you out now.`, function (r) {
                fetch('/user/logout')
                    .then(r => {
                        hadDirect = false;
                        $state.go('appSimp.login', {}, { reload: true })
                        return $q.reject(response);
                    })
            })
        }
    }
}];
app.constant('imgTypes', ["apng", "bmp", "gif", "ico", "cur", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "png", "svg", "tif", "tiff", "webp"])
app.constant('vidTypes', ["mp4", "avi", "mpg", "webm", "ogg", "flv"])
app.constant('defBlg', {
    title: 'No blog yet!',
    media: { url: 'https://media.giphy.com/media/9J7tdYltWyXIY/giphy.mp4', type: 'mp4' },
    txtHtml: `
    <p class='is-italic'>Just looking for the regular [PAIN] website? Click Sign up/Login up above!</p><br>
    <p>Welcome to Brethren[Pain]!<br>
    Moderators: This platform supports a format known as Markdown. Some basic formatting tricks:</p>
    <table class="table table-striped table-bordered">
    <thead>
    <tr>
    <th><strong>Code</strong></th>
    <th><strong>Action</strong></th>
    <th><strong>Example/Notes</strong></th>
    </tr>
    </thead>
    <tbody>
    <tr>
    <td>*text*</td>
    <td>Italic</td>
    <td>This text is <em>very</em> italic!</td>
    </tr>
    <tr>
    <td>**text**</td>
    <td>Bold</td>
    <td>This text <strong>isn’t</strong> scared of you!</td>
    </tr>
    <tr>
    <td># text</td>
    <td>Heading</td>
    <td>Makes text bigger. The more '#'s there are, the <em>smaller</em> the text will be! Needs to be on its own line.</td>
    </tr>
    <tr>
    <td>- Text</td>
    <td>Bullet point</td>
    <td>Make sure to put an empty line right before this</td>
    </tr>
    <tr>
    <td>1.Text</td>
    <td>Numbered list</td>
    <td>Exactly what it says on the box</td>
    </tr>
    <tr>
    <td>[Link](address)</td>
    <td>Link</td>
    <td><a href="https://www.google.com">Head over to google</a></td>
    </tr>
    <tr>
    <td>![Image](SomeImageAddress)</td>
    <td>Image</td>
    <td>Displays an image. The text between the []s is shown when you hover over the image.</td>
    </tr>
    </tbody>
    </table>
    <p>You can also include optional media (a youtube video, a picture, etc.) using the provided fields</p>`,
    txtMd: `Welcome to Brethren[Pain]!
    Moderators: This platform supports a format known as Markdown. Some basic formatting tricks:
    |**Code**|**Action**|**Example/Notes**|
    |---|---|---|
    |\*text\*|Italic| This text is *very* italic!|
    |\*\*text\*\*|Bold|This text **isn't** scared of you!|
    |# text|Heading|Makes text bigger. The more '#'s there are, the *smaller* the text will be! Needs to be on its own line.|
    | - Text| Bullet point| Make sure to put an empty line right before this|
    | 1.Text| Numbered list|Exactly what it says on the box|
    |\[Link\]\(address\)|Link|[Head over to google](https://www.google.com)|
    |!\[Image\]\(SomeImageAddress\)|Image|Displays an image. The text between the \[\]s is shown when you hover over the image.|
    You can also include optional media (a youtube video, a picture, etc.) using the provided fields`
})
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$sceDelegateProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {
    $locationProvider.html5Mode(true);
    $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://www.youtube.com/**']);
    $urlRouterProvider.otherwise('/404');
    $stateProvider
        .state('app', {
            abstract: true,
            templateUrl: 'layouts/full.html'
        })
        // .state('app.home', {
        //     url: '/', //default route, if not 404
        //     templateUrl: 'components/home.html'
        // })
        .state('app.dash', {
            url: '/dash',
            templateUrl: 'components/dash.html'
        })
        .state('app.chat', {
            url: '/chat',
            templateUrl: 'components/chat.html'
        })
        .state('app.calendar', {
            url: '/calendar',
            templateUrl: 'components/calendar.html'
        })
        .state('app.help', {
            url: '/help',
            templateUrl: 'components/help/help.html'
        })
        .state('app.blog', {
            url: '/blog',
            templateUrl: 'components/blog.html'
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
        .state('app.tools', {
            //indiv Thread
            url: '/tools',
            templateUrl: 'components/tools.html'
        })

        //SIMPLE (login, register, forgot, 404, 500)
        .state('appSimp', {
            abstract: true,
            templateUrl: 'components/layout/simp.html'
        })
        .state('appSimp.home', {
            url: '/',
            templateUrl: 'components/home.html'
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
    //http interceptor stuffs!
    // $httpProvider.interceptors.push(dcRedirect)
}])
    .directive("fileread", [function () {
        return {
            scope: {
                fileread: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    const reader = new FileReader(),
                        theFile = changeEvent.target.files[0],
                        tempName = theFile.name;
                    // console.log('UPLOADING FILE', theFile);
                    reader.onload = function (loadEvent) {
                        let theURI = loadEvent.target.result;
                        // console.log('URI before optional resize', theURI, theURI.length)
                        if (scope.$parent.needsResize) {
                            //needs to resize img (usually for avatar)
                            resizeDataUrl(scope, theURI, scope.$parent.needsResize, scope.$parent.needsResize, tempName);
                        } else {
                            // console.log('APPLYING file to $parent')
                            scope.$apply(function () {
                                if (scope.$parent && scope.$parent.$parent && scope.$parent.$parent.avas) {

                                    scope.$parent.$parent.loadingFile = false;
                                    scope.$parent.$parent.fileName = 'Loaded:' + tempName;
                                    scope.$parent.$parent.fileread = theURI;
                                } else {
                                    scope.$parent.loadingFile = false;
                                    scope.$parent.fileName = 'Loaded:' + tempName;
                                    scope.$parent.fileread = theURI;
                                }
                                if (scope.$parent.saveDataURI && typeof scope.$parent.saveDataURI == 'function') {
                                    scope.$parent.saveDataURI(dataURI);
                                }
                            });
                        }
                    }
                    if (!theFile) {
                        scope.$apply(function () {
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
    }]).directive("buildTemplate", function ($rootScope, $log) {
        return {
            scope: {
                build: "@"
            },
            template: `<div class='build-code' title='Inspect this build'>{{build}}</div>`,
            replace: true,
            restrict: 'E',
            link: function (scope, element, attributes) {
                //first, find loginBase OR logoutBase
                let base = scope;
                while (base.$parent && !base.label) {
                    // console.log('Not yet found base! current:', base, base.label, 'has parent?', base.$parent)
                    base = base.$parent;
                }
                //'base' should now be our all-app base
                // console.log('final base', base.label);
                element.bind('click', function (e) {
                    base.inspectCode(attributes.build);
                })
            }
        }
    }).directive('bindHtmlCompile', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function () {
                    return scope.$eval(attrs.bindHtmlCompile);
                }, function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                });
            }
        };
    }]);

Array.prototype.rotate = function (n) {
    let arrCop = angular.copy(this);
    for (let i = 0; i < n; i++) {
        arrCop.push(arrCop.shift());
    }
    return arrCop;
};
Date.prototype.dyMo = function () {
    return (this.getMonth() + 1) + '/' + this.getDate();
}
String.prototype.titleCase = function () {
    return this.split(/\s/).map(t => t.slice(0, 1).toUpperCase() + t.slice(1).toLowerCase()).join(' ');
}

// Object.prototype.healyCopy = function () {
//     return JSON.parse(JSON.stringify(this));
// }
const resizeDataUrl = (scope, datas, wantedWidth, wantedHeight, tempName) => {
    // We create an image to receive the Data URI
    const img = document.createElement('img');

    // When the event "onload" is triggered we can resize the image.
    img.onload = function () {
        // We create a canvas and get its context.
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // We set the dimensions at the wanted size.
        canvas.width = wantedWidth;
        canvas.height = wantedHeight;

        // We resize the image with the canvas method drawImage();
        ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);

        const dataURI = canvas.toDataURL();
        scope.$apply(function () {
            scope.$parent.loadingFile = false;
            scope.$parent.fileName = 'Loaded:' + tempName;
            scope.fileread = dataURI;
            if (scope.$parent.saveDataURI && typeof scope.$parent.saveDataURI == 'function') {
                //only for avatar
                scope.$parent.saveDataURI(dataURI);
            }
        });
    };

    // We put the Data URI in the image's src attribute
    img.src = datas;
}

String.prototype.sanAndParse = function () {
    /* Replace order:
    1: replace < and > with escape sequences so we're not rendering any HTML
    2: replace build codes with the build-template angular directive
    3: replace color codes with correct 'span' elements ONLY if they're valid colors
    */
    let str = this;
    for (rp of snps) {
        // console.log('replacing', rp.t, 'with', rp.s)
        str = str.replace(new RegExp(rp.t, 'g'), rp.s);
    }
    console.log('validateColor',validateColor)
    return str.replace(/\[c=["']?[\w#\s,\(\)]{2,}['"]?\][^\[]*\[\/c\]/, function (m) {
        // console.log('at beginning of col replace, m is', m)

        const bc = m.indexOf('[c=')+3,
            ec  = m.indexOf(']'),
            bt = m.indexOf(']')+1
            et = m.indexOf('[/'),
            col = m.slice(bc,ec).replace(/['"]/g,''),
            txt = m.slice(bt,et);

        // const col = m.match(/(?<=\[c=['"]?)[\w#\s\(\)]{2,}(?=['"]?\])/) && m.match(/(?<=\[c=['"]?)[\w#\s\(\)]{2,}(?=['"]?\])/)[0],
        //     txt = m.match(/(?<=\])[^\[]{2,}(?=\[\/c\])/) && m.match(/(?<=\])[^\[]{2,}(?=\[\/c\])/)[0];
        //if the color is a valid css col according to validate-color, return a span el. Otherwise, strip out the color tags and simply return the text
        // console.log('M', m, 'COLOR CODE', col, 'TEXT', txt)
        return `<span style='color:${col}'>${txt}</span>`;
    });
    // return this.replace('<', '&lt;').replace('>', '&gt;').replace(/\[&amp;D[\w+/]+=*\]/g, `<build-template build='$&'></build-template>`)
}
String.prototype.md2h = function (noP) {
    if(!!noP){
        return cv.makeHtml(this).slice(3,-4);
    }
    return cv.makeHtml(this);
}

showdown.setOption('tables', true);
app.controller('all-cont', ($scope, $http, $sce, $log) => {
    $scope.label = 'allBase';
    $scope.currBuild = {

    }

    $scope.inspectCode = (c) => {
        $http.get('/tool/build?build=' + encodeURIComponent(c.replace('&amp;', '&'))).then(r => {
            // return console.log('RESPONSE',r)
            $scope.currBuild.data = r.data;
            $scope.currBuild.whichSkill = 0;//for rev, mainly
            // $scope.currBuild.data.skillList = [];
        })
    }
    $scope.noBuild = s => {
        $scope.currBuild.data = null;
    }
    $scope.copyCode = c => {
        $log.debug('attempting to copy', c)
        prompt("Press ctrl-c (cmd-c on Mac) to copy this code!", c.parentNode.querySelector('.build-code').innerText);
    }
    $scope.infoBox = {
        x: 0,
        y: 0,
        data: null
    }
    $scope.skillBox = {
        x: 0,
        y: 0,
        on: false,
        data: {
        }
    }
    $scope.explTrait = (t, e, m) => {
        $scope.infoBox.x = e.screenX;
        $scope.infoBox.y = e.screenY - 50;
        if (t) {
            $scope.infoBox.data = `<div class='is-fullwidth ${t.picked || m ? 'has-text-white' : 'has-text-grey'}'>
            <div class='is-fullwidth is-size-5 has-text-centered'>${t.name}</div>
            <p>${t.desc}</p>
            </div>`;
        } else {
            $scope.infoBox.data = null;
        }
    }
    $scope.explSkill = (s, e, m) => {
        $scope.skillBox.x = e.screenX;
        $scope.skillBox.y = e.screenY - 50;
        if (s) {
            $scope.skillBox.data = s;
            const allUsedTraits = $scope.currBuild.data.specs.map(q => q.usedTraits).flat();
            $scope.skillBox.data.realFacts = s.facts.map((sk, n) => {
                const replaceTrait = s.traited_facts && s.traited_facts.find(q => q.overrides == n);//if truthy, there DOES exist a replacement fact
                if (!!replaceTrait && allUsedTraits.includes(replaceTrait.requires_trait)) {
                    sk = { ...JSON.parse(JSON.stringify(sk)), ...replaceTrait, isTraited: true };
                    $log.debug('FOUND replacement fact', replaceTrait, 'FOR SKILL', s.name, 'REQUIRED TRAIT', replaceTrait.requires_trait, 'SKILL NOW', sk)
                    // sk.isTraited = true;
                }
                return sk;
            })
            $log.debug('SKILL INFO', s, 'CURR BUILD', $scope.currBuild.data, 'USED TRAITS', allUsedTraits)
            $scope.skillBox.on = true;
        } else {
            $scope.skillBox.on = false;
        }
    }
    $scope.tryReconnect = () => {
        $http.get('/alive')
            .then(r => {
                    bulmabox.confirm(`<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Server Restarted`, `There's been an update, and we need to reload the website to restore functionality.<br/>Click Okay to reload, or Cancel to stay on this page.`, function (r) {
                        if (!!r) {
                            window.location.reload();
                        }
                    })
            
            })
            .catch(e => {
                // no reconnect
                setTimeout(function () {
                    $scope.tryReconnect();
                }, 500)
            })
    }
    socket.on('disconnect', function (e) {
        $scope.tryReconnect();
        $log.debug('disconnected!', e)
    })
})
Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

app.controller('cal-cont', function($scope, $http, $state,userFact) {
    $scope.cal = [];
    $scope.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    $scope.calLoaded = false;
    // $scope.repEvent = false;
    $scope.wkOpts = [{
        lbl: 'Every week',
        n: 1
    }, {
        lbl: 'Every two weeks',
        n: 2
    }, {
        lbl: 'Every three weeks',
        n: 3
    }, {
        lbl: 'Every four weeks',
        n: 4
    }, {
        lbl: 'Every five weeks',
        n: 5
    }]
    userFact.getUser()
        .then(r => {
            $scope.user = r.data;
        })
    $scope.refCal = () => {
        $http.get('/cal/all')
            .then((r) => {
                console.log('calendar events response:', r);
                $scope.makeCalendar(r.data);
            })
    };
    socket.on('refCal', (e) => {
        // bulmabox.alert('Refreshing Calendar',`There's been a change to the calendar, so we're refreshing!`,function(r){
        // $state.go($state.current, {}, { reload: true });
        // })
        $scope.refCal()
    })
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
        today.setHours(0, 0, 0, 0); //set day to beginning of the day (12am)
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
                let theDate = new Date(today + (((7 * i) + j)) * 1000 * 3600 * 24);
                newWk.days.push({
                    d: j,
                    evts: data.filter(et => {
                        let dtNum = new Date(et.eventDate).getTime();
                        console.log('THIS DATE DTNUM', dtNum, theDate.getTime())
                        return dtNum > theDate.getTime() && dtNum < (theDate.getTime() + (1000 * 3600 * 24));
                        // && dtNum<(theDate.getTime()+(1000*3600*24))
                    }),
                    date: theDate
                })
            }
            $scope.cal.push(newWk);
        }
        console.log('CAL STUFF', $scope.cal, $scope.offsetDays)
    };
    $scope.viewEvent = (ev) => {
        console.log('View event', ev)
        let payers = null;
        if (ev.paid && ev.paid.length) {
            payers = `<ul class='ul'>
                ${ev.paid.map(up=>'<li> - '+up+'</li>').join('')}
            </ul>`;
        }
        bulmabox.alert(`Event: ${ev.title}`, `Time:${new Date(ev.eventDate).toLocaleString()}<br>Type:${$scope.kindOpts.find(k=>k.kind==ev.kind).kindLong}<br>${payers?'Paid Users<br>'+payers:''}<hr> Description: ${ev.text}`)
    };
    $scope.editEventObj = {
        title: '',
        desc: '',
        day: 0,
        time: (new Date().getHours() + (new Date().getMinutes() < 30 ? 0.5 : 0)) * 2,
        kind: 'lotto',
        id: null
    }
    $scope.clearEdit = () => {
        $scope.editEventAct = false;
    }
    $scope.editEventAct = false;
    $scope.editEvent = (ev) => {
        $scope.editEventAct = true;
        console.log('Edit event', ev, 'hour options', $scope.hourOpts)
        const beginningOfDay = new Date(ev.eventDate).setHours(0, 0, 0, 0),
            now = Date.now();
        $scope.editEventObj = {
            title: ev.title,
            desc: ev.text,
            kind: $scope.kindOpts.find(k => k.kind == ev.kind),
            time: Math.floor((ev.eventDate - beginningOfDay) / (30 * 60 * 1000)),
            day: Math.round((ev.eventDate - now) / (3600 * 1000 * 24)),
            id: ev._id,
            user: ev.user
        }
    };
    $scope.doEdit = () => {
        console.log('Input edit event', $scope.editEventObj)
        const today = new Date();
        let baseDay = $scope.editEventObj.day,
        baseTime = $scope.editEventObj.time;
        if (!new Date().isDstObserved()) {
            baseTime += 2;
            if (baseTime > 47) {
                baseTime = baseTime % 47;
                baseDay++;
            }
        }
        today.setHours(0, 0, 0, 0);
        let time = today.getTime() + (baseTime * 1800 * 1000) + (baseDay * 3600 * 1000 * 24);
        console.log('Sending event', $scope.editEventObj, time);
        // return false;
        if (time < (Date.now() + (5 * 60 * 1000))) {
            //time selected is less than 5 minutes past "now"
            bulmabox.alert('Time Expiring', `Your selected time, ${new Date(time).toLocaleString()}, occurs too soon! Please select a later time.`)
            return false;
        }
        $http.post('/cal/edit', {
                title: $scope.editEventObj.title,
                text: $scope.editEventObj.desc,
                eventDate: time,
                kind: $scope.editEventObj.kind.kind,
                id: $scope.editEventObj.id,
                user: $scope.editEventObj.user
            })
            .then(function(r) {
                console.log('edit event response', r)
                if (r.data == 'wrongUser') {
                    bulmabox.alert('<i class="fa fa-exclamation-triangle"></i> Wrong User', 'You cannot edit this event, as you are not its creator and are not a moderator.');
                }
                $scope.refCal()
                $scope.clearEdit()
            })
    }
    $scope.delEvent = (ev) => {
        console.log('Delete event', ev)
        bulmabox.confirm('Delete Event', `Are you sure you wish to delete the following event?<br> Title: ${ev.title}<br>Description: ${ev.text}`, function(r) {
            if (!r || r == null) {
                return false;
            } else {
                //delete!
                $http.get('/cal/del?id=' + ev._id).then(function(r) {
                    console.log('delete response', r)
                    $scope.refCal();
                })
            }
        })
    };
    $scope.addEvent = false;
    $scope.newEventObj = {
        title: '',
        desc: '',
        day: 0,
        time: (new Date().getHours() + (new Date().getMinutes() < 30 ? 0.5 : 0)) * 2,
        kind: 'lotto',
        repeatNum: 1,
        repeatOn: false,
        repeatFreq: 1
    };
    userFact.getUsers()
        .then(au => {
            $scope.allUsrs = au.data.map(u => u.user);
        })

    $scope.addPaid = (ev) => {
        const lto = $scope.allUsrs.filter(pu => !ev.paid || !ev.paid.length || ev.paid.indexOf(pu) < 0).map(uo => {
            return `<option value='${uo}'>${uo}</option>`
        }).join(''); //find all users where the event either HAS no paid users, OR the user is not in the list yet.
        bulmabox.custom('Add Paid User', `Select a user from the list below to add them to this lotto\'s candidates:<br><p class='select'><select id='payusr'>${lto}</select></p>`, function() {
            let pyusr = document.querySelector('#payusr').value;
            console.log('User wishes to add', pyusr)
            $http.post('/cal/lottoPay', { lottoId: ev._id, pusr: pyusr })
        })
    }
    $scope.hourOpts = new Array(48).fill(100).map((c, i) => {
        let post = i < 24 ? 'AM' : 'PM',
            hr = Math.floor((i) / 2) < 13 ? Math.floor((i) / 2) : Math.floor((i) / 2) - 12;
        if (hr < 1) {
            hr = 12
        }
        return {
            num: i,
            hr: (hr) + (i % 2 ? ':30' : ':00') + post
        }
    });
    $scope.dayOpts = new Array(42).fill(100).map((c, i) => {
        let theDay = new Date(Date.now() + (i * 3600 * 1000 * 24));
        return {
            num: i,
            day: (theDay.getMonth() + 1) + '/' + theDay.getDate()
        }
    });
    $scope.kindOpts = [{
        kind: 'lotto',
        desc: 'An item or items will be given away by a [PAIN] member to one lucky guild member!',
        kindLong: 'Lottery/Giveaway'
    }, {
        kind: 'payLotto',
        desc: 'Try your luck! One lucky winner will win the pool of donations!',
        kindLong: 'Paid Lottery/Giveaway'
    }, {
        kind: 'announce',
        desc: 'Someone needs to make an important announcement!',
        kindLong: 'Announcement'
    }, {
        kind: 'contest',
        desc: 'Some sort of contest! See who\'s the best!',
        kindLong: 'Contest'
    }, {
        kind: 'other',
        desc: 'Any other event type',
        kindLong: 'Other'
    }]
    $scope.doAdd = () => {
        //send event!
        const today = new Date();
        let baseTime = $scope.newEventObj.time,
            baseDay = $scope.newEventObj.day;
        // console.log('ORIGINAL DATE STUFF',baseTime,baseDay)
        today.setHours(0, 0, 0, 0);
        //dst handlers
        if (!new Date().isDstObserved()) {
            baseTime += 2;
            if (baseTime > 47) {
                baseTime = baseTime % 47;
                baseDay++;
            }
        }
        // console.log('NOW DATE STUFF',baseTime,baseDay)
        //end dst
        let time = today.getTime() + (baseTime * 1800 * 1000) + (baseDay * 3600 * 1000 * 24);
        let theUrl = $scope.newEventObj.repeatOn ? '/cal/newRep' : '/cal/new';
        if (time < (Date.now() + (5 * 60 * 1000))) {
            //time selected is less than 5 minutes past "now"
            bulmabox.alert('Time Expiring', `Your selected time, ${new Date(time).toLocaleString()}, occurs too soon! Please select a later time.`)
            return false;
        }
        console.log('Sending event', $scope.newEventObj, time)
        // return false; //short circuit when we need to debug
        $http.post(theUrl, {
                title: $scope.newEventObj.title,
                text: $scope.newEventObj.desc,
                eventDate: time,
                kind: $scope.newEventObj.kind.kind,
                repeatNum: $scope.newEventObj.repeatNum,
                repeatFreq: $scope.newEventObj.repeatFreq,
                repeatOn: $scope.newEventObj.repeatOn
            })
            .then(function(r) {
                console.log('new event response', r)
                $scope.refCal()
                $scope.clearAdd()
            })
    }
    $scope.clearAdd = () => {
        $scope.addEvent = false;
        $scope.newEventObj = {
            title: '',
            desc: '',
            day: 0,
            time: (new Date().getHours() + (new Date().getMinutes() < 30 ? 0.5 : 0)) * 2,
            kind: 'lotto',
            repeatNum: 1,
            repeatFreq: 1,
            repeatOn: false
        }
    }
})
app.controller('chat-cont', function ($scope, $http, $state, $filter, $sce,userFact) {
    userFact.getUser()
        .then(r => {
            $scope.doUser(r.data);
            console.log('user', $scope.user)
        });
    $scope.msgs = [];
    $scope.doUser = (u) => {
        if (!u) {
            return false;
        }
        $scope.user = u;
        $scope.msgs.push({
            time: Date.now(),
            user: 'System',
            msg: 'Welcome to Brethren [PAIN] Chat! You\'re logged in as ' + u.user + '. Try /wiki or /google to search for stuff!',
            isSys: true
        })
    }
    $scope.parseMsg = (t) => {
        if (t.indexOf('/wiki ') === 0) {
            return `Wiki: <a href="https://wiki.guildwars2.com/wiki/${t.slice(6)}" target="_blank">${t.slice(6)}</a>`
        } else if (t.indexOf('/google ') === 0) {
            return `Google: <a href="https://www.google.com/search?q=${t.slice(8)}" target="_blank">${t.slice(8)}</a>`
        }
        return t;
    }
    userFact.getUsers()
        .then((au) => {
            //Auch!
            console.log('all users is', au)
            $scope.allUsers = au.data;
        });
    socket.on('msgOut', function (msg) {
        console.log('raw msg', msg)
        // console.log($scope.parseMsg(msg.msg),'IS THE MESSAGE')
        msg.msg = $sce.trustAsHtml($scope.parseMsg(msg.msg));
        $scope.msgs.push(msg);
        if ($scope.msgs.length > 100) {
            $scope.msgs.shift();
        }
        $scope.$apply()
        //scroll to bottom of chat window? HAO DU
        document.querySelector('#chat-container').scrollTop = document.querySelector('#chat-container').scrollHeight;
    })
    socket.on('disconnect', function () {
        $scope.msgs.push({
            time: Date.now(),
            user: 'System',
            msg: 'Warning: The connection to the server was lost. Until you refresh, chat\'s probably gonna be pretty quiet!',
            isSys: true
        });
        if ($scope.msgs.length > 100) {
            $scope.msgs.shift();
        }
        $scope.$apply()
        //scroll to bottom of chat window? HAO DU
        document.querySelector('#chat-container').scrollTop = document.querySelector('#chat-container').scrollHeight;
    })
    socket.on('allNames', d => {
        if (d.user == $scope.user.user) {
            //nneed msg (from names), user, time
            d.msg = $sce.trustAsHtml(`Users online: ${d.names.join(', ')}`);
            d.isSys = true;
            $scope.msgs.push(d);
            if ($scope.msgs.length > 100) {
                $scope.msgs.shift();
            }
            $scope.$apply()
            document.querySelector('#chat-container').scrollTop = document.querySelector('#chat-container').scrollHeight;
        }
        return false;
    })
    $scope.sendChat = () => {
        if (!$scope.newMsg) {
            return false;
        } else if ($scope.newMsg.toLowerCase() == '/list') {
            socket.emit('getOnline', { u: $scope.user.user })
        } else {
            if ($scope.newMsg.toLowerCase().startsWith('/disc')) {
                socket.emit('toDiscord', {
                    u: $scope.user.user,
                    msg: $scope.newMsg.replace('/disc', '')
                })
            }
            socket.emit('chatMsg', {
                user: $scope.user.user,
                msg: $scope.newMsg.sanAndParse().md2h(true)
            })
        }
        $scope.newMsg = '';
    }
})
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
const conv = new showdown.Converter(),
copyObj = o=>JSON.parse(JSON.stringify(o)),
    ytu = ['http://www.youtube.com/watch?v=&lt;VIDEO-CODE&gt;', 'http://www.youtube.com/v/&lt;VIDEO-CODE&gt;', 'http://youtu.be/&lt;VIDEO-CODE&gt;', 'https://www.youtube.com/embed/&lt;VIDEO-CODE&gt;', '&lt;VIDEO-CODE&gt;'];
app.controller('edit-cont', ($scope, $sce, $http, imgTypes, vidTypes, defBlg,$log) => {
    $scope.postList = null;
    $scope.getAllPosts = (id) => {
        $http.get('/blog/allBlogs').then(r => {
            $scope.postList = r.data.sort((a, b) => {
                return a.time - b.time;
            });
            //either select the most recent blog (if none was previously selected) or the previously selected blog.
            $scope.currBlg = (id ? $scope.postList.find(q => q.pid == id) : copyObj($scope.postList[0]));
            $log.debug('ALL POSTS', $scope.postList, 'SELECTED POST', $scope.currBlg)
        })
    }
    $scope.getAllPosts();
    $scope.toDate = t => new Date(t).toLocaleString();
    // $log.debug('imgTypes are',imgTypes)
    $scope.includesFormat = (which, format) => {
        return (which == 'vid' && vidTypes.includes(format)) || (which == 'img' && imgTypes.includes(format));
    }
    $scope.getYoutubeUrl = id => {
        return $sce.trustAsResourceUrl(`https://www.youtube.com/embed/${id}?controls=0`);
    }
    $scope.edit = {
        hasMedia: false
    };
    $scope.mediaEdit = {};
    $scope.blgInst = defBlg;
    $scope.parseMd = t => {
        return t && t.sanAndParse().md2h();
    }
    $scope.hideInst = true;
    $scope.changeMedia = function () {
        // $log.debug('New media is:',$scope.getMediaInfo($scope.currBlg.media.url))
        $scope.getMediaInfo($scope.currBlg.media.url).then(r => {
            $scope.currBlg.media = copyObj(r);
            $scope.edit.media = false;
            $scope.$digest();
        });
    }
    $scope.getMediaInfo = function (u) {
        return new Promise(function (resolve, reject) {
            const p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
            $log.debug('at top of promise, url is', u)
            if (u.match(p)) {
                //valid youtube URL; just return
                return resolve({
                    mediaType: 'youtube',
                    url: RegExp.$1
                })
            } else if (`https://youtu.be/${u}`.match(p)) {
                return resolve({
                    mediaType: 'youtube',
                    url: u
                })
            }
            //test https://i.imgur.com/Q5Kd08U.png
            $http.get(u).then(r => {
                const ct = r.headers()['content-type'].split('/');
                $log.debug(r, r.headers(), ct)
                if (!imgTypes.includes(ct[1]) && !vidTypes.includes(ct[1].split(';')[0])) {
                    bulmabox.alert('Unsupported File Type', `Sorry, but we don't currently support that file type (we think it's ${ct[1]}).<br/>
                    Supported file types are:<br/>
                    <div class='content columns'>
                        <div class='column'>
                            <strong><i class='fa fa-picture-o'></i>&nbsp;Images:</strong>
                            <ul>
                                ${imgTypes.map(q => "<li>." + q.toUpperCase() + "</li>").join('')}
                            </ul>
                        </div>
                        <div class='column'>
                            <strong><i class='fa fa-video-camera'></i>&nbsp;Videos:</strong>
                            <ul>
                                ${vidTypes.map(q => "<li>." + q.toUpperCase() + "</li>").join('')}
                            </ul>
                            <br/>
                            <strong><i class='fa fa-youtube-square'></i>&nbsp;Youtube:</strong>
                            <ul>
                                ${ytu.map(q => "<li>" + q + "</li>").join('')}
                            </ul>
                        </div>
                    </div>`)
                    return reject(false)
                }
                return resolve({
                    mediaType: ct[1],
                    url: u
                })
            }, e => {
                //cannot read external file. This is (sort of!) fine, as it means we wouldn't be able to load it in a blogpost anyway!
                bulmabox.alert('Cannot Read', `<div class='content'>Sorry, but we can't read that external file. Check to make sure:
                <ul>
                <li>The file actually exists at the specified location (i.e., you spelled the URL correctly)</li>
                <li>The file is publically available (i.e., does not require authorization or something)</li>
                <li>The file is not protected by Cross-Origin Resource Sharing protocols, aka the stupidest idea anyone on the internet ever came up with (<a href='https://en.wikipedia.org/wiki/Cross-origin_resource_sharing'>here</a>).</li>
                </ul>
                </div>`)
                return reject(false);
            })
        })
    }
    $scope.waitings = {

    }
    $scope.emptyBlog = {
        title: 'Enter a title',
        pid: null,
        txtMd: 'Tell us something!',
        media: {
            url: '',
            mediaType: null,
        }
    }
    $scope.verifyBlgCh = hasEdit => {
        $scope.waitings.changeBlg = true;
        $log.debug('CurrBlg?',$scope.currBlg,'hasEdit',hasEdit)
        if ($scope.currBlg) {
            $http.get('/blog/blog?pid=' + $scope.currBlg.pid)
                .then(r => {
                    //now compare this "saved" blog to our current currBlg
                    if (r.data && [r.data.title != $scope.currBlg.title, r.data.media.mediaType != $scope.currBlg.media.mediaType, r.data.media.url != $scope.currBlg.media.url, r.data.txtMd != $scope.currBlg.txtMd].filter(q => !!q).length) {
                        bulmabox.confirm('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Discard changes', `The blog post ${$scope.currBlg.title} has been modified. Switching blogs posts now will discard those changes. Switch anyway?`, r => {
                            if (!!r) {
                                $log.debug('current blog was changed. Said yes to discard; discarding and changing')
                                $scope.currBlg = hasEdit? copyObj(hasEdit):copyObj($scope.emptyBlog);
                            }
                            else {
                                $scope.candBlg = '';
                            }
                            $scope.waitings.changeBlg = false;
                            $scope.$digest();
                        })
                    } else {
                        //no changes
                        $scope.currBlg = hasEdit? copyObj(hasEdit):copyObj($scope.emptyBlog);
                        $scope.waitings.changeBlg = false;
                    }
                })
        }
    }
    $scope.saveBlog = b=>{
        //first, decide whether POST (new blog) or PUT (edit blog)
        let saveMeth;
        if(b.pid){
            saveMeth = 'PUT'
        }else{
            saveMeth = 'POST'
        }
        b.txtHtml = null;//delete HTML, just in case. We'll rebuild it on the backend!
        $http({
            method:saveMeth,
            url:'/blog/blog',
            data:b
        }).then(r=>{
            bulmabox.alert('Saved!','Your post has been saved!')
        })
    }
})
app.controller('forum-cat-cont', function($scope, $http, $state, $location,userFact) {
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    userFact.getUser()
        .then(r => {
            $scope.user = r.data;
            console.log('user', $scope.user)
        });
    $scope.newThr = {};
    $scope.fileName = null;
    //how do we wanna structure the forum obj?
    //structure is gonna be categories --> threads ---> indiv posts
    $scope.currCat = $location.search().c;
    $scope.refCat = () => {
        $http.get('/forum/byCat?grp=' + $scope.currCat)
            .then(function(r) {
                console.log('thrds in this cat', r)
                $scope.threads = r.data.sort((a, b) => {
                    //also need to sort by boolean 'stickied'
                    // return a.lastUpd - b.lastUpd;
                    if (a.stickied === b.stickied)
                        return a.lastUpd - b.lastUpd;
                    else if (a.stickied)
                        return -1;
                    else return 1;
                }).map(t=>{
                    t.time = new Date(t.lastUpd)
                    return t;
                });
                // $scope.$apply();
            })
    }
    $scope.refCat();
    $scope.newThrDial = () => {
        $scope.makingThread = true;
    }
    $scope.clearThread = () => {
        $scope.newThr = {};
        $scope.makingThread = false;
        $scope.loadingFile = false;
    }
    $scope.loadFile = () => {
        $scope.loadingFile = true;
        const fr = new FileReader();
    }
    $scope.deleteThread = (e, thr) => {
        e.stopPropagation();
        e.preventDefault();
        bulmabox.confirm('Delete Thread', `Are you absolutely sure you wish to delete the thread '${thr.title}'? <br>Please note that this process is <em>not</em> reversable!`, (resp) => {
            if (!resp || resp == null) {
                return false;
            } else {
                console.log('Deleting thread', thr)
                $http.delete('/forum/deleteThread?id=' + thr._id)
                    .then(r => {
                        $state.go($state.current, {}, { reload: true });
                    })
            }
        })
    }
    $scope.makeThread = () => {
        $scope.newThr.md = $scope.newThr.txt;
        $scope.newThr.text = new showdown.Converter().makeHtml($scope.newThr.txt);
        $scope.newThr.grp = $scope.currCat;
        // console.log('newThr:',$scope.newThr);
        // return false;
        $http.post('/forum/thread', $scope.newThr)
            .then(function(r) {
                console.log('new thred response', r)
                $state.go($state.current, {}, { reload: true });
            })
    }
    $scope.toggleSticky = (e, t) => {
        e.stopPropagation();
        e.preventDefault();
        $http.get('/forum/toggleSticky?id=' + t)
            .then(r => {
                console.log('response from thread sticky toggle is', r)
                $scope.refCat();
            })
    }
    $scope.toggleLock = (e, t) => {
        e.stopPropagation();
        e.preventDefault();
        $http.get('/forum/toggleLock?id=' + t)
            .then(r => {
                console.log('response from thread lock toggle is', r)
                $scope.refCat();
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
app.controller('forum-cont', function($scope, $http, $state,$sce,$log) {
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
            $log.debug('CATS',r)
            $scope.forObj = forCats.map(ct => {
                return {
                    name: ct,
                    count: r.data[ct].n,
                    time: r.data[ct].t > 0 ? new Date(r.data[ct].t) : null
                }
            })
        })
    //search stuffs
    $scope.searchin=false;
    $scope.search = '';
    $scope.searchTimer = null;
    $scope.doSearch = () => {
        if ($scope.searchTimer) {
            clearTimeout($scope.searchTimer);
        }
        $scope.searchTimer = setTimeout(function() {
            if ($scope.search && $scope.search.length) {
                $http.post('/forum/searchThr', { term: $scope.search })
                    .then(r => {
                        $log.debug('search response', r);
                        $scope.searchResults = r.data;
                    })
            }
        }, 500)
    }
    //end search stuff
    $scope.goCat = function(n) {
        $state.go('app.forumCat', { c: n })
    }
})
app.controller('forum-thr-cont', function ($scope, $http, $state, $location, $sce, userFact, $log) {
    $scope.currMsg = 0;
    $scope.defaultPic = defaultPic;
    $scope.forObj = {};
    $scope.fileName = null
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    $scope.loadingFile = false;
    $scope.loadFile = () => {
        $scope.loadingFile = true;
        const fr = new FileReader();
    }
    $scope.currCat = $location.search().c;
    $scope.id = $location.search().t;
    // $log.debug($scope.currCat,)
    $scope.refThred = () => {
        $log.debug('info to back:', $scope.id)
        $http.get('/forum/thread?id=' + $scope.id)
            .then((r) => {
                $log.debug('response', r)
                $scope.thr = r.data.thrd;
                r.data.psts.map(ps => {
                    ps.rawText = ps.text;
                    ps.text = $sce.trustAsHtml(ps.text);
                    ps.date = new Date(ps.lastUpd).toLocaleString();
                    ps.wasEdited = ps.lastUpd != ps.createDate;
                    return ps;
                });
                $scope.avas = r.data.ava;
                $scope.thr.posts = $scope.thr.posts.map((psth, n) => {
                    // $log.debug('PSTH', psth, r.data.psts.filter(psps => psps._id == psth.id)[0])
                    const thePst = r.data.psts.filter(psps => psps._id == psth.id)[0];
                    thePst.votesUp = psth.votesUp;
                    thePst.votesDown = psth.votesDown;
                    thePst.byMod = r.data.mods.indexOf(thePst.user) > -1;
                    thePst.showMdBox = false;
                    thePst.num = n;//used for ID
                    thePst.order = psth.order;
                    return r.data.psts.filter(psps => psps._id == psth.id)[0];
                }).sort((a, b) => {
                    return a.order - b.order;
                })
                $log.debug('thred response', $scope.thr, r);
            })
    }
    $scope.refThred();
    userFact.getUser()
        .then((r) => {
            $scope.user = r.data;
            $log.debug('user', $scope.user)
        })
    $scope.newPost = () => {
        let theText = document.querySelector('#postTxt').value;
        $log.debug('new POST', theText, $scope.fileread);
        if (!theText && !$scope.fileread) {
            bulmabox.alert('Say Something', `You can't just post nothing!`);
            return false;
        }
        // return $log.debug(new showdown.Converter().makeHtml(theText).replace('&amp;','&').replace(/\[&D[\w+/]+=*\]/g, `<build-template build='$&'></build-template>`))
        $http.post('/forum/post', {
            thread: $scope.thr._id,
            md: theText,
            file: $scope.fileread || null
        })
            .then((r) => {
                window.location.reload();
            })
    };
    $scope.vote = (pst, dir) => {
        $log.debug('voting for', pst, 'direction', dir, 'which is', typeof dir)
        $http.post('/forum/vote', {
            thread: pst.thread,
            post: pst._id,
            voteUp: !!dir
        })
            .then((r) => {
                $log.debug('vote response is:', r)
                $scope.refThred();
            })
    }
    $scope.quoteMe = (pst) => {
        document.querySelector('#postTxt').value = pst.md.split('\n').map(q => '>' + q).join('\n');
    }
    $scope.getBuildTimer = null;
    $scope.currBuild = {
        data: null,
    };
    $scope.doEdit = p => {
        p.md=p.showMdBox;
        $http.put('/forum/post', p)
            .then(r => {
                $scope.refThred();
            })
            .catch(e => {
                bulmabox.alert('Error updating post', 'There was an issue updating this post. Sorry!')
            })
    }
    $scope.toggleMdBox = p => {
        //we can only have ONE edit-box active at a time, so:
        //find one that's not this box, has a truthy showMdBox (edited stuff) and the showMdBox is not the original post text.
        const alreadyOpenBox = $scope.thr.posts.find(q => q._id != p && !!q.showMdBox && q.showMdBox != q.md);
        if (!!alreadyOpenBox) {
            bulmabox.confirm('Discard Changes', 'Are you sure you wish to discard your changes to the other post?', r => {
                console.log('DISCARD RESPONSE', r)
                if (!!r) {
                    $scope.doMdToggle(p);
                    $scope.$digest();
                } else {
                    return false;
                }
            })
        } else {
            $scope.doMdToggle(p);
        }
    }
    $scope.doMdToggle = (id) => {
        console.log('Changing post', id)
        if (!!id) {
            const targetPost = $scope.thr.posts.find(q => q._id == id);
            if (targetPost.showMdBox) {
                targetPost.showMdBox = false;
            } else {
                targetPost.showMdBox = targetPost.md;
            }
        }
        $scope.thr.posts = $scope.thr.posts.map(op => {
            console.log('LOOKING AT POST', op, op._id, id, op.showMdBox)
            if (op._id != id && !!op.showMdBox) {
                console.log('above post was reset, maybe')
                op.showMdBox = false;
                // $scope.$apply();
            }
            return op;
        })

    }
    window.addEventListener('keyup', e => {
        const targId = e.target.id,
            isEditBox = targId.match(/^edit-box-\d+$/);
        if (!isEditBox) {
            return false;
        }
        const pNum = Number(isEditBox[0].slice(isEditBox[0].lastIndexOf('-') + 1)),
            pst = $scope.thr.posts.find(q => q.num == pNum);
        if (e.key == 'Escape') {
            $scope.toggleMdBox(null)
            $scope.$digest();
        }else if(e.shiftKey && e.key=='Enter'){
            e.preventDefault();
            e.stopPropagation();
            $scope.doEdit(pst);
            // console.log('Submitting post',pst)
        }
    });
    $scope.removePost = p =>{
        // bulmabox.custom(`Remove Post`,`$`)
        bulmabox.custom('Remove Post', `<div class="is-fullwidth">
        Are you absolutely sure you wish to mark this post as removed? This process is not reversable!
        <hr/>
        <label class='has-text-weight-bold'>To confirm, please enter your password: <input type='password' id='rem-pwd' placeholder='Password to confirm'/></label>
        </div>`, () => {
            // console.log('User trying to send post',p)
            $http.put('/forum/removePost',{pst:p,pwd:document.querySelector('#rem-pwd').value}).then(r=>{
                $scope.refThred();
            }).catch(e=>{
                bulmabox.alert('Cannot Remove Post','There was an error removing that post. Sorry!')
            })
        }, `<button class='button is-warning' onclick='bulmabox.runCb(bulmabox.params.cb,true,false)'><i class='fa fa-check'></i>&nbsp;Remove</button>
        <button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'><i class='fa fa-times'></i>&nbsp;Cancel</button>`)
    }
})
app.controller('help-cont', ($scope,$sce) => {
    $scope.tabs = [{
        title: 'General Usage',
        icon:'users'
    }, {
        title: 'Posting and Formatting',
        icon:'pencil-square'
    }, {
        title: 'Terms of Service and Rules.',
        icon:'gavel'
    }];
    $scope.siteSections=[{
        title:'Home',
        descs:[`Only viewable while logged out`,`See blog entries posted by our mod team!`],
        icon:''
    },{
        title:'Dashboard',
        descs:[`View and edit your personal information, such as characters, account name, or game preferences`,`Look at other members' profiles`,`Send and receive messages from other Brethren members`,`View a list of upcoming events`],
        icon:'tachometer'
    },{
        title:'Calendar',
        descs:[`Create, edit, or just view guild events`,`It's a work in progress, so lemme know if it breaks!`],
        icon:'calendar'
    },{
        title:'Chat',
        descs:[`Talk with other guild members!`,`Chat is <em>not</em> preserved, but still, be nice!`,`See the <i class="fa fa-pencil-square"></i>&nbsp;Posting and Formatting tab for more details on how to make your text awesome.`], 
        icon:'comments'
    },{
        title:'Forums',
        descs:[`Got a message you want everyone to see? Post it here`,`You can even include a (relatively small!) picture`,`Be nice!`,`You can vote on posts too, if that's your thing.`,`See the <i class="fa fa-pencil-square"></i>&nbsp;Posting and Formatting tab for more details on how to make your text awesome.`], 
        icon:'commenting-o'
    },{
        title:'Tools',
        descs:[`Contains a bunch of "convenience" tools`,`List of today's and tomorrow's daily achievements (only for general, fractal, pvp, and wvw dailies for now!)`,`Current World versus World (WvW) matchup statistics`,`Core to Lodestone upgrade calculator`,`Tier six fine material upgrade calculator`], 
        icon:'wrench'
    },{
        title:'Help',
        descs:[`You're looking at it. Hi!`], 
        icon:'question-circle'
    }]
    $scope.currTab=0;
    $scope.setTab = n=>{
        $scope.currTab=n;
        // $scope.$digest();
    }
    $scope.mdCodes=[{
        md:`*text*, _text_`,
        html:`<em>text</em>`,
        notes:'Italic text.'
    },{
        md:`**text**`,
        html:`<b>text</b>`,
        notes:'Bold text.'
    },{
        md:`#text`,
        html:`<span class='is-size-3'>text</span>`,
        notes:'Bigger text. The more "#"s there are, the <em>smaller</em> the text will be (up to a maximum of 6).'
    },{
        md:`[link text](https://www.google.com)`,
        html:`<a href='https://www.google.com'>link text</a>`,
        htmlReal:`<a href='https://www.google.com' class='no-blue-link' target='_blank'>link text</a>`,
        notes:'Creates a link.'
    },{
        md:`|ColumnA|ColumnB|ColumnC|
        |---|---|---|
        |apple|banana|cherry|
        |Airedale|Bichon|Chihuahua|`,
        html:`<table>
        <thead>
            <tr>
                <th>ColumnA</th>
                <th>ColumnB</th>
                <th>ColumnC</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>apple</td>
                <td>banana</td>
                <td>cherry</td>
            </tr>
            <tr>
                <td>Airedale</td>
                <td>Bichon</td>
                <td>Chihuahua</td>
            </tr>
        </tbody>
    </table>`,
        htmlReal:`<table>
        <thead>
            <tr>
                <th style='color:#222;!important'>ColumnA</th>
                <th style='color:#222;!important'>ColumnB</th>
                <th style='color:#222;!important'>ColumnC</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>apple</td>
                <td>banana</td>
                <td>cherry</td>
            </tr>
            <tr>
                <td>Airedale</td>
                <td>Bichon</td>
                <td>Chihuahua</td>
            </tr>
        </tbody>
    </table>`,
        notes:'Creates a table.'
    },{
        md:`Unda da [c='blue']sea[/c]!`,
        html:`Unda da <span style='color:blue;'>sea</span>!`,
        notes:'Colored text. For you code-savvy folks, this accepts any CSS-compatible color format, including color names, hex, RGB, and HSL'
    },{
        md:`![awesome img description](some-img-address)`,
        html:`<img src='some-img-address' alt='awesome img description'/>`,
        htmlReal:`<img src='./img/icons/android-icon-72x72.png' alt='awesome img description'/>`,
        notes:'An image. Must be hosted somewhere else!'
    },{
        md:`\`foo==bar\``,
        html:`<code>foo==bar</code>`,
        notes:'Inline code.'
    },{
        md:`
        \`\`\`
        awesomeCode('isAwesome');
        \`\`\`
        `,
        html:`<pre>            
awesomeCode('isAwesome');
</pre>
        `,
        notes:'Pre-formatted code "block".'
    },{
        md:`[&DQgnNzI1Ii6bAAAAgAAAAHYAAABwAQAAkgAAAAAAAAAAAAAAAAAAAAAAAAA=]`,
        html:`(build code)`,
        htmlReal:`<build-template build='[&DQgnNzI1Ii6bAAAAgAAAAHYAAABwAQAAkgAAAAAAAAAAAAAAAAAAAAAAAAA=]'></build-template>`,
        notes: `Creates a clickable build code.`
    }];
    $scope.trustMe = s=>$sce.trustAsHtml(s);
})
app.controller('home-cont', function ($scope, $http, $state, $sce, imgTypes, vidTypes, defBlg,$log,$compile) {
    $http.get('/user/memberCount').then(r => {
        $scope.memberCount = { counts: r.data, types: Object.keys(r.data) };
        $log.debug('MEMBERS', $scope.memberCount)
        $scope.currMems = 0;
        setInterval(function () {
            document.querySelector('#fadey-count').classList.add('fader-on')
            setTimeout(function () {
                $scope.currMems = ($scope.currMems + 1) % ($scope.memberCount.types.length - 1);
                $scope.$digest()
                document.querySelector('#fadey-count').classList.remove('fader-on')
            }, 760)
        }, 10000)
    })
    $scope.defBlg = defBlg;
    $scope.currVid = null;
    $scope.blogs = [];
    $scope.getPosts = s => {
        //get more posts. Runs once when page loads, and again when we reach the bottom of the page (infinite scrolling)
        $http.get('/blog/blogs?n=5&s=' + (s || 0))
            .then(r => {
                const allTitles = $scope.blogs.map(q=>q.title);
                $log.debug(allTitles)
                $scope.blogs = $scope.blogs.concat(r.data.filter(a=>!allTitles.includes(a.title)));
                $scope.gettingBlogs = false;
            })
    }
    $scope.getPosts();

    $scope.includesFormat = (which, format) => {
        return (which == 'vid' && vidTypes.includes(format)) || (which == 'img' && imgTypes.includes(format));
    }
    $scope.getYoutubeUrl = id => {
        return $sce.trustAsResourceUrl(`https://www.youtube.com/embed/${id}?controls=0`);
    }
    $scope.toDate = t => new Date(t).toLocaleString();
    //detect scroll to bottom
    //below taken from http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
    function getScrollXY() {
        if (typeof (window.pageYOffset) == 'number') {
            //Netscape compliant
            return window.pageYOffset;
        } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
            //DOM compliant
            return document.body.scrollTop;
        } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
            //IE6 standards compliant mode
            return document.documentElement.scrollTop;
        }
    }

    //taken from http://james.padolsey.com/javascript/get-document-height-cross-browser/
    function getDocHeight() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    }

    document.addEventListener("scroll", function (event) {
        // $log.debug(getDocHeight(),getScrollXY(),window.innerHeight)
        if (getDocHeight() <= getScrollXY() + window.innerHeight + 50 && !$scope.gettingBlogs) {
            $log.debug("BOTTOMED");
            $scope.gettingBlogs=true;
            $scope.getPosts($scope.blogs[$scope.blogs.length-1].time);
        }
    });
    //to login page
    $scope.goLogin = function () {
        $state.go('appSimp.login');
    }
})
app.controller('inbox-cont',function($scope,$http,userFact,$log){
	$scope.currMsg = 0;
	$log.debug('PARENT USER IS:',$scope.$parent.user);
	$scope.chMsg = function(dir){
		if(dir && $scope.currMsg<$scope.$parent.user.msgs.length-1){
			$log.debug('goin up 1 msg')
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
						$log.debug('affected user',$scope.$parent.user)
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
String.prototype.capMe = function() {
    return this.slice(0, 1).toUpperCase() + this.slice(1);
}
app.controller('main-cont', function($scope, $http, $state,userFact,$log) {
    $log.debug('main controller registered!')
    $scope.user=null;
    userFact.getUser().then(r=>{
    	$scope.user=r.data;
    	//user sends their name to back
    	socket.emit('hiIm',{name:$scope.user.user})
    })
    //used to see if this user is still online after a disconnect
    socket.on('reqHeartBeat',function(sr){
        if(!$scope.user) return false;//do not respond if we're not logged in!
    	socket.emit('hbResp',{name:$scope.user.user})
    })
    // socket.on('allNames',function(r){
    // 	$scope.online = r;
    // 	$log.debug('users now online are',r)
    // })
})

app.controller('nav-cont',function($scope,$http,$state,userFact){
	$scope.logout = function() {
        bulmabox.confirm('Logout','Are you sure you wish to logout?', function(resp) {
            if (!resp || resp == null) {
                return true;
            } else {
                $scope.$parent.$parent.user=null;
                $http.get('/user/logout').then(function(r) {
                    $state.go('appSimp.home');
                })
            }
        })
    }
    // userFact.getUser().then(r=>{
    //     $scope.isMod = !!r.data.mod
    // })
    $scope.pages = [{
        sref:'app.dash',
        txt:'Dashboard',
        icon:'tachometer'
    },{
        sref:'app.calendar',
        txt:'Calendar',
        icon:'calendar'
    },{
        sref:'app.chat',
        txt:'Chat',
        icon:'comments'
    },{
        sref:'app.forum',
        txt:'Forum',
        icon:'commenting-o'
    },{
        sref:'app.tools',
        txt:'Tools',
        icon:'wrench'
    },{
        sref:'app.blog',
        txt:'Blog Editor',
        icon:'pencil',
        protected:true
    }]
    $scope.mobActive=false;
})
resetApp.controller('reset-contr',function($scope,$http,$location,$log){
	$scope.key = window.location.search.slice(5);

	$http.get('/user/resetUsr?key='+$scope.key).then(function(u){
		$log.debug('getting reset user status?',u)
		$scope.user=u.data;
	});
	$scope.doReset = function(){
		if(!$scope.user || !$scope.pwd || !$scope.pwdDup || $scope.pwdDup!=$scope.pwd ||!$scope.key){
			bulmabox.alert('Error: Missing data','Make sure you&rsquo;ve reached this page from a password reset link, and that you have entered the same password in both fields!');
		}else{
			$http.post('/user/resetPwd',{
				acct:$scope.user.user,
				pwd:$scope.pwd,
				pwdDup:$scope.pwdDup,
				key:$scope.key
			}).then(function(r){
				if(r.data=='err'){
					bulmabox.alert('Error resetting password','There was an error resetting your password. Please contact a mod');
				}else{
					bulmabox.alert('Password Reset','Your password was successfully reset! We\'re redirecting you to login now.',function(){
						$scope.goLogin();
					})
				}
			})
		}
	}
	$scope.goLogin = ()=>{
		window.location.href='../../login';
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
app.controller('tool-cont', function($scope, $http, $state, $filter, $sce, $window,$log) {
    $scope.showTab = (t) => {
        $scope.currTab = t;
        if($scope.currTab=='WvW Current Match History'){
            $http.get('/tool/worldData').then(r=>{

                $scope.refWvw(r.data)
            })
        }
    }
    $scope.currTab = 'Dailies'
    $scope.tabs = [{
        name: 'Dailies',
        icon: 'calendar-check-o'
    }, {
        name: 'WvW Current Match History',
        icon: 'fort-awesome'
    }, {
        name: 'Core/Lodestone Upgrade',
        icon: 'diamond'
    }, {
        name: 'Tier Six Material Conversion',
        icon: 'money'
    }]
    //Dailies
    $scope.dailyRestrict = {};
    $scope.tmrw = false;
    $scope.regetDaily = () => {
        const spd = Object.keys($scope.dailyRestrict).filter(sp => $scope.dailyRestrict[sp]);
        $http.get('/tool/daily' + ($scope.tmrw ? '/tomorrow' : '') + (spd.length ? '?modes=' + spd.join(',') : '')).then(r => {
            $log.debug('dailyObj', r.data)
            $scope.dailies = r.data;
        })
    }
    $window.addEventListener('keyup', (e) => {
        if (e.which == 39 && !e.shiftKey) {
            $scope.nextSkirm();
            $scope.$digest();
        } else if (e.which == 39 && e.shiftKey) {
            $scope.lastSkirm();
            $scope.$digest();
        } else if (e.which == 37 && !e.shiftKey) {
            $scope.prevSkirm();
            $scope.$digest();
        } else if (e.which == 37 && e.shiftKey) {
            $scope.firstSkirm();
            $scope.$digest();
        }
    })
    $scope.regetDaily();
    //get ALL prices:
    $scope.refPrices = () => {
        $http.get('/tool/allPrices')
            .then(r => {
                $scope.prices = $scope.calcPrices(r.data.p)
            })
    }
    $scope.wvwWorld = false;
    $scope.wvwColors = ['red', 'green', 'blue']
    $scope.wvwPie = {
        cutoutPercentage: 0,
        backgroundColor: ['#aa0000', '#00aa00', '#0000aa'],
        config: {
            plugins: {
                vert: false
            }
        }
    }
    $scope.wvwDisabled = false;
    //NOTE: slice 'size' is current accumulated score for that skirimish; i.e., the score at end of skirimish
    $scope.makeMarkers = () => {
        const icons = ['camp-blue.png',
            'camp-green.png',
            'camp-netural.png',
            'camp-red.png',
            'castle-blue.png',
            'castle-green.png',
            'castle-neutral.png',
            'castle-red.png',
            'keep-blue.png',
            'keep-green.png',
            'keep-netural.png',
            'keep-red.png',
            'ruins-blue.png',
            'ruins-green.png',
            'ruins-neutral.png',
            'ruins-red.png',
            'tower-blue.png',
            'tower-green.png',
            'tower-neutral.png',
            'tower-red.png'
        ]
        $scope.mapMarkers = icons.map(mm => {
            return L.icon({
                iconUrl: './img/wvw/' + mm,
                iconName: mm.replace('.png',''),
                // shadowUrl: null,
                iconSize: [32, 32], // size of the icon
                // shadowSize: [32,32], // size of the shadow
                iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
                // shadowAnchor: [15,15], // the same for the shadow
                popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
        });
        $log.debug('Map Markers', $scope.mapMarkers)
    }
    $scope.refWvw = worlds => {
        // return console.log('World data!',d)
        $http.get('/tool/wvw' + ($scope.wvwWorld ? '?world=' + $scope.wvwWorld : ''))
            .then(r => {
                $log.debug('WVW STUFF', r, r.data)
                if (r.data == 'newMatch') {
                    $scope.wvwDisabled = true;
                    $scope.wvw = null;
                    return false;
                } else {
                    $scope.wvwDisabled = false;
                }
                $scope.wvw = r.data.wvw;
                $scope.currentMatch = $scope.wvw.skirmishes.length - 1;

                $scope.wvw.labels = $scope.wvwColors.map(cl => {
                    return r.data.wvw.all_worlds[cl].map(clw => {
                        return worlds.find(wld => wld.id == clw).name;
                    }).join(', ')
                });
                $scope.wvw.skirmishes.forEach(sk => {
                    sk.scoreArr = $scope.wvwColors.map(c => sk.scores[c]);
                })
                $scope.wvw.history = $scope.wvwColors.map(c => {
                    return $scope.wvw.skirmishes.map(sk => sk.scores[c]);
                })
                $scope.wvw.histLabels = new Array($scope.wvw.history[0].length).fill(100).map((c, i) => i + 1);
                $scope.wvw.histColors = [{
                    backgroundColor: 'transparent',
                    borderColor: '#f00',
                    pointBackgroundColor: '#f00'
                }, {
                    backgroundColor: 'transparent',
                    borderColor: '#0f0',
                    pointBackgroundColor: '#0f0'
                }, {
                    backgroundColor: 'transparent',
                    borderColor: '#00f',
                    pointBackgroundColor: '#00f'
                }]
                $log.debug('WVW', $scope.wvw)
                // $scope.currSkirm = {s:$scope.wvwColors.map(c=>r.data.wvw.scores[c]),l:labels,v:$scope.wvwColors.map(c=>r.data.data.victory_points[c])}
                $scope.mapMarkers = [];
                $scope.wvwOwned = r.data.owned||null;//wot do we own
                $scope.makeMarkers()
                let mapDiv = document.querySelector('#wvw-map');
                $log.debug('mapDiv', mapDiv, mapDiv.offsetWidth)
                // mapDiv.style.height = mapDiv.getBoundingClientRect().right +'px';
                $scope.doMap($scope.wvw.maps)
            })
    }
    $scope.nextSkirm = () => {
        if (!$scope.wvw) {
            return false
        }
        if ($scope.wvw.skirmishes.length > $scope.currentMatch + 1) {
            $scope.currentMatch++;
        } else {
            $scope.currentMatch = 0;
        }
        $scope.positionVert();
    }
    $scope.prevSkirm = () => {
        if (!$scope.wvw) {
            return false
        }
        if ($scope.currentMatch && $scope.currentMatch > 0) {
            $scope.currentMatch--;
        } else {
            $scope.currentMatch = $scope.wvw.skirmishes.length - 1;
        }
        $scope.positionVert();
    }
    $scope.lastSkirm = () => {
        $scope.currentMatch = $scope.wvw.skirmishes.length - 1;
        $scope.positionVert();
    }
    $scope.firstSkirm = () => {
        $scope.currentMatch = 0;
        $scope.positionVert();
    }
    //prices!
    $scope.mats = ['blood', 'bone', 'claw', 'fang', 'scale', 'totem', 'venom'];
    $scope.cores = ['glacial', 'onyx', 'destroyer', 'molten', 'corrupted', 'essence', 'crystal', 'charged']
    $scope.calcPrices = (data) => {
        $log.debug('DATA before prices', data)
        data.push({ hi: 2504, lo: 2504, lName: 'Bottle of Elonian Wine', id: 19663, sName: 'wine' }); //push in bottle of elonian whine
        //mats
        //output is 5-12 t6 for input of 50 t5, 1 t6, 5 cdust, 5 philosorocks
        //MIN: 5 output (5*t6.lo) for 50*t5.hi, 1 t6.hi, 5 cdust.hi
        //MAX: 12 output (12*t6.hi) for 50*t5.lo, 1 t6.lo, 5 cdust.lo
        let dust = data.find(d => d.sName == 't6dust');
        $scope.mats.forEach(m => {
            let t5 = data.find(d => {
                    return d.sName == 't5' + m;
                }),
                t6 = data.find(d => {
                    return d.sName == 't6' + m;
                });
            t6.hiProf = (12 * t6.hi) - ((50 * t5.lo) + (1 * t6.lo) + (5 * dust.lo))
            t6.loProf = (5 * t6.lo) - ((50 * t5.hi) + (1 * t6.hi) + (5 * dust.hi))
            t6.t5 = t5;
            t6.profGood = 0;
            if (t6.hiProf > 0 && t6.loProf > 0) {
                t6.profGood = 1;
            } else if (t6.hiProf < 0 && t6.loProf < 0) {
                t6.profGood = -1;
            }
        })
        $scope.cores.forEach(c => {
            let core = data.find(d => d.sName == 'c' + c),
                l = data.find(d => d.sName == 'l' + c);
            // $log.debug('TYPE:',c,'CORE',core,'LODE',l)
            l.c = core;
            l.hiProf = l.hi - ((2 * core.lo) + dust.lo + 2504);
            l.loProf = l.lo - ((2 * core.hi) + dust.hi + 2504);
            l.profGood = 0;
            if (l.hiProf > 0 && l.loProf > 0) {
                l.profGood = 1;
            } else if (l.hiProf < 0 && l.loProf < 0) {
                l.profGood = -1;
            }
        })
        $log.debug('PRICES!', data)
        return data;
    }
    $scope.isMat = (m) => {
        return m.sName.indexOf('t6') > -1 && m.sName != 't6dust';
    }
    $scope.isGem = (m) => {
        // $log.debug('checking',m,m.sName[0])
        return m.sName.indexOf('t6') < 0 && m.sName != 'wine' && m.sName.indexOf('t5') < 0 && m.sName[0] == 'l';
    }
    $scope.histClick = (e) => {
        $log.debug('CLICKED:', e, Chart)
        if (!e || !e[0]) return false;
        $scope.currentMatch = e[0]._index;
        $scope.positionVert();
    }
    $scope.positionVert = () => {
        $scope.lineOpts.title.text = `(${$scope.currentMatch+1})`;
        // $scope.$digest();
    }
    Chart.plugins.register({
        id: 'vert',
        afterDraw: function(chart, options) {
            if (chart.config.type != 'doughnut') {
                // $scope.lineXWid = chart.scales[Object.keys(chart.scales)[0]].maxWidth;
                $scope.lineXWid = chart.chartArea.right - chart.chartArea.left;
                $scope.lineYWid = chart.chartArea.left;
                $scope.lineHeight = chart.chartArea.bottom - chart.chartArea.top;
                $scope.lineStepWid = $scope.lineXWid / ($scope.wvw.skirmishes.length - 1);
                // $log.debug('After Draw', chart, 'WIDTH:', $scope.lineXWid, $scope.lineYWid, $scope.lineHeight, 'SCALE NAMES:', Object.keys(chart.scales));
                // $log.debug('CHART',JSON.stringify(chart))
                const ctx = chart.canvas.getContext("2d");
                ctx.moveTo($scope.lineYWid + ($scope.currentMatch * $scope.lineStepWid), 5)
                ctx.lineTo($scope.lineYWid + ($scope.currentMatch * $scope.lineStepWid), $scope.lineHeight + 5);
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        }
    });
    $scope.lineOpts = {
        title: { text: `(${$scope.currentMatch+1})` },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontColor: '#fff'
                },
            }],
            xAxes: [{
                ticks: {
                    fontColor: '#fff'
                },
            }]
        },
        hover: {
            animationDuration: 0
        }
    }
    $scope.refPrices();
    // $scope.refWvw();
    $scope.getMapState=()=>{
        //
        $log.debug('ZOOM',$scope.map.getZoom(),'BOUNDS',$scope.map.getBounds())
    }
    $scope.unproject = function(m, c) {
        return m.unproject(c, m.getMaxZoom())
    }
    $scope.doMap = function(mapObjs) {
        "use strict";
        // const unproject = function (coord) {
        //     return map.unproject(coord, map.getMaxZoom());
        // }
        let southWest, northEast;
        // return console.log('stopping just before map push!')
        $scope.map = L.map("wvw-map", {
            minZoom: 0,
            maxZoom: 6
            // zoomSnap: 0,
            // zoomDelta: 0.3,
            /* wheelPxPerZoomLevel: 140,
            maxBoundsViscosity: 1.0,
            bounceAtZoomLimits: false,
            zoomControl: false,
            attributionControl: false, */
        });

        northEast = $scope.unproject($scope.map, [15700, 8900]);
        southWest = $scope.unproject($scope.map, [5100, 15900]);

        const renderBounds = new L.LatLngBounds($scope.unproject($scope.map, [16384, 0]), $scope.unproject($scope.map, [0, 16384]));
        L.tileLayer("https://tiles.guildwars2.com/2/3/{z}/{x}/{y}.jpg", {
            subdomains: ["tiles1", "tiles2", "tiles3", "tiles4"],
            bounds: renderBounds,
            minNativeZoom: 4,
            noWrap: true
        }).addTo($scope.map);
        $scope.map.setMaxBounds(new L.LatLngBounds(southWest, northEast));
        $scope.map.setView(new L.LatLng(
                (northEast.lat - southWest.lat) / 2,
                (northEast.lng - southWest.lng) / 2),
            0);
        // map.on("click", onMapClick);

        mapObjs.forEach(mp => {
            mp.objectives.filter(mpf => !!mpf.marker).forEach(mpo => {
                let theMarker = $scope.mapMarkers.find(mmr => mmr.options.iconName == mpo.type.toLowerCase()+'-'+mpo.owner.toLowerCase());
                // $log.debug('THIS OBJECTIVE',mpo,'MARKER (probly)',theMarker,'FROM', mpo.type.toLowerCase()+'-'+mpo.owner.toLowerCase())
                L.marker($scope.unproject($scope.map, mpo.coord), { title: `${mpo.name} (owned by: ${mpo.owner})`, icon: theMarker }).addTo($scope.map)
            })
        })
        setTimeout(function() {
            $scope.map.invalidateSize();
            $scope.map.setZoom(3);
        }, 500)
    }
})
app.controller('unconf-cont', function($scope, $http, $state) {
    // $scope.usr = JSON.parse(localStorage.brethUsr).user;
    $scope.logout = function() {
        $http.get('/user/logout').then(function(r) {
            console.log(r);
            $state.go('appSimp.login');
        })
    }
})
app.factory('socketFac', function ($rootScope) {
  const socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () { 
        const args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        const args = arguments;
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
                def.resolve(true)
            } else if(r.data){
                def.resolve($state.target('appSimp.unconfirmed',undefined, {location:true}))
            }else{
                // User isn't authenticated. Redirect to a new Target State
                def.resolve($state.target('appSimp.login', undefined, { location: true }))
            }
        }).catch(e=>{
            def.resolve($state.target('appSimp.login', undefined, { location: true }))
        });
        return def.promise;
    });
    $transitions.onBefore({to:'app.blog'},function(trans){
        let def = $q.defer()
        const usrCheck = trans.injector().get('userFact')
        usrCheck.getUser().then(r=>{
            if(!r.data.mod){
                //user not mod; reject transfer to blod editor
                console.log('tried to access editor as non-mod!')
               return def.resolve($state.target('app.dash',undefined, {location:true}))
            }
            def.resolve(true);
        })
        return def.promise;
    })
    // $transitions.onFinish({ to: '*' }, function() {
    //     document.body.scrollTop = document.documentElement.scrollTop = 0;
    // });
}]);
app.factory('userFact', function($http) {
    return {
        getUser() {
            return $http.get('/user/getUsr').then(function(s) {
                return s;
            })
        },
        getUsers() {
            return $http.get('/user/allUsrs').then(function(s) {
                return s;
            })
        },
        login(u){
            return $http.put('/user/login', { user: u.user, pass: u.pass }).then(function(s){
                return s;
            })
        },
        signup(u){
            return $http.post('/user/new', u).then(function(r){
                return r;
            })
        }
    };
});
}());
