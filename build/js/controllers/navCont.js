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
    },{
        sref:'app.help',
        txt:'Help',
        icon:'question-circle'
    },]
    $scope.mobActive=false;
})