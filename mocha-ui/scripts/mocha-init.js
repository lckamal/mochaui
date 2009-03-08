/* -----------------------------------------------------------------

	In this file initialize your Layouts and Windows:

	1. Define windows
	
		var myWindow = function(){ 
			new MochaUI.Window({
				id: 'mywindow',
				title: 'My Window',
				loadMethod: 'xhr',
				contentURL: 'pages/lipsum.html',
				width: 340,
				height: 150
			});
		}

	2. Build windows on onDomReady
	
		myWindow();
	
	3. Add link events to build future windows
	
		if ($('myWindowLink')){
			$('myWindowLink').addEvent('click', function(e) {
				new Event(e).stop();
				jsonWindows();
			});
		}

		Note: If your link is in the top menu, it opens only a single window, and you would
		like a check mark next to it when it's window is open, format the link name as follows:

		window.id + LinkCheck, e.g., mywindowLinkCheck

		Otherwise it is suggested you just use mywindowLink

	Associated HTML for link event above:

		<a id="myWindowLink" href="pages/lipsum.html">My Window</a>	


	Notes:
		If you need to add link events to links within windows you are creating, do
		it in the onContentLoaded function of the new window.


   ----------------------------------------------------------------- */

initializeWindows = function(){

	// Examples
	MochaUI.ajaxpageWindow = function(){
		new MochaUI.Window({
			id: 'ajaxpage',
			loadMethod: 'xhr',
			contentURL: 'pages/lipsum.html',
			width: 340,
			height: 150
		});
	}	
	if ($('ajaxpageLinkCheck')){ 
		$('ajaxpageLinkCheck').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.ajaxpageWindow();
		});
	}	
	
	MochaUI.jsonWindows = function(){
		var url = 'data/json-windows-data.js';
		var request = new Request.JSON({
			url: url,
			method: 'get',
			onComplete: function(properties) {
				MochaUI.newWindowsFromJSON(properties.windows);
			}
		}).send();
	}	
	if ($('jsonLink')){
		$('jsonLink').addEvent('click', function(e) {
			new Event(e).stop();
			MochaUI.jsonWindows();
		});
	}

	MochaUI.youtubeWindow = function(){
		new MochaUI.Window({
			id: 'youtube',
			title: 'YouTube in Iframe',
			loadMethod: 'iframe',
			contentURL: 'pages/youtube.html',
			width: 340,
			height: 280,
			resizeLimit: {'x': [330, 2500], 'y': [250, 2000]},
			toolbar: true,
			toolbarURL: 'pages/youtube-tabs.html',
			toolbarOnload: function(){
				MochaUI.initializeTabs('youtubeTabs');	

				$('youtube1Link').addEvent('click', function(e){
					MochaUI.updateContent({
						'element':  $('youtube'),
						'url':      'pages/youtube.html'
					});
				});
	
				$('youtube2Link').addEvent('click', function(e){
					MochaUI.updateContent({
						'element':  $('youtube'),
						'url':      'pages/youtube2.html'
					});
				});
	
				$('youtube3Link').addEvent('click', function(e){
					MochaUI.updateContent({
						'element':  $('youtube'),	
						'url':      'pages/youtube3.html'
					});
				});	
			}
		});
	}
	if ($('youtubeLinkCheck')) {
		$('youtubeLinkCheck').addEvent('click', function(e){
		new Event(e).stop();
			MochaUI.youtubeWindow();
		});
	}
	
	MochaUI.clockWindow = function(){
		new MochaUI.Window({
			id: 'clock',
			title: 'Canvas Clock',
			addClass: 'transparent',
			loadMethod: 'xhr',
			contentURL: 'plugins/coolclock/index.html',
			shape: 'gauge',
			headerHeight: 30,
			width: 160,
			height: 160,
			x: 570,
			y: 140,
			padding: { top: 0, right: 0, bottom: 0, left: 0 },
			onContentLoaded: function(){
				new Asset.javascript('plugins/coolclock/scripts/coolclock.js', {
					id: 'coolclockScript',
					onload: function(){
						if (CoolClock) new CoolClock();
					}
				});
			}				
		});	
	}
	if ($('clockLinkCheck')){
		$('clockLinkCheck').addEvent('click', function(e){	
			new Event(e).stop();
			MochaUI.clockWindow();
		});
	}	
	
	MochaUI.parametricsWindow = function(){	
		new MochaUI.Window({
			id: 'parametrics',
			title: 'Window Parametrics',
			loadMethod: 'xhr',
			contentURL: 'plugins/parametrics/index.html',
			width: 305,
			height: 110,
			x: 570,
			y: 160,
			padding: { top: 12, right: 12, bottom: 10, left: 12 },
			resizable: false,
			maximizable: false,
			onBeforeBuild: function(){
				if ($('parametricsStyle')) return;
				new Asset.css('plugins/parametrics/css/style.css', {id: 'parametricsStyle'});
			},			
			onContentLoaded: function(){
				new Asset.javascript('plugins/parametrics/scripts/parametrics.js', {
					id: 'parametricsScript',
					onload: function(){
						if (MochaUI.addRadiusSlider) MochaUI.addRadiusSlider();
						if (MochaUI.addShadowSlider) MochaUI.addShadowSlider();
					}
				});
			}					
		});
	}
	if ($('parametricsLinkCheck')){
		$('parametricsLinkCheck').addEvent('click', function(e){	
			new Event(e).stop();
			MochaUI.parametricsWindow();
		});
	}
	
	MochaUI.splitWindow = function(){
		new MochaUI.Window({
			id: 'splitWindow',
			title: 'Split Window',
			loadMethod: 'html', // May create a 'panel' method in the future
			width: 600,
			height: 350,
			resizeLimit: {'x': [450, 2500], 'y': [300, 2000]},
			scrollbars: false, // Could make this automatic if a 'panel' method were created
			onContentLoaded: function(){	
		
				new MochaUI.Column({
					container: 'splitWindow_contentWrapper',
					id: 'splitWindow_sideColumn',
					placement: 'left',
					width: 170,
					resizeLimit: [100, 300]
				});
			
				new MochaUI.Column({
					container: 'splitWindow_contentWrapper',
					id: 'splitWindow_mainColumn',
					placement: 'main',
					width: null,
					resizeLimit: [100, 300]
				});
			
				new MochaUI.Panel({
					header: false,
					id: 'splitWindow_panel1',
					loadMethod: 'xhr',
					contentURL: 'license.html',
					column: 'splitWindow_mainColumn',
					panelBackground: '#fff'
				});
			
				new MochaUI.Panel({
					header: false,
					id: 'splitWindow_panel2',
					addClass: 'panelAlt',
					loadMethod: 'xhr',
					contentURL: 'pages/lipsum.html',
					column: 'splitWindow_sideColumn'					
				});

			}			
		});
	}
	if ($('splitWindowLinkCheck')) {
		$('splitWindowLinkCheck').addEvent('click', function(e){
		new Event(e).stop();
			MochaUI.splitWindow();
		});
	}
	
	MochaUI.fxmorpherWindow = function(){
		new MochaUI.Window({
			id: 'fxmorpherExample',
			title: 'Path Animation Example',
			loadMethod: 'xhr',
			contentURL: 'plugins/Fx.Morpher/example.html',
			width: 330,
			height: 330,
			padding: { top: 0, right: 0, bottom: 0, left: 0 },
			scrollbars: false,
			resizable: false,
			onBeforeBuild: function(){
				if ($('accordianStyle')) return;
				new Asset.css('plugins/Fx.Morpher/css/style.css', {id: 'cboxStyle'});
			},			
			onContentLoaded: function() {
				if (!$('cboxScript') || !$('animationExampleScript')){
					new Asset.javascript('plugins/Fx.Morpher/scripts/cbox.js', {
						id: 'cboxScript',
						onload: function(){
							new Asset.javascript('plugins/Fx.Morpher/scripts/example.js', {
								id: 'animationExampleScript'
							});	
						}
					});
				}
				else {
					createCanvas();
					myAnim.delay(250);
				}							
			}				
		});	
	}			

	// Examples > Tests
	
	MochaUI.serverRepsonseWindow = function(response){
		new MochaUI.Window({
			id: 'serverResponse',
			loadMethod: 'html',
			content: response,
			width: 350,
			height: 350
		});
	}		
	
	MochaUI.eventsWindow = function(){
		new MochaUI.Window({
			id: 'windowevents',
			title: 'Window Events',
			loadMethod: 'xhr',
			contentURL: 'pages/events.html',
			width: 340,
			height: 250,			
			onContentLoaded: function(windowEl){
				MochaUI.notification('Window content was loaded.');
			},
			onCloseComplete: function(){
				MochaUI.notification('The window is closed.');
			},
			onMinimize: function(windowEl){
				MochaUI.notification('Window was minimized.');
			},
			onMaximize: function(windowEl){
				MochaUI.notification('Window was maximized.');
			},
			onRestore: function(windowEl){
				MochaUI.notification('Window was restored.');
			},
			onResize: function(windowEl){
				MochaUI.notification('Window was resized.');
			},
			onFocus: function(windowEl){
				MochaUI.notification('Window was focused.');
			},
			onBlur: function(windowEl){
				MochaUI.notification('Window lost focus.');
			}
		});
	}	
	if ($('windoweventsLinkCheck')){
		$('windoweventsLinkCheck').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.eventsWindow();
		});
	}
	
	MochaUI.containertestWindow = function(){ 
		new MochaUI.Window({
			id: 'containertest',
			title: 'Container Test',
			loadMethod: 'xhr',
			contentURL: 'pages/lipsum.html',
			container: 'pageWrapper',
			width: 340,
			height: 150,
			x: 100,
			y: 100
		});
	}
	if ($('containertestLinkCheck')) { 
		$('containertestLinkCheck').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.containertestWindow();
		});
	}
	
	MochaUI.iframetestsWindow = function() {
		new MochaUI.Window({
			id: 'iframetests',
			title: 'Iframe Tests',
			loadMethod: 'iframe',
			contentURL: 'pages/iframetests.html'
		});
	}
	if ($('iframetestsLinkCheck')) {
		$('iframetestsLinkCheck').addEvent('click', function(e){
		new Event(e).stop();
			MochaUI.iframetestsWindow();
		});
	}
	
	MochaUI.formtestsWindow = function() {
		new MochaUI.Window({
			id: 'formtests',
			title: 'Form Tests',
			loadMethod: 'xhr',
			contentURL: 'pages/formtests.html',
			onContentLoaded: function(){
				document.testForm.focusTest.focus();
			}			
		});
	}
	if ($('formtestsLinkCheck')) {
		$('formtestsLinkCheck').addEvent('click', function(e){
		new Event(e).stop();
			MochaUI.formtestsWindow();
		});
	}	

	MochaUI.accordiantestWindow = function() {
		var id = 'accordiantest';
		new MochaUI.Window({
			id: id,
			title: 'Accordian',
			loadMethod: 'xhr',
			contentURL: 'pages/accordian-demo.html',
			width: 300,
			height: 200,
			scrollbars: false,
			resizable: false,
			maximizable: false,				
			padding: { top: 0, right: 0, bottom: 0, left: 0 },
			onBeforeBuild: function(){
				if ($('accordianStyle')) return;
				new Asset.css('plugins/accordian/css/style.css', {id: 'accoridanStyle'});
			},			
			onContentLoaded: function(windowEl){
				this.windowEl = windowEl;				
				new Accordion('#' + id + ' h3.accordianToggler', "#" + id + ' div.accordianElement',{
				//	start: 'all-closed',
					opacity: false,
					alwaysHide: true,
					onActive: function(toggler, element){
						toggler.addClass('open');
					},
					onBackground: function(toggler, element){
						toggler.removeClass('open');
					},							
					onStart: function(toggler, element){
						this.windowEl.accordianResize = function(){
							MochaUI.dynamicResize($(id));
						}
						this.windowEl.accordianTimer = this.windowEl.accordianResize.periodical(10);
					}.bind(this),
					onComplete: function(){
						this.windowEl.accordianTimer = $clear(this.windowEl.accordianTimer);
						MochaUI.dynamicResize($(id)) // once more for good measure
					}.bind(this)
				}, $(id));				
			}
		});
	}	
	if ($('accordiantestLinkCheck')) { 
		$('accordiantestLinkCheck').addEvent('click', function(e){	
			new Event(e).stop();
			MochaUI.accordiantestWindow();
		});
	}

	MochaUI.noCanvasWindow = function() {
		new MochaUI.Window({
			id: 'nocanvas',
			title: 'No Canvas',
			loadMethod: 'xhr',
			contentURL: 'pages/lipsum.html',
			addClass: 'no-canvas',
			width: 305,
			height: 175,
			shadowBlur: 0,
			resizeLimit: {'x': [275, 2500], 'y': [125, 2000]},
			useCanvas: false
		});
	}
	if ($('noCanvasLinkCheck')) {
		$('noCanvasLinkCheck').addEvent('click', function(e){	
			new Event(e).stop();
			MochaUI.noCanvasWindow();
		});
	}	

	// View
	if ($('sidebarLinkCheck')) {
		$('sidebarLinkCheck').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.Desktop.sidebarToggle();
		});
	}

	if ($('cascadeLink')) {
		$('cascadeLink').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.arrangeCascade();
		});
	}

	if ($('tileLink')) {
		$('tileLink').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.arrangeTile();
		});
	}

	if ($('closeLink')) {
		$('closeLink').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.closeAll();
		});
	}

	if ($('minimizeLink')) {
		$('minimizeLink').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.minimizeAll();
		});
	}	

	// Tools
	MochaUI.builderWindow = function() {	
		new MochaUI.Window({
			id: 'builder',
			title: 'Window Builder',
			icon: 'images/icons/16x16/page.gif',
			loadMethod: 'xhr',
			contentURL: 'plugins/windowform/',
			width: 375,
			height: 420,
			maximizable: false,
			resizable: false,
			scrollbars: false,
			onBeforeBuild: function(){
				if ($('builderStyle')) return;
				new Asset.css('plugins/windowform/css/style.css', {id: 'builderStyle'});
			},
			onContentLoaded: function(){
				new Asset.javascript('plugins/windowform/scripts/Window-from-form.js', {
					id: 'builderScript',
					onload: function(){
						$('newWindowSubmit').addEvent('click', function(e){
							new Event(e).stop();
							new MochaUI.WindowForm();
						});
					}
				});
			}			
		});
	}
	if ($('builderLinkCheck')) {
		$('builderLinkCheck').addEvent('click', function(e) {
			new Event(e).stop();
			MochaUI.builderWindow();
		});
	}
	
	if ($('toggleStandardEffectsLinkCheck')) {
		$('toggleStandardEffectsLinkCheck').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.toggleStandardEffects($('toggleStandardEffectsLinkCheck'));			
		});
		if (MochaUI.options.standardEffects == true) {
			MochaUI.toggleStandardEffectsLink = new Element('div', {
				'class': 'check',
				'id': 'toggleStandardEffects_check'
			}).inject($('toggleStandardEffectsLinkCheck'));
		}
	}	
	
	if ($('toggleAdvancedEffectsLinkCheck')) {
		$('toggleAdvancedEffectsLinkCheck').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.toggleAdvancedEffects($('toggleAdvancedEffectsLinkCheck'));			
		});
		if (MochaUI.options.advancedEffects == true) {
			MochaUI.toggleAdvancedEffectsLink = new Element('div', {
				'class': 'check',
				'id': 'toggleAdvancedEffects_check'
			}).inject($('toggleAdvancedEffectsLinkCheck'));
		}
	}	
		
	// Workspaces
	
	if ($('saveWorkspaceLink')) {
		$('saveWorkspaceLink').addEvent('click', function(e) {
			new Event(e).stop();
			MochaUI.saveWorkspace();
		});
	}

	if ($('loadWorkspaceLink')) {
		$('loadWorkspaceLink').addEvent('click', function(e) {
			new Event(e).stop();
			MochaUI.loadWorkspace();
		});
	}
	
	// Help	
	MochaUI.featuresWindow = function() {
		new MochaUI.Window({
			id: 'features',
			title: 'Features',
			loadMethod: 'xhr',
			contentURL: 'pages/features-layout.html',
			width: 305,
			height: 175,
			resizeLimit: {'x': [275, 2500], 'y': [125, 2000]},
			toolbar: true,
			toolbarURL: 'pages/features-tabs.html',
			toolbarOnload: function(){
				MochaUI.initializeTabs('featuresTabs');

				$('featuresLayoutLink').addEvent('click', function(e){
					MochaUI.updateContent({
						'element':  $('features'),
						'url':       'pages/features-layout.html'
					});
				});

				$('featuresWindowsLink').addEvent('click', function(e){
					MochaUI.updateContent({
						'element':  $('features'),
						'url':       'pages/features-windows.html'
					});
				});

				$('featuresGeneralLink').addEvent('click', function(e){
					MochaUI.updateContent({
						'element':  $('features'),
						'url':       'pages/features-general.html'
					});
				});
			}
		});
	}
	if ($('featuresLinkCheck')) {
		$('featuresLinkCheck').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.featuresWindow();
		});
	}

	MochaUI.aboutWindow = function() {
		new MochaUI.Window({
			id: 'about',
			title: 'MochaUI',
			loadMethod: 'xhr',
			contentURL: 'pages/about.html',
			type: 'modal2',
			width: 350,
			height: 195,
			padding: { top: 43, right: 12, bottom: 10, left: 12 },
			scrollbars: false
		});
	}
	if ($('aboutLink')) {
		$('aboutLink').addEvent('click', function(e){
			new Event(e).stop();
			MochaUI.aboutWindow();
		});
	}
	
	// Misc
	MochaUI.licenseWindow = function() {
		new MochaUI.Window({
			id: 'License',
			title: 'License',			
			loadMethod: 'xhr',
			contentURL: 'license.html',
			width: 375,
			height: 340
		});
	}	
	if ($('licenseLink')){ 
		$('licenseLink').addEvent('click', function(e) {
			new Event(e).stop();
			MochaUI.licenseWindow();
		});
	}	

	// Deactivate menu header links
	$$('a.returnFalse').each(function(el) {
		el.addEvent('click', function(e) {
			new Event(e).stop();
		});
	});
	
	// Build windows onDomReady
	MochaUI.parametricsWindow();
	
}

