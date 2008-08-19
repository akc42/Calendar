// Calendar: a Javascript class for Mootools that adds accessible and unobtrusive date pickers to your form elements <http://electricprism.com/aeron/calendar>
// Calendar RC4, Copyright (c) 2007 Aeron Glemann <http://electricprism.com/aeron>, MIT Style License.
// Mootools 1.2 compatibility by Davorin Šego
/* Further modifications
 *	Copyright (c) 2008 Alan Chandler
 *	see COPYING.txt in this directory for more details
 */






var Calendar = new Class({	

	options: {
		blocked: [], // blocked dates 
		classes: [], // ['calendar', 'prev', 'next', 'month', 'year', 'today', 'invalid', 'valid', 'inactive', 'active', 'hover', 'hilite']
		days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // days of the week starting at sunday
		direction: 0, // -1 past, 0 past + future, 1 future
		draggable: true,
		format:'jS M Y g:i a';
		months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		navigation: 1, // 0 = no nav; 1 = single nav for month; 2 = dual nav for month and year
		offset: 0, // first day of the week: 0 = sunday, 1 = monday, etc..
		onHideStart: Class.empty,
		onHideComplete: Class.empty,
		onShowStart: Class.empty,
		onShowComplete: Class.empty,
		pad: {days:1,mins:0}, // padding between multiple calendars
		tweak: {x: 0, y: 0} // tweak calendar positioning
	},

	// initialize: calendar constructor
	// @param obj (obj) a js object containing the form elements and format strings { id: 'format', id: 'format' etc }
	// @param props (obj) optional properties

	initialize: function(obj, options) {
		// basic error checking
		if (!obj) { return false; }

		this.setOptions(options);

		// create our classes array
		var keys = ['calendar', 'prev', 'next', 'month', 'year', 'today', 'invalid', 'valid', 'inactive', 'active', 'hover', 'hilite'];

		var values = keys.map(function(key, i) {
			if (this.options.classes[i]) {
				if (this.options.classes[i].length) { key = this.options.classes[i]; }
			}
			return key;
		}, this);

		this.classes = values.associate(keys);

		// create cal element with css styles required for proper cal functioning
		this.calendar = new Element('div', { 
			'styles': { left: '-1000px', opacity: 0, position: 'absolute', top: '-1000px', zIndex: 1000 }
		}).addClass(this.classes.calendar).injectInside(document.body);

		// iex 6 needs a transparent iframe underneath the calendar in order to not allow select elements to render through
		if (window.ie6) {
			this.iframe = new Element('iframe', { 
				'styles': { left: '-1000px', position: 'absolute', top: '-1000px', zIndex: 999 }
			}).injectInside(document.body);
			this.iframe.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
		}

		// initialize fade method
		this.fx = new Fx.Tween(this.calendar, {
			onStart: function() { 
				if (this.calendar.getStyle('opacity') == 0) { // show
					if (window.ie6) { this.iframe.setStyle('display', 'block'); }
					this.calendar.setStyle('display', 'block');
					this.fireEvent('onShowStart', this.element);
				}
				else { // hide
					this.fireEvent('onHideStart', this.element);
				}
			}.bind(this),
			onComplete: function() { 
				if (this.calendar.getStyle('opacity') == 0) { // hidden
					this.calendar.setStyle('display', 'none');
					if (window.ie6) { this.iframe.setStyle('display', 'none'); }
					this.fireEvent('onHideComplete', this.element);
				}
				else { // shown
					this.fireEvent('onShowComplete', this.element);
				}
			}.bind(this)
		});

		// initialize drag method
		if (window.Drag && this.options.draggable) {
			this.drag = new Drag.Move(this.calendar, { 
				onDrag: function() {
					if (window.ie6) { this.iframe.setStyles({ left: this.calendar.style.left, top: this.calendar.style.top }); } 
				}.bind(this) 
			}); 
		}
		
		// create calendars array
		this.calendars = [];

		var id = 0;
		var d = new Date(); // today

		d.setTime(d.getTime() + this.options.direction.toInt()*60000); // correct today for directional offset

		for (var i in obj) {
			var cal = { 
				button: new Element('button', { 'type': 'button' }),
				el: $(i),
				els: [],
				id: id++,
				month: d.getMonth(),
				visible: false,
				year: d.getFullYear()
			};

			// fix for bad element (naughty, naughty element!)
			if (!this.element(i, obj[i], cal)) { continue; }
			
			cal.el.addClass(this.classes.calendar);

			// create cal button
			cal.button.addClass(this.classes.calendar).addEvent('click', function(cal) { this.toggle(cal); }.pass(cal, this)).injectAfter(cal.el);

			// read in default value
			cal.val = this.read(cal);

			$extend(cal, this.bounds(cal)); // abs bounds of calendar

			$extend(cal, this.values(cal)); // valid days, months, years

			this.rebuild(cal);

			this.calendars.push(cal); // add to cals array		
		}	
	},


	// blocked: returns an array of blocked days for the month / year
	// @param cal (obj)
	// @returns blocked days (array)

	blocked: function(cal) {
		var blocked = [];
		var offset = new Date(cal.year, cal.month, 1).getDay(); // day of the week (offset)
		var last = new Date(cal.year, cal.month + 1, 0).getDate(); // last day of this month
		
		this.options.blocked.each(function(date){
			var values = date.split(' ');
			
			// preparation
			for (var i = 0; i <= 3; i++){ 
				if (!values[i]){ values[i] = (i == 3) ? '' : '*'; } // make sure blocked date contains values for at least d, m and y
				values[i] = values[i].contains(',') ? values[i].split(',') : new Array(values[i]); // split multiple values
				var count = values[i].length - 1;
				for (var j = count; j >= 0; j--){
					if (values[i][j].contains('-')){ // a range
						var val = values[i][j].split('-');
						for (var k = val[0]; k <= val[1]; k++){
							if (!values[i].contains(k)){ values[i].push(k + ''); }
						}
						values[i].splice(j, 1);
					}
				}
			}

			// execution
			if (values[2].contains(cal.year + '') || values[2].contains('*')){
				if (values[1].contains(cal.month + 1 + '') || values[1].contains('*')){
					values[0].each(function(val){ // if blocked value indicates this month / year
						if (val > 0){ blocked.push(val.toInt()); } // add date to blocked array
					});

					if (values[3]){ // optional value for day of week
						for (var i = 0; i < last; i++){
								var day = (i + offset) % 7;
	
								if (values[3].contains(day + '')){ 
									blocked.push(i + 1); // add every date that corresponds to the blocked day of the week to the blocked array
								}
						}
					}
				}
			}
		}, this);

		return blocked;
	},


	// bounds: returns the start / end bounds of the calendar
	// @param cal (obj)
	// @returns obj	

	bounds: function(cal) {
		// 1. first we assume the calendar has no bounds (or a thousand years in either direction)
		
		// by default the calendar will accept a millennium in either direction
		var start = new Date(1000, 0, 1); // jan 1, 1000
		var end = new Date(2999, 11, 31); // dec 31, 2999

		// 2. but if the cal is one directional we adjust accordingly
		var date = new Date().getDate() + this.options.direction.toInt();

		if (this.options.direction > 0) {
			start = new Date();
			start.setDate(date + this.options.pad * cal.id);
		}
		
		if (this.options.direction < 0) {
			end = new Date();
			end.setDate(date - this.options.pad * (this.calendars.length - cal.id - 1));
		}

		// 3. then we can further filter the limits by using the pre-existing values in the selects
		cal.els.each(function(el) {	
			if (el.get('tag') == 'select') {		
				if (el.format.test('(y|Y)')) { // search for a year select
					var years = [];

					el.getChildren().each(function(option) { // get options
						var values = this.unformat(option.value, el.format);
	
						if (!years.contains(values[0])) { years.push(values[0]); } // add to years array
					}, this);
	
					years.sort(this.sort);
			
					if (years[0] > start.getFullYear()) { 
						d = new Date(years[0], start.getMonth() + 1, 0); // last day of new month
					
						if (start.getDate() > d.getDate()) { start.setDate(d.getDate()); }
	
						start.setYear(years[0]); 
					}
					
					if (years.getLast() < end.getFullYear()) { 
						d = new Date(years.getLast(), end.getMonth() + 1, 0); // last day of new month
					
						if (end.getDate() > d.getDate()) { end.setDate(d.getDate()); }
	
						end.setYear(years.getLast());
					}		
				}
	
				if (el.format.test('(F|m|M|n)')) { // search for a month select
					var months_start = [];
					var months_end = [];

					el.getChildren().each(function(option) { // get options
						var values = this.unformat(option.value, el.format);
	
						if ($type(values[0]) != 'number' || values[0] == years[0]) { // if it's a year / month combo for curr year, or simply a month select
							if (!months_start.contains(values[1])) { months_start.push(values[1]); } // add to months array
						}
	
						if ($type(values[0]) != 'number' || values[0] == years.getLast()) { // if it's a year / month combo for curr year, or simply a month select
							if (!months_end.contains(values[1])) { months_end.push(values[1]); } // add to months array
						}
					}, this);
	
					months_start.sort(this.sort);
					months_end.sort(this.sort);
					
					if (months_start[0] > start.getMonth()) { 
						d = new Date(start.getFullYear(), months_start[0] + 1, 0); // last day of new month
					
						if (start.getDate() > d.getDate()) { start.setDate(d.getDate()); }
	
						start.setMonth(months_start[0]); 
					}
					
					if (months_end.getLast() < end.getMonth()) { 
						d = new Date(start.getFullYear(), months_end.getLast() + 1, 0); // last day of new month
					
						if (end.getDate() > d.getDate()) { end.setDate(d.getDate()); }
	
						end.setMonth(months_end.getLast());
					}		
				}
			}
		}, this);
		
		return { 'start': start, 'end': end };
	},


	// caption: returns the caption element with header and navigation
	// @param cal (obj)
	// @returns caption (element)

	caption: function(cal) {
		// start by assuming navigation is allowed
		var navigation = {
			prev: { 'month': true, 'year': true },
			next: { 'month': true, 'year': true }
		};
		
		// if we're in an out of bounds year
		if (cal.year == cal.start.getFullYear()) { 
			navigation.prev.year = false; 
			if (cal.month == cal.start.getMonth() && this.options.navigation == 1) { 
				navigation.prev.month = false;
			}		
		}		
		if (cal.year == cal.end.getFullYear()) { 
			navigation.next.year = false; 
			if (cal.month == cal.end.getMonth() && this.options.navigation == 1) { 
				navigation.next.month = false;
			}
		}

		// special case of improved navigation but months array with only 1 month we can disable all month navigation
		if ($type(cal.months) == 'array') {
			if (cal.months.length == 1 && this.options.navigation == 2) {
				navigation.prev.month = navigation.next.month = false;
			}
		}

		var caption = new Element('caption');

		var prev = new Element('a').addClass(this.classes.prev).appendText('\x3c'); // <		
		var next = new Element('a').addClass(this.classes.next).appendText('\x3e'); // >

		if (this.options.navigation == 2) {
			var month = new Element('span').addClass(this.classes.month).injectInside(caption);
			
			if (navigation.prev.month) { prev.clone().addEvent('click', function(cal) { this.navigate(cal, 'm', -1); }.pass(cal, this)).injectInside(month); }
			
			month.adopt(new Element('span').appendText(this.options.months[cal.month]));

			if (navigation.next.month) { next.clone().addEvent('click', function(cal) { this.navigate(cal, 'm', 1); }.pass(cal, this)).injectInside(month); }

			var year = new Element('span').addClass(this.classes.year).injectInside(caption);

			if (navigation.prev.year) { prev.clone().addEvent('click', function(cal) { this.navigate(cal, 'y', -1); }.pass(cal, this)).injectInside(year); }
			
			year.adopt(new Element('span').appendText(cal.year));

			if (navigation.next.year) { next.clone().addEvent('click', function(cal) { this.navigate(cal, 'y', 1); }.pass(cal, this)).injectInside(year); }
		}
		else { // 1 or 0
			if (navigation.prev.month && this.options.navigation) { prev.clone().addEvent('click', function(cal) { this.navigate(cal, 'm', -1); }.pass(cal, this)).injectInside(caption); }

			caption.adopt(new Element('span').addClass(this.classes.month).appendText(this.options.months[cal.month]));
			
			caption.adopt(new Element('span').addClass(this.classes.year).appendText(cal.year));
			
			if (navigation.next.month && this.options.navigation) { next.clone().addEvent('click', function(cal) { this.navigate(cal, 'm', 1); }.pass(cal, this)).injectInside(caption); }

		}

		return caption;
	},


	// changed: run when a select value is changed
	// @param cal (obj)

	changed: function(cal) {
		cal.val = this.read(cal); // update calendar val from inputs	

		$extend(cal, this.values(cal)); // update bounds - based on curr month

		this.rebuild(cal); // rebuild days select

		if (!cal.val) { return; } // in case the same date was clicked the cal has no set date we should exit		

		if (cal.val.getDate() < cal.days[0]) { cal.val.setDate(cal.days[0]); }
		if (cal.val.getDate() > cal.days.getLast()) { cal.val.setDate(cal.days.getLast()); }
		
		cal.els.each(function(el) {	// then we can set the value to the field
			el.value = this.format(cal.val, el.format); 		
		}, this);
		
		this.check(cal); // checks other cals

		this.calendars.each(function(kal) { // update cal graphic if visible
			if (kal.visible) { this.display(kal); }
		}, this);
	},


	// check: checks other calendars to make sure no overlapping values
	// @param cal (obj)

	check: function(cal) {
		this.calendars.each(function(kal, i) {
			if (kal.val) { // if calendar has value set
				var change = false;
			
				if (i < cal.id) { // preceding calendar
					var bound = new Date(Date.parse(cal.val));
					
					bound.setDate(bound.getDate() - (this.options.pad * (cal.id - i)));

					if (bound < kal.val) { change = true; }
				}
				if (i > cal.id) { // following calendar
					var bound = new Date(Date.parse(cal.val));
					
					bound.setDate(bound.getDate() + (this.options.pad * (i - cal.id)));
					
					if (bound > kal.val) { change = true; }
				}

				if (change) {
					if (kal.start > bound) { bound = kal.start; }
					if (kal.end < bound) { bound = kal.end; }

					kal.month = bound.getMonth();
					kal.year = bound.getFullYear();		

					$extend(kal, this.values(kal));			

					// TODO - IN THE CASE OF SELECT MOVE TO NEAREST VALID VALUE
					// IN THE CASE OF INPUT DISABLE

					// if new date is not valid better unset cal value
					// otherwise it would mean incrementally checking to find the nearest valid date which could be months / years away
					kal.val = kal.days.contains(bound.getDate()) ? bound : null;

					this.write(kal);

					if (kal.visible) { this.display(kal); } // update cal graphic if visible
				}
			}
			else {
				kal.month = cal.month;
				kal.year = cal.year;
			}
		}, this);
	},
	

	// clicked: run when a valid day is clicked in the calendar
	// @param cal (obj)

	clicked: function(td, day, cal) {
		cal.val = (this.value(cal) == day) ? null : new Date(cal.year, cal.month, day); // set new value - if same then disable

		this.write(cal); 

		// ok - in the special case that it's all selects and there's always a date no matter what (at least as far as the form is concerned)
		// we can't let the calendar undo a date selection - it's just not possible!!
		if (!cal.val) { cal.val = this.read(cal); }

		if (cal.val) {
			this.check(cal); // checks other cals						
			this.toggle(cal); // hide cal
		} 
		else { // remove active class and replace with valid
			td.addClass(this.classes.valid);
			td.removeClass(this.classes.active);
		}
	},
	

	// display: create calendar element
	// @param cal (obj)

	display: function(cal) {
		// 1. header and navigation
		this.calendar.empty(); // init div

		this.calendar.className = this.classes.calendar + ' ' + this.options.months[cal.month].toLowerCase();

		var div = new Element('div').injectInside(this.calendar); // a wrapper div to help correct browser css problems with the caption element

		var table = new Element('table').injectInside(div).adopt(this.caption(cal));
				
		// 2. day names		
		var thead = new Element('thead').injectInside(table);

		var tr = new Element('tr').injectInside(thead);
		
		for (var i = 0; i <= 6; i++) {
			var th = this.options.days[(i + this.options.offset) % 7];
			
			tr.adopt(new Element('th', { 'title': th }).appendText(th.substr(0, 1)));
		}

		// 3. day numbers
		var tbody = new Element('tbody').injectInside(table);
		var tr = new Element('tr').injectInside(tbody);

		var d = new Date(cal.year, cal.month, 1);
		var offset = ((d.getDay() - this.options.offset) + 7) % 7; // day of the week (offset)
		var last = new Date(cal.year, cal.month + 1, 0).getDate(); // last day of this month
		var prev = new Date(cal.year, cal.month, 0).getDate(); // last day of previous month
		var active = this.value(cal); // active date (if set and within curr month)
		var valid = cal.days; // valid days for curr month
		var inactive = []; // active dates set by other calendars
		var hilited = [];
		this.calendars.each(function(kal, i) {
			if (kal != cal && kal.val) {
				if (cal.year == kal.val.getFullYear() && cal.month == kal.val.getMonth()) { inactive.push(kal.val.getDate()); }

				if (cal.val) {
					for (var day = 1; day <= last; day++) {
						d.setDate(day);
						
						if ((i < cal.id && d > kal.val && d < cal.val) || (i > cal.id && d > cal.val && d < kal.val)) { 
							if (!hilited.contains(day)) { hilited.push(day); }
						}
					}
				}
			}
		}, this);
		var d = new Date();
		var today = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); // today obv 
		
		for (var i = 1; i < 43; i++) { // 1 to 42 (6 x 7 or 6 weeks)
			if ((i - 1) % 7 == 0) { tr = new Element('tr').injectInside(tbody); } // each week is it's own table row

			var td = new Element('td').injectInside(tr);
						
			var day = i - offset;
			var date = new Date(cal.year, cal.month, day);
			
			var cls = '';
			
			if (day === active) { cls = this.classes.active; } // active
			else if (inactive.contains(day)) { cls = this.classes.inactive; } // inactive
			else if (valid.contains(day)) { cls = this.classes.valid; } // valid
			else if (day >= 1 && day <= last) { cls = this.classes.invalid; } // invalid

			if (date.getTime() == today) { cls = cls + ' ' + this.classes.today; } // adds class for today

			if (hilited.contains(day)) { cls = cls + ' ' + this.classes.hilite; } // adds class if hilited

			td.addClass(cls);

			if (valid.contains(day)) { // if it's a valid - clickable - day we add interaction
				td.setProperty('title', this.format(date, 'D M jS Y'));
				
				td.addEvents({
					'click': function(td, day, cal) { 
						this.clicked(td, day, cal); 
					}.pass([td, day, cal], this),
					'mouseover': function(td, cls) { 
						td.addClass(cls); 
					}.pass([td, this.classes.hover]),
					'mouseout': function(td, cls) { 
						td.removeClass(cls); 
					}.pass([td, this.classes.hover])
				});
			}

			// pad calendar with last days of prev month and first days of next month
			if (day < 1) { day = prev + day; }
			else if (day > last) { day = day - last; }

			td.appendText(day);
		}
	},


	// element: helper function
	// @param el (string) element id
	// @param f (string) format string
	// @param cal (obj)

	element: function(el, f, cal) {
		if ($type(f) == 'object') { // in the case of multiple inputs per calendar
			for (var i in f) { 
				if (!this.element(i, f[i], cal)) { return false; }		
			}
			
			return true;
		}

		el = $(el);

		if (!el) { return false; }
		
		el.format = f;
		
		if (el.get('tag') == 'select') { // select elements allow the user to manually set the date via select option
			el.addEvent('change', function(cal) { this.changed(cal); }.pass(cal, this));
		}
		else { // input (type text) elements restrict the user to only setting the date via the calendar
			el.readOnly = true;
			el.addEvent('focus', function(cal) { this.toggle(cal); }.pass(cal, this));
		}

		cal.els.push(el);

		return true;
	},


	// format: formats a date object according to passed in instructions
	// @param date (obj)
	// @param f (string) any combination of punctuation / separators and d, j, D, l, S, m, n, F, M, y, Y
	// @returns string

	format: function(date, format) {
		var str = '';
		
		if (date) {
			var j = date.getDate(); // 1 - 31
			var w = date.getDay(); // 0 - 6
			var l = this.options.days[w]; // Sunday - Saturday
			var n = date.getMonth() + 1; // 1 - 12
			var f = this.options.months[n - 1]; // January - December
			var y = date.getFullYear() + ''; // 19xx - 20xx
			var h = date.getHours(); // 0 - 23
			var G = h + '';			// h as string
			var g = (h == 0)?12:((h > 12)?h-12:h) + ''; // '1' to '12'
			var i = date.getMinutes() + ''; //'0' - '59'
			i = (i.length == 1)?'0'+i:i;
			
			for (var i = 0, len = format.length; i < len; i++) {
				var cha = format.charAt(i); // format char
				
				switch(cha) {
					// year cases
					case 'y': // xx - xx
						y = y.substr(2);
					case 'Y': // 19xx - 20xx
						str += y;
						break;
	
					// month cases
					case 'm': // 01 - 12
						if (n < 10) { n = '0' + n; }
					case 'n': // 1 - 12
						str += n;
						break;
	
					case 'M': // Jan - Dec
						f = f.substr(0, 3);
					case 'F': // January - December
						str += f;
						break;
	
					// day cases
					case 'd': // 01 - 31
						if (j < 10) { j = '0' + j; }
					case 'j': // 1 - 31
						str += j;
						break;
	
					case 'D': // Sun - Sat
						l = l.substr(0, 3);
					case 'l': // Sunday - Saturday
						str += l;
						break;
	
					case 'N': // 1 - 7
						w += 1;
					case 'w': // 0 - 6
						str += w;
						break;

					case 'S': // st, nd, rd or th (works well with j)
						if (j % 10 == 1 && j != '11') { str += 'st'; }
						else if (j % 10 == 2 && j != '12') { str += 'nd'; }
						else if (j % 10 == 3 && j != '13') { str += 'rd'; }
						else { str += 'th'; }
						break;
	
					case 'a' :
						str += (h < 12)? 'am':'pm';
						break;

					case 'A' :
						str += (h < 12)? 'AM':'PM';
						break;

					case 'g' :
						str += g;
						break;
					case 'h' :
						str += 	(g.length == 1)?'0'+g:g;
						break;
					case 'G' :
						str += G;
					case 'H' :
						str += 	(G.length == 1)?'0'+G:G;
						break;
					default:
						str += cha;
				}
			}
		}

	  return str; //  return format with values replaced
	},


	// navigate: calendar navigation
	// @param cal (obj)
	// @param type (str) m or y for month or year
	// @param n (int) + or - for next or prev

	navigate: function(cal, type, n) {
		switch (type) {
			case 'm': // month
					if ($type(cal.months) == 'array') {
						var i = cal.months.indexOf(cal.month) + n; // index of current month
						
						if (i < 0 || i == cal.months.length) { // out of range
							if (this.options.navigation == 1) { // if type 1 nav we'll need to increment the year
								this.navigate(cal, 'y', n);		
							}
		
							i = (i < 0) ? cal.months.length - 1 : 0;
						}

						cal.month = cal.months[i];
					}
					else { 
						var i = cal.month + n;
		
						if (i < 0 || i == 12) {
							if (this.options.navigation == 1) {
								this.navigate(cal, 'y', n);	
							}
		
							i = (i < 0) ? 11 : 0;
						}
						
						cal.month = i;
					}		
					break;

				case 'y': // year
					if ($type(cal.years) == 'array') {
						var i = cal.years.indexOf(cal.year) + n;

						cal.year = cal.years[i]; 
					}
					else { 
						cal.year += n;
					}						
					break;		
		}

		$extend(cal, this.values(cal));

		if ($type(cal.months) == 'array') { // if the calendar has a months select
			var i = cal.months.indexOf(cal.month); // and make sure the curr months exists for the new year

			if (i < 0) { cal.month = cal.months[0]; } // otherwise we'll reset the month
		}


		this.display(cal);
	},


	// read: compiles cal value based on array of inputs passed in
	// @param cal (obj)
	// @returns date (obj) or (null)

	read: function(cal) {
		var arr = [null, null, null];

		cal.els.each(function(el) {
			// returns an array which may contain empty values
			var values = this.unformat(el.value, el.format);
			
			values.each(function(val, i) { 
				if ($type(val) == 'number') { arr[i] = val; }
			}); 
		}, this);

		// we can update the cals month and year values
		if ($type(arr[0]) == 'number') { cal.year = arr[0]; }
		if ($type(arr[1]) == 'number') { cal.month = arr[1]; }

		var val = null;

		if (arr.every(function(i) { return $type(i) == 'number'; })) { // if valid date
			var last = new Date(arr[0], arr[1] + 1, 0).getDate(); // last day of month

			if (arr[2] > last) { arr[2] = last; } // make sure we stay within the month (ex in case default day of select is 31 and month is feb)
			
			val = new Date(arr[0], arr[1], arr[2]);
		}

		return (cal.val == val) ? null : val; // if new date matches old return null (same date clicked twice = disable)
	},

	
	// rebuild: rebuilds days + months selects
	// @param cal (obj)

	rebuild: function(cal) {
		cal.els.each(function(el) {			
			/*
			if (el.get('tag') == 'select' && el.format.test('^(F|m|M|n)$')) { // special case for months-only select
				if (!cal.options) { cal.options = el.clone(); } // clone a copy of months select
			
				var val = (cal.val) ? cal.val.getMonth() : el.value.toInt();

				el.empty(); // initialize select

				cal.months.each(function(month) {
					// create an option element
					var option = new Element('option', {
						'selected': (val == month),
						'value': this.format(new Date(1, month, 1), el.format);
					}).appendText(day).injectInside(el);
				}, this);
			}
			*/

			if (el.get('tag') == 'select' && el.format.test('^(d|j)$')) { // special case for days-only select
				var d = this.value(cal);

				if (!d) { d = el.value.toInt(); } // if the calendar doesn't have a set value, try to use value from select

				el.empty(); // initialize select

				cal.days.each(function(day) {
					// create an option element
					var option = new Element('option', {
						'selected': (d == day),
						'value': ((el.format == 'd' && day < 10) ? '0' + day : day)
					}).appendText(day).injectInside(el);
				}, this);
			}
		}, this); 
	},


	// sort: helper function for numerical sorting

	sort: function(a, b) {
		return a - b;
	},


	// toggle: show / hide calendar 
	// @param cal (obj)

	toggle: function(cal) {
		document.removeEvent('mousedown', this.fn); // always remove the current mousedown script first
			
		if (cal.visible) { // simply hide curr cal						
			cal.visible = false;
			cal.button.removeClass(this.classes.active); // active
			
			this.fx.start('opacity', 1, 0);
		}
		else { // otherwise show (may have to hide others)
			// hide cal on out-of-bounds click
			this.fn = function(e, cal) { 
				var e = new Event(e);
			
				var el = e.target;

				var stop = false;
				
				while (el != document.body && el.nodeType == 1) {
					if (el == this.calendar) { stop = true; }
					this.calendars.each(function(kal) {
						if (kal.button == el || kal.els.contains(el)) { stop = true; }
					});

					if (stop) { 
						e.stop();
						return false;
					}
					else { el = el.parentNode; }
				}
				
				this.toggle(cal);
			}.create({ 'arguments': cal, 'bind': this, 'event': true });				

			document.addEvent('mousedown', this.fn);

			this.calendars.each(function(kal) {
				if (kal == cal) {
					kal.visible = true;
					kal.button.addClass(this.classes.active); // css c-icon-active
				}
				else {
					kal.visible = false;
					kal.button.removeClass(this.classes.active); // css c-icon-active
				}
			}, this);
			
			var size = window.getScrollSize();
			
			var coord = cal.button.getCoordinates();

			var x = coord.right + this.options.tweak.x;
			var y = coord.top + this.options.tweak.y;

			// make sure the calendar doesn't open off screen
			if (!this.calendar.coord) { this.calendar.coord = this.calendar.getCoordinates(); }

			if (x + this.calendar.coord.width > size.x) { x -= (x + this.calendar.coord.width - size.x); }
			if (y + this.calendar.coord.height > size.y) { y -= (y + this.calendar.coord.height - size.y); }
			
			this.calendar.setStyles({ left: x + 'px', top: y + 'px' });

			if (window.ie6) { 
				this.iframe.setStyles({ height: this.calendar.coord.height + 'px', left: x + 'px', top: y + 'px', width: this.calendar.coord.width + 'px' }); 
			}

			this.display(cal);
			
			this.fx.start('opacity', 0, 1);
		}
	},


	// unformat: takes a value from an input and parses the d, m and y elements
	// @param val (string)
	// @param f (string) any combination of punctuation / separators and d, j, D, l, S, m, n, F, M, y, Y
	// @returns array
	
	unformat: function(val, f) {
		f = f.escapeRegExp();
		
		var re = {
			d: '([0-9]{2})',
			j: '([0-9]{1,2})',
			D: '(' + this.options.days.map(function(day) { return day.substr(0, 3); }).join('|') + ')',					
			l: '(' + this.options.days.join('|') + ')',
			S: '(st|nd|rd|th)',
			F: '(' + this.options.months.join('|') + ')',
			m: '([0-9]{2})',
			M: '(' + this.options.months.map(function(month) { return month.substr(0, 3); }).join('|') + ')',					
			n: '([0-9]{1,2})',
			Y: '([0-9]{4})',
			y: '([0-9]{2})'
		}

		var arr = []; // array of indexes

		var g = '';

		// convert our format string to regexp
		for (var i = 0; i < f.length; i++) {
			var c = f.charAt(i);
			
			if (re[c]) {
				arr.push(c);

				g += re[c];
			}
			else {
				g += c;
			}
		}

		// match against date
		var matches = val.match('^' + g + '$');
		
		var dates = new Array(3);

		if (matches) {
			matches = matches.slice(1); // remove first match which is the date

			arr.each(function(c, i) {
				i = matches[i];
				
				switch(c) {
					// year cases
					case 'y':
						i = '19' + i; // 2 digit year assumes 19th century (same as JS)
					case 'Y':
						dates[0] = i.toInt();
						break;

					// month cases
					case 'F':
						i = i.substr(0, 3);
					case 'M':
						i = this.options.months.map(function(month) { return month.substr(0, 3); }).indexOf(i) + 1;
					case 'm':
					case 'n':
						dates[1] = i.toInt() - 1;
						break;

					// day cases
					case 'd':
					case 'j':
						dates[2] = i.toInt();
						break;
				}
			}, this);
		}

		return dates;
	},


	// value: returns day value of calendar if set
	// @param cal (obj)
	// @returns day (int) or null

	value: function(cal) {
		var day = null;

		if (cal.val) {
			if (cal.year == cal.val.getFullYear() && cal.month == cal.val.getMonth()) { day = cal.val.getDate(); }
		}

		return day;
	},
	

	// values: returns the years, months (for curr year) and days (for curr month and year) for the calendar
	// @param cal (obj)
	// @returns obj	

	values: function(cal) {
		var years, months, days;

		cal.els.each(function(el) {	
			if (el.get('tag') == 'select') {		
				if (el.format.test('(y|Y)')) { // search for a year select
					years = [];

					el.getChildren().each(function(option) { // get options
						var values = this.unformat(option.value, el.format);
	
						if (!years.contains(values[0])) { years.push(values[0]); } // add to years array
					}, this);
	
					years.sort(this.sort);
				}
	
				if (el.format.test('(F|m|M|n)')) { // search for a month select
					months = []; // 0 - 11 should be

					el.getChildren().each(function(option) { // get options
						var values = this.unformat(option.value, el.format);
	
						if ($type(values[0]) != 'number' || values[0] == cal.year) { // if it's a year / month combo for curr year, or simply a month select
							if (!months.contains(values[1])) { months.push(values[1]); } // add to months array
						}
					}, this);
	
					months.sort(this.sort);
				}
				
				if (el.format.test('(d|j)') && !el.format.test('^(d|j)$')) { // search for a day select, but NOT a days only select
					days = []; // 1 - 31
					
					el.getChildren().each(function(option) { // get options
						var values = this.unformat(option.value, el.format);

						// in the special case of days we dont want the value if its a days only select
						// otherwise that will screw up the options rebuilding
						// we will take the values if they are exact dates though
						if (values[0] == cal.year && values[1] == cal.month) {
							if (!days.contains(values[2])) { days.push(values[2]); } // add to days array
						}
					}, this);
				}
			}
		}, this);
		
		// we start with what would be the first and last days were there no restrictions
		var first = 1;
		var last = new Date(cal.year, cal.month + 1, 0).getDate(); // last day of the month
		
		// if we're in an out of bounds year
		if (cal.year == cal.start.getFullYear()) {
			// in the special case of improved navigation but no months array, we'll need to construct one
			if (months == null && this.options.navigation == 2) {
				months = [];
				
				for (var i = 0; i < 12; i ++) { 
					if (i >= cal.start.getMonth()) { months.push(i); } 
				}
			}
			
			// if we're in an out of bounds month
			if (cal.month == cal.start.getMonth()) { 
				first = cal.start.getDate(); // first day equals day of bound
			}
		}		
		if (cal.year == cal.end.getFullYear()) {
			// in the special case of improved navigation but no months array, we'll need to construct one
			if (months == null && this.options.navigation == 2) {
				months = [];
				
				for (var i = 0; i < 12; i ++) { 
					if (i <= cal.end.getMonth()) { months.push(i); } 
				}
			}

			if (cal.month == cal.end.getMonth()) { 
				last = cal.end.getDate(); // last day equals day of bound
			}
		}

		// let's get our invalid days
		var blocked = this.blocked(cal);

		// finally we can prepare all the valid days in a neat little array
		if ($type(days) == 'array') { // somewhere there was a days select
			days = days.filter(function(day) {
				if (day >= first && day <= last && !blocked.contains(day)) { return day; }
			});
		}
		else { // no days select we'll need to construct a valid days array
			days = [];
			
			for (var i = first; i <= last; i++) { 
				if (!blocked.contains(i)) { days.push(i); }
			}
		}		

		days.sort(this.sort); // sorting our days will give us first and last of month

		return { 'days': days, 'months': months, 'years': years };
	},


	// write: sets calendars value to form elements
	// @param cal (obj)

	write: function(cal) {
		this.rebuild(cal);	 // in the case of options, we'll need to make sure we have the correct number of days available
		
		cal.els.each(function(el) {	// then we can set the value to the field
			el.value = this.format(cal.val, el.format); 		
		}, this);
	}
});

