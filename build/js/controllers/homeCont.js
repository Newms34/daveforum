app.controller('home-cont', function ($scope, $http, $state, $sce, imgTypes,vidTypes,defBlg) {
    $http.get('/user/memberCount').then(r => {
        $scope.memberCount = { counts: r.data, types: Object.keys(r.data) };
        console.log('MEMBERS',$scope.memberCount)
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
    $scope.getPosts = ()=>{
        //get more posts. Runs once when page loads, and again when we reach the bottom of the page (infinite scrolling)
    }
    //to login page
    $scope.goLogin = function(){
        $state.go('appSimp.login');
    } 
})