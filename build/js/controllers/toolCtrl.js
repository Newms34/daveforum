app.controller('tool-cont', function($scope, $http, $state, $filter, $sce, $window,$log) {
    $scope.showTab = (t) => {
        $scope.currTab = t;
        if($scope.currTab=='WvW Current Match History'){
            $http.get('/tool/worldData').then(r=>{

                $scope.refWvw(r.data)
            })
        }
    }
    $scope.currTab = 'Dailies'
    $scope.tabs = [{
        name: 'Dailies',
        icon: 'calendar-check-o'
    }, {
        name: 'WvW Current Match History',
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
    $scope.tmrw = false;
    $scope.regetDaily = () => {
        const spd = Object.keys($scope.dailyRestrict).filter(sp => $scope.dailyRestrict[sp]);
        $http.get('/tool/daily' + ($scope.tmrw ? '/tomorrow' : '') + (spd.length ? '?modes=' + spd.join(',') : '')).then(r => {
            $log.debug('dailyObj', r.data)
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
    $scope.wvwDisabled = false;
    //NOTE: slice 'size' is current accumulated score for that skirimish; i.e., the score at end of skirimish
    $scope.makeMarkers = () => {
        const icons = ['camp-blue.png',
            'camp-green.png',
            'camp-netural.png',
            'camp-red.png',
            'castle-blue.png',
            'castle-green.png',
            'castle-neutral.png',
            'castle-red.png',
            'keep-blue.png',
            'keep-green.png',
            'keep-netural.png',
            'keep-red.png',
            'ruins-blue.png',
            'ruins-green.png',
            'ruins-neutral.png',
            'ruins-red.png',
            'tower-blue.png',
            'tower-green.png',
            'tower-neutral.png',
            'tower-red.png'
        ]
        $scope.mapMarkers = icons.map(mm => {
            return L.icon({
                iconUrl: './img/wvw/' + mm,
                iconName: mm.replace('.png',''),
                // shadowUrl: null,
                iconSize: [32, 32], // size of the icon
                // shadowSize: [32,32], // size of the shadow
                iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
                // shadowAnchor: [15,15], // the same for the shadow
                popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
        });
        $log.debug('Map Markers', $scope.mapMarkers)
    }
    $scope.refWvw = worlds => {
        // return console.log('World data!',d)
        $http.get('/tool/wvw' + ($scope.wvwWorld ? '?world=' + $scope.wvwWorld : ''))
            .then(r => {
                $log.debug('WVW STUFF', r, r.data)
                if (r.data == 'newMatch') {
                    $scope.wvwDisabled = true;
                    $scope.wvw = null;
                    return false;
                } else {
                    $scope.wvwDisabled = false;
                }
                $scope.wvw = r.data.wvw;
                $scope.currentMatch = $scope.wvw.skirmishes.length - 1;

                $scope.wvw.labels = $scope.wvwColors.map(cl => {
                    return r.data.wvw.all_worlds[cl].map(clw => {
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
                $log.debug('WVW', $scope.wvw)
                // $scope.currSkirm = {s:$scope.wvwColors.map(c=>r.data.wvw.scores[c]),l:labels,v:$scope.wvwColors.map(c=>r.data.data.victory_points[c])}
                $scope.mapMarkers = [];
                $scope.wvwOwned = r.data.owned||null;//wot do we own
                $scope.makeMarkers()
                let mapDiv = document.querySelector('#wvw-map');
                $log.debug('mapDiv', mapDiv, mapDiv.offsetWidth)
                // mapDiv.style.height = mapDiv.getBoundingClientRect().right +'px';
                $scope.doMap($scope.wvw.maps)
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
        $log.debug('DATA before prices', data)
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
            // $log.debug('TYPE:',c,'CORE',core,'LODE',l)
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
        $log.debug('PRICES!', data)
        return data;
    }
    $scope.isMat = (m) => {
        return m.sName.indexOf('t6') > -1 && m.sName != 't6dust';
    }
    $scope.isGem = (m) => {
        // $log.debug('checking',m,m.sName[0])
        return m.sName.indexOf('t6') < 0 && m.sName != 'wine' && m.sName.indexOf('t5') < 0 && m.sName[0] == 'l';
    }
    $scope.histClick = (e) => {
        $log.debug('CLICKED:', e, Chart)
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
                // $log.debug('After Draw', chart, 'WIDTH:', $scope.lineXWid, $scope.lineYWid, $scope.lineHeight, 'SCALE NAMES:', Object.keys(chart.scales));
                // $log.debug('CHART',JSON.stringify(chart))
                const ctx = chart.canvas.getContext("2d");
                ctx.moveTo($scope.lineYWid + ($scope.currentMatch * $scope.lineStepWid), 5)
                ctx.lineTo($scope.lineYWid + ($scope.currentMatch * $scope.lineStepWid), $scope.lineHeight + 5);
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
        hover: {
            animationDuration: 0
        }
    }
    $scope.refPrices();
    // $scope.refWvw();
    $scope.getMapState=()=>{
        //
        $log.debug('ZOOM',$scope.map.getZoom(),'BOUNDS',$scope.map.getBounds())
    }
    $scope.unproject = function(m, c) {
        return m.unproject(c, m.getMaxZoom())
    }
    $scope.doMap = function(mapObjs) {
        "use strict";
        // const unproject = function (coord) {
        //     return map.unproject(coord, map.getMaxZoom());
        // }
        let southWest, northEast;
        // return console.log('stopping just before map push!')
        $scope.map = L.map("wvw-map", {
            minZoom: 0,
            maxZoom: 6
            // zoomSnap: 0,
            // zoomDelta: 0.3,
            /* wheelPxPerZoomLevel: 140,
            maxBoundsViscosity: 1.0,
            bounceAtZoomLimits: false,
            zoomControl: false,
            attributionControl: false, */
        });

        northEast = $scope.unproject($scope.map, [15700, 8900]);
        southWest = $scope.unproject($scope.map, [5100, 15900]);

        const renderBounds = new L.LatLngBounds($scope.unproject($scope.map, [16384, 0]), $scope.unproject($scope.map, [0, 16384]));
        L.tileLayer("https://tiles.guildwars2.com/2/3/{z}/{x}/{y}.jpg", {
            subdomains: ["tiles1", "tiles2", "tiles3", "tiles4"],
            bounds: renderBounds,
            minNativeZoom: 4,
            noWrap: true
        }).addTo($scope.map);
        $scope.map.setMaxBounds(new L.LatLngBounds(southWest, northEast));
        $scope.map.setView(new L.LatLng(
                (northEast.lat - southWest.lat) / 2,
                (northEast.lng - southWest.lng) / 2),
            0);
        // map.on("click", onMapClick);

        mapObjs.forEach(mp => {
            mp.objectives.filter(mpf => !!mpf.marker).forEach(mpo => {
                let theMarker = $scope.mapMarkers.find(mmr => mmr.options.iconName == mpo.type.toLowerCase()+'-'+mpo.owner.toLowerCase());
                // $log.debug('THIS OBJECTIVE',mpo,'MARKER (probly)',theMarker,'FROM', mpo.type.toLowerCase()+'-'+mpo.owner.toLowerCase())
                L.marker($scope.unproject($scope.map, mpo.coord), { title: `${mpo.name} (owned by: ${mpo.owner})`, icon: theMarker }).addTo($scope.map)
            })
        })
        setTimeout(function() {
            $scope.map.invalidateSize();
            $scope.map.setZoom(3);
        }, 500)
    }
})