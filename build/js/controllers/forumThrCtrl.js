app.controller('forum-thr-cont', function ($scope, $http, $state, $location, $sce) {
    $scope.currMsg = 0;
    $scope.defaultPic = defaultPic;
    $scope.forObj = {};
    $scope.fileName = null
    if (!localStorage.brethUsr) {
        $state.go('app.login');
        //since we really cannot do anything here if user is NOT logged in
    }
    $scope.loadingFile = false;
    $scope.loadFile = () => {
        $scope.loadingFile = true;
        const fr = new FileReader();
    }
    $scope.currCat = $location.search().c;
    $scope.id = $location.search().t;
    // console.log($scope.currCat,)
    $scope.refThred = () => {
        console.log('info to back:', $scope.id)
        $http.get('/forum/thread?id=' + $scope.id)
            .then((r) => {
                console.log('response', r)
                $scope.thr = r.data.thrd;
                r.data.psts.map(ps => {
                    ps.rawText = ps.text;
                    ps.text = $sce.trustAsHtml(ps.text);
                    ps.date = new Date(ps.lastUpd).toLocaleString();
                    ps.wasEdited = ps.lastUpd != ps.createDate;
                    return ps;
                });
                $scope.avas = r.data.ava;
                $scope.thr.posts = $scope.thr.posts.map(psth => {
                    console.log('PSTH', psth, r.data.psts.filter(psps => psps._id == psth.id)[0])
                    const thePst = r.data.psts.filter(psps => psps._id == psth.id)[0];
                    thePst.votesUp = psth.votesUp;
                    thePst.votesDown = psth.votesDown;
                    thePst.byMod = r.data.mods.indexOf(thePst.user) > -1;
                    thePst.order = psth.order;
                    return r.data.psts.filter(psps => psps._id == psth.id)[0];
                }).sort((a, b) => {
                    return a.order - b.order;
                })
                console.log('thred response', $scope.thr, r);
            })
    }
    $scope.refThred();
    $http.get('/user/getUsr').then((r) => {
        $scope.user = r.data;
        console.log('user', $scope.user)
    })
    $scope.copyCode = c => {
        console.log('attempting to copy', c)
        prompt("Press ctrl-c (cmd-c on Mac) to copy this code!", c.parentNode.querySelector('.build-code').innerText);
    }
    $scope.newPost = () => {
        let theText = document.querySelector('#postTxt').value;
        console.log('new POST', theText, $scope.fileread);
        if (!theText && !$scope.fileread) {
            bulmabox.alert('Say Something', `You can't just post nothing!`);
            return false;
        }
        $http.post('/forum/newPost', {
            thread: $scope.thr._id,
            text: new showdown.Converter().makeHtml(theText).replace(/\[&amp;D[\w+/]+=*\]/g, `<span class='build-code' onclick='angular.element(this).scope().inspectCode(this);' title= 'inspect this build!'>$&</span>`),
            md: theText,
            file: $scope.fileread || null
        })
            .then((r) => {
                window.location.reload();
            })
    };
    $scope.infoBox =  {
        x:0,
        y:0,
        data:null
    }
    $scope.skillBox =  {
        x:0,
        y:0,
        on:false,
        data:{
        }
    }
    $scope.explTrait = (t,e,m) =>{
        $scope.infoBox.x = e.screenX;
        $scope.infoBox.y = e.screenY-50;
        if(t){
            $scope.infoBox.data = `<div class='is-fullwidth ${t.picked||m?'has-text-white':'has-text-grey'}'>
            <div class='is-fullwidth is-size-5 has-text-centered'>${t.name}</div>
            <p>${t.desc}</p>
            </div>`;
        }else{
            $scope.infoBox.data=null;
        }
    }
    $scope.explSkill = (s,e,m) =>{
        $scope.skillBox.x = e.screenX;
        $scope.skillBox.y = e.screenY-50;
        if(s){
            $scope.skillBox.data = s;
            const allUsedTraits  = $scope.currBuild.data.specs.map(q=>q.usedTraits).flat();
            $scope.skillBox.data.realFacts = s.facts.map((sk,n)=>{
                const replaceTrait = s.traited_facts && s.traited_facts.find(q=>q.overrides == n);//if truthy, there DOES exist a replacement fact
                if(!!replaceTrait && allUsedTraits.includes(replaceTrait.requires_trait)){
                    sk = {...JSON.parse(JSON.stringify(sk)),...replaceTrait,isTraited:true};
                    console.log('FOUND replacement fact',replaceTrait,'FOR SKILL',s.name,'REQUIRED TRAIT',replaceTrait.requires_trait,'SKILL NOW',sk)
                    // sk.isTraited = true;
                }
                return sk;
            })
            console.log('SKILL INFO',s,'CURR BUILD',$scope.currBuild.data,'USED TRAITS',allUsedTraits)
            $scope.skillBox.on=true;
        }else{
            $scope.skillBox.on=false;
        }
    }
    $scope.vote = (pst, dir) => {
        console.log('voting for', pst, 'direction', dir, 'which is', typeof dir)
        $http.post('/forum/vote', {
            thread: pst.thread,
            post: pst._id,
            voteUp: !!dir
        })
            .then((r) => {
                console.log('vote response is:', r)
                $scope.refThred();
            })
    }
    $scope.quoteMe = (pst) => {
        document.querySelector('#postTxt').value = pst.md.split('\n').map(q => '>' + q).join('\n');
    }
    $scope.getBuildTimer = null;
    $scope.currBuild = {
        data: null,
    };
    $scope.saySkills = b=>{
        console.log('attempted to switch legends; builds now',b)
        console.log('Skills list for',b.whichSkill,'is',b.data.skills.land[b.whichSkill])
    }
    $scope.inspectCode = (c) => {
        $http.get('/tool/build?build=' + encodeURIComponent(c.innerText.replace('&amp;','&'))).then(r => {
            $scope.currBuild.data = r.data;
            $scope.currBuild.whichSkill= 0;//for rev, mainly
            // $scope.currBuild.data.skillList = [];
        })
    }
    $scope.noBuild = s =>{
        $scope.currBuild.data=null;
    }
    // window.addEventListener('mousemove',e=>{
    //     $scope.currBuild.pos.x = e.screenX;
    //     $scope.currBuild.pos.y = e.screenY-250;
    //     // console.log('Target is build-code? ',[...e.target.classList].includes('build-code'))
    //     if([...e.target.classList].includes('build-code')){
    //         $scope.getBuild(e.target.innerHTML.replace('&amp;','&'))
    //         $scope.$apply();
    //     }else{
    //         //not on a build template span
    //         $scope.currBuild.code=null;
    //         $scope.$apply();
    //     }
    // })
})