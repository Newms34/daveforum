app.controller('forum-thr-cont', function ($scope, $http, $state, $location, $sce, userFact, $log) {
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
    // $log.debug($scope.currCat,)
    $scope.refThred = () => {
        $log.debug('info to back:', $scope.id)
        $http.get('/forum/thread?id=' + $scope.id)
            .then((r) => {
                $log.debug('response', r)
                $scope.thr = r.data.thrd;
                r.data.psts.map(ps => {
                    ps.rawText = ps.text;
                    ps.text = $sce.trustAsHtml(ps.text);
                    ps.date = new Date(ps.lastUpd).toLocaleString();
                    ps.wasEdited = ps.lastUpd != ps.createDate;
                    return ps;
                });
                $scope.avas = r.data.ava;
                $scope.thr.posts = $scope.thr.posts.map((psth, n) => {
                    // $log.debug('PSTH', psth, r.data.psts.filter(psps => psps._id == psth.id)[0])
                    const thePst = r.data.psts.filter(psps => psps._id == psth.id)[0];
                    thePst.votesUp = psth.votesUp;
                    thePst.votesDown = psth.votesDown;
                    thePst.byMod = r.data.mods.indexOf(thePst.user) > -1;
                    thePst.showMdBox = false;
                    thePst.num = n;//used for ID
                    thePst.order = psth.order;
                    return r.data.psts.filter(psps => psps._id == psth.id)[0];
                }).sort((a, b) => {
                    return a.order - b.order;
                })
                $log.debug('thred response', $scope.thr, r);
            })
    }
    $scope.refThred();
    userFact.getUser()
        .then((r) => {
            $scope.user = r.data;
            $log.debug('user', $scope.user)
        })
    $scope.newPost = () => {
        let theText = document.querySelector('#postTxt').value;
        $log.debug('new POST', theText, $scope.fileread);
        if (!theText && !$scope.fileread) {
            bulmabox.alert('Say Something', `You can't just post nothing!`);
            return false;
        }
        // return $log.debug(new showdown.Converter().makeHtml(theText).replace('&amp;','&').replace(/\[&D[\w+/]+=*\]/g, `<build-template build='$&'></build-template>`))
        $http.post('/forum/newPost', {
            thread: $scope.thr._id,
            md: theText,
            file: $scope.fileread || null
        })
            .then((r) => {
                window.location.reload();
            })
    };
    $scope.vote = (pst, dir) => {
        $log.debug('voting for', pst, 'direction', dir, 'which is', typeof dir)
        $http.post('/forum/vote', {
            thread: pst.thread,
            post: pst._id,
            voteUp: !!dir
        })
            .then((r) => {
                $log.debug('vote response is:', r)
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
    $scope.doEdit = p => {
        p.md=p.showMdBox;
        $http.put('/forum/editPost', p)
            .then(r => {
                $scope.refThred();
            })
            .catch(e => {
                bulmabox.alert('Error updating post', 'There was an issue updating this post. Sorry!')
            })
    }
    $scope.toggleMdBox = p => {
        //we can only have ONE edit-box active at a time, so:
        //find one that's not this box, has a truthy showMdBox (edited stuff) and the showMdBox is not the original post text.
        const alreadyOpenBox = $scope.thr.posts.find(q => q._id != p && !!q.showMdBox && q.showMdBox != q.md);
        if (!!alreadyOpenBox) {
            bulmabox.confirm('Discard Changes', 'Are you sure you wish to discard your changes to the other post?', r => {
                console.log('DISCARD RESPONSE', r)
                if (!!r) {
                    $scope.doMdToggle(p);
                    $scope.$digest();
                } else {
                    return false;
                }
            })
        } else {
            $scope.doMdToggle(p);
        }
    }
    $scope.doMdToggle = (id) => {
        console.log('Changing post', id)
        if (!!id) {
            const targetPost = $scope.thr.posts.find(q => q._id == id);
            if (targetPost.showMdBox) {
                targetPost.showMdBox = false;
            } else {
                targetPost.showMdBox = targetPost.md;
            }
        }
        $scope.thr.posts = $scope.thr.posts.map(op => {
            console.log('LOOKING AT POST', op, op._id, id, op.showMdBox)
            if (op._id != id && !!op.showMdBox) {
                console.log('above post was reset, maybe')
                op.showMdBox = false;
                // $scope.$apply();
            }
            return op;
        })

    }
    window.addEventListener('keyup', e => {
        const targId = e.target.id,
            isEditBox = targId.match(/^edit-box-\d+$/);
        if (!isEditBox) {
            return false;
        }
        const pNum = Number(isEditBox[0].slice(isEditBox[0].lastIndexOf('-') + 1)),
            pst = $scope.thr.posts.find(q => q.num == pNum);
        if (e.key == 'Escape') {
            $scope.toggleMdBox(null)
            $scope.$digest();
        }else if(e.shiftKey && e.key=='Enter'){
            e.preventDefault();
            e.stopPropagation();
            $scope.doEdit(pst);
            // console.log('Submitting post',pst)
        }
    });
    $scope.removePost = p =>{
        // bulmabox.custom(`Remove Post`,`$`)
        bulmabox.custom('Remove Post', `<div class="is-fullwidth">
        Are you absolutely sure you wish to mark this post as removed? This process is not reversable!
        <hr/>
        <label class='has-text-weight-bold'>To confirm, please enter your password: <input type='password' id='rem-pwd' placeholder='Password to confirm'/></label>
        </div>`, () => {
            // console.log('User trying to send post',p)
            $http.put('/forum/removePost',{pst:p,pwd:document.querySelector('#rem-pwd').value}).then(r=>{
                $scope.refThred();
            }).catch(e=>{
                bulmabox.alert('Cannot Remove Post','There was an error removing that post. Sorry!')
            })
        }, `<button class='button is-warning' onclick='bulmabox.runCb(bulmabox.params.cb,true,false)'><i class='fa fa-check'></i>&nbsp;Remove</button>
        <button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'><i class='fa fa-times'></i>&nbsp;Cancel</button>`)
    }
})