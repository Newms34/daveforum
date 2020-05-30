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
