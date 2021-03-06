pages.raw_materials_selection = {
	buttonContainer: undefined,
	
	addItemOrFluid: function(item, imgPath) {
		var templateButton = document.getElementById('template-item_button');
		var buttonId = 'raw_materials_selection-button-' + item;

		if (document.getElementById(buttonId) != null) return;
		
		// make a deep copy of the button, show it, and append it to the page
		var button = templateButton.cloneNode(true);
		button.id = buttonId;
		button.classList.remove('hidden');
		var buttonIcons = button.getElementsByClassName('icon');
		
		for (var iconI = 0; iconI < buttonIcons.length; ++iconI) {
			buttonIcons[iconI].onerror = function() {
				console.warn('Unable to find ' + this.src);
				this.onerror = null; 
				this.src = 'img/default.png'
			};
			buttonIcons[iconI].src = imgPath;
		}
		
		button.onclick = function() {
			app.ratioSolver.toggleRaw(item);
		}
		
		if (app.ratioSolver.isRaw(item)) {
			button.classList.add('raw');
		}
		
		if (!app.ratioSolver.hasRecipe(item)) {
			button.disabled = true;
		}
		
		pages.raw_materials_selection.buttonContainer.appendChild(button);
	},
	
	addRecipe: function(recipe) {
		var item = recipe.outputItem();
		var button = document.getElementById('raw_materials_selection-button-' + item);
		
		if (button) {
			button.disabled = false;
		}
	},
	
	removeAll: function() {
		var buttonContainer = pages.raw_materials_selection.buttonContainer;
		var buttonContainerEmpty = buttonContainer.cloneNode(false);
		buttonContainer.parentNode.replaceChild(buttonContainerEmpty, buttonContainer);
		pages.raw_materials_selection.buttonContainer = buttonContainerEmpty;
	},
	
	setItemRaw: function(item, raw) {
		var button = document.getElementById('raw_materials_selection-button-' + item);
		if (button) {
			if (raw) {
				button.classList.add('raw');
			} else {
				button.classList.remove('raw');
			}
		}
	}
}

document.addEventListener(
	'deviceready', 
	function() {
		console.log('Loading item buttons for raw_materials_selection');

		var mainElement = document.getElementById('raw_materials_selection');
		content.addPage('raw_materials_selection', new Page(
			mainElement,
			undefined,
			function() {
				app.preferences.inherit();
				app.preferences.save();
			})
		);
		pages.raw_materials_selection.buttonContainer = document.getElementById('raw_materials_selection-item_buttons');

		document.addEventListener('modsunloaded', pages.raw_materials_selection.removeAll);
		document.addEventListener('modsloaded', function() {
			app.factorioEnvironment.addFluidListener(pages.raw_materials_selection.addItemOrFluid);
			app.factorioEnvironment.addItemListener(pages.raw_materials_selection.addItemOrFluid);
			app.factorioEnvironment.addRecipeListener(pages.raw_materials_selection.addRecipe);
			
			app.ratioSolver.addSetRawListener(
				item => pages.raw_materials_selection.setItemRaw(item, true),
				item => pages.raw_materials_selection.setItemRaw(item, false)
			);
		});
	},
	false
);
