app.controller('dash-cont', function($scope, $http, $state, userFact) {
    $http.get('/user/getUsr')
        .then(r => {
            $scope.user = r.data;
            console.log('user', $scope.user)
        });
    $http.get('/user/allUsrs')
        .then((au) => {
            //Auch!
            console.log('all users is', au)
            $scope.allUsers = au.data;
        });
    $scope.makeMod = (u) => {
        console.log('wanna mod', u);
        bulmabox.confirm(`Assign Moderator Rights`, `Warning: This will give user ${u.user} full moderator rights, and prevents them from being banned. This process is <i>not</i> reversable!`, function(r) {
            if (!r || r == null) {
                return false;
            } else {
                //No thanks
                $http.get('/user/makeMod?user=' + u.user)
                    .then(tbr => {
                        $scope.allUsers = tbr.data;
                    })
            }
        })
    }
    $scope.toggleBan = (u) => {
        $http.get('/user/toggleBan?user=' + u.user)
            .then(tbr => {
                $scope.allUsers = tbr.data;
            })
    }
    $scope.races = ['Asura', 'Charr', 'Human', 'Norn', 'Sylvari'];
    $scope.profs = ['Guardian', 'Warrior', 'Revenant', 'Thief', 'Ranger', 'Engineer', 'Elementalist', 'Mesmer', 'Necromancer']
    $scope.addChar = () => {
        const raceOptList = $scope.races.map(rc => {
                return `<label class='char-opt opt-${rc}'><input type='radio' name='char-race' value=${rc} title=${rc}><div></div></label>`
            }).join(''),
            profOptList = $scope.profs.map(rc => {
                return `<label class='char-opt opt-${rc}'><input type='radio' name='char-prof' value=${rc} title=${rc}><div></div></label>`
            }).join('');
        bulmabox.custom('Add a character',
            `<div class="field">
    <label class="label">
        Name
    </label>
    <p class="control has-icons-left">
        <input class="input" type="text" placeholder="Your character's name" id='char-name'>
        <span class="icon is-small is-left">
            <i class="fa fa-user"></i>
        </span>
    </p>
</div>
<div class="field">
    <label class='label'>
        Race
    </label>
    ${raceOptList}
</div>
<div class="field">
    <label class='label'>
        Profession
    </label>
    ${profOptList}
</div>
<div class="field">
    <label class='label'>
        Level
    </label>
    <p class="control">
        <input class='input' type='number' id='char-lvl' min='1' max='80' value='80'>
    </p>
</div>
<div class="field">
    <label class='label'>
        Other Info
    </label>
    <p class="control">
        <textarea class='textarea' id='char-other' placeholder='Any other information you wanna include (optional)'></textarea>
    </p>
</div>`,
            function() {
                const theProf = document.querySelector('input[name=char-prof]:checked'),
                theRace = document.querySelector('input[name=char-race]:checked'),
                theName = document.querySelector('#char-name');
                if(!theProf|| !theRace|| !theName){
                    bulmabox.alert('Needs More Info','You need to specify a profession, race, and name! Otherwise we won\'t know who/what you are!');
                    return false;
                }
                const char = {
                    name: document.querySelector('#char-name').value,
                    prof: document.querySelector('input[name=char-prof]:checked').value,
                    race: document.querySelector('input[name=char-race]:checked').value,
                    lvl: document.querySelector('#char-lvl').value,
                    other: document.querySelector('#char-other').value
                }
                console.log('User wants to add char', char)
                $http.post('/user/addChar', char)
                    .then((r) => {
                        $scope.user = r.data;
                    })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Save</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    }
    $scope.delChr = (chr) => {
        console.log('user wishes to remove character', chr)
        bulmabox.confirm('Remove Character', `Are you sure you wish to remove the character ${chr.name}?`, function(resp) {
            if (resp && resp != null) {
                $http.get('/user/remChar?id=' + chr._id)
                    .then(r => {
                        $scope.user = r.data;
                    }).catch(e => {
                        bulmabox.alert('Error', 'There was a problem removing this character!');
                    })
            }
        })
    }
    $scope.editChar = (chr) => {
        console.log('usr wants to',chr,Date.now())
        const raceOptList = $scope.races.map(rc => {
                return `<label class='char-opt opt-${rc}'><input type='radio' name='char-race' value=${rc} title=${rc} ${rc==chr.race?'checked':''}><div></div></label>`
            }).join(''),
            profOptList = $scope.profs.map(rc => {
                return `<label class='char-opt opt-${rc}'><input type='radio' name='char-prof' value=${rc} title=${rc} ${rc==chr.prof?'checked':''}><div></div></label>`
            }).join('');
        bulmabox.custom('Edit character',
            `<div class="field">
    <label class="label">
        Name
    </label>
    <p class="control has-icons-left">
        <input class="input" type="text" placeholder="Your character's name" id='char-name' value='${chr.name}'>
        <span class="icon is-small is-left">
            <i class="fa fa-user"></i>
        </span>
    </p>
</div>
<div class="field">
    <label class='label'>
        Race
    </label>
    ${raceOptList}
</div>
<div class="field">
    <label class='label'>
        Profession
    </label>
    ${profOptList}
</div>
<div class="field">
    <label class='label'>
        Level
    </label>
    <p class="control has-icons-left">
        <input class='input' type='number' id='char-lvl' min='1' max='${chr.lvl}' value='80'>
        <span class="icon is-small is-left">
            <i class="fa fa-signal"></i>
        </span>
    </p>
</div>
<div class="field">
    <label class='label'>
        Other Info
    </label>
    <p class="control">
        <textarea class='textarea' id='char-other' placeholder='Any other information you wanna include (optional)'>${chr.other}</textarea>
    </p>
</div>`,
            function(resp) {
                //send event!
                // const title = document.querySelector('#newTitle').value,
                // text = document.querySelector('#newMsg').value;
                const theProf = document.querySelector('input[name=char-prof]:checked'),
                theRace = document.querySelector('input[name=char-race]:checked'),
                theName = document.querySelector('#char-name');
                if(!theProf|| !theRace|| !theName){
                    bulmabox.alert('Needs More Info','You need to specify a profession, race, and name! Otherwise we won\'t know who/what you are!');
                    return false;
                }
                const char = {
                    name: document.querySelector('#char-name').value,
                    prof: document.querySelector('input[name=char-prof]:checked').value,
                    race: document.querySelector('input[name=char-race]:checked').value,
                    lvl: document.querySelector('#char-lvl').value,
                    other: document.querySelector('#char-other').value
                }
                console.log('User wants to add char', char, resp)
                $http.post('/user/editChar', char)
                    .then((r) => {
                        $scope.user = r.data;
                    })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Save</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    }
    $scope.mail=(usr)=>{

        bulmabox.custom('Send Message',
            `<div class="field">
    <label class='label'>
        Message
    </label>
    <p class="control">
        <textarea class='textarea' id='newMsg' placeholder='What do you wanna say?'></textarea>
    </p>
</div>`,
            function(resp) {
                //send event!
                // const title = document.querySelector('#newTitle').value,
                // text = document.querySelector('#newMsg').value;
                const theMsg = document.querySelector('#newMsg').value;
                if(!theMsg){
                    bulmabox.alert('Huh?','Sorry, but we don\'t support uncomfortable silences currently.');
                    return false;
                }
                $http.post('/user/sendMsg', {msg:theMsg,to:usr.user})
                    .then((r) => {
                        //done
                    })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Save</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    }
    $scope.viewMsg=(m)=>{
        console.log('user wishes to view msg',m)
        bulmabox.alert(`Message from ${m.from}`,m.msg||'(No message)')
    }
    $scope.delMsg=(m)=>{
        console.log('user wishes to delete msg',m)
        bulmabox.confirm('Delete Message','Are you sure you wish to delete this message?',(resp)=>{
            console.log('resp',resp);
            if(resp && resp!=null){
                $http.get('/user/delMsg?id='+m.id)
                .then(r=>{
                    $scope.user=r.data;
                })
            }
        })
    }
    $scope.repMsg=(m)=>{
        console.log('user wishes to report msg',m)
        bulmabox.confirm('Report Message','Reporting a message sends a notification to the moderators, including the details of the message.<br>It will then be up to the moderators to determine if you\'re being uncool to each other.<br>Are you sure you wish to report this message?',(resp)=>{
            console.log('resp',resp)
        })
    }
})
.filter('numToDate', function() {
  return function(num) {
    if(isNaN(num)){
        return 'Invalid date!';
    }
    return new Date(num).toLocaleString();
  };
})