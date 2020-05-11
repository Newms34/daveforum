app.controller('nav-cont',function($scope,$http,$state){
	$scope.logout = function() {
        bulmabox.confirm('Logout','Are you sure you wish to logout?', function(resp) {
            if (!resp || resp == null) {
                return true;
            } else {
                $scope.$parent.$parent.user=null;
                $http.get('/user/logout').then(function(r) {
                    $state.go('appSimp.login');
                })
            }
        })
    }
    $scope.pages = [{
        sref:'app.dash',
        txt:'Dashboard'
    },{
        sref:'app.calendar',
        txt:'Calendar'
    },{
        sref:'app.chat',
        txt:'Chat'
    },{
        sref:'app.forum',
        txt:'Forum'
    },{
        sref:'app.tools',
        txt:'Tools'
    },{
        sref:'app.help',
        txt:'Help'
    },]
    $scope.mobActive=false;
})