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