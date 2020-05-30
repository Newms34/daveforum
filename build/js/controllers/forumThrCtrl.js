app.controller('forum-thr-cont', function ($scope, $http, $state, $location, $sce,userFact,$log) {
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
                $scope.thr.posts = $scope.thr.posts.map(psth => {
                    // $log.debug('PSTH', psth, r.data.psts.filter(psps => psps._id == psth.id)[0])
                    const thePst = r.data.psts.filter(psps => psps._id == psth.id)[0];
                    thePst.votesUp = psth.votesUp;
                    thePst.votesDown = psth.votesDown;
                    thePst.byMod = r.data.mods.indexOf(thePst.user) > -1;
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
        $http.post('/forum/newPost', {
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

})