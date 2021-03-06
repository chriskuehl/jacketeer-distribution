var gui = {
	screens: {},
	hasHiddenSplashScreen: false,
	screenContainerIndex: (-1)
};

var LEFT = 0;
var RIGHT = 1;
var transitioning = false;
var oldTabBarID = "lessons";
var ignoreNextSelect = false;

function initInterface() {
	log("Initializing interface");

	applyInterfaceTweaks();

	if (PLATFORM == PLATFORM_IOS) {
	//	initTabBar();
	}

	initScreenHolder();
}

function applyInterfaceTweaks() {
	document.body.addEventListener('touchmove', function(e) {
		e.preventDefault();
	});
}

var tabBarItems = {
	lessons: {
		text: "Lessons",
		image: "/www/css/assets/tabbar/lessons.png",
		screen: "lesson/category"
	},
	
	progress: {
		text: "Progress",
		image: "/www/css/assets/tabbar/progress.png",
		screen: "user/progress"
	},
	
	account: {
		text: "Account",
		image: "/www/css/assets/tabbar/account.png",
		screen: "user/account"
	}
};

function checkTabBarForScreen(screen) {
	if (PLATFORM != PLATFORM_IOS) {
		return;
	}
	
	for (var id in tabBarItems) {
		var tabBarItem = tabBarItems[id];
		
		if (tabBarItem.screen == screen) {
			oldTabBarID = id;
			ignoreNextSelect = true;
			//plugins.tabBar.selectItem(id);
		}
	}
}

function initTabBar() {
	plugins.tabBar.init();
	plugins.tabBar.create();

	gui.showingTabBar = false;
	var allItems = [];
	
	for (var id in tabBarItems) {
		var tabBarItem = tabBarItems[id];
		allItems.push(id);
		
		plugins.tabBar.createItem(id, tabBarItem.text, tabBarItem.image, {
			onSelect: function(id) {
				if (ignoreNextSelect) {
					return ignoreNextSelect = false;
				}
				
				if (transitioning || isLoading()) {
					if (transitioning) log("ignore: transition");
					if (isLoading()) log("ignore: loading");
					
					ignoreNextSelect = true;
					plugins.tabBar.selectItem(oldTabBarID);
					return;
				}
				
				setScreen(tabBarItems[id].screen, true);
			}
		});
	}
	
	plugins.tabBar["showItems"].apply(this, allItems);
}

function initScreenHolder() {
	resetScreen();
}

function resetScreen() {
	if (!gui.currentScreen) {
		return;
	}

	gui.oldScreen = gui.currentScreen;
	gui.currentScreen = null;
}

function setScreen(screenPath, dontSlide) {
	if (gui.currentScreen && gui.currentScreen.data.data.id == screenPath) {
		return;
	}
	
	if (transitioning) {
		return;
	}
	
	blockTouchInput();
	transitioning = true;
	
	if (!dontSlide) {
		dontSlide = false;
	}

	log("Changing screen to: " + screenPath);

	// load JS (and other files) if they haven't already been loaded
	if (!gui.screens[screenPath] || !gui.screens[screenPath].fullyLoaded) {
		log("Data not loaded for screen \"" + screenPath + "\", requesting load...");

		loadScreen(screenPath, dontSlide, function() {
			log("Screen load OK");
			setScreenWithLoadedData(screenPath, dontSlide);
		});
	} else {
		log("Already have data for screen: " + screenPath);
		setScreenWithDataLoaded(screenPath, dontSlide);
	}
}

// TODO: this callback never gets executed

function loadScreen(screenPath, dontSlide, callback) {
	log("Loading data for screen: " + screenPath);

	// initialize screen storage
	var screenName = getScreenNameFromPath(screenPath);

	gui.screens[screenPath] = {
		fullyLoaded: false,
		loaded: []
	};

	var screenFilePath = "screens/" + screenPath + "/" + screenName;
	log("File path: " + screenFilePath);

	// html
	$.get(screenFilePath + ".html", function(data) {
		log("Component loaded for screen: html");
		gui.screens[screenPath].loaded.push("html");
		gui.screens[screenPath].html = data;

		checkScreenLoaded(screenPath, dontSlide);
	});

	// css
	$.get(screenFilePath + ".css", function(data) {
		log("Component loaded for screen: css");
		gui.screens[screenPath].loaded.push("css");
		gui.screens[screenPath].css = data;

		checkScreenLoaded(screenPath, dontSlide);
	});

	// js
	loadJavaScriptFiles([screenFilePath + ".js"], function() {
		log("Component loaded for screen: js");
		gui.screens[screenPath]["loaded"].push("js");
		checkScreenLoaded(screenPath, dontSlide);
	});
}

