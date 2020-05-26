app.controller('all-cont',($scope,$http,$sce,$log)=>{
    $scope.label = 'allBase';
    $scope.currBuild = {

    }

    $scope.inspectCode = (c) => {
        $http.get('/tool/build?build=' + encodeURIComponent(c.replace('&amp;', '&'))).then(r => {
            // return console.log('RESPONSE',r)
            $scope.currBuild.data = r.data;
            $scope.currBuild.whichSkill = 0;//for rev, mainly
            // $scope.currBuild.data.skillList = [];
        })
    }
    $scope.noBuild = s => {
        $scope.currBuild.data = null;
    }
    $scope.copyCode = c => {
       $log.debug('attempting to copy', c)
        prompt("Press ctrl-c (cmd-c on Mac) to copy this code!", c.parentNode.querySelector('.build-code').innerText);
    }
    $scope.infoBox = {
        x: 0,
        y: 0,
        data: null
    }
    $scope.skillBox = {
        x: 0,
        y: 0,
        on: false,
        data: {
        }
    }
    $scope.explTrait = (t, e, m) => {
        $scope.infoBox.x = e.screenX;
        $scope.infoBox.y = e.screenY - 50;
        if (t) {
            $scope.infoBox.data = `<div class='is-fullwidth ${t.picked || m ? 'has-text-white' : 'has-text-grey'}'>
            <div class='is-fullwidth is-size-5 has-text-centered'>${t.name}</div>
            <p>${t.desc}</p>
            </div>`;
        } else {
            $scope.infoBox.data = null;
        }
    }
    $scope.explSkill = (s, e, m) => {
        $scope.skillBox.x = e.screenX;
        $scope.skillBox.y = e.screenY - 50;
        if (s) {
            $scope.skillBox.data = s;
            const allUsedTraits = $scope.currBuild.data.specs.map(q => q.usedTraits).flat();
            $scope.skillBox.data.realFacts = s.facts.map((sk, n) => {
                const replaceTrait = s.traited_facts && s.traited_facts.find(q => q.overrides == n);//if truthy, there DOES exist a replacement fact
                if (!!replaceTrait && allUsedTraits.includes(replaceTrait.requires_trait)) {
                    sk = { ...JSON.parse(JSON.stringify(sk)), ...replaceTrait, isTraited: true };
                   $log.debug('FOUND replacement fact', replaceTrait, 'FOR SKILL', s.name, 'REQUIRED TRAIT', replaceTrait.requires_trait, 'SKILL NOW', sk)
                    // sk.isTraited = true;
                }
                return sk;
            })
           $log.debug('SKILL INFO', s, 'CURR BUILD', $scope.currBuild.data, 'USED TRAITS', allUsedTraits)
            $scope.skillBox.on = true;
        } else {
            $scope.skillBox.on = false;
        }
    }
    $scope.tryReconnect = ()=>{
        $http.get('/alive')
            .then(r=>{
                console.log('Reconnected! Refreshing....')
                bulmabox.confirm(`<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Server Restarted`,`There's been an update, and we need to reload the website to restore functionality.<br/>Click Okay to reload, or Cancel to stay on this page.`,function(r){
                    if(!!r){
                        window.location.reload();
                    }
                })
            })
            .catch(e=>{
                // no reconnect
                setTimeout(function(){
                    $scope.tryReconnect();
                },500)
            })
    }
    socket.on('disconnect',function(e){
        $scope.tryReconnect();
        console.log('disconnected!',e)
    })
})