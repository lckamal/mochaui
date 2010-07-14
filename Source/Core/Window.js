/*
 ---

 script: Window.js

 description: Build windows.

 copyright: (c) 2010 Contributors in (/AUTHORS.txt).

 license: MIT-style license in (/MIT-LICENSE.txt).

 requires: [MochaUI/MUI]

 provides: [MUI.Windows]

 ...
 */

MUI.files['source|Window.js'] = 'loaded';

MUI.Windows = (MUI.Windows || $H({})).extend({
	indexLevel:	 100,			// Used for window z-Index
	windowsVisible: true,		// Ctrl-Alt-Q to toggle window visibility
	focusingWindow: false,

	options:{
		id:					null,
		title:				'New Window',
		icon:				false,
		type:				'window',
		require: {
			css:			[],
			images:			[],
			js:				[],
			onload:			null
		},
		loadMethod:			null,
		method:				'get',
		contentURL:			null,
		data:				null,

		closeAfter:			false,

		// xhr options
		evalScripts:		true,
		evalResponse:		false,

		// html options
		content:			'Window content',

		// additional content sections
		sections:			false,

		// Container options
		container:			null,
		shape:				'box',

		// Window Controls
		collapsible:		true,
		minimizable:		true,
		maximizable:		true,
		closable:			true,

		// Close options
		storeOnClose:		false,

		// Modal options
		modalOverlayClose:	true,

		// Draggable
		draggable:			null,
		draggableGrid:		false,
		draggableLimit:		false,
		draggableSnap:		false,

		// Resizable
		resizable:			null,
		resizeLimit:		{'x': [250, 2500], 'y': [125, 2000]},

		// Style options:
		addClass:			'',
		width:				300,
		height:				125,
		headerHeight:		25,
		footerHeight:		25,
		cornerRadius:		8,
		radiusOnMaximize:	false,
		x:					null,
		y:					null,
		scrollbars:			true,
		padding:			{top: 10, right: 12, bottom: 10, left: 12},
		shadowBlur:			5,
		shadowOffset:		{'x': 0, 'y': 1},
		controlsOffset:		{'right': 6, 'top': 6},
		useCanvas:			true,
		useCanvasControls:	true,
		useCSS3:			true,
		useSpinner:			true,

		// Events
		onDrawBegin:		$empty,
		onDrawEnd:			$empty,
		onContentLoaded:	$empty,
		onFocus:			$empty,
		onBlur:				$empty,
		onResize:			$empty,
		onMinimize:			$empty,
		onMaximize:			$empty,
		onRestore:			$empty,
		onClose:			$empty,
		onCloseComplete:	$empty,
		onDragStart:		$empty,
		onDragComplete:		$empty
	},

	closeAll: function(){
		$$('.mocha').each(function(windowEl){
			windowEl.close();
		}.bind(this));
	},

	toggleAll: function(){
		MUI.each(function(instance){
			if (!instance.isTypeOf || !instance.isTypeOf('MUI.Window') || instance.isMinimized) return;
			var windowEl = instance.el.windowEl;
			if (windowEl.getStyle('visibility') == 'visible'){
				if (instance.iframe) instance.el.iframe.setStyle('visibility', 'hidden');
				if (instance.sections){
					instance.sections.each(function(section){
						var el=section.wrap ? section.wrapperEl : section.childElement;
						if (el) el.setStyle('visibility', 'hidden');
					});
				}
				if (instance.el.contentBorder) instance.el.contentBorder.setStyle('visibility', 'hidden');
				windowEl.setStyle('visibility', 'hidden');
				MUI.Windows.windowsVisible = false;
			} else {
				windowEl.setStyle('visibility', 'visible');
				if (instance.el.contentBorder) instance.el.contentBorder.setStyle('visibility', 'visible');
				if (instance.iframe) instance.el.iframe.setStyle('visibility', 'visible');
				if (instance.sections){
					instance.sections.each(function(section){
						var el=section.wrap ? section.wrapperEl : section.childElement;
						if (el) el.setStyle('visibility', 'visible');
					});
				}
				MUI.Windows.windowsVisible = true;
			}
		}.bind(this));
	},

	blurAll: function(){
		if (!MUI.Windows.focusingWindow){
			$$('.mocha').each(function(windowEl){
				var instance = windowEl.retrieve('instance');
				if (instance.options.type != 'modal' && instance.options.type != 'modal2'){
					windowEl.removeClass('isFocused');
				}
			});
			$$('.dockTab').removeClass('activeDockTab');
		}
	},

	newFromHTML: function(){

		$$('.mocha').each(function(el){
			// Get the window title and destroy that element, so it does not end up in window content
			if (Browser.Engine.presto || Browser.Engine.trident5){
				el.hide(); // Required by Opera, and probably IE7
			}
			var title = el.getElement('h3.mochaTitle');

			if (Browser.Engine.presto) el.show();

			var elDimensions = el.getStyles('height', 'width');
			var properties = {
				id: el.getProperty('id'),
				height: elDimensions.height.toInt(),
				width: elDimensions.width.toInt(),
				x: el.getStyle('left').toInt(),
				y: el.getStyle('top').toInt()
			};

			// If there is a title element, set title and destroy the element so it does not end up in window content
			if (title){
				properties.title = title.innerHTML;
				title.destroy();
			}

			// Get content and destroy the element
			properties.content = el.innerHTML;
			el.destroy();

			// Create window
			new MUI.Window(properties, true);
		}.bind(this));
	},

	newFromJSON: function(newWindows){

		newWindows.each(function(options){
			var temp = new Hash(options);

			temp.each(function(value, key){
				if ($type(value) != 'string') return;
				if (value.substring(0, 8) == 'function'){
					eval("options." + key + " = " + value);
				}
			});

			new MUI.Window(options);
		});

	},

	_underlayInitialize: function(){
		/*
		 The underlay is inserted directly under windows when they are being dragged or resized
		 so that the cursor is not captured by iframes or other plugins (such as Flash)
		 underneath the window.
		 */
		var windowUnderlay = new Element('div', {
			'id': 'windowUnderlay',
			'styles': {
				'height': parent.getCoordinates().height,
				'opacity': .01,
				'display': 'none'
			}
		}).inject(document.body);
	},

	_setUnderlaySize: function(){
		$('windowUnderlay').setStyle('height', parent.getCoordinates().height);
	},

	_getWithHighestZIndex: function(){
		this.highestZindex = 0;
		$$('.mocha').each(function(element){
			this.zIndex = element.getStyle('zIndex');
			if (this.zIndex >= this.highestZindex){
				this.highestZindex = this.zIndex;
			}
		}.bind(this));
		$$('.mocha').each(function(element){
			if (element.getStyle('zIndex') == this.highestZindex){
				this.windowWithHighestZindex = element;
			}
		}.bind(this));
		return this.windowWithHighestZindex;
	}

});