function updateCSSForScreenContainer(css, screenContainer, path) {
	css = css.replaceAll("$ASSETS", path + "assets");
	css = css.replaceAll("$PATH", path);
	css = css.replaceAll("$NORMAL", "\"HelveticaNeue\"");
	css = css.replaceAll("$BOLD", "\"HelveticaNeue-Bold\"");
	css = css.replaceAll("$SCREEN", "#" + screenContainer.attr("id"));

	return css;
}

function checkScreenLoaded(screenPath, dontSlide) {
	var elementsToLoad = ["html", "css", "js"];
	var currentlyLoaded = gui.screens[screenPath].loaded.slice(0);

	for (var i = 0; i < gui.screens[screenPath].loaded.length; i++) {
		var loadedElement = gui.screens[screenPath].loaded[i];
		elementsToLoad.removeElement(loadedElement);
	}

	if (elementsToLoad.length > 0) {
		log("Still waiting for: " + JSON.stringify(elementsToLoad));
	} else {
		log("All data loaded for screen " + screenPath);
		gui.screens[screenPath].fullyLoaded = true;

		setScreenWithDataLoaded(screenPath, dontSlide);
	}
}

function setScreenWithDataLoaded(screenPath, dontSlide) {
	checkTabBarForScreen(screenPath);
	var screenName = getScreenNameFromPath(screenPath);

	log("Finally changing screen for: " + screenPath);
	resetScreen();

	var screenData = gui.screens[screenPath];

	// create a new screen container
	var screenContainer = createNewScreenContainer();
	var screenContainerID = "screenContainer-" + (++gui.screenContainerIndex);

	screenContainer.attr({
		id: screenContainerID
	});

	// create the CSS container
	var cssContainer = createNewCSSContainer();
	var cssContainerID = "cssContainer-" + (++gui.screenContainerIndex);

	cssContainer.attr({
		id: cssContainerID
	});

	// set state
	gui.currentScreen = {
		data: gui.screens[screenPath],
		container: {
			screen: screenContainer,
			css: cssContainer
		}
	};

	// fill CSS container with the rules we loaded
	var logicalPath = "screens/" + screenPath + "/";
	cssContainer.html("<style>" + updateCSSForScreenContainer(screenData.css, screenContainer, logicalPath) + "</style>");

	// fill screen with content
	screenContainer.html(screenData.html);

	// call JavaScript setup
	screenData.data.setup(null); // TODO: contentManager

	// display the new screen
	showNewScreen(dontSlide, function() {
		transitioning = false;
		unblockTouchInput();
		
		if (!gui.hasHiddenSplashScreen) {
			log("Hiding splash screen for the first time.");

			if (PLATFORM == PLATFORM_IOS) {
				gui.hasHiddenSplashScreen = true;
				setTimeout(function() {
					navigator.splashscreen.hide();
				}, 200);
			} else {
				log("Not really hiding splash screen (not iOS).");
			}
		}
	});
}

function getScreenNameFromPath(screenPath) {
	var tokens = screenPath.split("/");
	return tokens[tokens.length - 1];
}

function showTabBar() {
	log("Showing tab bar");
	gui.showingTabBar = true;
	//plugins.tabBar.show();
}

function hideTabBar() {
	log("Hiding tab bar");
	gui.showingTabBar = false;
	//plugins.tabBar.hide();
}

function populateNavBar(navBarContainer, startX, width, navBarData) {
	// add the title text
	var title = $("<h1 />");
	title.appendTo(navBarContainer);
	title.text(navBarData.title);
	title.css({
		position: "absolute",

		left: startX + "px",
		width: width + "px"
	});

	// TODO: remove this
	/*
	if (!navBarData.buttons) navBarData.buttons = {};

	navBarData.buttons.right = {
		type: "action",
		title: DEVELOPER ? "Turn OFF developer" : "Turn ON developer",
		action: function() {
			localStorage.developer = !DEVELOPER;
			alert("You are now " + (DEVELOPER ? "NOT IN" : "IN") + " developer mode.");
			networkReset();
		}
	};*/

	// add any buttons
	if (navBarData.buttons) {
		if (navBarData.buttons.left) {
			addNavBarButton(LEFT, navBarData.buttons.left, navBarContainer, startX, width);
		}

		if (navBarData.buttons.right) {
			addNavBarButton(RIGHT, navBarData.buttons.right, navBarContainer, startX, width);
		}
	}
	
	// add version number to the nav bar
	var vNumber = $("<h1 />");
	vNumber.appendTo(navBarContainer);
	vNumber.text(APP_VERSION);
	vNumber.css({
		position: "absolute",

		left: (startX + 400) + "px",
		width: (width - 400 - 30) + "px",
		textAlign: "right"
	});
	
	return title;
}

