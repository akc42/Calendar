// Calendar: a Javascript class for Mootools that adds accessible and unobtrusive date pickers to your form elements <http://electricprism.com/aeron/calendar>
// Calendar RC4, Copyright (c) 2007 Aeron Glemann <http://electricprism.com/aeron>, MIT Style License.
// Mootools 1.2 compatibility by Davorin Šego
/* Further modifications
 *	Copyright (c) 2008 Alan Chandler
 *	see COPYING.txt in this directory for more details
 */

var Cal = new Class({
	initialize: function (input, i, owner) {
		this.input = input;
		this.id = i
		var div = new Element('div',{'class':owner.classes.calendar});
		div.wraps(input);
		this.span = new Element('span',{ 'class':owner.classes.calendar}).inject(div);
		this. button = new Element('button', { 'type': 'button', 'class':this.classes.calendar }).inject(div);
		var t = new Date().setTime(new Date().getTime() + owner.options.direction.toInt()*60000);
		if (this.value > 0) {
			t = new Date().setTime(this.value);
			this.val = t;
			this.write();
		} else {
			this.val = t
			this.val = null;
		}
		this.year = t.getFullYear();
		this.month = t.getMonth();
		this.day = t.getDate();
		this.hours = t.getHours();
		this.fivemin = (t.getMins()/5+0.5).toInt();  //Round to nearest 5 minutes
		this.button.addEvent('click', function(e) {
			e.stop();
			this.toggle();
		}.bind(this));
		this.visible = false;
	},
	write:function() {
		if (this.val) {
			this.input.value = val.getTime();
			span.set('text',owner.format(this.val));
		} else {
			this.input.value = 0;
			span.empty();
		}
	},
 	bounds:function() {
		// 1. first we assume the calendar has no bounds (or a thousand years in either direction)
		
		// by default the calendar will accept a millennium in either direction
		this.start = new Date(1000, 0, 1); // jan 1, 1000
		this.end = new Date(2999, 11, 31); // dec 31, 2999

		// 2. but if the cal is one directional we adjust accordingly
		var time = new Date().getTime() + owner.options.direction.toInt()*60000;

		if (owner.options.direction > 0) {
			this.start.setTime(time + ((owner.options.pad.days*1440+owner.options.pad.mins)*60 * this.id));
		}
		
		if (owner.options.direction < 0) {
			this.end.setTime(time - ((owner.options.pad.days*1440+owner.options.pad.mins)*60* (owner.calendars.length - this.id - 1)));
		}
	},
	toggle: function (){
		if (this.visible = !this.visible) {
			this.button.addClass(owner.classes.active);
			owner.show(this);
		} else {
			this.button.removeClass(owner.classes.active);
			owner.hide();
		}
	}
	values: function() {
		var  months;

// we start with what would be the first and last days were there no restrictions
		var first = 1;
		var last = new Date(this.year, this.month + 1, 0).getDate(); // last day of the month
		
		// if we're in an out of bounds year
		if (this.year == this.start.getFullYear()) {
			// in the special case of improved navigation but no months array, we'll need to construct one
			if (this.months == null && owner.options.navigation == 2) {
				this.months = [];
				
				for (var i = 0; i < 12; i ++) { 
					if (i >= this.start.getMonth()) { this.months.push(i); }
				}
			}
			
			// if we're in an out of bounds month
			if (this.month == this.start.getMonth()) {
				first = this.start.getDate(); // first day equals day of bound
			}
		}		
		if (this.year == this.end.getFullYear()) {
			// in the special case of improved navigation but no months array, we'll need to construct one
			if (this.months == null && owner.options.navigation == 2) {
				months = [];
				
				for (var i = 0; i < 12; i ++) { 
					if (i <= this.end.getMonth()) { this.months.push(i); }
				}
			}

			if (this.month() == cal.end.getMonth()) {
				last = this.end.getDate(); // last day equals day of bound
			}
		}

		// let's get our invalid days
		var days = [];
		var offset = new Date(cal.year, cal.month, 1).getDay(); // day of the week (offset)
		var last = new Date(cal.year, cal.month + 1, 0).getDate(); // last day of this month
		
		owner.options.blocked.each(function(date){
			var values = date.split(' ');
			
			// preparation
			for (var i21/08/2008 = 0; i <= 3; i++){ 
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
			if (values[2].contains(this.year + '') || values[2].contains('*')){
				if (values[1].contains(this.month + 1 + '') || values[1].contains('*')){
					va21/08/2008lues[0].each(function(val){ // if blocked value indicates this month / year
						if (val > 0){ this.days.push(val.toInt()); } // add date to blocked array
					},this);

					if (values[3]){ // optional value for day of week
						for (var i = 0; i < last; i++){
								var day = (i + offset) % 7;
	
								if (values[3].contains(day + '')){ 
									this.days.push(i + 1); // add every date that corresponds to the blocked day of the week to the blocked array
								}
						}
					}
				}
			}
		}, this);
		days.sort(function(a, b) {return a - b}); // sorting our days will give us first and last of month
		this.days = days;
		this.months = months;
	},
 	check:function(cal) {
		if(cal.val) {
			var bound = cal.val.getTime();
			var change = false;
			if (this.id < cal.id) { // preceding calendar
				bound -= ((owner.options.pad.days*1440+owner.options.pad.mins)*60* (cal.id - this.id));
				if (bound < this.val) { change = true; }
			}
			if (this.id > cal.id) { // following calendar
				bound += ((owner.options.pad.days*1440+owner.options.pad.mins)*60* (this.id - cal.id));
				if (bound > this.val) { change = true; }
			}
			
			if (change) {
				bound = new Date().setTime(bound);
				if (this.start > bound) { bound = this.start; }
				if (this.end < bound) { bound = this.end; }

				this.values();

				// TODO - IN THE CASE OF SELECT MOVE TO NEAREST VALID VALUE
				// IN THE CASE OF INPUT DISABLE
21/08/2008
				// if new date is not valid better unset cal value
				// otherwise it would mean incrementally checking to find the nearest valid date which could be months / years away
				this.val = this.days.contains(bound.getDate()) ? bound : null;
				this.write();
				if (this.visible) { owner.display(this); } // update cal graphic if visible
			}
		}
	},
	// navigate: calendar navigation
	// @param cal (obj)
	// @param type (str) m or y for month or year
	// @param n (int) + or - for next or prev

	navigate: function( type, n) {
		switch (type) {
			case 'm': // month
				if ($type(this.months) == 'array') {
					var i = this.months.indexOf(this.month) + n; // index of current month

					if (i < 0 || i == this.months.length) { // out of range
						if (owner.options.navigation == 1) { // if type 1 nav we'll need to increment the year
							this.navigate( 'y', n);
						}

						i = (i < 0) ? this.months.length - 1 : 0;
					}

					this.month = this.months[i];
				}
				else {21/08/2008
					var i = this.month + n;

					if (i < 0 || i == 12) {
						if (owner.options.navigation == 1) {
							this.navigate( 'y', n);
						}

						i = (i < 0) ? 11 : 0;
					}

					this.month = i;
				}
				break;

			case 'y': // year
				this.year += n;
				break;
		}

		this.values(cal);

		if ($type(this.months) == 'array') { // if the calendar has a months select
			var i = this.months.indexOf(this.month); // and make sure the curr months exists for the new year

			if (i < 0) { this.month = this.months[0]; } // otherwise we'll reset the month
		}


		this.display(cal);
	}
});

21/08/2008

var Calendar = new Class({	
	implements: [Events,Options],
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
	// @param props (o21/08/2008bj) optional properties

	initialize: function(input, options) {
		var isInput = function(el) {
			if($type(el) != 'element'){ return false; };
			if(el.get('tag') != 'input') {return false;};
			if(el.type != 'hidden') {return false};
			return true;
		}
		this.setOptions(options);

		// create our classes array
		var keys = ['calendar', 'prev', 'next', 'minute','hour','month', 'year', 'today', 'invalid', 'valid', 'inactive', 'active', 'hover', 'hilite'];

		var values = keys.map(function(key, i) {
			if (this.options.classes[i]) {
				if (this.options.classes[i].length) { key = this.options.classes[i]; }
			}
			return key;
		}, this);

		this.classes = values.associate(keys);
		var id = 0;
		var t = new Date().getTime() + this.options.direction.toInt()*60000); // correct today for directional offset
		this.calendars = [];
		// basic error checking
		if (!isInput(input)) {
			if($type(input) != 'array') { return false; };
			input.each(function(el,i) {
				if (isInput(el)) {
					this.calendars.push(new Cal(el,i,this));
				}		
			},this);
		} else {
			this.cale21/08/2008ndars.push(new Cal(input,0,this));
		}
		// because bounds and values depend on the total number of calendars, we can't work them out
		// until we have set up the initial data for each calendar
		this.calendars.each(function(cal) {
			// read in default value
			cal.bounds(); // abs bounds of calendar
			cal.values(); // valid days, months, years
		});


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
					21/08/2008if (window.ie6) { this.iframe.setStyle('display', 'block'); }
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
			
			if (navigation.prev.month) {
				prev.clone().addEvent('click', function(cal) {
					cal.navigate('m', -1);
				}.pass(cal)).inject(month);
			}
			
			month.adopt(new Element('span').appendText(this.options.months[cal.month]));

			if (navigation.next.month) {
				next.clone().addEvent('click', function(cal) {
					cal.navigate('m', 1);
				}.pass(cal)).inject(month);
			}

			var year = new Element('span').addClass(this.classes.year).injectInside(caption);

			if (navigation.prev.year) {
				prev.clone().addEvent('click', function(cal) {
					cal.navigate( 'y', -1);
				}.pass(cal)).inject(year);
			}
			
			year.adopt(new Element('span').appendText(cal.year));

			if (navigation.next.year) {
				next.clone().addEvent('click', function(cal) {
					cal.navigate( 'y', 1);
				}.pass(cal)).inject(year);
			}
		}
		else { // 1 or 0
			if (navigation.prev.month && this.options.navigation) {
				prev.clone().addEvent('click', function(cal) {
					cal.navigate(, 'm', -1);
				}.pass(cal)).inject(caption);
			}

			caption.adopt(new Element('span').addClass(this.classes.month).appendText(this.options.months[cal.month()]));
			
			caption.adopt(new Element('span').addClass(this.classes.year).appendText(cal.year));
			
			if (navigation.next.month && this.options.navigation) {
				next.clone().addEvent('click', function(cal) {
					cal.navigate( 'm', 1); }.pass(cal)).injectInside(caption);
			}

		}

		return caption;
	},


	// check: checks other calendars to make sure no overlapping values
	// @param cal (obj)

	check: function(cal) {
		if(cal.val) {
			this.calendars.each(function(kal) {
				kal.check(cal);
			});
		}
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

		var div = new Element('div').inject(this.calendar); // a wrapper div to help correct browser css problems with the caption element

		var table = new Element('table').inject(div).adopt(this.caption(cal));
				
		// 2. day names		
		var thead = new Element('thead').inject(table);

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

			var td = new Element('td').injectI(tr);
						
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
		div.adopt(new Element('hr');
		table = new Element('table').inject(div);
		var caption = new Element('caption').inject(table).set('text','hours');
		tbody = new Element('tbody').inject(table);
		tr = new Element('tr').inject(tbody);
		td = new Element('td').inject(tr);
		var am = new Element('td').inject(tr).set('text','am');
		if (cal.hours > 5) {
			am.addClass(this.options.classes.active);
		} else {
			am.addClass(this.options.classes.valid).addEvents({;
				var cls = this.options.classes.
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
		
	},


	// element: helper function
	// @param el (string) element id
	// @param f (string) format string
	// @param cal (obj)

	// format: formats a date object according to passed in instructions
	// @param date (obj)
	// @param f (string) any combination of punctuation / separators and d, j, D, l, S, m, n, F, M, y, Y
	// @returns string

	format: function(date) {
		var format this.options.format;
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


	},





	// toggle: show / hide calendar 
	// @param cal (obj)
	hide: function (){
		document.removeEvent('mousedown', this.fn); // always remove the current mousedown script first
		this.fx.start('opacity', 1, 0);

	}
	show: function(cal) {
		document.removeEvent('mousedown', this.fn); // always remove the current mousedown script first	
		//(may have to hide others)
		// hide cal on out-of-bounds click
		this.fn = function(e, cal) {
			var e = new Event(e);
			var el = e.target;
			var stop = false;
			
			while (el != document.body && el.nodeType == 1) {
				if (el == this.calendar) { stop = true; }
				this.calendars.each(function(kal) {
					if (kal.button == el) { stop = true; }
				});
				if (stop) {
					e.stop();
					return false;
				} else {
					el = el.parentNode;
				}
			}
			cal.toggle();
		}.create({ 'arguments': cal, 'bind': this, 'event': true });

		document.addEvent('mousedown', this.fn);

		this.calendars.each(function(kal) {
			if (!kal == cal) {
     			kal.hide();
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



	// value: returns day value of calendar if set
	// @param cal (obj)
	// @returns day (int) or null

	value: function(cal) {
		var day = null;
		if (cal.val()) {
			if (cal.year() == cal.val.getFullYear() && cal.month == cal.val.getMonth()) { day = cal.val.getDate(); }
		}

		return day;
	},
	

});





