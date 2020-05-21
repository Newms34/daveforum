app.controller('home-cont', function ($scope, $http, $state, $sce, imgTypes, vidTypes, defBlg,$log) {
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
    $scope.blogs = []
    $scope.getPosts = s => {
        //get more posts. Runs once when page loads, and again when we reach the bottom of the page (infinite scrolling)
        $http.get('/blog/blogs?n=5&s=' + (s || 0))
            .then(r => {
                $scope.blogs = $scope.blogs.concat(r.data);
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