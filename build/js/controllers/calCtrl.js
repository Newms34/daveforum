app.controller('cal-cont', function($scope, $http) {
    $scope.cal = [];
    $scope.days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    $scope.calLoaded = false;
    $scope.refCal = () => {
        $http.get('/cal/all')
            .then((r) => {
                console.log('calendar events response:', r);
                $scope.makeCalendar(r.data);
            })
    };
    $scope.refCal();
    $scope.makeCalendar = (data) => {
    	//make the calendar object using the data from /cal/all
        $scope.offsetDays = $scope.days.rotate(new Date().getDay());
        let wks = 6,
            days = 7,
            i = 0,
            j = 0,
            today = new Date(),
            tDay;
        today.setHours(0,0,0,0);//set day to beginning of the day (12am)
        today = today.getTime();
        $scope.cal = []
        for (i; i < wks; i++) {
            let newWk = {
                wk: i,
                wkSt: new Date(today + ((7 * i) * 1000 * 3600 * 24)),
                wkEn: new Date(today + (((7 * (i + 1)) - 1) * 1000 * 3600 * 24)),
                days: []
            }
            for (j = 0; j < days; j++) {
                // for each day, add that number of days to our 'current' day (today)
                let theDate = new Date(today+(((7*i)+j))*1000*3600*24);
                newWk.days.push({
                    d: j,
                    evts: data.filter(et=>{
                    	let dtNum = new Date(et.eventDate).getTime();
                    	console.log('THIS DATE DTNUM',dtNum,theDate.getTime())
                    	return dtNum>theDate.getTime() && dtNum<(theDate.getTime()+(1000*3600*24));
                    	// && dtNum<(theDate.getTime()+(1000*3600*24))
                    }),
                    date: theDate
                })
            }
            $scope.cal.push(newWk);
        }
        console.log('CAL STUFF', $scope.cal, $scope.offsetDays)
    };
    $scope.viewEvent=(ev)=>{
    	console.log('View event',ev)
    	bulmabox.alert(`Event: ${ev.title}`,`Time:${new Date(ev.eventDate).toString()}<hr>${ev.text}`)
    };
    $scope.editEvent=(ev)=>{
    	console.log('Edit event',ev)
        let opts = '';
        let theDate = new Date(ev.eventDate)
        for (let i=0;i<24;i++){
            let hr = i<13?i:i-12,
            ampm = i<12?' am':' pm';
            if(!hr||hr==0){
                hr=12;
            }
            opts+='<option value ='+i+' '+(theDate.getHours()==i && theDate.getMinutes()==0?'selected':'')+'>'+hr+':00'+ampm+'</options><option value ='+(i+0.5)+' '+(theDate.getHours()==i && theDate.getMinutes()==30?'selected':'')+'>'+hr+':30'+ampm+'</options>'
        }
    	 bulmabox.custom('Edit Event',
            `<div class="field">
            	<label class='label'>
                Event Title
                </label>
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="A title for your event" id='newTitle' value='${ev.title}'>
                        <span class="icon is-small is-left">
                            <i class="fa fa-puzzle-piece"></i>
                        </span>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
               Description of Event
                </label>
                    <p class="control">
                        <textarea class='textarea' id='newMsg' placeholder='A description for your event (optional)'>${ev.text}</textarea>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
                When should this event occur?
                </label>
                    <p class="select">
                        <select id='newTime'>
                        	${opts}
                        </select>
                    </p>
                </div>`,
            function() {
                //send event!
                const title = document.querySelector('#newTitle').value,
                msg = document.querySelector('#newMsg').value,
                today = new Date();
                today.setHours(0,0,0,0);
                //add hours in day, today, and day offset
                let time = (parseInt(document.querySelector('#newTime').value)*3600*1000)+today.getTime()+(((7*wk.wk)+dy.d)*1000*3600*24);
                console.log('Sending event',title,msg,time,)
                $http.post('/cal/new',{
                	title:title,
                	text:msg,
                	eventDate:time,
                })
                .then(function(r){
                	console.log('new event response',r)
                	$scope.refCal()
                })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Add</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)
    };
    $scope.delEvent=(ev)=>{
    	console.log('Delete event',ev)
    	bulmabox.confirm('Delete Event',`Are you sure you wish to delete the following event?<br> Title: ${ev.title}<br>Description: ${ev.text}`,function(r){
    		if(!r||r==null){
    			return false;
    		}else{
    			//delete!
    			$http.get('/cal/del?id='+ev._id).then(function(r){
    				console.log('delete response',r)
    				$scope.refCal();
    			})
    		}
    	})
    };

    $scope.addEvent = (wk,dy) => {
        console.log('DAY is', dy);
        let opts = '';
        for (let i=0;i<24;i++){
        	let hr = i<13?i:i-12,
        	ampm = i<12?' am':' pm';
        	if(!hr||hr==0){
        		hr=12;
        	}
        	opts+='<option value ='+i+'>'+hr+':00'+ampm+'</options><option value ='+(i+0.5)+'>'+hr+':30'+ampm+'</options>'
        }
        bulmabox.custom('Add Event',
            `<div class="field">
            	<label class='label'>
                Event Title
                </label>
                    <p class="control has-icons-left">
                        <input class="input" type="text" placeholder="A title for your event" id='newTitle'>
                        <span class="icon is-small is-left">
                            <i class="fa fa-puzzle-piece"></i>
                        </span>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
               Description of Event
                </label>
                    <p class="control">
                        <textarea class='textarea' id='newMsg' placeholder='A description for your event (optional)'></textarea>
                    </p>
                </div>
                <div class="field">
                <label class='label'>
                When should this event occur?
                </label>
                    <p class="select">
                        <select id='newTime'>
                        	<option disabled selected>Select a time</option>
                        	${opts}
                        </select>
                    </p>
                </div>`,
            function() {
                //send event!
                const title = document.querySelector('#newTitle').value,
                msg = document.querySelector('#newMsg').value,
                today = new Date();
                today.setHours(0,0,0,0);
                //add hours in day, today, and day offset
                let time = (parseInt(document.querySelector('#newTime').value)*3600*1000)+today.getTime()+(((7*wk.wk)+dy.d)*1000*3600*24);
                console.log('Sending event',title,msg,time,)
                $http.post('/cal/new',{
                	title:title,
                	text:msg,
                	eventDate:time,
                })
                .then(function(r){
                	console.log('new event response',r)
                	$scope.refCal()
                })
            }, `<button class='button is-info' onclick='bulmabox.runCb(bulmabox.params.cb)'>Add</button><button class='button is-danger' onclick='bulmabox.kill("bulmabox-diag")'>Cancel</button>`)

    }
})