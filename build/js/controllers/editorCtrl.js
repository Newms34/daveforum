const conv = new showdown.Converter(),
    ytu = ['http://www.youtube.com/watch?v=&lt;VIDEO-CODE&gt;', 'http://www.youtube.com/v/&lt;VIDEO-CODE&gt;', 'http://youtu.be/&lt;VIDEO-CODE&gt;', 'https://www.youtube.com/embed/&lt;VIDEO-CODE&gt;', '&lt;VIDEO-CODE&gt;'];
app.controller('edit-cont', ($scope, $sce, $http, imgTypes, vidTypes, defBlg,$log) => {
    $scope.postList = null;
    $scope.getAllPosts = (id) => {
        $http.get('/blog/allBlogs').then(r => {
            $scope.postList = r.data.sort((a, b) => {
                return a.time - b.time;
            });
            //either select the most recent blog (if none was previously selected) or the previously selected blog.
            $scope.currBlg = (id ? $scope.postList.find(q => q.pid == id) : $scope.postList[0]).copy();
            $log.debug('ALL POSTS', $scope.postList, 'SELECTED POST', $scope.currBlg)
        })
    }
    $scope.getAllPosts();
    $scope.toDate = t => new Date(t).toLocaleString();
    // $log.debug('imgTypes are',imgTypes)
    $scope.includesFormat = (which, format) => {
        return (which == 'vid' && vidTypes.includes(format)) || (which == 'img' && imgTypes.includes(format));
    }
    $scope.getYoutubeUrl = id => {
        return $sce.trustAsResourceUrl(`https://www.youtube.com/embed/${id}?controls=0`);
    }
    $scope.edit = {
        hasMedia: false
    };
    $scope.mediaEdit = {};
    $scope.blgInst = defBlg;
    $scope.parseMd = t => {
        return t && t.sanAndParse().md2h();
    }
    $scope.hideInst = true;
    $scope.changeMedia = function () {
        // $log.debug('New media is:',$scope.getMediaInfo($scope.currBlg.media.url))
        $scope.getMediaInfo($scope.currBlg.media.url).then(r => {
            $scope.currBlg.media = r.copy();
            $scope.edit.media = false;
            $scope.$digest();
        });
    }
    $scope.getMediaInfo = function (u) {
        return new Promise(function (resolve, reject) {
            const p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
            $log.debug('at top of promise, url is', u)
            if (u.match(p)) {
                //valid youtube URL; just return
                return resolve({
                    mediaType: 'youtube',
                    url: RegExp.$1
                })
            } else if (`https://youtu.be/${u}`.match(p)) {
                return resolve({
                    mediaType: 'youtube',
                    url: u
                })
            }
            //test https://i.imgur.com/Q5Kd08U.png
            $http.get(u).then(r => {
                const ct = r.headers()['content-type'].split('/');
                $log.debug(r, r.headers(), ct)
                if (!imgTypes.includes(ct[1]) && !vidTypes.includes(ct[1].split(';')[0])) {
                    bulmabox.alert('Unsupported File Type', `Sorry, but we don't currently support that file type (we think it's ${ct[1]}).<br/>
                    Supported file types are:<br/>
                    <div class='content columns'>
                        <div class='column'>
                            <strong><i class='fa fa-picture-o'></i>&nbsp;Images:</strong>
                            <ul>
                                ${imgTypes.map(q => "<li>." + q.toUpperCase() + "</li>").join('')}
                            </ul>
                        </div>
                        <div class='column'>
                            <strong><i class='fa fa-video-camera'></i>&nbsp;Videos:</strong>
                            <ul>
                                ${vidTypes.map(q => "<li>." + q.toUpperCase() + "</li>").join('')}
                            </ul>
                            <br/>
                            <strong><i class='fa fa-youtube-square'></i>&nbsp;Youtube:</strong>
                            <ul>
                                ${ytu.map(q => "<li>" + q + "</li>").join('')}
                            </ul>
                        </div>
                    </div>`)
                    return reject(false)
                }
                return resolve({
                    mediaType: ct[1],
                    url: u
                })
            }, e => {
                //cannot read external file. This is (sort of!) fine, as it means we wouldn't be able to load it in a blogpost anyway!
                bulmabox.alert('Cannot Read', `<div class='content'>Sorry, but we can't read that external file. Check to make sure:
                <ul>
                <li>The file actually exists at the specified location (i.e., you spelled the URL correctly)</li>
                <li>The file is publically available (i.e., does not require authorization or something)</li>
                <li>The file is not protected by Cross-Origin Resource Sharing protocols, aka the stupidest idea anyone on the internet ever came up with (<a href='https://en.wikipedia.org/wiki/Cross-origin_resource_sharing'>here</a>).</li>
                </ul>
                </div>`)
                return reject(false);
            })
        })
    }
    $scope.waitings = {

    }
    $scope.emptyBlog = {
        title: 'Enter a title',
        pid: null,
        txtMd: 'Tell us something!',
        media: {
            url: '',
            mediaType: null,
        }
    }
    $scope.verifyBlgCh = hasEdit => {
        $scope.waitings.changeBlg = true;
        $log.debug('CurrBlg?',$scope.currBlg,'hasEdit',hasEdit)
        if ($scope.currBlg) {
            $http.get('/blog/blog?pid=' + $scope.currBlg.pid)
                .then(r => {
                    //now compare this "saved" blog to our current currBlg
                    if (r.data && [r.data.title != $scope.currBlg.title, r.data.media.mediaType != $scope.currBlg.media.mediaType, r.data.media.url != $scope.currBlg.media.url, r.data.txtMd != $scope.currBlg.txtMd].filter(q => !!q).length) {
                        bulmabox.confirm('<i class="fa fa-exclamation-triangle is-size-3"></i>&nbsp;Discard changes', `The blog post ${$scope.currBlg.title} has been modified. Switching blogs posts now will discard those changes. Switch anyway?`, r => {
                            if (!!r) {
                                $log.debug('current blog was changed. Said yes to discard; discarding and changing')
                                $scope.currBlg = hasEdit? hasEdit.copy():$scope.emptyBlog.copy();
                            }
                            else {
                                $scope.candBlg = '';
                            }
                            $scope.waitings.changeBlg = false;
                            $scope.$digest();
                        })
                    } else {
                        //no changes
                        $scope.currBlg = hasEdit? hasEdit.copy():$scope.emptyBlog.copy();
                        $scope.waitings.changeBlg = false;
                    }
                })
        }
    }
    $scope.saveBlog = b=>{
        //first, decide whether POST (new blog) or PUT (edit blog)
        let saveMeth;
        if(b.pid){
            saveMeth = 'PUT'
        }else{
            saveMeth = 'POST'
        }
        b.txtHtml = null;//delete HTML, just in case. We'll rebuild it on the backend!
        $http({
            method:saveMeth,
            url:'/blog/blog',
            data:b
        }).then(r=>{
            bulmabox.alert('Saved!','Your post has been saved!')
        })
    }
})