// WARNING: back buttons on the right side don't work (but who cares?)
function addNavBarButton(position, data, container, startX, width) {
	var button = $("<a />");
	button.addClass("nbutton");
	button.appendTo(container);

	if (data.action) {
		button.data("action", data.action);
	}

	button.bind((PLATFORM == PLATFORM_IOS ? "touchstart" : "mousedown"), function() {
		$(this).addClass("active");
		$(this).addClass("touchdown");
	});

	button.bind((PLATFORM == PLATFORM_IOS ? "touchend" : "mouseup"), function() {
		if (!$(this).hasClass("touchdown")) {
			return;
		}

		$(this).removeClass("touchdown");
		var f = $(this);

		if (f.data("action")) {
			setTimeout(function() {
				f.data("action")();
			}, 0);
		}

		setTimeout(function() {
			if (!f.hasClass("touchdown")) {
				f.removeClass("active");
			}
		}, 100);
	});
	
	// TODO: this button creation routine works but is a mess
	var container = $("<div />").appendTo(button);

	container.append($("<div />").addClass("left"));

	var margin = 14;
	var leftWidth = 10;
	var textLeftWidthAdjust = 0;

	if (data.type == "back") {
		button.addClass("nbuttonBack");
		leftWidth = 28;
		textLeftWidthAdjust = 16;
	} else if (data.type == "action") {
		button.addClass("nbuttonAction");
	}

	var t = $("<div />").text(data.title).addClass("text").css("left", leftWidth + "px");
	t.css("padding-left", (16 - textLeftWidthAdjust) + "px");
	t.css("padding-right", "8px");
	container.append(t);

	var metrics = $.textMetrics(t);
	var w = metrics.width; // - (16) + 6;

	if (position == LEFT) {
		button.css("left", (startX + margin) + "px");
	} else if (position == RIGHT) {
		button.css("left", (startX + width - margin - w - 20 - 16 - textLeftWidthAdjust) + "px");
	}

	t.css("width", w + "px");

	container.append($("<div />").addClass("right").css("left", (w + 8 + (16 - textLeftWidthAdjust) + leftWidth) + "px"));
}

