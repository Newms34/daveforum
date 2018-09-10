resetApp.controller('reset-contr',function($scope,$http,$location){
	$scope.key = window.location.search.slice(3);

	$http.get('/user/resetUsr?key='+$scope.key).then(function(u){
		console.log('getting reset user status?',u)
		$scope.user=u.data;
	});
	$scope.doReset = function(){
		if(!$scope.user || !$scope.pwd || !$scope.pwdDup || $scope.pwdDup!=$scope.pwd ||!$scope.key){
			bulmabox.alert('Error: Missing data','Make sure you&rsquo;ve reached this page from a password reset link, and that you have entered the same password in both fields!');
		}else{
			$http.post('/user/resetPwd',{
				acct:$scope.user.user,
				pwd:$scope.pwd,
				key:$scope.key
			}).then(function(r){
				console.log('')
				if(r.data=='err'){
					// bulmabox.alert('Error resetting password','There was an error resetting your password. Please contact a mod');
				}else{
					// window.location.href='../../login';
				}
			})
		}
	}
})