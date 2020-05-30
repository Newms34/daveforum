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