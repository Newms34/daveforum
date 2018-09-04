const worlds = [
{
id: 1001,
name: "Anvil Rock",
population: "High"
},
{
id: 1002,
name: "Borlis Pass",
population: "Medium"
},
{
id: 1003,
name: "Yak's Bend",
population: "High"
},
{
id: 1004,
name: "Henge of Denravi",
population: "Medium"
},
{
id: 1005,
name: "Maguuma",
population: "High"
},
{
id: 1006,
name: "Sorrow's Furnace",
population: "Medium"
},
{
id: 1007,
name: "Gate of Madness",
population: "Medium"
},
{
id: 1008,
name: "Jade Quarry",
population: "Medium"
},
{
id: 1009,
name: "Fort Aspenwood",
population: "Full"
},
{
id: 1010,
name: "Ehmry Bay",
population: "Medium"
},
{
id: 1011,
name: "Stormbluff Isle",
population: "Medium"
},
{
id: 1012,
name: "Darkhaven",
population: "Medium"
},
{
id: 1013,
name: "Sanctum of Rall",
population: "VeryHigh"
},
{
id: 1014,
name: "Crystal Desert",
population: "Medium"
},
{
id: 1015,
name: "Isle of Janthir",
population: "Medium"
},
{
id: 1016,
name: "Sea of Sorrows",
population: "VeryHigh"
},
{
id: 1017,
name: "Tarnished Coast",
population: "High"
},
{
id: 1018,
name: "Northern Shiverpeaks",
population: "High"
},
{
id: 1019,
name: "Blackgate",
population: "Full"
},
{
id: 1020,
name: "Ferguson's Crossing",
population: "Medium"
},
{
id: 1021,
name: "Dragonbrand",
population: "Medium"
},
{
id: 1022,
name: "Kaineng",
population: "High"
},
{
id: 1023,
name: "Devona's Rest",
population: "Medium"
},
{
id: 1024,
name: "Eredon Terrace",
population: "Medium"
},
{
id: 2001,
name: "Fissure of Woe",
population: "Medium"
},
{
id: 2002,
name: "Desolation",
population: "VeryHigh"
},
{
id: 2003,
name: "Gandara",
population: "High"
},
{
id: 2004,
name: "Blacktide",
population: "Medium"
},
{
id: 2005,
name: "Ring of Fire",
population: "Medium"
},
{
id: 2006,
name: "Underworld",
population: "Medium"
},
{
id: 2007,
name: "Far Shiverpeaks",
population: "Medium"
},
{
id: 2008,
name: "Whiteside Ridge",
population: "High"
},
{
id: 2009,
name: "Ruins of Surmia",
population: "Medium"
},
{
id: 2010,
name: "Seafarer's Rest",
population: "VeryHigh"
},
{
id: 2011,
name: "Vabbi",
population: "High"
},
{
id: 2012,
name: "Piken Square",
population: "VeryHigh"
},
{
id: 2013,
name: "Aurora Glade",
population: "High"
},
{
id: 2014,
name: "Gunnar's Hold",
population: "Medium"
},
{
id: 2101,
name: "Jade Sea",
population: "High"
},
{
id: 2102,
name: "Fort Ranik",
population: "Medium"
},
{
id: 2103,
name: "Augury Rock",
population: "High"
},
{
id: 2104,
name: "Vizunah Square",
population: "Medium"
},
{
id: 2105,
name: "Arborstone",
population: "Medium"
},
{
id: 2201,
name: "Kodash",
population: "High"
},
{
id: 2202,
name: "Riverside",
population: "Full"
},
{
id: 2203,
name: "Elona Reach",
population: "VeryHigh"
},
{
id: 2204,
name: "Abaddon's Mouth",
population: "Medium"
},
{
id: 2205,
name: "Drakkar Lake",
population: "High"
},
{
id: 2206,
name: "Miller's Sound",
population: "Medium"
},
{
id: 2207,
name: "Dzagonur",
population: "Medium"
},
{
id: 2301,
name: "Baruch Bay",
population: "VeryHigh"
}
];
app.controller('tool-cont', function($scope, $http, $state, $filter, $sce, $window) {
    $scope.showTab = (t) => {
        $scope.currTab = t;
    }
    $scope.currTab = 'Dailies'
    $scope.tabs = [{
            name: 'Dailies',
            icon: 'calendar-check-o'
        },{
            name: 'WvW Matchups',
            icon: 'fort-awesome'
        }, {
            name: 'Core/Lodestone Upgrade',
            icon: 'diamond'
        }, {
            name: 'Tier Six Material Conversion',
            icon: 'money'
        }
    ]
    //Dailies
    $scope.dailyRestrict = {};
    $scope.regetDaily = () => {
        const spd = Object.keys($scope.dailyRestrict).filter(sp => $scope.dailyRestrict[sp]);
        $http.get('/tool/daily' + (spd.length ? '?modes=' + spd.join(',') : '')).then(r => {
            $scope.dailies = r.data;
        })
    }
    $window.addEventListener('keyup',(e)=>{
    	console.log(e||'NO E');
    	if(e.which==39 && !e.shiftKey){
    		$scope.nextSkirm();
    		$scope.$digest();
    	}else if(e.which==39 && e.shiftKey){
    		$scope.lastSkirm();
    		$scope.$digest();
    	}else if(e.which==37){
    		$scope.prevSkirm();
    		$scope.$digest();
    	}
    })
    $scope.regetDaily();
    //get ALL prices:
    $scope.refPrices = () => {
        $http.get('/tool/allPrices')
            .then(r => {
                $scope.prices = r.data;
            })
    }
    $scope.wvwWorld = false;
    $scope.wvwColors = ['red','green','blue']
    $scope.wvwPie = {
    	cutoutPercentage:0,
    	backgroundColor:['#aa0000','#00aa00','#0000aa']
    }
    //NOTE: slice 'size' is current accumulated score for that skirimish; i.e., the score at end of skirimish
    $scope.refWvw= ()=>{
    	$http.get('/tool/wvw'+($scope.wvwWorld?'?world='+$scope.wvwWorld:''))
    		.then(r=>{
    			console.log('WVW STUFF',r,r.data.data.scores)
    			$scope.wvw = r.data.data;
    			$scope.currentMatch = $scope.wvw.skirmishes.length-1;

    			$scope.wvw.labels = $scope.wvwColors.map(cl=>{
    				return r.data.data.all_worlds[cl].map(clw=>{
    					return worlds.find(wld=>wld.id==clw).name;
    				}).join(', ')
    			});
    			$scope.wvw.skirmishes.forEach(sk=>{
    				sk.scoreArr = $scope.wvwColors.map(c=>sk.scores[c]);
    			})
    			// console.log(labels)
    			// $scope.currSkirm = {s:$scope.wvwColors.map(c=>r.data.data.scores[c]),l:labels,v:$scope.wvwColors.map(c=>r.data.data.victory_points[c])}
    		})
    }
    $scope.nextSkirm=()=>{
    	console.log('tryin to get NEXT skirm')
    	if(!$scope.wvw){
    		return false
    	}
    	if($scope.wvw.skirmishes.length>$scope.currentMatch+1){
    		$scope.currentMatch++;
    	}else{
    		$scope.currentMatch=0;
    	}
    }
    $scope.prevSkirm=()=>{
    	console.log('tryin to get PREV skirm',!!$scope.wvw,)
    	if(!$scope.wvw){
    		return false
    	}
    	if($scope.currentMatch && $scope.currentMatch>0){
    		$scope.currentMatch--;
    	}else{
    		$scope.currentMatch = $scope.wvw.skirmishes.length-1;
    	}
    }
    $scope.lastSkirm = ()=>{
    	$scope.currentMatch = $scope.currentMatch = $scope.wvw.skirmishes.length-1;
    }
    $scope.refPrices();
    $scope.refWvw();
})