app.controller('forum-cat-cont', function($scope, $http, $state, $location) {
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    $http.get('/user/getUsr')
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
    $scope.makeThread = () => {
        $scope.newThr.md = $scope.newThr.txt;
        $scope.newThr.text = new showdown.Converter().makeHtml($scope.newThr.txt);
        $scope.newThr.grp = $scope.currCat;
        $http.post('/forum/newThread', $scope.newThr)
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