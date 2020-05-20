const conv = new showdown.Converter();
app.controller('edit-cont', ($scope, $sce, $http, imgTypes, vidTypes, defBlg) => {
    $scope.postList = null;
    $scope.getAllPosts = (id) => {
        $http.get('/blog/blog').then(r => {
            $scope.postList = r.data.sort((a, b) => {
                return a.time - b.time;
            });
            $scope.currBlg = id ? $scope.postList.find(q => q.pid == id) : $scope.postList[0];
            console.log('ALL POSTS', $scope.postList, 'SELECTED POST', $scope.currBlg)
        })
    }
    // console.log('imgTypes are',imgTypes)
    $scope.includesFormat = (which, format) => {
        return (which == 'vid' && vidTypes.includes(format)) || (which == 'img' && imgTypes.includes(format));
    }
    $scope.getYoutubeUrl = id => {
        return $sce.trustAsResourceUrl(`https://www.youtube.com/embed/${id}?controls=0`);
    }
    $scope.edit = {};
    $scope.mediaEdit = {};
    $scope.getAllPosts();
    $scope.blgInst = defBlg;
    $scope.parseMd = t => {
        return conv && conv.makeHtml && conv.makeHtml(t) && conv.makeHtml(t).replace(/\[&amp;D[\w+/]+=*\]/g, `<span class='build-code' onclick='angular.element(this).scope().inspectCode(this);' title= 'inspect this build!'>$&</span>`) || '';
    }
    function validateYouTubeUrl(url) {
        if (url != undefined || url != '') {
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[2].length == 11) {
                // Do anything for being valid
                console.log()
            }
            else {
                // Do anything for not being valid
            }
        }
    }
    // OR
    $scope.getYtId = u => {
        const p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        return (u.match(p)) ? RegExp.$1 : false;
    }
})