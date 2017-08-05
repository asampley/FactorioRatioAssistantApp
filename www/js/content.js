var content = {
	currentPage: null,
	currentPageName: null,
	currentArgs: null,
	pageMap: {},
	prevPageNameStack: [],
	prevArgsStack: [],
	pageListeners: [],

	switchToPage: function(pageName, arguments) {
		if (pageName in this.pageMap) {
			if (this.currentPage != null) {
				this.currentPage.hide();
				this.prevPageNameStack.push(this.currentPageName);
				this.prevArgsStack.push(this.currentArgs)
			}
			this.currentPage = this.pageMap[pageName];
			this.currentPageName = pageName;
			this.currentArgs = arguments;
			this.currentPage.show(arguments);
			console.log('Switched to page named "' + pageName + '"' + 
				(arguments == undefined ? "" : ' with arguments "' + arguments + '"'));
			for (var i = 0; i < this.pageListeners.length; ++i) {
				this.pageListeners[i](this.currentPageName);
			}
		}
	},

	goBackToPage: function() {
		if (this.prevPageNameStack.length > 0) {
			this.currentPage.hide();
			this.currentPageName = this.prevPageNameStack.pop();
			this.currentPage = this.pageMap[this.currentPageName];
			this.currentArgs = this.prevArgsStack.pop();
			this.currentPage.show(this.currentArgs);
			console.log('Went back to page "' + this.currentPageName + '"' + 
				(arguments == undefined ? "" : ' with arguments "' + arguments + '"'));
			for (var i = 0; i < this.pageListeners.length; ++i) {
				this.pageListeners[i](this.currentPageName);
			}
			return true;
		} else {
			return false;
		}
	},

	addPage: function(pageName, page) {
		this.pageMap[pageName] = page;
	},

	addPageListener: function(listener, immediateUpdate=true) {
		this.pageListeners.push(listener);

		if (immediateUpdate) {
			listener(this.currentPageName);
		}
	}
};

Page = function(view, onenter, onexit) {
	this.view = view;
	this.onenter = onenter;
	this.onexit = onexit;
};

Page.prototype.show = function(arguments) {
	this.view.style.display = 'block';

	if (this.onenter != undefined) {
		this.onenter(arguments);
	}
};

Page.prototype.hide = function() {
	this.view.style.display = 'none';

	if (this.onexit != undefined) {
		this.onexit();
	}
};