initializeColumns = function() {

	/* Creating a Column and Panel Layout:
	 
	 - If you are not using panels then these columns are not required.
	 - If you do use panels, the main column is required. The side columns are optional.
	 
	 Columns
	 - Create your columns from left to right.
	 - One column should not have it's width set. This column will have a fluid width.
	 
	 Panels
	 - After creating Columns, create your panels from top to bottom, left to right.
	 - One panel in each column should not have it's height set. This panel will have a fluid height.	 
	 - New Panels are inserted at the bottom of their column.

	*/
	new MochaUI.Column({
		id: 'sideColumn1',
		placement: 'left',
		width: 200,
		resizeLimit: [100, 300]
	});
	
	new MochaUI.Column({
		id: 'mainColumn',
		placement: 'main',
		resizeLimit: [100, 300]
	});
	
	new MochaUI.Column({
		id: 'sideColumn2',
		placement: 'right',
		width: 220,
		resizeLimit: [200, 300]
	});
	
	// Add panels to first side column
	new MochaUI.Panel({
		id: 'files-panel',
		title: 'Examples',
		loadMethod: 'xhr',
		contentURL: 'pages/file-view.html',
		column: 'sideColumn1',
		onBeforeBuild: function(){
			if ($('treeStyle')) return;
			new Asset.css('plugins/tree/css/style.css', {id: 'treeStyle'});
		},		
		onContentLoaded: function(){
			new Asset.javascript('plugins/tree/scripts/tree.js', {
				id: 'treeScript',
				onload: function(){
					if (buildTree) buildTree('tree1');
				}
			});		
			$('notesLink').addEvent('click', function(e){
				MochaUI.updateContent({
					'element': $('mainPanel'),
					'loadMethod': 'xhr',
					'url': 'pages/notes.html',
					'title': 'Development Notes',
					'padding': { top: 8, right: 8, bottom: 8, left: 8 }
				});
			});
			$('xhrLink').addEvent('click', function(e){
				MochaUI.updateContent({
					'element': $('mainPanel'),
					'loadMethod': 'xhr',
					'url': 'pages/lipsum.html',
					'title': 'Lorem Ipsum',
					'padding': { top: 8, right: 8, bottom: 8, left: 8 }
				});
			});
			$('youtube4Link').addEvent('click', function(e){
				MochaUI.updateContent({
					'element': $('mainPanel'),
					'loadMethod': 'iframe',
					'url': 'pages/youtube4.html',
					'title': 'Iframe: YouTube',
					'padding': { top: 0, right: 0, bottom: 0, left: 0 }
				});
			});	
			$('splitPanelLink').addEvent('click', function(e){
				MochaUI.updateContent({
					'element': $('mainPanel'),
					'loadMethod': 'html',  // May create a 'panel' method in the future
					'title': 'Split Panel',
					'padding': { top: 0, right: 0, bottom: 0, left: 0 }
				});
				MochaUI.splitPanelPanel(); // This is initialized in mocha-init.js just like the windows.	
			});	
			$('splitWindowLink').addEvent('click', function(e){
				MochaUI.splitWindow();
			});		
			$('ajaxpageLink').addEvent('click', function(e){
				MochaUI.ajaxpageWindow();
			});	
			$('jsonLink').addEvent('click', function(e){
				MochaUI.jsonWindows();
			});	
			$('youtubeLink').addEvent('click', function(e){
				MochaUI.youtubeWindow();
			});	
			$('accordiantestLink').addEvent('click', function(e){
				MochaUI.accordiantestWindow();
			});	
			$('clockLink').addEvent('click', function(e){
				MochaUI.clockWindow();
			});
			$('parametricsLink').addEvent('click', function(e){
				MochaUI.parametricsWindow();
			});
			$('fxmorpherLink').addEvent('click', function(e){
				MochaUI.updateContent({
					'element': $('mainPanel'),
					'loadMethod': 'xhr',
					'url': 'plugins/Fx.Morpher/',
					'title': 'Fx.Morpher Path Animation',
					'padding': { top: 8, right: 8, bottom: 8, left: 8 }
				});
				MochaUI.fxmorpherWindow();
			});			
		}
	});
	
	new MochaUI.Panel({
		id: 'panel2',
		title: 'Ajax Form',
		loadMethod: 'xhr',
		contentURL: 'pages/ajax.form.html',
		column: 'sideColumn1',
		height: 230,
		onContentLoaded: function(){
			$('myForm').addEvent('submit', function(e){
				e.stop();

				$('spinner').show();
				if ($('postContent') && MochaUI.options.standardEffects == true) {
					$('postContent').setStyle('opacity', 0);	
				}
				else {
					$('mainPanel_pad').empty();
				}
	
				this.set('send', {
					onComplete: function(response) { 
	 						MochaUI.updateContent({
							'element': $('mainPanel'),
							'loadMethod': 'html',
							'content': response,
							'title': 'Ajax Response',
							'padding': { top: 8, right: 8, bottom: 8, left: 8 }
						});			
					},
					onSuccess: function(){
						if (MochaUI.options.standardEffects == true) {
							$('postContent').setStyle('opacity', 0).get('morph').start({'opacity': 1});
						}
					}
				});
				this.send();
			});		
		}
	});
	
	// Add panels to main column	
	new MochaUI.Panel({
		id: 'mainPanel',
		title: 'Lorem Ipsum',
		loadMethod: 'xhr',
		contentURL: 'pages/lipsum.html',
		column: 'mainColumn',
		headerToolbox: true,
		headerToolboxURL: 'pages/toolbox-demo2.html',
		headerToolboxOnload: function(){
			if ($('demoSearch')) {
				$('demoSearch').addEvent('submit', function(e){
					e.stop();
					$('spinner').setStyle('visibility', 'visible');
					if ($('postContent') && MochaUI.options.standardEffects == true) {
						$('postContent').setStyle('opacity', 0);
					}
					else {
						$('mainPanel_pad').empty();
					}
					this.set('send', {
						onComplete: function(response){
							MochaUI.updateContent({
								'element': $('mainPanel'),
								'loadMethod': 'html',
								'content': response,
								'title': 'Ajax Response',
								'padding': {
									top: 8,
									right: 8,
									bottom: 8,
									left: 8
								}
							});
						},
						onSuccess: function(){
							if ($('postContent') && MochaUI.options.standardEffects == true) {								
								$('postContent').setStyle('opacity', 0).get('morph').start({'opacity': 1});
							}
						}
					});
					this.send();
				});
			}
		}		
	});
	
	new MochaUI.Panel({
		id: 'mochaConsole',
		addClass: 'mochaConsole',
		title: 'Console',
		loadMethod: 'xhr',
		contentURL: 'pages/lipsum.html',
		column: 'mainColumn',
		height: 200,	
		headerToolbox: true,
		headerToolboxURL: 'pages/console.toolbox.html',
		headerToolboxOnload: function(){
			$$('.demoAction').each(function(element){
				element.addEvent('click', function(e){
					MochaUI.notification('Do Something');
				});
			});
		}
	});
	
	// Add panels to second side column
	
	new MochaUI.Panel({
		id: 'help-panel',
		loadMethod: 'xhr',
		contentURL: 'pages/overview.html',
		column: 'sideColumn2',
		tabsURL: 'pages/panel-tabs.html'
	});

	new MochaUI.Panel({
		id: 'panel3',
		title: 'Panel',
		loadMethod: 'xhr',
		contentURL: 'pages/lipsum.html',
		column: 'sideColumn2',
		height: 120
	});	
	
	new MochaUI.Panel({
		id: 'tips-panel',
		title: 'Tips',
		loadMethod: 'xhr',
		contentURL: 'pages/tips.html',
		column: 'sideColumn2',
		height: 140,
		footer: true,
		footerURL: 'pages/toolbox-demo.html',
		footerOnload: function(){
			$$('.demoAction').each(function(element){
				element.addEvent('click', function(e){
					MochaUI.notification('Do Something');
				});
			});
		}
	});
	
	MochaUI.splitPanelPanel = function() {
		if ($('mainPanel')) {			
			new MochaUI.Column({
				container: 'mainPanel',
				id: 'sideColumn3',
				placement: 'left',
				width: 200,
				resizeLimit: [100, 300]
			});
			
			new MochaUI.Column({
				container: 'mainPanel',
				id: 'mainColumn2',
				placement: 'main',
				width: null,
				resizeLimit: [100, 300]
			});
			
			new MochaUI.Panel({
				header: false,
				id: 'splitPanel_mainPanel',
				loadMethod: 'xhr',
				contentURL: 'license.html',
				column: 'mainColumn2'
			});
			
			new MochaUI.Panel({
				header: false,
				id: 'splitPanel_sidePanel',
				addClass: 'panelAlt',
				loadMethod: 'xhr',
				contentURL: 'pages/lipsum.html',
				column: 'sideColumn3'
			});
		}
	}
	
}	

// Initialize MochaUI when the DOM is ready
window.addEvent('load', function(){ //using load instead of domready for IE8
	MochaUI.Desktop = new MochaUI.Desktop();
	MochaUI.Dock = new MochaUI.Dock();	

	initializeColumns();

	MochaUI.Modal = new MochaUI.Modal();

	initializeWindows();

});

window.addEvent('unload', function() {
	// This runs when a user leaves your page.	
});