app.controller('home-cont', function ($scope, $http, $state, $sce) {
    $http.get('/user/memberCount').then(r => {
        $scope.memberCount = { counts: r.data, types: Object.keys(r.data) };
        console.log('MEMBERS',$scope.memberCount)
        $scope.currMems = 0;
        setInterval(function () {
            document.querySelector('#fadey-count').classList.add('fader-on')
            setTimeout(function () {
                $scope.currMems = ($scope.currMems + 1) % ($scope.memberCount.types.length - 1);
                $scope.$digest()
                document.querySelector('#fadey-count').classList.remove('fader-on')
            }, 760)
        }, 10000)
    })
    $scope.defBlg = {
        title:'No blog yet!',
        media: { url: 'https://media.giphy.com/media/9J7tdYltWyXIY/giphy.mp4', type: 'mp4' },
        txtHtml: `
        <p class='is-italic'>Just looking for the regular [PAIN] website? Click Sign up/Login up above!</p><br>
        <p>Welcome to Brethren[Pain]!<br>
        Unfortunately, no one has <em>yet</em> posted any blog entries (or Healy broke the website).<br>
        Moderators: This platform supports a format known as Markdown. Some basic formatting tricks:</p>
        <table class="table table-striped table-bordered">
        <thead>
        <tr>
        <th><strong>Code</strong></th>
        <th><strong>Action</strong></th>
        <th><strong>Example/Notes</strong></th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <td>*text*</td>
        <td>Italic</td>
        <td>This text is <em>very</em> italic!</td>
        </tr>
        <tr>
        <td>**text**</td>
        <td>Bold</td>
        <td>This text <strong>isn’t</strong> scared of you!</td>
        </tr>
        <tr>
        <td># text</td>
        <td>Heading</td>
        <td>Makes text bigger. The more '#'s there are, the <em>smaller</em> the text will be! Needs to be on its own line.</td>
        </tr>
        <tr>
        <td>- Text</td>
        <td>Bullet point</td>
        <td>Make sure to put an empty line right before this</td>
        </tr>
        <tr>
        <td>1.Text</td>
        <td>Numbered list</td>
        <td>Exactly what it says on the box</td>
        </tr>
        <tr>
        <td>[Link](address)</td>
        <td>Link</td>
        <td><a href="https://www.google.com">Head over to google</a></td>
        </tr>
        <tr>
        <td>![Image](SomeImageAddress)</td>
        <td>Image</td>
        <td>Displays an image. The text between the []s is shown when you hover over the image.</td>
        </tr>
        </tbody>
        </table>`,
        txtMd:`Welcome to Brethren[Pain]! 
        Unfortunately, no one has *yet* posted any blog entries. 
        Moderators: This platform supports a format known as Markdown. Some basic formatting tricks:
        |**Code**|**Action**|**Example/Notes**|
        |---|---|---|
        |\*text\*|Italic| This text is *very* italic!|
        |\*\*text\*\*|Bold|This text **isn't** scared of you!|
        |# text|Heading|Makes text bigger. The more '#'s there are, the *smaller* the text will be! Needs to be on its own line.|
        | - Text| Bullet point| Make sure to put an empty line right before this|
        | 1.Text| Numbered list|Exactly what it says on the box|
        |\[Link\]\(address\)|Link|[Head over to google](https://www.google.com)|
        |!\[Image\]\(SomeImageAddress\)|Image|Displays an image. The text between the \[\]s is shown when you hover over the image.`
    }
    $scope.currVid = null;
    $scope.getPosts = ()=>{
        //get more posts. Runs once when page loads, and again when we reach the bottom of the page (infinite scrolling)
    }
    //to login page
    $scope.goLogin = function(){
        $state.go('appSimp.login');
    } 
})