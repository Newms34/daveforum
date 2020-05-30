app.factory('userFact', function($http) {
    return {
        getUser() {
            return $http.get('/user/getUsr').then(function(s) {
                return s;
            })
        },
        getUsers() {
            return $http.get('/user/allUsrs').then(function(s) {
                return s;
            })
        },
        login(u){
            return $http.put('/user/login', { user: u.user, pass: u.pass }).then(function(s){
                return s;
            })
        },
        signup(u){
            return $http.post('/user/new', u).then(function(r){
                return r;
            })
        }
    };
});