MUI.Window = (MUI.Window || new NamedClass('MUI.Window',{})).implement({

	Implements: [Events, Options],

	options: MUI.Windows.options,

	initialize: function(options){
		this.setOptions(MUI.Windows.options); // looks strange, but is here to allow global options to be set externally to Window.js
		this.setOptions(options);

		// Shorten object chain
		options = this.options;

		$extend(this, {
			mochaControlsWidth: 0,
			minimizeButtonX: 0,  // Minimize button horizontal position
			maximizeButtonX: 0,  // Maximize button horizontal position
			closeButtonX: 0,  // Close button horizontal position
			headerFooterShadow: options.headerHeight + options.footerHeight + (options.shadowBlur * 2),
			oldTop: 0,
			oldLeft: 0,
			isMaximized: false,
			isMinimized: false,
			isCollapsed: false,
			el: {}
		});

		if (options.type != 'window'){
			options.container = document.body;
			options.minimizable = false;
		}
		if (!options.container) options.container = MUI.Desktop && MUI.Desktop.desktop ? MUI.Desktop.desktop : document.body;

		// Set this.options.resizable to default if it was not defined
		if (options.resizable == null) options.resizable = !(options.type != 'window' || options.shape == 'gauge');

		// Set this.options.draggable if it was not defined
		if (options.draggable == null) options.draggable = options.type == 'window';

		// Gauges are not maximizable or resizable
		if (options.shape == 'gauge' || options.type == 'notification'){
			options.collapsible = false;
			options.maximizable = false;
			options.contentBgColor = 'transparent';
			options.scrollbars = false;
			options.footerHeight = 0;
			options.useCSS3 = false;
		}
		if (options.type == 'notification'){
			options.closable = false;
			options.headerHeight = 0;
		}

		// Minimizable, dock is required and window cannot be modal
		if (MUI.dock){
			if (options.type != 'modal' && options.type != 'modal2') this.options.minimizable = options.minimizable;
		} else options.minimizable = false;

		// Maximizable, desktop is required
		options.maximizable = MUI.Desktop && MUI.Desktop.desktop && options.maximizable && options.type != 'modal' && options.type != 'modal2';

		if (this.options.type == 'modal2'){
			this.options.shadowBlur = 0;
			this.options.shadowOffset = {'x': 0, 'y': 0};
			this.options.useSpinner = false;
			this.options.useCanvas = false;
			this.options.footerHeight = 0;
			this.options.headerHeight = 0;
		}

		// If window has no ID, give it one.
		options.id = options.id || 'win' + (++MUI.IDCount);

		this.el.windowEl = $(options.id);

		// Condition under which to use CSS3, needs shadow, border-radius and gradient support
		if (!options.useCSS3) this.useCSS3 = false;
		else if (Browser.Engine.gecko && Browser.Engine.version >= 19) this.useCSS3 = true; // FF3.6
		else if (Browser.Engine.webkit && Browser.Engine.version >= 525) this.useCSS3 = true; // S4
		else this.useCSS3 = Browser.Engine.trident && Browser.Engine.version > 6;

		// if somebody wants CSS3 but not canvas and condition are false for css3
		// i.e. IE8 Test CSS3 Body
		if (options.useCSS3 && !this.useCSS3 && !this.options.useCanvas) options.shadowBlur = 0;

		if (options.require.css.length || options.require.images.length){
			new MUI.Require({
				css: options.require.css,
				images: options.require.images,
				onload: function(){
					this.draw();
				}.bind(this)
			});
		} else {
			this.draw();
		}

		// Return window object
		return this;
	},

	draw: function(){ // options is not doing anything
		var options = this.options;

		// Check if window already exists and is not in progress of closing
		if (this.el.windowEl && !this.isClosing){
			// Restore if minimized
			if (this.isMinimized) this._restoreMinimized();

			// Expand and focus if collapsed
			else if (this.isCollapsed){
				this.collapseToggle();
				this.focus.delay(10,this);
			} else if (this.el.windowEl.hasClass('windowClosed')){

				if (this.el.check) this.el.check.show();

				this.el.windowEl.removeClass('windowClosed');
				this.el.windowEl.setStyle('opacity', 0);
				this.el.windowEl.addClass('mocha');

				if (MUI.dock && options.type == 'window'){
					var currentButton = $(options.id + '_dockTab');
					if (currentButton) currentButton.show();
					MUI.Desktop.setDesktopSize();
				}

				this._showNewWindow();
			} else { // Else focus
				var coordinates = document.getCoordinates();
				if (this.el.windowEl.getStyle('left').toInt() > coordinates.width || this.el.windowEl.getStyle('top').toInt() > coordinates.height)
					this.center();
				this.focus.delay(10,this);
				if (MUI.options.standardEffects) this.el.windowEl.shake();
			}
			return this;
		} else MUI.set(options.id, this);

		this.isClosing = false;
		this.fireEvent('drawBegin',[this]);

		// Create window div
		MUI.Windows.indexLevel++;
		this.el.windowEl = new Element('div', {
			'class': this.useCSS3 ? 'mocha css3' : 'mocha',
			'id': options.id,
			'styles': {
				'position': 'absolute',
				'width': options.width,
				'height': options.height,
				'display': 'block',
				'opacity': 0,
				'zIndex': MUI.Windows.indexLevel += 2
			}
		});

		this.el.windowEl.store('instance', this);
		this.el.windowEl.addClass(options.addClass);
		if (options.type == 'modal2') this.el.windowEl.addClass('modal2');

		// Fix a mouseover issue with gauges in IE7
		if (Browser.Engine.trident && options.shape == 'gauge') this.el.windowEl.setStyle('backgroundImage', 'url(../images/spacer.gif)');

		if ((this.options.type == 'modal' || options.type == 'modal2' ) && Browser.Platform.mac && Browser.Engine.gecko){
			if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
				var ffversion = new Number(RegExp.$1);
				if (ffversion < 3) this.el.windowEl.setStyle('position', 'fixed');
			}
		}

		if (options.loadMethod == 'iframe') options.padding = {top: 0, right: 0, bottom: 0, left: 0};

		// Insert sub elements inside el.windowEl
		this._insertWindowElements();

		// Set title
		this.el.title.set('html', options.title);

		this.el.contentWrapper.setStyle('overflow', 'hidden');

		if (options.shape == 'gauge'){
			if (options.useCanvasControls) this.el.canvasControls.setStyle('visibility', 'hidden');
			else this.el.controls.setStyle('visibility', 'hidden');
			this.el.windowEl.addEvent('mouseover', function(){
				this.mouseover = true;
				var showControls = function(){
					if (this.mouseover){
						if (options.useCanvasControls) this.el.canvasControls.setStyle('visibility', 'visible');
						else this.el.controls.setStyle('visibility', 'visible');
						this.el.canvasHeader.setStyle('visibility', 'visible');
						this.el.title.show();
					}
				};
				showControls.delay(0, this);

			}.bind(this));
			this.el.windowEl.addEvent('mouseleave', function(){
				this.mouseover = false;
				if (this.options.useCanvasControls) this.el.canvasControls.setStyle('visibility', 'hidden');
				else this.el.controls.setStyle('visibility', 'hidden');
				this.el.canvasHeader.setStyle('visibility', 'hidden');
				this.el.title.hide();
			}.bind(this));
		}

		// Inject window into DOM
		this.el.windowEl.inject(options.container);
		
		// Convert CSS colors to Canvas colors.
		this._setColors();
		if (options.type != 'notification') this._setMochaControlsWidth();

		// Add content to window.
		MUI.updateContent({
			'element': this.el.windowEl,
			'content': options.content,
			'method': options.method,
			'url': options.contentURL,
			'data': options.data,
			'onContentLoaded': null,
			'require': {
				js: options.require.js,
				onload: options.require.onload
			},
			'section':'content'
		});

		// load/build all of the additional  content sections
		if (options.sections) options.sections.each(function(section){
			MUI.updateContent(section);
		});

		this.redraw();

		// Attach events to the window
		this._attachDraggable();
		this._attachResizable();
		this._setupEvents();

		if (options.resizable) this._adjustHandles();

		// Position window. If position not specified by user then center the window on the page.
		var dimensions = (options.container == document.body || options.container == MUI.Desktop.desktop) ? window.getSize() : $(this.options.container).getSize();
		var x,y;
		if (options.y){
			y = options.y - options.shadowBlur;
		} else {
			if (MUI.Desktop && MUI.Desktop.desktop){
				y = (dimensions.y * .5) - (this.el.windowEl.offsetHeight * .5);
				if (y < -options.shadowBlur) y = -options.shadowBlur;
			} else {
				y = window.getScroll().y + (window.getSize().y * .5) - (this.el.windowEl.offsetHeight * .5);
				if (y < -options.shadowBlur) y = -options.shadowBlur;
			}
		}

		if (this.options.x == null){
			x = (dimensions.x * .5) - (this.el.windowEl.offsetWidth * .5);
			if (x < -options.shadowBlur) x = -options.shadowBlur;
		} else x = options.x - options.shadowBlur;

		this.el.windowEl.setStyles({
			'top': y,
			'left': x
		});

		// Create opacityMorph

		this.opacityMorph = new Fx.Morph(this.el.windowEl, {
			'duration': 350,
			transition: Fx.Transitions.Sine.easeInOut,
			onComplete: function(){
				if (Browser.Engine.trident) this.redraw();
			}.bind(this)
		});

		this._showNewWindow();

		// This is a generic morph that can be reused later by functions like centerWindow()
		// It returns the el.windowEl element rather than this Class.
		this.morph = new Fx.Morph(this.el.windowEl, {
			'duration': 200
		});
		this.el.windowEl.store('morph', this.morph);

		this.resizeMorph = new Fx.Elements([this.el.contentWrapper, this.el.windowEl], {
			duration: 400,
			transition: Fx.Transitions.Sine.easeInOut,
			onStart: function(){
				this.resizeAnimation = this.redraw.periodical(20, this);
			}.bind(this),
			onComplete: function(){
				$clear(this.resizeAnimation);
				this.redraw();
				// Show iframe
				if (this.el.iframe) this.el.iframe.setStyle('visibility', 'visible');
			}.bind(this)
		});
		this.el.windowEl.store('resizeMorph', this.resizeMorph);

		// Add check mark to menu if link exists in menu
		// Need to make sure the check mark is not added to links not in menu
		if ($(this.el.windowEl.id + 'LinkCheck')){
			this.el.check = new Element('div', {
				'class': 'check',
				'id': this.options.id + '_check'
			}).inject(this.el.windowEl.id + 'LinkCheck');
		}

		if (this.options.closeAfter) this.el.windowEl.close.delay(this.options.closeAfter, this);
		if (MUI.dock && this.options.type == 'window') MUI.dock.createDockTab(this);
		this.fireEvent('drawEnd',[this]);
		return this;
	},

	redraw: function(shadows){
		if (shadows == null) shadows = true;
		if (this.drawingWindow) return;
		this.drawingWindow = true;

		if (this.isCollapsed){
			this._drawWindowCollapsed(shadows);
			return;
		}

		var options = this.options;
		var shadowBlur = this.useCSS3 ? 0 : options.shadowBlur;
		var shadowBlur2x = this.useCSS3 ? 0 : shadowBlur * 2;
		var shadowOffset = this.options.shadowOffset;

		this.el.overlay.setStyle('width', this.el.contentWrapper.offsetWidth);

		// Resize iframe when window is resized
		if (this.el.iframe) this.el.iframe.setStyle('height', this.el.contentWrapper.offsetHeight);

		var borderHeight = this.el.contentBorder.getStyle('border-top').toInt() + this.el.contentBorder.getStyle('border-bottom').toInt();

		this.headerFooterShadow = options.headerHeight + options.footerHeight + shadowBlur2x;

		var width = this.el.contentWrapper.getStyle('width').toInt() + shadowBlur2x;
		var height = this.el.contentWrapper.getStyle('height').toInt() + this.headerFooterShadow + borderHeight;
		if (options.sections) options.sections.each(function(section){
			var el = section.wrap ? section.wrapperEl : section.childElement;
			height += el.getStyle('height').toInt() + el.getStyle('border-top').toInt();
		} );

		this.el.windowEl.setStyles({
			'height': height,
			'width': width
		});
		this.el.titleBar.setStyles({
			'width': width - shadowBlur2x,
			'height': options.headerHeight
		});

		if (this.useCSS3) this._css3SetStyles();
		else {
			this.el.overlay.setStyles({
				'height': height,
				'top': shadowBlur - shadowOffset.y,
				'left': shadowBlur - shadowOffset.x
			});

			if (this.options.useCanvas){
				if (Browser.Engine.trident){
					this.el.canvas.height = 20000;
					this.el.canvas.width = 50000;
				}
				this.el.canvas.height = height;
				this.el.canvas.width = width;
			}

			// Part of the fix for IE6 select z-index bug
			if (Browser.Engine.trident4) this.el.zIndexFix.setStyles({'width': width, 'height': height});

			// Make sure loading icon is placed correctly.
			if (options.useSpinner && options.shape != 'gauge' && options.type != 'notification'){
				this.el.spinner.setStyles({
					'left': shadowBlur - shadowOffset.x,
					'bottom': shadowBlur + shadowOffset.y + 8
				});
			}

			if (this.options.useCanvas){
				// Draw Window
				var ctx = this.el.canvas.getContext('2d');
				ctx.clearRect(0, 0, width, height);

				switch (options.shape){
					case 'box':
						MUI.Canvas.drawBox(ctx, width, height, shadowBlur, shadowOffset, shadows, this.options.type != 'notification' ? this.options.headerHeight : 0, this.options.cornerRadius);
						break;
					case 'gauge':
						MUI.Canvas.drawGauge(ctx, width, height, shadowBlur, shadowOffset, shadows, this.options.headerHeight);
						break;
				}

				if (options.resizable && !this.isMaximized){
					MUI.Canvas.triangle(ctx, width - (shadowBlur + shadowOffset.x + 17), height - (shadowBlur + shadowOffset.y + 18), 11, 11, this.resizableColor, 1.0);
					// Invisible dummy object. The last element drawn is not rendered consistently while resizing in IE6 and IE7
					if (Browser.Engine.trident) MUI.Canvas.triangle(ctx, 0, 0, 10, 10, this.resizableColor, 0);
				}
			}
		}

		if (options.type != 'notification' && options.useCanvasControls) this._drawControls(width, height, shadows);

		// Resize panels if there are any
		if (MUI.Desktop && this.el.contentWrapper.getChildren('.column').length != 0){
			MUI.rWidth(this.el.contentWrapper);
			this.el.contentWrapper.getChildren('.column').each(function(column){
				MUI.panelHeight(column);
			});
		}

		this.drawingWindow = false;
		return this;
	},

	restore: function(){
		if (this.isMinimized) { if(this._restoreMinimized) this._restoreMinimized(); }
		else if (this.isMaximized && this._restoreMaximized) this._restoreMaximized();
		return this;
	},

	center: function(){
		var windowEl = this.el.windowEl;
		var options = this.options;
		var dimensions = options.container.getCoordinates();

		var windowPosTop = window.getScroll().y + (window.getSize().y * .5) - (windowEl.offsetHeight * .5);
		if (windowPosTop < -options.shadowBlur) windowPosTop = -options.shadowBlur;
		var windowPosLeft = (dimensions.width * .5) - (windowEl.offsetWidth * .5);
		if (windowPosLeft < -options.shadowBlur) windowPosLeft = -options.shadowBlur;
		if (MUI.options.advancedEffects){
			this.morph.start({
				'top': windowPosTop,
				'left': windowPosLeft
			});
		} else {
			windowEl.setStyles({
				'top': windowPosTop,
				'left': windowPosLeft
			});
		}

		return this;
	},

	resize: function(options){
		var windowEl = this.el.windowEl;

		options=$extend({
			width: null,
			height: null,
			top: null,
			left: null,
			centered: true
		}, options);

		var oldWidth = windowEl.getStyle('width').toInt();
		var oldHeight = windowEl.getStyle('height').toInt();
		var oldTop = windowEl.getStyle('top').toInt();
		var oldLeft = windowEl.getStyle('left').toInt();

		var top,left;
		if (options.centered){
			top = typeof(options.top) != 'undefined' ? options.top : oldTop - ((options.height - oldHeight) * .5);
			left = typeof(options.left) != 'undefined' ? options.left : oldLeft - ((options.width - oldWidth) * .5);
		} else {
			top = typeof(options.top) != 'undefined' ? options.top : oldTop;
			left = typeof(options.left) != 'undefined' ? options.left : oldLeft;
		}

		if (MUI.options.advancedEffects){
			windowEl.retrieve('resizeMorph').start({
				'0': {
					'height': options.height,
					'width':  options.width
				},
				'1': {
					'top': top,
					'left': left
				}
			});
		} else {
			windowEl.setStyles({
				'top': top,
				'left': left
			});
			this.el.contentWrapper.setStyles({
				'height': options.height,
				'width':  options.width
			});
			this.redraw();
			// Show iframe
			if (this.el.iframe){
				if (Browser.Engine.trident) this.el.iframe.show();
				else this.el.iframe.setStyle('visibility', 'visible');
			}
		}

		return this;
	},

	hide: function(){
		this.el.windowEl.setStyle('display', 'none');
		return this;
	},

	show: function(){
		this.el.windowEl.setStyle('display', 'block');
		return this;
	},

	focus: function(fireEvent){
		if(fireEvent==null) fireEvent=true;
		MUI.Windows.focusingWindow = true; // This is used with blurAll
		(function() { MUI.Windows.focusingWindow = false; }).delay(170, this);

		// Only focus when needed
		var windowEl = this.el.windowEl;
		if ($$('.mocha').length == 0) return this;
		if (windowEl.hasClass('isFocused')) return this;

		if (this.options.type == 'notification'){
			windowEl.setStyle('zIndex', 11001);
			return this;
		}

		MUI.Windows.indexLevel += 2;
		windowEl.setStyle('zIndex', MUI.Windows.indexLevel);

		// Used when dragging and resizing windows
		$('windowUnderlay').setStyle('zIndex', MUI.Windows.indexLevel - 1).inject($(windowEl), 'after');

		// Fire onBlur for the window that lost focus.
		MUI.each(function(instance){
			if (instance.className != 'MUI.Window') return;
			if (instance.el.windowEl.hasClass('isFocused')){
				instance.fireEvent('blur', [this]);
			}
			instance.el.windowEl.removeClass('isFocused');
		});

		if (MUI.dock && this.options.type == 'window') MUI.dock.makeActiveTab();
		windowEl.addClass('isFocused');

		if (fireEvent) this.fireEvent('focus', [this]);
		return this;
	},

	hideSpinner: function(){
		if (this.el.spinner)	this.el.spinner.hide();
		return this;
	},

	showSpinner: function(){
		if (this.el.spinner) this.el.spinner.show();
		return this;
	},

	close: function(){
		var self = this;

		// Does window exist and is not already in process of closing ?
		if (self.isClosing) return this;

		self.isClosing = true;
		self.fireEvent('close', [this]);

		if (self.options.storeOnClose){
			this._storeOnClose();
			return this;
		}
		if (self.check) self.check.destroy();

		if ((self.options.type == 'modal' || self.options.type == 'modal2') && Browser.Engine.trident4){
			$('modalFix').hide();
		}

		if (!MUI.options.advancedEffects){
			if (self.options.type == 'modal' || self.options.type == 'modal2') $('modalOverlay').setStyle('opacity', 0);
			self._doClosingJobs();
		} else {
			// Redraws IE windows without shadows since IE messes up canvas alpha when you change element opacity
			if (Browser.Engine.trident) self.redraw(false);
			if (self.options.type == 'modal' || self.options.type == 'modal2'){
				MUI.Modal.modalOverlayCloseMorph.start({
					'opacity': 0
				});
			}
			var closeMorph = new Fx.Morph(self.el.windowEl, {
				duration: 120,
				onComplete: function(){
					self._doClosingJobs();
					return true;
				}.bind(this)
			});
			closeMorph.start({
				'opacity': .4
			});
		}
		return this;
	},

	collapseToggle: function() {
		var handles = this.el.windowEl.getElements('.handle');
		if (this.isMaximized) return this;
		if (this.isCollapsed){
			this.isCollapsed = false;
			this.redraw();
			this.el.contentBorder.setStyles({
				visibility: 'visible',
				position: null,
				top: null,
				left: null
			});
			if (this.sections){
				this.sections.each(function(section){
					var el = section.wrap ? section.wrapperEl : section.childElement;
					if (el) el.setStyles({
						visibility: 'visible',
						position: null,
						top: null,
						left: null
					});
				});
			}
			if (this.el.iframe) this.el.iframe.setStyle('visibility', 'visible');
			handles.show();
		} else {
			this.isCollapsed = true;
			handles.hide();
			if (this.el.iframe) this.el.iframe.setStyle('visibility', 'hidden');
			this.el.contentBorder.setStyles({
				visibility: 'hidden',
				position: 'absolute',
				top: -10000,
				left: -10000
			});
			if (this.sections){
				this.sections.each(function(section){
					var el = section.wrap ? section.wrapperEl : section.childElement;
					if (el) el.setStyles({
						visibility: 'hidden',
						position: 'absolute',
						top: -10000,
						left: -10000
					});
				});
			}
			this._drawWindowCollapsed();
		}
		return this;
	},

	_saveValues: function(){
		var coordinates = this.el.windowEl.getCoordinates();
		this.options.x = coordinates.left.toInt();
		this.options.y = coordinates.top.toInt();
		return this;
	},

	_setupEvents: function(){
		var windowEl = this.el.windowEl;
		// Set events
		// Note: if a button does not exist, its due to properties passed to newWindow() stating otherwise
		if (this.el.closeButton) this.el.closeButton.addEvent('click', function(e){
			e.stop();
			windowEl.close();
		}.bind(this));

		if (this.options.type == 'window'){
			windowEl.addEvent('mousedown', function(e){
				if (Browser.Engine.trident) e.stop();
				this.focus();
				if (windowEl.getStyle('top').toInt() < -this.options.shadowBlur){
					windowEl.setStyle('top', -this.options.shadowBlur);
				}
			}.bind(this));
		}

		if (this.el.minimizeButton) this.el.minimizeButton.addEvent('click', function(e){
			e.stop();
			this.minimize();
		}.bind(this));

		if (this.el.maximizeButton) this.el.maximizeButton.addEvent('click', function(e){
			e.stop();
			if (this.isMaximized) this._restoreMaximized();
			else this.maximize();
		}.bind(this));

		if (this.options.collapsible){
			// Keep titlebar text from being selected on double click in Safari.
			this.el.title.addEvent('selectstart', function(e){
				e.stop();
			}.bind(this));

			if (Browser.Engine.trident){
				this.el.titleBar.addEvent('mousedown', function(){
					this.el.title.setCapture();
				}.bind(this));
				this.el.titleBar.addEvent('mouseup', function(){
					this.el.title.releaseCapture();
				}.bind(this));
			}

			this.el.titleBar.addEvent('dblclick', function(e){
				e.stop();
				this.collapseToggle();
			}.bind(this));
		}
	},

	_adjustHandles: function(){
		var shadowBlur = this.options.shadowBlur;
		var shadowBlur2x = shadowBlur * 2;
		var shadowOffset = this.options.shadowOffset;
		var top = shadowBlur - shadowOffset.y - 1;
		var right = shadowBlur + shadowOffset.x - 1;
		var bottom = shadowBlur + shadowOffset.y - 1;
		var left = shadowBlur - shadowOffset.x - 1;

		var coordinates = this.el.windowEl.getCoordinates();
		var width = coordinates.width - shadowBlur2x + 2;
		var height = coordinates.height - shadowBlur2x + 2;

		this.el.n.setStyles({
			'top': top,
			'left': left + 10,
			'width': width - 20
		});
		this.el.e.setStyles({
			'top': top + 10,
			'right': right,
			'height': height - 30
		});
		this.el.s.setStyles({
			'bottom': bottom,
			'left': left + 10,
			'width': width - 30
		});
		this.el.w.setStyles({
			'top': top + 10,
			'left': left,
			'height': height - 20
		});
		this.el.ne.setStyles({
			'top': top,
			'right': right
		});
		this.el.se.setStyles({
			'bottom': bottom,
			'right': right
		});
		this.el.sw.setStyles({
			'bottom': bottom,
			'left': left
		});
		this.el.nw.setStyles({
			'top': top,
			'left': left
		});
	},

	_setColors: function(){
		// Convert CSS colors to Canvas colors.
		if (this.options.useCanvas && !this.useCSS3){

			// Set TitlebarColor
			var pattern = /\?(.*?)\)/;
			if (this.el.titleBar.getStyle('backgroundImage') != 'none'){
				var gradient = this.el.titleBar.getStyle('backgroundImage');
				gradient = gradient.match(pattern)[1];
				gradient = gradient.parseQueryString();
				var gradientFrom = gradient.from;
				var gradientTo = gradient.to.replace(/\"/, ''); // IE7 was adding a quotation mark in. No idea why.

				this.headerStartColor = new Color(gradientFrom);
				this.headerStopColor = new Color(gradientTo);
				this.el.titleBar.addClass('replaced');
			} else if (this.el.titleBar.getStyle('background-color') !== '' && this.el.titleBar.getStyle('background-color') !== 'transparent'){
				this.headerStartColor = new Color(this.el.titleBar.getStyle('background-color')).mix('#fff', 20);
				this.headerStopColor = new Color(this.el.titleBar.getStyle('background-color')).mix('#000', 20);
				this.el.titleBar.addClass('replaced');
			}

			// Set BodyBGColor
			if (this.el.windowEl.getStyle('background-color') !== '' && this.el.windowEl.getStyle('background-color') !== 'transparent'){
				this.bodyBgColor = new Color(this.el.windowEl.getStyle('background-color'));
				this.el.windowEl.addClass('replaced');
			}

			// Set resizableColor, the color of the SE corner resize handle
			if (this.options.resizable && this.se.getStyle('background-color') !== '' && this.se.getStyle('background-color') !== 'transparent'){
				this.resizableColor = new Color(this.se.getStyle('background-color'));
				this.se.addClass('replaced');
			}

		}

		if (this.options.useCanvasControls){
			if (this.el.minimizeButton){
				// Set Minimize Button Foreground Color
				if (this.el.minimizeButton.getStyle('color') !== '' && this.el.minimizeButton.getStyle('color') !== 'transparent')
					this.minimizeColor = new Color(this.el.minimizeButton.getStyle('color'));

				// Set Minimize Button Background Color
				if (this.el.minimizeButton.getStyle('background-color') !== '' && this.el.minimizeButton.getStyle('background-color') !== 'transparent'){
					this.minimizeBgColor = new Color(this.el.minimizeButton.getStyle('background-color'));
					this.el.minimizeButton.addClass('replaced');
				}
			}

			if (this.el.maximizeButton){
				// Set Maximize Button Foreground Color
				if (this.el.maximizeButton.getStyle('color') !== '' && this.el.maximizeButton.getStyle('color') !== 'transparent')
					this.maximizeColor = new Color(this.el.maximizeButton.getStyle('color'));

				// Set Maximize Button Background Color
				if (this.el.maximizeButton.getStyle('background-color') !== '' && this.el.maximizeButton.getStyle('background-color') !== 'transparent'){
					this.maximizeBgColor = new Color(this.el.maximizeButton.getStyle('background-color'));
					this.el.maximizeButton.addClass('replaced');
				}
			}

			if (this.el.closeButton){
				// Set Close Button Foreground Color
				if (this.el.closeButton.getStyle('color') !== '' && this.el.closeButton.getStyle('color') !== 'transparent')
					this.closeColor = new Color(this.el.closeButton.getStyle('color'));

				// Set Close Button Background Color
				if (this.el.closeButton.getStyle('background-color') !== '' && this.el.closeButton.getStyle('background-color') !== 'transparent'){
					this.closeBgColor = new Color(this.el.closeButton.getStyle('background-color'));
					this.el.closeButton.addClass('replaced');
				}
			}
		}
	},

	_setMochaControlsWidth: function(){
		this.mochaControlsWidth = 0;
		var options = this.options;
		if (options.minimizable){
			this.mochaControlsWidth += (this.el.minimizeButton.getStyle('margin-left').toInt() + this.el.minimizeButton.getStyle('width').toInt());
		}
		if (options.maximizable){
			this.mochaControlsWidth += (this.el.maximizeButton.getStyle('margin-left').toInt() + this.el.maximizeButton.getStyle('width').toInt());
		}
		if (options.closable){
			this.mochaControlsWidth += (this.el.closeButton.getStyle('margin-left').toInt() + this.el.closeButton.getStyle('width').toInt());
		}
		this.el.controls.setStyle('width', this.mochaControlsWidth);
		if (options.useCanvasControls){
			this.el.canvasControls.setProperty('width', this.mochaControlsWidth);
		}
	},

	_insertWindowElements: function(){
		var self = this;
		var options = self.options;
		var height = options.height;
		var width = options.width;
		var id = options.id;

		var cache = {};

		if (Browser.Engine.trident4){
			cache.zIndexFix = new Element('iframe', {
				'id': id + '_zIndexFix',
				'class': 'zIndexFix',
				'scrolling': 'no',
				'marginWidth': 0,
				'marginHeight': 0,
				'src': '',
				'styles': {
					'position': 'absolute' // This is set here to make theme transitions smoother
				}
			}).inject(self.el.windowEl);
		}

		cache.overlay = new Element('div', {
			'id': id + '_overlay',
			'class': 'mochaOverlay',
			'styles': {
				'position': 'absolute', // This is set here to make theme transitions smoother
				'top': 0,
				'left': 0
			}
		}).inject(self.el.windowEl);

		cache.titleBar = new Element('div', {
			'id': id + '_titleBar',
			'class': 'mochaTitlebar',
			'styles': {
				'cursor': options.draggable ? 'move' : 'default'
			}
		}).inject(cache.overlay, 'top');

		cache.title = new Element('h3', {
			'id': id + '_title',
			'class': 'mochaTitle'
		}).inject(cache.titleBar);

		if (options.icon != false){
			cache.title.setStyles({
				'padding-left': 28,
				'background': 'url(' + options.icon + ') 5px 4px no-repeat'
			});
		}

		cache.contentBorder = new Element('div', {
			'id': id + '_contentBorder',
			'class': 'mochaContentBorder'
		}).inject(cache.overlay);

		cache.contentWrapper = new Element('div', {
			'id': id + '_contentWrapper',
			'class': 'mochaContentWrapper',
			'styles': {
				'width': width + 'px',
				'height': height + 'px'
			}
		}).inject(cache.contentBorder);

		if (self.options.shape == 'gauge'){
			cache.contentBorder.setStyle('borderWidth', 0);
		}

		cache.content = new Element('div', {
			'id': id + '_content',
			'class': 'mochaContent'
		}).inject(cache.contentWrapper);

		if (self.options.useCanvas && !this.useCSS3){
			if (!Browser.Engine.trident){
				cache.canvas = new Element('canvas', {
					'id': id + '_canvas',
					'class': 'mochaCanvas',
					'width': 10,
					'height': 10
				}).inject(self.el.windowEl);
			} else if (Browser.Engine.trident){
				cache.canvas = new Element('canvas', {
					'id': id + '_canvas',
					'class': 'mochaCanvas',
					'width': 50000, // IE8 excanvas requires these large numbers
					'height': 20000,
					'styles': {
						'position': 'absolute',
						'top': 0,
						'left': 0
					}
				}).inject(self.el.windowEl);

				if (MUI.ieSupport == 'excanvas'){
					G_vmlCanvasManager.initElement(cache.canvas);
					cache.canvas = self.el.windowEl.getElement('.mochaCanvas');
				}
			}
		}

		cache.controls = new Element('div', {
			'id': id + '_controls',
			'class': 'mochaControls'
		}).inject(cache.overlay, 'after');

		cache.footer = new Element('div', {
			'id': id + '_footer',
			'class': 'mochaWindowFooter',
			'styles':{ 'width': width - 30 }
		}).inject(cache.overlay, 'bottom');

		if (options.sections){
			var snum = 0;
			options.sections.each(function(section,idx){
				var intoEl = cache.contentBorder;

				section.element = self.el.windowEl;
				snum++;
				var id = self.options.id + '_' + (section.section || 'section' + snum);

				section = $extend({
					'wrap': true,
					'position': 'top',
					'empty': false,
					'height': 29,
					'id': id,
					'css': 'mochaToolbar',
					'section': 'section' + snum,
					'loadMethod': 'xhr',
					'method': self.options.method
				}, section);

				var wrap = section.wrap;
				var where = section.position == 'bottom' ? 'after' : 'before';
				var empty = section.empty;
				if (section.position == 'header' || section.position == 'footer'){
					intoEl = section.position == 'header' ? cache.titleBar : cache.footer;
					where = 'bottom';
					wrap = false;
				} else empty = false; // can't empty in content border area

				if (wrap){
					section.wrapperEl = new Element('div', {
						'id': section.id + '_wrapper',
						'class': section.css+'Wrapper',
						'styles': {'height': section.height}
					}).inject(intoEl, where);

					if (section.position == 'bottom') section.wrapperEl.addClass('bottom');
					intoEl = section.wrapperEl;
				}

				if (empty) intoEl.empty();
				section.childElement = new Element('div', {
					'id': section.id,
					'class': section.css,
					'styles': {'height': section.height}
				}).inject(intoEl);

				section.wrapperEl = intoEl;
				if (section.wrap && section.position == 'bottom') section.childElement.addClass('bottom');

				self.options.sections[idx] = section;
			});
		}

		if (options.useCanvasControls){
			cache.canvasControls = new Element('canvas', {
				'id': id + '_canvasControls',
				'class': 'mochaCanvasControls',
				'width': 14,
				'height': 14
			}).inject(self.el.windowEl);

			if (Browser.Engine.trident && MUI.ieSupport == 'excanvas'){
				G_vmlCanvasManager.initElement(cache.canvasControls);
				cache.canvasControls = self.el.windowEl.getElement('.mochaCanvasControls');
			}
		}

		if (options.closable){
			cache.closeButton = new Element('div', {
				'id': id + '_closeButton',
				'class': 'mochaCloseButton mochaWindowButton',
				'title': 'Close'
			}).inject(cache.controls);
		}

		if (options.maximizable){
			cache.maximizeButton = new Element('div', {
				'id': id + '_drawMaximizeButton',
				'class': 'mochaMaximizeButton mochaWindowButton',
				'title': 'Maximize'
			}).inject(cache.controls);
		}

		if (options.minimizable){
			cache.minimizeButton = new Element('div', {
				'id': id + '_minimizeButton',
				'class': 'mochaMinimizeButton mochaWindowButton',
				'title': 'Minimize'
			}).inject(cache.controls);
		}

		if (options.useSpinner && options.shape != 'gauge' && options.type != 'notification'){
			cache.spinner = new Element('div', {
				'id': id + '_spinner',
				'class': 'mochaSpinner',
				'styles':{	'width': 16,
							'height': 16 }
			}).inject(cache.footer, 'bottom');
		}

		if (self.options.shape == 'gauge'){
			cache.canvasHeader = new Element('canvas', {
				'id': id + '_canvasHeader',
				'class': 'mochaCanvasHeader',
				'width': self.options.width,
				'height': 26
			}).inject(self.el.windowEl, 'bottom');

			if (Browser.Engine.trident && MUI.ieSupport == 'excanvas'){
				G_vmlCanvasManager.initElement(cache.canvasHeader);
				cache.canvasHeader = self.el.windowEl.getElement('.mochaCanvasHeader');
			}
		}

		if (Browser.Engine.trident) cache.overlay.setStyle('zIndex', 2);

		// For Mac Firefox 2 to help reduce scrollbar bugs in that browser
		if (Browser.Platform.mac && Browser.Engine.gecko){
			if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
				var ffversion = new Number(RegExp.$1);
				if (ffversion < 3){
					cache.overlay.setStyle('overflow', 'auto');
				}
			}
		}

		if (options.resizable){
			cache.n = new Element('div', {
				'id': id + '_resizeHandle_n',
				'class': 'handle',
				'styles': {
					'top': 0,
					'left': 10,
					'cursor': 'n-resize'
				}
			}).inject(cache.overlay, 'after');

			cache.ne = new Element('div', {
				'id': id + '_resizeHandle_ne',
				'class': 'handle corner',
				'styles': {
					'top': 0,
					'right': 0,
					'cursor': 'ne-resize'
				}
			}).inject(cache.overlay, 'after');

			cache.e = new Element('div', {
				'id': id + '_resizeHandle_e',
				'class': 'handle',
				'styles': {
					'top': 10,
					'right': 0,
					'cursor': 'e-resize'
				}
			}).inject(cache.overlay, 'after');

			cache.se = new Element('div', {
				'id': id + '_resizeHandle_se',
				'class': 'handle cornerSE',
				'styles': {
					'bottom': 0,
					'right': 0,
					'cursor': 'se-resize'
				}
			}).inject(cache.overlay, 'after');

			cache.s = new Element('div', {
				'id': id + '_resizeHandle_s',
				'class': 'handle',
				'styles': {
					'bottom': 0,
					'left': 10,
					'cursor': 's-resize'
				}
			}).inject(cache.overlay, 'after');

			cache.sw = new Element('div', {
				'id': id + '_resizeHandle_sw',
				'class': 'handle corner',
				'styles': {
					'bottom': 0,
					'left': 0,
					'cursor': 'sw-resize'
				}
			}).inject(cache.overlay, 'after');

			cache.w = new Element('div', {
				'id': id + '_resizeHandle_w',
				'class': 'handle',
				'styles': {
					'top': 10,
					'left': 0,
					'cursor': 'w-resize'
				}
			}).inject(cache.overlay, 'after');

			cache.nw = new Element('div', {
				'id': id + '_resizeHandle_nw',
				'class': 'handle corner',
				'styles': {
					'top': 0,
					'left': 0,
					'cursor': 'nw-resize'
				}
			}).inject(cache.overlay, 'after');
		}
		$extend(this.el, cache);

	},

	_showNewWindow: function(){
		var options = this.options;
		if (options.type == 'modal' || options.type == 'modal2'){
			MUI.currentModal = this.el.windowEl;
			if (Browser.Engine.trident4) $('modalFix').show();
			$('modalOverlay').show();
			if (MUI.options.advancedEffects){
				MUI.Modal.modalOverlayCloseMorph.cancel();
				MUI.Modal.modalOverlayOpenMorph.start({
					'opacity': .6
				});
				this.el.windowEl.setStyle('zIndex', 11000);
				this.opacityMorph.start({
					'opacity': 1
				});
			} else {
				$('modalOverlay').setStyle('opacity', .6);
				this.el.windowEl.setStyles({
					'zIndex': 11000,
					'opacity': 1
				});
			}

			$$('.dockTab').removeClass('activeDockTab');
			$$('.mocha').removeClass('isFocused');
			this.el.windowEl.addClass('isFocused');

		} else if (MUI.options.advancedEffects){
			// IE cannot handle both element opacity and VML alpha at the same time.
			if (Browser.Engine.trident) this.redraw(false);
			this.opacityMorph.start({'opacity': 1});
			this.focus.delay(10,this);
		} else {
			this.el.windowEl.setStyle('opacity', 1);
			this.focus.delay(10,this);
		}
	},

	_getAllSectionsHeight: function(){
		// Get the total height of all of the custom sections in the content area.
		var height = 0;
		if (this.options.sections){
			this.options.sections.each(function(section){
				height += section.wrapperEl.getStyle('height').toInt() + section.wrapperEl.getStyle('border-top').toInt();
			});
		}
		return height;
	},

	_css3SetStyles: function(){
		var self = this;
		var options = this.options;
		var color = Asset.getCSSRule('.mochaCss3Shadow').style.backgroundColor;
		['', '-o-', '-webkit-', '-moz-'].each(function(pre){
			self.el.windowEl.setStyle(pre + 'box-shadow', options.shadowOffset.x + 'px ' + options.shadowOffset.y + 'px ' + options.shadowBlur + 'px ' + color);
			self.el.windowEl.setStyle(pre + 'border-radius', options.cornerRadius + 'px');
			self.el.titleBar.setStyle(pre + 'border-radius', options.cornerRadius + 'px '+options.cornerRadius + 'px 0px 0px');
		});
	},

	_attachDraggable: function(){
		var windowEl = this.el.windowEl;
		if (!this.options.draggable) return;
		this.windowDrag = new Drag.Move(windowEl, {
			handle: this.el.titleBar,
			container: this.options.container ? $(this.options.container) : false,
			grid: this.options.draggableGrid,
			limit: this.options.draggableLimit,
			snap: this.options.draggableSnap,
			onStart: function(){
				if (this.options.type != 'modal' && this.options.type != 'modal2'){
					this.focus();
					$('windowUnderlay').show();
				}
				if (this.el.iframe){
					if (!Browser.Engine.trident) this.el.iframe.setStyle('visibility', 'hidden');
					else this.el.iframe.hide();
				}
				this.fireEvent('dragStart', [this]);
			}.bind(this),
			onComplete: function(){
				if (this.options.type != 'modal' && this.options.type != 'modal2')
					$('windowUnderlay').hide();

				if (this.el.iframe){
					if (!Browser.Engine.trident) this.el.iframe.setStyle('visibility', 'visible');
					else this.el.iframe.show();
				}
				// Store new position in options.
				this._saveValues();
				this.fireEvent('dragComplete', [this]);
			}.bind(this)
		});
	},

	_attachResizable: function(){
		var windowEl = this.el.windowEl;
		if (!this.options.resizable) return;
		this.resizable1 = this.el.windowEl.makeResizable({
			handle: [this.n, this.ne, this.nw],
			limit: {
				y: [
					function(){
						return this.el.windowEl.getStyle('top').toInt() + this.el.windowEl.getStyle('height').toInt() - this.options.resizeLimit.y[1];
					}.bind(this),
					function(){
						return this.el.windowEl.getStyle('top').toInt() + this.el.windowEl.getStyle('height').toInt() - this.options.resizeLimit.y[0];
					}.bind(this)
				]
			},
			modifiers: {x: false, y: 'top'},
			onStart: function(){
				this._resizeOnStart();
				this.coords = this.el.contentWrapper.getCoordinates();
				this.y2 = this.coords.top.toInt() + this.el.contentWrapper.offsetHeight;
			}.bind(this),
			onDrag: function(){
				this.coords = this.el.contentWrapper.getCoordinates();
				this.el.contentWrapper.setStyle('height', this.y2 - this.coords.top.toInt());
				this._resizeOnDrag();
			}.bind(this),
			onComplete: function(){
				this._resizeOnComplete();
			}.bind(this)
		});

		this.resizable2 = this.el.contentWrapper.makeResizable({
			handle: [this.e, this.ne],
			limit: {
				x: [this.options.resizeLimit.x[0] - (this.options.shadowBlur * 2), this.options.resizeLimit.x[1] - (this.options.shadowBlur * 2) ]
			},
			modifiers: {x: 'width', y: false},
			onStart: function(){
				this._resizeOnStart();
			}.bind(this),
			onDrag: function(){
				this._resizeOnDrag();
			}.bind(this),
			onComplete: function(){
				this._resizeOnComplete();
			}.bind(this)
		});

		this.resizable3 = this.el.contentWrapper.makeResizable({
			container: this.options.container ? $(this.options.container) : false,
			handle: this.se,
			limit: {
				x: [this.options.resizeLimit.x[0] - (this.options.shadowBlur * 2), this.options.resizeLimit.x[1] - (this.options.shadowBlur * 2) ],
				y: [this.options.resizeLimit.y[0] - this.headerFooterShadow, this.options.resizeLimit.y[1] - this.headerFooterShadow]
			},
			modifiers: {x: 'width', y: 'height'},
			onStart: function(){
				this._resizeOnStart();
			}.bind(this),
			onDrag: function(){
				this._resizeOnDrag();
			}.bind(this),
			onComplete: function(){
				this._resizeOnComplete();
			}.bind(this)
		});

		this.resizable4 = this.el.contentWrapper.makeResizable({
			handle: [this.s, this.sw],
			limit: {
				y: [this.options.resizeLimit.y[0] - this.headerFooterShadow, this.options.resizeLimit.y[1] - this.headerFooterShadow]
			},
			modifiers: {x: false, y: 'height'},
			onStart: function(){
				this._resizeOnStart();
			}.bind(this),
			onDrag: function(){
				this._resizeOnDrag();
			}.bind(this),
			onComplete: function(){
				this._resizeOnComplete();
			}.bind(this)
		});

		this.resizable5 = this.el.windowEl.makeResizable({
			handle: [this.w, this.sw, this.nw],
			limit: {
				x: [
					function(){
						return this.el.windowEl.getStyle('left').toInt() + this.el.windowEl.getStyle('width').toInt() - this.options.resizeLimit.x[1];
					}.bind(this),
					function(){
						return this.el.windowEl.getStyle('left').toInt() + this.el.windowEl.getStyle('width').toInt() - this.options.resizeLimit.x[0];
					}.bind(this)
				]
			},
			modifiers: {x: 'left', y: false},
			onStart: function(){
				this._resizeOnStart();
				this.coords = this.el.contentWrapper.getCoordinates();
				this.x2 = this.coords.left.toInt() + this.el.contentWrapper.offsetWidth;
			}.bind(this),
			onDrag: function(){
				this.coords = this.el.contentWrapper.getCoordinates();
				this.el.contentWrapper.setStyle('width', this.x2 - this.coords.left.toInt());
				this._resizeOnDrag();
			}.bind(this),
			onComplete: function(){
				this._resizeOnComplete();
			}.bind(this)
		});
	},

	_resizeOnStart: function(){
		$('windowUnderlay').show();
		if (this.el.iframe){
			if (Browser.Engine.trident) this.el.iframe.hide();
			else this.el.iframe.setStyle('visibility', 'hidden');
		}
	},

	_resizeOnDrag: function(){
		// Fix for a rendering glitch in FF when resizing a window with panels in it
		if (Browser.Engine.gecko){
			this.el.windowEl.getElements('.panel').each(function(panel){
				panel.store('oldOverflow', panel.getStyle('overflow'));
				panel.setStyle('overflow', 'visible');
			});
		}
		this.redraw();
		this._adjustHandles();
		if (Browser.Engine.gecko){
			this.el.windowEl.getElements('.panel').each(function(panel){
				panel.setStyle('overflow', panel.retrieve('oldOverflow')); // Fix for a rendering bug in FF
			});
		}
	},

	_resizeOnComplete: function(){
		$('windowUnderlay').hide();
		if (this.el.iframe){
			if (Browser.Engine.trident){
				this.el.iframe.show();
				// The following hack is to get IE8 RC1 IE8 Standards Mode to properly resize an iframe
				// when only the vertical dimension is changed.
				this.el.iframe.setStyle('width', '99%');
				this.el.iframe.setStyle('height', this.el.contentWrapper.offsetHeight);
				this.el.iframe.setStyle('width', '100%');
				this.el.iframe.setStyle('height', this.el.contentWrapper.offsetHeight);
			} else this.el.iframe.setStyle('visibility', 'visible');
		}

		// Resize panels if there are any
		if (this.el.contentWrapper.getChildren('.column') != null){
			MUI.rWidth(this.el.contentWrapper);
			this.el.contentWrapper.getChildren('.column').each(function(column){
				MUI.panelHeight(column);
			});
		}

		this.fireEvent('resize', [this]);
	},

	_detachResizable: function(){
		this.resizable1.detach();
		this.resizable2.detach();
		this.resizable3.detach();
		this.resizable4.detach();
		this.resizable5.detach();
		this.el.windowEl.getElements('.handle').hide();
	},

	_reattachResizable: function(){
		this.resizable1.attach();
		this.resizable2.attach();
		this.resizable3.attach();
		this.resizable4.attach();
		this.resizable5.attach();
		this.el.windowEl.getElements('.handle').show();
	},

	_drawWindowCollapsed: function(shadows){
		var options = this.options;
		var shadowBlur = this.useCSS3 ? 0 : options.shadowBlur;
		var shadowBlur2x = this.useCSS3 ? 0 : shadowBlur * 2;
		var shadowOffset = this.useCSS3 ? 0 : options.shadowOffset;

		var height = options.headerHeight + shadowBlur2x + 2;
		var width = this.el.contentWrapper.getStyle('width').toInt() + shadowBlur2x;
		this.el.windowEl.setStyle('height', height);

		// Set width
		this.el.windowEl.setStyle('width', width);
		this.el.overlay.setStyle('width', width);
		this.el.titleBar.setStyles({
			'width': width - shadowBlur2x,
			'height': options.headerHeight
		});

		if (this.useCSS3) this._css3SetStyles();
		else {
			this.el.overlay.setStyles({
				'height': height,
				'top': shadowBlur - shadowOffset.y,
				'left': shadowBlur - shadowOffset.x
			});

			// Part of the fix for IE6 select z-index bug
			if (Browser.Engine.trident4) this.el.zIndexFix.setStyles({
					'width': width,
					'height': height
				});

			// Draw Window
			if (this.options.useCanvas){
				this.el.canvas.height = height;
				this.el.canvas.width = width;

				var ctx = this.el.canvas.getContext('2d');
				ctx.clearRect(0, 0, width, height);

				MUI.Canvas.drawBoxCollapsed(ctx, width, height, shadowBlur, shadowOffset, shadows);
				if (options.useCanvasControls) this._drawControls(width, height, shadows);

				// Invisible dummy object. The last element drawn is not rendered consistently while resizing in IE6 and IE7
				if (Browser.Engine.trident) MUI.Canvas.triangle(ctx, 0, 0, 10, 10, [0, 0, 0], 0);
			}
		}

		this.drawingWindow = false;
		return this;

	},

	_drawControls : function(){
		var options = this.options;
		var shadowBlur = this.useCSS3 ? 0 : options.shadowBlur;
		var shadowOffset = this.useCSS3 ? 0 : options.shadowOffset;
		var controlsOffset = options.controlsOffset;

		// Make sure controls are placed correctly.
		this.el.controls.setStyles({
			'right': shadowBlur + shadowOffset.x + controlsOffset.right,
			'top': shadowBlur - shadowOffset.y + controlsOffset.top
		});

		this.el.canvasControls.setStyles({
			'right': shadowBlur + shadowOffset.x + controlsOffset.right,
			'top': shadowBlur - shadowOffset.y + controlsOffset.top
		});

		// Calculate X position for controlbuttons
		//var mochaControlsWidth = 52;
		this.closeButtonX = options.closable ? this.mochaControlsWidth - 7 : this.mochaControlsWidth + 12;
		this.maximizeButtonX = this.closeButtonX - (options.maximizable ? 19 : 0);
		this.minimizeButtonX = this.maximizeButtonX - (options.minimizable ? 19 : 0);

		var ctx2 = this.el.canvasControls.getContext('2d');
		ctx2.clearRect(0, 0, 100, 100);

		if (this.options.closable) MUI.Canvas.drawCloseButton(ctx2, this.closeButtonX, 7, this.closeBgColor, 1.0, this.closeColor, 1.0);
		if (this.options.maximizable) MUI.Canvas.drawMaximizeButton(ctx2, this.maximizeButtonX, 7, this.maximizeBgColor, 1.0, this.maximizeColor, 1.0);
		if (this.options.minimizable){
			MUI.Canvas.drawMinimizeButton(ctx2, this.minimizeButtonX, 7, this.minimizeBgColor, 1.0, this.minimizeColor, 1.0);

			// Invisible dummy object. The last element drawn is not rendered consistently while resizing in IE6 and IE7
			if (Browser.Engine.trident){
				MUI.Canvas.circle(ctx2, 0, 0, 3, this.minimizeBgColor, 0);
			}
		}
	},

	_doClosingJobs: function(){
		var windowEl = this.el.windowEl;
		windowEl.setStyle('visibility', 'hidden');
		// Destroy throws an error in IE8
		if (Browser.Engine.trident) windowEl.dispose();
		else windowEl.destroy();
		this.fireEvent('closeComplete',[this]);

		if (this.options.type != 'notification'){
			var newFocus = MUI.Windows._getWithHighestZIndex();
			this.focus(newFocus);
		}

		MUI.erase(this.options.id);
		if (MUI.Desktop.loadingWorkspace) MUI.Desktop.loadingCallChain();

		if (MUI.dock && this.options.type == 'window'){
			var currentButton = $(this.options.id + '_dockTab');
			if (currentButton) MUI.dock.dockSortables.removeItems(currentButton).destroy();
			// Need to resize everything in case the dock becomes smaller when a tab is removed
			MUI.Desktop.setDesktopSize();
		}
	},

	_storeOnClose: function(){
		if (this.el.check) this.el.check.hide();

		var windowEl = this.el.windowEl;
		windowEl.setStyle('zIndex', -1);
		windowEl.addClass('windowClosed');
		windowEl.removeClass('mocha');

		if (MUI.dock && this.options.type == 'window'){
			var currentButton = $(this.options.id + '_dockTab');
			if (currentButton) currentButton.hide();
			MUI.Desktop.setDesktopSize();
		}

		this.fireEvent('closeComplete',[this]);

		if (this.options.type != 'notification'){
			var newFocus = MUI.Windows._getWithHighestZIndex();
			this.focus(newFocus);
		}

		this.isClosing = false;
	}

}).implement(MUI.WindowPanelShared);

