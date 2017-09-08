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
	},

	setHelpContent: function(page) {
		// get the content from the page by the help class, or default if none exists
		var helpContent = page.view.getElementsByClassName('help');
		if (helpContent.length == 0) {
			helpContent = document.getElementById('help_popup-content_default');
		} else {
			helpContent = helpContent[0];
		}
		helpContent = helpContent.cloneNode(true);
		helpContent.classList.remove('hidden');

		// clear old help content
		var helpPopupContentOld = document.getElementById('help_popup-content');
		var helpPopupContent = helpPopupContentOld.cloneNode(false);
		var helpPopup = helpPopupContentOld.parentNode;
		helpPopup.replaceChild(helpPopupContent, helpPopupContentOld);

		// apply new content
		helpPopupContent.appendChild(helpContent);
	}
};

Page = function(view, onenter, onexit, onrefresh) {
	this.view = view;
	this.onenter = onenter;
	this.onexit = onexit;
	this.onrefresh = onrefresh;
};

Page.prototype.refresh = function() {
	if (this.onrefresh != undefined) {
		this.onrefresh();
	}
}

Page.prototype.show = function(arguments) {
	this.view.style.display = 'block';
	content.setHelpContent(this);

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