function showNewScreen(dontSlide, callback) {
	// iOS changes (nav bar and tab bar)
	if (PLATFORM == PLATFORM_IOS) {
		// tab bar
		var shouldShowTabBar = (!gui.currentScreen.data.data.hideTabBar);

		if (shouldShowTabBar && !gui.showingTabBar) {
			showTabBar();
		} else if (!shouldShowTabBar && gui.showingTabBar) {
			hideTabBar();
		}
	}

	// nav bar
	var oldNavBarContainer = $("#navBar").children();
	var navBarContainer = createNewNavBarContainer();
	var w = navBarContainer.width();

	gui.currentScreen.navBarTitles = [];
	// add each new nav bar
	if (gui.currentScreen.data.data.navBars) {
		var navBars = gui.currentScreen.data.data.navBars;
		var startX = 0;

		for (var i = 0; i < navBars.length; i++) {
			var navBarData = navBars[i];

			if (i > 0) {
				// add a separator
				var sep = $("<div />");
				sep.appendTo(navBarContainer);
				sep.addClass("separator");
				sep.css("left", (startX - 7) + "px");
			}

			var fullWidth = i >= (navBars.length - 1); // is there anything to the right?
			var width = fullWidth ? ($("#navBar").width() - startX) : navBarData.width; // ignore given width if full; otherwise, use it

			var title = populateNavBar(navBarContainer, startX, width, navBarData);
			gui.currentScreen.navBarTitles.push(title);
	
			// adjust start position for future bars
			if (!fullWidth) {
				startX += width;
			}
		}
	}
	
	if (gui.currentScreen.data.data.navBarReady) {
		gui.currentScreen.data.data.navBarReady();
	}

	if (!gui.oldScreen || dontSlide) {
		gui.currentScreen.container.screen.show();
		gui.currentScreen.container.screen.css({
			left: "0px"
		});

		if (gui.oldScreen) {
			gui.oldScreen.container.screen.remove();

			navBarContainer.css({
				left: "0px",
				opacity: 1
			});

			oldNavBarContainer.remove();
		}

		callback();
		return;
	}

	if (gui.oldScreen.data.data.parents && gui.oldScreen.data.data.parents.indexOf(gui.currentScreen.data.data.id) > (-1)) {
		// the new screen is the parent of the old one, so we need to slide in the new screen from the left
		gui.currentScreen.container.screen.css({
			left: "-" + gui.currentScreen.container.screen.width() + "px"
		});

		gui.currentScreen.container.screen.animate({
			left: "0px"
		}, 500, "swing");

		gui.oldScreen.container.screen.animate({
			left: (gui.currentScreen.container.screen.width()) + "px"
		}, 500, "swing", function() {
			$(this).remove();
			callback();
		});

		navBarContainer.css({
			left: (-navBarContainer.width()) + "px",
			opacity: 0
		});

		navBarContainer.animate({
			left: "0px",
			opacity: 1
		}, 500, "swing");

		oldNavBarContainer.each(function() {
			var n = $(this);
			n.animate({
				left: w + "px",
				opacity: 0
			}, 500, "swing", function() {
				$(this).remove();
			});
		});
	} else {
		// slide in the new screen from the right
		gui.currentScreen.container.screen.css({
			left: gui.currentScreen.container.screen.width() + "px"
		});

		gui.currentScreen.container.screen.animate({
			left: "0px"
		}, 500, "swing", null);

		gui.oldScreen.container.screen.animate({
			left: "-" + (gui.currentScreen.container.screen.width()) + "px"
		}, 500, "swing", function() {
			$(this).remove();
			callback();
		});

		navBarContainer.css({
			left: navBarContainer.width() + "px",
			opacity: 0
		});

		navBarContainer.animate({
			left: "0px",
			opacity: 1
		}, 500, "swing");

		oldNavBarContainer.each(function() {
			var n = $(this);
			n.animate({
				left: "-" + w + "px",
				opacity: 0
			}, 500, "swing", function() {
				$(this).remove();
			});
		});
	}
}

function createNewNavBarContainer() {
	var container = createNewContainer();
	container.addClass("navBarContainer");
	container.appendTo($("#navBar"));

	return container;
}

function createNewScreenContainer() {
	var container = createNewContainer();
	container.addClass("screenContainer");
	container.appendTo($("#contentHolder"));

	return container;
}

function createNewCSSContainer() {
	var container = createNewContainer();
	container.addClass("cssContainer");
	container.appendTo($("#cssHolder"));

	return container;
}

function createNewContainer() {
	return $("<div />");
}

function registerScrollContainers(containers) {
	containers.each(function() {
		var j = Math.floor(Math.random() * 100000000000).toString(16);
		$(this).attr("id", j);
		var scroll = new iScroll(j, {
			bounce: false,
			hScrollbar: false,
			vScrollbar: false
		});
		$(this).data("scroll", scroll);

	});
}

function updateScrollContainers(containers) {
	containers.each(function() {
		$(this).data("scroll").refresh();
		$(this).data("scroll").scrollTo(0, 0, 0);
	});
}

// dialogs

function dialog(title, question, buttons, callback) {
	if (PLATFORM != PLATFORM_PC) {
		navigator.notification.confirm(question, function(resp) {
			callback(resp == 2);
		}, title, buttons.join(","));
	} else {
		callback(confirm("[" + title + "]\n" + question + "\n[" + buttons.join(", ") + "]"));
	}
}

// loading screen
var loading = false;

function isLoading() {
	return loading;
}

function showLoading(text) {
	loading = true;
	var container = $("#loading");
	container.stop(true);

	var currentOpacity = container.css("opacity");
	$("#loadingText").text(text);
	container.fadeIn(250 * (1 - currentOpacity));
}

function hideLoading(callback) {
	loading = false;
	$("#loading").fadeOut(250, callback);
}

// input blocking
var blocker;

function blockTouchInput() {
	unblockTouchInput();
	
	blocker = $("<div />");
	blocker.appendTo($("body"));
	blocker.css({
		position: "fixed",
		top: "0px",
		left: "0px",
		bottom: "0px",
		right: "0px",
		zIndex: "99999"
		//backgroundColor: "rgba(255, 0, 0, 0.6)"
	});
}

function unblockTouchInput() {
	if (blocker) {
		blocker.remove();
	}
}