MUI.extend({

	dynamicResize: function(windowEl){
		var instance = windowEl.retrieve('instance');
		var contentEl = instance.el.content;

		instance.el.contentWrapper.setStyles({
			'height': contentEl.offsetHeight,
			'width': contentEl.offsetWidth
		});
		instance.redraw();
	}

});

Element.implement({

	minimize: function(){
		var instance = MUI.get(this.id);
		if (instance == null || instance.minimize == null) return this;
		instance.minimize();
		return this;
	},

	maximize: function(){
		var instance = MUI.get(this.id);
		if (instance == null || instance.maximize == null) return this;
		instance.maximize();
		return this;
	},

	restore: function(){
		var instance = MUI.get(this.id);
		if (instance == null || instance.restore == null) return this;
		instance.restore();
		return this;
	},

	center: function(){
		var instance = MUI.get(this.id);
		if (instance == null || instance.center == null) return this;
		instance.center();
		return this;
	}

});

document.addEvents({
	'keydown': function(event){  // Toggle window visibility with Ctrl-Alt-Q
		if (event.key == 'q' && event.control && event.alt) MUI.Windows.toggleAll();
	},

	'mousedown': function(){  // Blur all windows if user clicks anywhere else on the page
		MUI.Windows.blurAll.delay(50);
	}
});

window.addEvents({
	'domready': function(){
		MUI.Windows._underlayInitialize();
	},

	'resize': function(){
		if ($('windowUnderlay')) MUI.Windows._setUnderlaySize();
		else MUI.Windows._underlayInitialize();
	}
});