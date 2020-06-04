app.controller('help-cont', ($scope,$sce) => {
    $scope.tabs = [{
        title: 'General Usage',
        icon:'users'
    }, {
        title: 'Posting and Formatting',
        icon:'pencil-square'
    }, {
        title: 'Terms of Service and Rules.',
        icon:'gavel'
    }];
    $scope.siteSections=[{
        title:'Home',
        descs:[`Only viewable while logged out`,`See blog entries posted by our mod team!`],
        icon:''
    },{
        title:'Dashboard',
        descs:[`View and edit your personal information, such as characters, account name, or game preferences`,`Look at other members' profiles`,`Send and receive messages from other Brethren members`,`View a list of upcoming events`],
        icon:'tachometer'
    },{
        title:'Calendar',
        descs:[`Create, edit, or just view guild events`,`It's a work in progress, so lemme know if it breaks!`],
        icon:'calendar'
    },{
        title:'Chat',
        descs:[`Talk with other guild members!`,`Chat is <em>not</em> preserved, but still, be nice!`,`See the <i class="fa fa-pencil-square"></i>&nbsp;Posting and Formatting tab for more details on how to make your text awesome.`], 
        icon:'comments'
    },{
        title:'Forums',
        descs:[`Got a message you want everyone to see? Post it here`,`You can even include a (relatively small!) picture`,`Be nice!`,`You can vote on posts too, if that's your thing.`,`See the <i class="fa fa-pencil-square"></i>&nbsp;Posting and Formatting tab for more details on how to make your text awesome.`], 
        icon:'commenting-o'
    },{
        title:'Tools',
        descs:[`Contains a bunch of "convenience" tools`,`List of today's and tomorrow's daily achievements (only for general, fractal, pvp, and wvw dailies for now!)`,`Current World versus World (WvW) matchup statistics`,`Core to Lodestone upgrade calculator`,`Tier six fine material upgrade calculator`], 
        icon:'wrench'
    },{
        title:'Help',
        descs:[`You're looking at it. Hi!`], 
        icon:'question-circle'
    }]
    $scope.currTab=0;
    $scope.setTab = n=>{
        $scope.currTab=n;
        // $scope.$digest();
    }
    $scope.mdCodes=[{
        md:`*text*, _text_`,
        html:`<em>text</em>`,
        notes:'Italic text.'
    },{
        md:`**text**`,
        html:`<b>text</b>`,
        notes:'Bold text.'
    },{
        md:`#text`,
        html:`<span class='is-size-3'>text</span>`,
        notes:'Bigger text. The more "#"s there are, the <em>smaller</em> the text will be (up to a maximum of 6).'
    },{
        md:`[link text](https://www.google.com)`,
        html:`<a href='https://www.google.com'>link text</a>`,
        htmlReal:`<a href='https://www.google.com' class='no-blue-link' target='_blank'>link text</a>`,
        notes:'Creates a link.'
    },{
        md:`|ColumnA|ColumnB|ColumnC|
        |---|---|---|
        |apple|banana|cherry|
        |Airedale|Bichon|Chihuahua|`,
        html:`<table>
        <thead>
            <tr>
                <th>ColumnA</th>
                <th>ColumnB</th>
                <th>ColumnC</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>apple</td>
                <td>banana</td>
                <td>cherry</td>
            </tr>
            <tr>
                <td>Airedale</td>
                <td>Bichon</td>
                <td>Chihuahua</td>
            </tr>
        </tbody>
    </table>`,
        htmlReal:`<table>
        <thead>
            <tr>
                <th style='color:#222;!important'>ColumnA</th>
                <th style='color:#222;!important'>ColumnB</th>
                <th style='color:#222;!important'>ColumnC</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>apple</td>
                <td>banana</td>
                <td>cherry</td>
            </tr>
            <tr>
                <td>Airedale</td>
                <td>Bichon</td>
                <td>Chihuahua</td>
            </tr>
        </tbody>
    </table>`,
        notes:'Creates a table.'
    },{
        md:`Unda da [c='blue']sea[/c]!`,
        html:`Unda da <span style='color:blue;'>sea</span>!`,
        notes:'Colored text. For you code-savvy folks, this accepts any CSS-compatible color format, including color names, hex, RGB, and HSL'
    },{
        md:`![awesome img description](some-img-address)`,
        html:`<img src='some-img-address' alt='awesome img description'/>`,
        htmlReal:`<img src='./img/icons/android-icon-72x72.png' alt='awesome img description'/>`,
        notes:'An image. Must be hosted somewhere else!'
    },{
        md:`\`foo==bar\``,
        html:`<code>foo==bar</code>`,
        notes:'Inline code.'
    },{
        md:`
        \`\`\`
        awesomeCode('isAwesome');
        \`\`\`
        `,
        html:`<pre>            
awesomeCode('isAwesome');
</pre>
        `,
        notes:'Pre-formatted code "block".'
    },{
        md:`[&DQgnNzI1Ii6bAAAAgAAAAHYAAABwAQAAkgAAAAAAAAAAAAAAAAAAAAAAAAA=]`,
        html:`(build code)`,
        htmlReal:`<build-template build='[&DQgnNzI1Ii6bAAAAgAAAAHYAAABwAQAAkgAAAAAAAAAAAAAAAAAAAAAAAAA=]'></build-template>`,
        notes: `Creates a clickable build code.`
    }];
    $scope.trustMe = s=>$sce.trustAsHtml(s);
})