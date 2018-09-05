const worlds = [{
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
    }, {
        name: 'WvW Matchups',
        icon: 'fort-awesome'
    }, {
        name: 'Core/Lodestone Upgrade',
        icon: 'diamond'
    }, {
        name: 'Tier Six Material Conversion',
        icon: 'money'
    }]
    //Dailies
    $scope.dailyRestrict = {};
    $scope.regetDaily = () => {
        const spd = Object.keys($scope.dailyRestrict).filter(sp => $scope.dailyRestrict[sp]);
        $http.get('/tool/daily' + (spd.length ? '?modes=' + spd.join(',') : '')).then(r => {
            $scope.dailies = r.data;
        })
    }
    $window.addEventListener('keyup', (e) => {
        if (e.which == 39 && !e.shiftKey) {
            $scope.nextSkirm();
            $scope.$digest();
        } else if (e.which == 39 && e.shiftKey) {
            $scope.lastSkirm();
            $scope.$digest();
        } else if (e.which == 37 && !e.shiftKey) {
            $scope.prevSkirm();
            $scope.$digest();
        } else if (e.which == 37 && e.shiftKey) {
            $scope.firstSkirm();
            $scope.$digest();
        }
    })
    $scope.regetDaily();
    //get ALL prices:
    $scope.refPrices = () => {
        $http.get('/tool/allPrices')
            .then(r => {
                $scope.prices = $scope.calcPrices(r.data.p)
            })
    }
    $scope.wvwWorld = false;
    $scope.wvwColors = ['red', 'green', 'blue']
    $scope.wvwPie = {
        cutoutPercentage: 0,
        backgroundColor: ['#aa0000', '#00aa00', '#0000aa'],
        config: {
            plugins: {
                vert: false
            }
        }
    }
    //NOTE: slice 'size' is current accumulated score for that skirimish; i.e., the score at end of skirimish
    $scope.refWvw = () => {
        $http.get('/tool/wvw' + ($scope.wvwWorld ? '?world=' + $scope.wvwWorld : ''))
            .then(r => {
                console.log('WVW STUFF', r, r.data.data.scores)
                $scope.wvw = r.data.data;
                $scope.currentMatch = $scope.wvw.skirmishes.length - 1;

                $scope.wvw.labels = $scope.wvwColors.map(cl => {
                    return r.data.data.all_worlds[cl].map(clw => {
                        return worlds.find(wld => wld.id == clw).name;
                    }).join(', ')
                });
                $scope.wvw.skirmishes.forEach(sk => {
                    sk.scoreArr = $scope.wvwColors.map(c => sk.scores[c]);
                })
                $scope.wvw.history = $scope.wvwColors.map(c => {
                    return $scope.wvw.skirmishes.map(sk => sk.scores[c]);
                })
                $scope.wvw.histLabels = new Array($scope.wvw.history[0].length).fill(100).map((c, i) => i + 1);
                $scope.wvw.histColors = [{
                    backgroundColor: 'transparent',
                    borderColor: '#f00',
                    pointBackgroundColor: '#f00'
                }, {
                    backgroundColor: 'transparent',
                    borderColor: '#0f0',
                    pointBackgroundColor: '#0f0'
                }, {
                    backgroundColor: 'transparent',
                    borderColor: '#00f',
                    pointBackgroundColor: '#00f'
                }]
                console.log('WVW', $scope.wvw)
                // $scope.currSkirm = {s:$scope.wvwColors.map(c=>r.data.data.scores[c]),l:labels,v:$scope.wvwColors.map(c=>r.data.data.victory_points[c])}
            })
    }
    $scope.nextSkirm = () => {
        if (!$scope.wvw) {
            return false
        }
        if ($scope.wvw.skirmishes.length > $scope.currentMatch + 1) {
            $scope.currentMatch++;
        } else {
            $scope.currentMatch = 0;
        }
        $scope.positionVert();
    }
    $scope.prevSkirm = () => {
        if (!$scope.wvw) {
            return false
        }
        if ($scope.currentMatch && $scope.currentMatch > 0) {
            $scope.currentMatch--;
        } else {
            $scope.currentMatch = $scope.wvw.skirmishes.length - 1;
        }
        $scope.positionVert();
    }
    $scope.lastSkirm = () => {
        $scope.currentMatch = $scope.wvw.skirmishes.length - 1;
        $scope.positionVert();
    }
    $scope.firstSkirm = () => {
        $scope.currentMatch = 0;
        $scope.positionVert();
    }
    //prices!
    $scope.mats = ['blood', 'bone', 'claw', 'fang', 'scale', 'totem', 'venom'];
    $scope.cores = ['glacial', 'onyx', 'destroyer', 'molten', 'corrupted', 'essence', 'crystal', 'charged']
    $scope.calcPrices = (data) => {
        console.log('DATA before prices', data)
        data.push({ hi: 2504, lo: 2504, lName: 'Bottle of Elonian Wine', id: 19663, sName: 'wine' }); //push in bottle of elonian whine
        //mats
        //output is 5-12 t6 for input of 50 t5, 1 t6, 5 cdust, 5 philosorocks
        //MIN: 5 output (5*t6.lo) for 50*t5.hi, 1 t6.hi, 5 cdust.hi
        //MAX: 12 output (12*t6.hi) for 50*t5.lo, 1 t6.lo, 5 cdust.lo
        let dust = data.find(d => d.sName == 't6dust');
        $scope.mats.forEach(m => {
            let t5 = data.find(d => {
                    return d.sName == 't5' + m;
                }),
                t6 = data.find(d => {
                    return d.sName == 't6' + m;
                });
            t6.hiProf = (12 * t6.hi) - ((50 * t5.lo) + (1 * t6.lo) + (5 * dust.lo))
            t6.loProf = (5 * t6.lo) - ((50 * t5.hi) + (1 * t6.hi) + (5 * dust.hi))
            t6.t5 = t5;
            t6.profGood = 0;
            if (t6.hiProf > 0 && t6.loProf > 0) {
                t6.profGood = 1;
            } else if (t6.hiProf < 0 && t6.loProf < 0) {
                t6.profGood = -1;
            }
        })
        $scope.cores.forEach(c => {
            let core = data.find(d => d.sName == 'c' + c),
                l = data.find(d => d.sName == 'l' + c);
            // console.log('TYPE:',c,'CORE',core,'LODE',l)
            l.c = core;
            l.hiProf = l.hi - ((2 * core.lo) + dust.lo + 2504);
            l.loProf = l.lo - ((2 * core.hi) + dust.hi + 2504);
            l.profGood = 0;
            if (l.hiProf > 0 && l.loProf > 0) {
                l.profGood = 1;
            } else if (l.hiProf < 0 && l.loProf < 0) {
                l.profGood = -1;
            }
        })
        console.log('PRICES!', data)
        return data;
    }
    $scope.isMat = (m) => {
        return m.sName.indexOf('t6') > -1 && m.sName != 't6dust';
    }
    $scope.isGem = (m) => {
        // console.log('checking',m,m.sName[0])
        return m.sName.indexOf('t6') < 0 && m.sName != 'wine' && m.sName.indexOf('t5') < 0 && m.sName[0] == 'l';
    }
    $scope.histClick = (e) => {
        console.log('CLICKED:', e, Chart)
        if (!e || !e[0]) return false;
        $scope.currentMatch = e[0]._index;
        $scope.positionVert();
    }
    $scope.positionVert = () => {
        $scope.lineOpts.title.text = `(${$scope.currentMatch+1})`;
        // $scope.$digest();
    }
    Chart.plugins.register({
        id: 'vert',
        afterDraw: function(chart, options) {
            if (chart.config.type != 'doughnut') {
                // $scope.lineXWid = chart.scales[Object.keys(chart.scales)[0]].maxWidth;
                $scope.lineXWid = chart.chartArea.right - chart.chartArea.left;
                $scope.lineYWid = chart.chartArea.left;
                $scope.lineHeight = chart.chartArea.bottom - chart.chartArea.top;
                $scope.lineStepWid = $scope.lineXWid / ($scope.wvw.skirmishes.length - 1);
                // console.log('After Draw', chart, 'WIDTH:', $scope.lineXWid, $scope.lineYWid, $scope.lineHeight, 'SCALE NAMES:', Object.keys(chart.scales));
                // console.log('CHART',JSON.stringify(chart))
                const ctx = chart.canvas.getContext("2d");
                ctx.moveTo($scope.lineYWid + ($scope.currentMatch * $scope.lineStepWid), 5)
                ctx.lineTo($scope.lineYWid + ($scope.currentMatch * $scope.lineStepWid), $scope.lineHeight+5);
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        }
    });
    $scope.lineOpts = {
        title: { text: `(${$scope.currentMatch+1})` },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    fontColor: '#fff'
                },
            }],
            xAxes: [{
                ticks: {
                    fontColor: '#fff'
                },
            }]
        },
        hover:{
        	animationDuration:0
        }
    }
    $scope.refPrices();
    $scope.refWvw();
})