Calendar.implement(new Events, new Options);


// ----------------------------------------------------------

    var mootime = function(timepickerInput) {
        var mootimeID = timepickerInput + "_mootimewrap";
        var mootimeHTML = unescape('%0A%09%09%09%09%3C%64%69%76%20%63%6C%61%73%73%3D%27%74%69%6D%65%70%69%63%6B%65%72%27%3E%0A%09%09%09%09%09%3C%64%69%76%20%63%6C%61%73%73%3D%27%74%69%6D%65%27%3E%0A%09%09%09%09%09%09%3C%73%70%61%6E%20%63%6C%61%73%73%3D%27%64%69%73%70%6C%61%79%5F%68%6F%75%72%27%3E%31%32%3C%2F%73%70%61%6E%3E%3A%3C%73%70%61%6E%20%63%6C%61%73%73%3D%27%64%69%73%70%6C%61%79%5F%6D%69%6E%27%3E%30%3C%2F%73%70%61%6E%3E%3C%73%70%61%6E%20%63%6C%61%73%73%3D%27%64%69%73%70%6C%61%79%5F%6D%69%6E%74%77%6F%27%3E%30%3C%2F%73%70%61%6E%3E%0A%09%09%09%09%09%09%3C%73%70%61%6E%20%63%6C%61%73%73%3D%27%64%69%73%70%6C%61%79%5F%61%6D%70%6D%27%3E%61%6D%3C%2F%73%70%61%6E%3E%0A%09%09%09%09%09%3C%2F%64%69%76%3E%0A%09%09%09%09%09%0A%09%09%09%09%09%3C%64%69%76%20%63%6C%61%73%73%3D%27%61%6D%6F%72%70%6D%27%3E%0A%09%09%09%09%09%09%3C%73%70%61%6E%20%63%6C%61%73%73%3D%27%61%6D%70%6D%20%61%6D%20%6D%6F%6F%74%69%6D%65%61%6D%70%6D%5F%61%63%74%69%76%65%27%3E%61%6D%3C%2F%73%70%61%6E%3E%0A%09%09%09%09%09%09%3C%73%70%61%6E%20%63%6C%61%73%73%3D%27%61%6D%70%6D%20%70%6D%27%3E%70%6D%3C%2F%73%70%61%6E%3E%0A%09%09%09%09%09%3C%2F%64%69%76%3E%0A%09%09%09%09%09%0A%09%09%09%09%09%3C%64%69%76%20%63%6C%61%73%73%3D%27%63%6F%6E%74%72%6F%6C%73%27%3E%0A%09%09%09%09%09%09%3C%61%20%63%6C%61%73%73%3D%27%63%6C%6F%73%65%5F%74%69%6D%65%70%69%63%6B%65%72%27%3E%63%6C%6F%73%65%3C%2F%61%3E%26%6E%62%73%70%3B%26%6E%62%73%70%3B%0A%09%09%09%09%09%09%3C%61%20%63%6C%61%73%73%3D%27%73%61%76%65%5F%74%69%6D%65%70%69%63%6B%65%72%27%3E%73%61%76%65%3C%2F%61%3E%20%20%0A%09%09%09%09%09%3C%2F%64%69%76%3E%0A%09%09%09%09%09%0A%09%09%09%09%09%3C%64%69%76%20%63%6C%61%73%73%3D%27%73%65%70%27%3E%3C%2F%64%69%76%3E%20%0A%09%09%09%09%09%0A%09%09%09%09%09%3C%75%6C%20%63%6C%61%73%73%3D%27%68%6F%75%72%73%27%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6C%65%67%65%6E%64%27%3E%68%72%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%31%20%6D%6F%6F%74%69%6D%65%5F%61%63%74%69%76%65%27%3E%3C%73%70%61%6E%3E%31%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%32%27%3E%3C%73%70%61%6E%3E%32%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%33%27%3E%3C%73%70%61%6E%3E%33%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%34%27%3E%3C%73%70%61%6E%3E%34%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%35%27%3E%3C%73%70%61%6E%3E%35%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%36%27%3E%3C%73%70%61%6E%3E%36%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%37%27%3E%3C%73%70%61%6E%3E%37%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%38%27%3E%3C%73%70%61%6E%3E%38%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%39%27%3E%3C%73%70%61%6E%3E%39%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%31%30%27%3E%3C%73%70%61%6E%3E%31%30%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%31%31%27%3E%3C%73%70%61%6E%3E%31%31%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%68%72%73%20%68%72%31%32%27%3E%3C%73%70%61%6E%3E%31%32%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%3C%2F%75%6C%3E%0A%09%09%09%09%09%0A%09%09%09%09%09%3C%75%6C%20%63%6C%61%73%73%3D%27%6D%69%6E%5F%66%69%72%73%74%27%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%6C%65%67%65%6E%64%27%3E%6D%6E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%20%6D%69%6E%30%20%6D%6F%6F%74%69%6D%65%5F%61%63%74%69%76%65%27%3E%3C%73%70%61%6E%3E%30%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%20%6D%69%6E%31%27%3E%3C%73%70%61%6E%3E%31%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%20%6D%69%6E%32%27%3E%3C%73%70%61%6E%3E%32%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%20%6D%69%6E%33%27%3E%3C%73%70%61%6E%3E%33%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%20%6D%69%6E%34%27%3E%3C%73%70%61%6E%3E%34%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%20%6D%69%6E%35%27%3E%3C%73%70%61%6E%3E%35%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%20%0A%09%09%09%09%09%3C%2F%75%6C%3E%0A%09%09%09%09%09%0A%09%09%09%09%09%3C%75%6C%20%63%6C%61%73%73%3D%27%6D%69%6E%5F%73%65%63%6F%6E%64%27%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%30%20%6D%6F%6F%74%69%6D%65%5F%61%63%74%69%76%65%27%3E%30%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%20%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%31%27%3E%3C%73%70%61%6E%3E%31%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%32%27%3E%3C%73%70%61%6E%3E%32%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%33%27%3E%3C%73%70%61%6E%3E%33%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%34%27%3E%3C%73%70%61%6E%3E%34%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%35%27%3E%3C%73%70%61%6E%3E%35%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%36%27%3E%3C%73%70%61%6E%3E%36%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%37%27%3E%3C%73%70%61%6E%3E%37%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%38%27%3E%3C%73%70%61%6E%3E%38%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%09%3C%6C%69%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%20%6D%69%6E%30%39%27%3E%3C%73%70%61%6E%3E%39%3C%2F%73%70%61%6E%3E%3C%2F%6C%69%3E%0A%09%09%09%09%09%3C%2F%75%6C%3E%0A%09%09%09%09%3C%2F%64%69%76%3E%0A%09%09%09%09%0A%09%09%09%09%3C%69%6E%70%75%74%20%74%79%70%65%3D%27%68%69%64%64%65%6E%27%20%63%6C%61%73%73%3D%27%68%6F%75%72%5F%6D%65%6D%6F%72%79%27%20%76%61%6C%75%65%3D%27%31%32%27%3E%0A%09%09%09%09%3C%69%6E%70%75%74%20%74%79%70%65%3D%27%68%69%64%64%65%6E%27%20%63%6C%61%73%73%3D%27%6D%69%6E%5F%6D%65%6D%6F%72%79%27%20%76%61%6C%75%65%3D%27%30%27%3E%0A%09%09%09%09%3C%69%6E%70%75%74%20%74%79%70%65%3D%27%68%69%64%64%65%6E%27%20%63%6C%61%73%73%3D%27%6D%69%6E%74%77%6F%5F%6D%65%6D%6F%72%79%27%20%76%61%6C%75%65%3D%27%30%27%3E%0A%09%09%09%09%3C%69%6E%70%75%74%20%74%79%70%65%3D%27%68%69%64%64%65%6E%27%20%63%6C%61%73%73%3D%27%61%6D%70%6D%5F%6D%65%6D%6F%72%79%27%20%76%61%6C%75%65%3D%27%61%6D%27%3E%0A');
        var newMooTime = new Element('div', {
                'id': mootimeID,
                'class': 'timepickerwrap',
                'html': mootimeHTML
        }); 
 
        newMooTime.inject(timepickerInput, 'after');
        var createMootime = $(timepickerInput + "_mootimewrap");
 
        //shows the timepicker when user focuses on timepicker input field
        $(timepickerInput).addEvent('focus', function(){
                //calculates various positions to decide where to place the timepicker
                var windowSize = $(window).getSize();
                var windowScroll = $(window).getScroll();
                var mootimeInput = $(timepickerInput).getCoordinates();
                var mootimeInputBottom = mootimeInput.bottom;
                var mootimeInputTop = mootimeInput.top;
                var mootimeInputLeft = mootimeInput.left;
                var mootimeInputRight = mootimeInput.right;
                var adjustTopInput = mootimeInputBottom - windowScroll.y;
                var halfWindow = windowSize.y / 2;
                var distanceRight = windowSize.x - mootimeInputRight;
 
                //sets all timepickers back one, so that one can be called to the front on focus
                $$('.timepickerwrap').each(function(item){
                        item.setStyle('z-index', '999');
                });
 
                //chooses whether to place the timepicker above or below the input field
                $(createMootime).setStyle('display', 'block');
                var mootimePickerLeft = mootimeInputLeft + 10;
                if (adjustTopInput &lt; halfWindow) {
                        var mootimePickerTop = mootimeInputBottom + 10;
                        $(createMootime).setStyle('top', mootimePickerTop);
                        $(createMootime).setStyle('z-index', '1000');
 
                        //chooses wheter to align the timepicker left of right of the input field
                        if (mootimeInputLeft &lt; distanceRight) {
                                $(createMootime).setStyle('left', mootimePickerLeft);
                        }
 
                        else {
                                var timepickerSize = $(createMootime).getSize();
                                var mootimeInputSize = $(timepickerInput).getSize();
                                var timepickerLeftLeft = (mootimeInputLeft+ mootimeInputSize.x) - timepickerSize.x;
                                $(createMootime).setStyle('left', timepickerLeftLeft);
                        };
                }
 
                else {
                        var mootimePickerBottom = mootimeInputTop - 10;
                        var mootimePickerHeight = $(createMootime).getSize();
                        mootimePickerBottom = mootimePickerBottom - mootimePickerHeight.y;
                        $(createMootime).setStyle('top', mootimePickerBottom);
                        $(createMootime).setStyle('z-index', '1000');
 
                        //chooses wheter to align the timepicker left of right of the input field
                        if (mootimeInputLeft &lt; distanceRight) {
                                $(createMootime).setStyle('left', mootimePickerLeft);
                        }
 
                        else {
                                var timepickerSize = $(createMootime).getSize();
                                var mootimeInputSize = $(timepickerInput).getSize();
                                var timepickerLeftLeft = (mootimeInputLeft+ mootimeInputSize.x) - timepickerSize.x;
                                $(createMootime).setStyle('left', timepickerLeftLeft);
                        };
                }
        });
 
        //closes timepicker when user clicks "close"
        $(createMootime).getElement('.close_timepicker').addEvent('click', function(){
                $(createMootime).setStyle('display', 'none');
        });
 
        //removes the current class from current row only
        var removeActive = function(times) {
                $(createMootime).getElements('.' + times).each(function(item, index){
                        var currentClass = item.hasClass('mootime_active');
                        if (currentClass) {
                                item.removeClass('mootime_active');
                        }
                });
        };
 
        //applies to the following 4 functions:
        //adds a click event to each time row that changes the clicked number to an active class,
        //removes the active class from the previous current element
        //and sets the time in the upper left display 
 
        //adds click event to hours
        $(createMootime).getElements('.hrs').each(function(item){
                var hour = item.get('text');
                item.addEvent('click', function(){
                        $(createMootime).getElement('.display_hour').set('text', hour);
                        removeActive('hrs');
                        item.addClass('mootime_active');
                });
        });
 
        //adds click event to top minute row
        $(createMootime).getElements('.min').each(function(item){
                var minute = item.get('text');
                item.addEvent('click', function(){
                        $(createMootime).getElement('.display_min').set('text', minute);
                        removeActive('min');
                        item.addClass('mootime_active');
                });
        });
 
        //adds click event to bottom minute row
        $(createMootime).getElements('.mintwo').each(function(item){
                var minuteTwo = item.get('text');
                item.addEvent('click', function(){
                        $(createMootime).getElement('.display_mintwo').set('text', minuteTwo);
                        removeActive('mintwo');
                        item.addClass('mootime_active');
                });
        });
 
        //adds click event to am/pm
        $(createMootime).getElements('.ampm').each(function(item){
                var amPm = item.get('text');
                item.addEvent('click', function(){
                        $(createMootime).getElement('.display_ampm').set('text', amPm);
                        $(createMootime).getElement('.mootimeampm_active').removeClass('mootimeampm_active');
                        item.addClass('mootimeampm_active');
                });
        });
 
        //grabs the current selected time and pushes it into the value property of the mootime input field
        var chosenTime = function() {
                //gets time from the timechooser display
                var hour = $(createMootime).getElement('.display_hour').get('text');
                var min =  $(createMootime).getElement('.display_min').get('text');
                var minTwo =  $(createMootime).getElement('.display_mintwo').get('text');
                var amPm =  $(createMootime).getElement('.display_ampm').get('text');
                var newChosenTime = hour + ':'  + min + minTwo + amPm;
 
                //sets the mootime input field to the time on the timechooser
                $(timepickerInput).setProperty('value', newChosenTime);
 
                //sets memory
                $(createMootime).getElement('.hour_memory').setProperty('value', hour);
                $(createMootime).getElement('.min_memory').setProperty('value', min);
                $(createMootime).getElement('.mintwo_memory').setProperty('value', minTwo);
                $(createMootime).getElement('.ampm_memory').setProperty('value', amPm);
        };
 
        //SAVE
        $(createMootime).getElement('.save_timepicker').addEvent('click', function(){
                chosenTime();
                $(createMootime).setStyle('display', 'none');
        });
 
        //CLOSE
        $(createMootime).getElement('.close_timepicker').addEvent('click', function(){
                //removes active class from rows
                removeActive('hrs');
                removeActive('min');
                removeActive('mintwo');
                $(createMootime).getElement('.mootimeampm_active').removeClass('mootimeampm_active'); 
 
                //grabs saved time from "memory"
                var memoryHour = $(createMootime).getElement('.hour_memory').getProperty('value');
                var memoryMin = $(createMootime).getElement('.min_memory').getProperty('value');
                var memoryMinTwo = $(createMootime).getElement('.mintwo_memory').getProperty('value');
                var memoryAmPm = $(createMootime).getElement('.ampm_memory').getProperty('value');
 
                //resets active class from "memory"
                $(createMootime).getElement("'.hr" + memoryHour + "'").addClass('mootime_active');
                $(createMootime).getElement("'.min" + memoryMin + "'").addClass('mootime_active');
                $(createMootime).getElement("'.min0" + memoryMinTwo + "'").addClass('mootime_active');
                $(createMootime).getElement('.' + memoryAmPm + "'").addClass('mootimeampm_active'); 
 
                //resets timepicker time display from "memory"
                $(createMootime).getElement('.display_hour').setProperty('text', memoryHour);
                $(createMootime).getElement('.display_min').setProperty('text', memoryMin);
                $(createMootime).getElement('.display_mintwo').setProperty('text', memoryMinTwo);
                $(createMootime).getElement('.display_ampm').setProperty('text', memoryAmPm); 
 
                //hides the timepicker
                $(createMootime).setStyle('display', 'none');
        });
};
 

