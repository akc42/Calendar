// Calendar: a Javascript Module for Mootools that adds accessible and unobtrusive date pickers to your form input hidden elements 
// Derived from <http://electricprism.com/aeron/calendar> Calendar RC4, Copyright (c) 2007 Aeron Glemann <http://electricprism.com/aeron>, MIT Style License
//
/*	Copyright (c) 2008 Alan Chandler
 *	see COPYING.txt in this directory for more details
 */

Calendar = function() {
    var url;
    var scripts = document.getElements('script');
    scripts.every(function(script) {
        var u = script.src.substr(script.src.length - 11);
        if (u === 'calendar.js') {
            url = script.src.substr(0, script.src.length - 2) + 'html';
            return false;
        }
        return true;
    });
    var calendar = new Element('div');
    calendar.load(url);

    /*
var Cal = new Class({
	initialize: function (input, owner) {

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

	},
	toggle: function (){
		if (this.visible = !this.visible) {
			this.calendar = owner.show(this);
			this.button.addClass(owner.classes.active);
		} else {
			this.button.removeClass(owner.classes.active);
			owner.hide(this.calendar);
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
	// clicked: run when a valid button is clicked in the calendar
	// @param cal (obj)
		      // type - 'd' = days, 'h' = 'hours - including am and pm buttons (values, -1=am, -2=pm), 'm' = minutes
		      // n - value of parameter
		      // el the button element which was clicked
	clicked: function(td, day, cal) {
		cal.val = (this.value(cal) == day) ? null : new Date(cal.year, cal.month, day); // set new value - if same then disable

		this.write(cal);

		// ok - in the special case that it's all selects and there's always a date no matter what (at least as far as the form is concerned)
		// we can't let the calendar undo a date selection - it's just not possible!!
		if (!cal.val) { cal.val = this.read(cal); }

		if (this.val) {
			owner.check(this); // checks other cals
		}
		else { // remove active class and replace with valid
			td.addClass(this.classes.valid);
			td.removeClass(this.classes.active);
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

	// initialize: calendar constructor
	// @param obj (obj) a js object containing the form elements and format strings { id: 'format', id: 'format' etc }
	// @param props (o21/08/2008bj) optional properties

	initialize: function(input, options) {
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


		// create calendars array


	},

	// caption: returns the caption element with header and navigation
	// @param cal (obj)
	// @returns caption (element)



	// check: checks other calendars to make sure no overlapping values
	// @param cal (obj)

	check: function(cal) {
		if(cal.val) {
			this.calendars.each(function(kal) {
				kal.check(cal);
			});
		}
	},
	

	// display: create calendar element
	// @param cal (obj)

	display: function(cal) {
		// 1. header and navigation
		this.calendar.empty(); // init div

			  },


*/
    return {
        Single: new Class({
            Implements: [Events, Options],
            options: {
                ap: ['am', 'pm'],
                blocked: [],
                // blocked dates
                classes: [],
                // ['calendar', 'prev', 'next', 'minute','hour','month', 'year', 'today', 'invalid', 'valid', 'inactive', 'active', 'hover', 'hilite']
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                // days of the week starting at sunday
                draggable: true,
                end: new Date(2999, 11, 31),
                // null maans current time
                format: 'jS M Y g:i a',
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                navigation: 1,
                // 0 = no nav; 1 = single nav for month; 2 = dual nav for month and year
                offset: 0,
                // first day of the week: 0 = sunday, 1 = monday, etc..
                onHideStart: Class.empty,
                onHideComplete: Class.empty,
                onShowStart: Class.empty,
                onShowComplete: Class.empty,
                onUpdate: Class.empty,
                start: new Date(1000, 0, 1),
                // null means current time
                tweak: {
                    x: 0,
                    y: 0
                } // tweak calendar positioning
            },

            initialize: function(input, options) {
                this.setOptions(options);
                //Basic validation
                if ($type(input) != 'element') return false;
                if (input.get('tag') != 'input') return false;
                if (input.type != 'hidden') return false;
                this.input = input;

                // create our classes array
                var keys = ['calendar', 'picker', 'prev', 'next', 'ap', 'minute', 'hour', 'month', 'year', 'today', 'invalid', 'valid', 'inactive', 'active', 'hover', 'hilite'];

                var values = keys.map(function(key, i) {
                    if (this.options.classes[i]) {
                        if (this.options.classes[i].length) {
                            key = this.options.classes[i];
                        }
                    }
                    return key;
                },
                this);
                this.classes = values.associate(keys);

                var div = new Element('div', {
                    'class': this.classes.calendar
                });
                div.wraps(input);
                this.span = new Element('span', {
                    'class': this.classes.calendar
                }).inject(div);
                this.button = new Element('button', {
                    'type': 'button',
                    'class': this.classes.calendar
                }).inject(div).addEvent('click',
                function(e) {
                    e.stop();
                    this.toggle();
                }.bind(this));
                this.visible = false;
                // create cal element with css styles required for proper cal functioning
                this.picker = new Element('div', {
                    'styles': {
                        left: '-1000px',
                        opacity: 0,
                        position: 'absolute',
                        top: '-1000px',
                        zIndex: 1000
                    }
                }).addClass(this.classes.picker).injectInside(document.body);

                // iex 6 needs a transparent iframe underneath the calendar in order to not allow select elements to render through
                if (window.ie6) {
                    this.iframe = new Element('iframe', {
                        'styles': {
                            left: '-1000px',
                            position: 'absolute',
                            top: '-1000px',
                            zIndex: 999
                        }
                    }).injectInside(document.body);
                    this.iframe.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)';
                }

                // initialize fade method
                this.fx = new Fx.Tween(this.picker, {
                    onStart: function() {
                        if (this.picker.getStyle('opacity') == 0) { // show
                            if (window.ie6) {
                                this.iframe.setStyle('display', 'block');
                            }
                            this.picker.setStyle('display', 'block');
                            this.fireEvent('showStart', this);
                        } else { // hide
                            this.fireEvent('hideStart', this);
                        }
                    }.bind(this),
                    onComplete: function() {
                        if (this.picker.getStyle('opacity') == 0) { // hidden
                            this.picker.setStyle('display', 'none');
                            if (window.ie6) {
                                this.iframe.setStyle('display', 'none');
                            }
                            this.fireEvent('hideComplete', this);
                        } else { // shown
                            this.fireEvent('showComplete', this);
                        }
                    }.bind(this)
                });

                // initialize drag method
                if (window.Drag && this.options.draggable) {
                    this.drag = new Drag.Move(this.calendar, {
                        onDrag: function() {
                            if (window.ie6) {
                                this.iframe.setStyles({
                                    left: this.calendar.style.left,
                                    top: this.calendar.style.top
                                });
                            }
                        }.bind(this)
                    });
                }

                // by default the calendar will accept a millennium in either direction
                this.setStart(this.options.start);
                this.setEnd(this.options.end);

                // we need to set up the blocked arrays, which contain either a list of the blocked numbers for that unit, or an '*', meaning all of them
                this.blocked = {
                    mi: [],
                    hr: [],
                    da: [],
                    mo: [],
                    yr: [],
                    wd: []
                };
                this.options.blocked.each(function(date) {
                    var values = date.split(' ');

                    // preparation
                    for (var i = 0; i <= 5; i++) {
                        if (!values[i]) {
                            values[i] = (i == 5) ? '': '*';
                        } // make sure blocked date contains values for at least m,h,d, m and y
                        values[i] = values[i].contains(',') ? values[i].split(',') : new Array(values[i]); // split multiple values
                        var count = values[i].length - 1;
                        for (var j = count; j >= 0; j--) {
                            values[i][j] = values[i].contains(',') ? values[i].split(',') : new Array(values[i][j]); // split multiple values
                            var val = values[i][j].split('-');
                            for (var k = val[0]; k <= val[1]; k++) {
                                if (!values[i].contains(k)) values[i].push(k + '');
                            }
                            values[i].splice(j, 1);
                        }
                    }
                    this.blocked.mi.combine(values[0]);
                    this.blocked.hr.combine(values[1]);
                    this.blocked.da.combine(values[2]);
                    this.blocked.mo.combine(values[3]);
                    this.blocked.yr.combine(values[4]);
                    this.blocked.wd.combine(values[5]);
                });

            },
            setVal: function(val) {
                if (val) {
                    this.input.value = val.getTime() / 1000;
                    span.set('text', this.format(val));
                } else {
                    this.input.value = 0;
                    span.set('text', '');
                    this.fireEvent('update');
                }
            },
            getStart: function() {
                return (this.start) ? this.start: new Date();
            },
            setStart: function(start) {
                this.start = (start) ? ((options.start) ? ((start > options.start) ? start: options.start) : (start > new Date()) ? start: new Date()) : ((options.start) ? ((options.start > new Date()) ? options.start: new Date()) : new Date());
                if (this.input.value != 0 && this.input.value < this.getStart().getTime() / 1000) this.setVal(this.getStart());
            },
            getEnd: function() {
                return (this.end) ? this.end: new Date();
            },
            setEnd: function(end) {
                this.end = (end) ? ((options.end) ? ((end > options.end) ? end: options.end) : (end > new Date()) ? end: new Date()) : ((options.end) ? ((options.end > new Date()) ? options.end: new Date()) : new Date());
                if (this.input.value != 0 && this.input.value < this.getEnd().getTime() / 1000) this.setVal(this.getEnd());
            },
            toggle: function() {
                if (this.visible) {
					document.removeEvent('mousedown', this.hide); // always remove the current mousedown script first
					this.fx.start('opacity', 1, 0);
					this.visible = false;
                } else {
					document.removeEvent('mousedown', this.hide); // always remove the current mousedown script first
					this.hide = function(e) {

//						var e = new Event(e);
						var el = e.target;
						var stop = false;
			
						while (el !== document.body && el.nodeType === 1) {
							if (el === this.calendar || el === this.button ) {
								e.stop;
								return false;
							}
						el = el.parentNode;
						}
						this.toggle();
					}.bind(this);

					document.addEvent('mousedown', this.hide);

					var size = window.getScrollSize();
			
					var coord = this.button.getCoordinates();

					var x = coord.right + this.options.tweak.x;
					var y = coord.top + this.options.tweak.y;

					// make sure the calendar doesn't open off screen
					if (!this.calendar.coord) this.calendar.coord = this.calendar.getCoordinates(); 

					if (x + this.calendar.coord.width > size.x) x -= (x + this.calendar.coord.width - size.x);
					if (y + this.calendar.coord.height > size.y)  y -= (y + this.calendar.coord.height - size.y);

					this.calendar.setStyles({ left: x + 'px', top: y + 'px' });

					if (window.ie6) { 
						this.iframe.setStyles({ height: this.calendar.coord.height + 'px', left: x + 'px', top: y + 'px', width: this.calendar.coord.width + 'px' }); 
					}

				var picker = calender.clone();
				picker.addClass(this.options.classes.picker);
				if (this.month()) {
					picker.addClass(this.options.months[this.month()].toLowerCase());
				}

				
	---------
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
			  if (cal.hours < 12) {
			    am.addClass(this.options.classes.active);
			  } else {
			    var cls = this.options.classes.valid;
			    am.addClass(this.options.classes.valid).addEvents({
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
			  td = new Element('td').inject(tr);
			  td = new Element('td').inject(tr);
			  var pm = new Element('td').inject(tr).set('text','pm');
			  if (cal.hours < 12) {
			    var cls = this.options.classes.valid;
			    pm.addClass(this.options.classes.valid).addEvents({;
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
			    

			
				this.fx.start('opacity', 0, 1);
		
				}
            },
				caption: function(cal) {
					// start by assuming navigation is allowed
					var navigation = {
						prev: { 'month': true, 'year': true },
						next: { 'month': true, 'year': true }
					};
					
					// if we're in an out of bounds year
					if (this.year() === this.getStart().getFullYear()) {
						navigation.prev.year = false; 
						if (this.month === this.getStart().getMonth() && this.options.navigation == 1) {
							navigation.prev.month = false;
						}		
					}		
					if (this.year() === this.getEnd().getFullYear()) {
						navigation.next.year = false; 
						if (this.month() == this.getEnd().getMonth() && this.options.navigation == 1) {
							navigation.next.month = false;
						}
					}

					// special case of improved navigation but months array with only 1 month we can disable all month navigation
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
				format: function(date) {
                var str = '';

                if (date) {
                    var j = date.getDate(); // 1 - 31
                    var w = date.getDay(); // 0 - 6
                    var l = this.options.days[w]; // Sunday - Saturday
                    var n = date.getMonth() + 1; // 1 - 12
                    var f = this.options.months[n - 1]; // January - December
                    var y = date.getFullYear() + ''; // 19xx - 20xx
                    var h = date.getHours(); // 0 - 23
                    var G = h + ''; // h as string
                    var g = (h == 0) ? 12 : ((h > 12) ? h - 12 : h) + ''; // '1' to '12'
                    var i = date.getMinutes() + ''; //'0' - '59'
                    i = (i.length == 1) ? '0' + i: i;
                    var format = this.options.format;

                    for (var i = 0,
                    len = format.length; i < len; i++) {
                        var cha = format.charAt(i); // format char
                        switch (cha) {
                            // year cases
                        case 'y':
                            // xx - xx
                            y = y.substr(2);
                        case 'Y':
                            // 19xx - 20xx
                            str += y;
                            break;

                            // month cases
                        case 'm':
                            // 01 - 12
                            if (n < 10) {
                                n = '0' + n;
                            }
                        case 'n':
                            // 1 - 12
                            str += n;
                            break;
                        case 'M':
                            // Jan - Dec
                            f = f.substr(0, 3);
                        case 'F':
                            // January - December
                            str += f;
                            break;

                            // day cases
                        case 'd':
                            // 01 - 31
                            if (j < 10) {
                                j = '0' + j;
                            }
                        case 'j':
                            // 1 - 31
                            str += j;
                            break;

                        case 'D':
                            // Sun - Sat
                            l = l.substr(0, 3);
                        case 'l':
                            // Sunday - Saturday
                            str += l;
                            break;

                        case 'N':
                            // 1 - 7
                            w += 1;
                        case 'w':
                            // 0 - 6
                            str += w;
                            break;

                        case 'S':
                            // st, nd, rd or th (works well with j)
                            if (j % 10 == 1 && j != '11') {
                                str += 'st';
                            } else if (j % 10 == 2 && j != '12') {
                                str += 'nd';
                            } else if (j % 10 == 3 && j != '13') {
                                str += 'rd';
                            } else {
                                str += 'th';
                            }
                            break;

                        case 'a':
                            str += (h < 12) ? 'am': 'pm';
                            break;
                            i
                        case 'A':
                            str += (h < 12) ? 'AM': 'PM';
                            break;

                        case 'g':
                            str += g;
                            break;
                        case 'h':
                            str += (g.length == 1) ? '0' + g: g;
                            break;
                        case 'G':
                            str += G;
                            break;
                        case 'H':
                            str += (G.length == 1) ? '0' + G: G;
                            break;
                        default:
                            str += cha;
                        }
                    }
                }

                return str; //  return format with values replaced
            },
			date: function() {
				if(input.value > 0) {
					return new Date().setTime(input.value*1000);
				}
				return null;
			},
			year: function() {
				var d = this.date();
				if(d) return d.getFullYear();
				return null;
			},
			month: function() {
				var d = this.date();
				if(d) return d.getMonth();
				return null;
			},
			isBlocked: function(date,type) {
				// helper function to see if this date is blocked.  The type field should be one of
				// 'y' 'm' 'd' 'h' '5' - which implies the entire period must be blocked for the result to be true
				switch (type) {
					case 'y' :
							if (!this.blocked.yr.contains('*') && !this.block.yr.contains(date.getFullYear())) return false;
					//deliberately drops through
					case 'm' :
							if (!this.blocked.mo.contains('*') && !this.block.mo.contains(date.getMonth())) return false;
					//deliberately drops through
					case 'd' :
							if (!this.blocked.da.contains('*') && !this.block.mo.contains(date.getDate())) return false;
					//deliberately drops through
					case 'h' :
							if (!this.blocked.hr.contains('*') && !this.block.mo.contains(date.getHours())) return false;
					//deliberately drops through
					case '5' :
					default:
							if (!this.blocked.mi.contains('*')) return false;
							var min = date.getMinutes();
							min = min - min%5;
							for (var i = 0; i<5 ;i++) {
								if (!this.blocked.mi.contains(min+i)) return false;
							}
							return true;
				}
			}
		}),
        Multiple: new Class({
            Implements: [Events, Options],
            options: {
                pad: 1440,
                //minutes gap between calendars - one day is default - 0 means no contraints
                onHideStart: Class.empty,
                onHideComplete: Class.empty,
                onShowStart: Class.empty,
                onShowComplete: Class.empty,
                onUpdate: Class.empty
            },
            initialize: function(input, options) {
                this.setOptions(options);
                this.calendars = [];
                input.each(function(item, i) {
                    this.calendars.push(new Single(item, options.extend({
                        onUpdate: this.update
                    })));
                });
                this.calendars.sort(function(a, b) {
                    return a.input.value - b.input.value;
                });
            },
            update: function() {
                // We check all the other calendar contraints again
                // so that they do not overlap this by the options
                if (options.pad != 0) {
                    this.calendars.each(function(cal, i) {
                        if (i != 0) {
                            var prev = this.calendars[i - 1];
                            if (prev.input.value != 0) {
                                if (cal.input.value != 0) {
                                    cal.setStart(new Date().setTime((prev.input.value + options.pad * 60) * 1000));
                                }
                                prev.setEnd(new Date().setTime((cal.input.value - options.pad * 60) * 1000));
                            } else {
                                if (cal.input.value != 0) {
                                    prev.setEnd(new Date().setTime((cal.input.value - options.pad * 60) * 1000));
                                }
                            }
                        }
                    });
                }
                this.fireEvent('update');
            }
        })
    };
} ();