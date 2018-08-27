app.controller('forum-cat-cont', function($scope, $http, userFact, $state,$location) {
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    //how do we wanna structure the forum obj?
    //structure is gonna be categories --> threads ---> indiv posts
        $scope.currCat = $location.search().c;
        $http.get('/forum/byCat?grp='+$scope.currCat)
        .then(function(r){
            console.log('thrds in this cat',r)
            $scope.threads = r.data;
        })
    $scope.newThrDial=()=>{
        bulmabox.custom('New Thread',
            `<div class="field">
                <label class='label'>
                Thread Title
                </label>
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="Your thread's title" id='newTitle'>
                        <span class="icon is-small is-left">
                            <i class="fa fa-puzzle-piece"></i>
                        </span>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
                Post
                </label>
                    <p class="control">
                        <textarea class='textarea' id='newMsg' placeholder='Thread text'></textarea>
                    </p>
                </div>`,
            function() {
                //send event!
                const title = document.querySelector('#newTitle').value,
                text = document.querySelector('#newMsg').value;
                $http.post('/forum/newThread',{
                    title:title,
                    text: new showdown.Converter().makeHtml(text),
                    md:text,
                    grp:$scope.currCat,
                })
                .then(function(r){
                    console.log('new thred response',r)
                    $state.go($state.current, {}, {reload: true});
                })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Create Thread</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    }
})