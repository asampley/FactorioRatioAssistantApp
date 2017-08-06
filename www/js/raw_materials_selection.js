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
		var buttonContainer = document.getElementById('raw_materials_selection-item_buttons');

		document.addEventListener(
			'modsunloaded',
			function() {
				buttonContainerEmpty = buttonContainer.cloneNode(false);
				buttonContainer.parentNode.replaceChild(buttonContainerEmpty, buttonContainer);
				buttonContainer = buttonContainerEmpty;
			}
		);

		document.addEventListener(
			'modsloaded',
			function() {
				var buttonContainer = document.getElementById('raw_materials_selection-item_buttons');

				app.factorioEnvironment.addItemListener(
					function(item, itemImgPath) {
						var templateButton = document.getElementById('template-item_button');
						var buttonId = 'raw_materials_selection-button-' + item;

						if (document.getElementById(buttonId) != null) return;

						// make a deep copy of the button, show it, and append it to the page
						button = templateButton.cloneNode(true);
						button.id = buttonId;
						button.classList.remove('hidden');
						buttonIcons = button.getElementsByClassName('icon');

						for (var iconI = 0; iconI < buttonIcons.length; ++iconI) {
							buttonIcons[iconI].onerror = function() {this.onerror = null; this.src = 'img/default.png'};
							buttonIcons[iconI].src = itemImgPath;
						}

						button.onclick = function() {
							app.ratioSolver.toggleRaw(item);
							console.log("Changed " + item + " to raw=" + app.ratioSolver.isRaw(item));
						}

						if (app.ratioSolver.isRaw(item)) {
							button.style.backgroundColor = "var(--color-button-raw)";
						}

						if (!app.ratioSolver.hasRecipe(item)) {
							button.disabled = true;
						}

						buttonContainer.appendChild(button);
					}
				);

				app.ratioSolver.addSetRawListener(
					function(item) {
						var button = document.getElementById('raw_materials_selection-button-' + item);
						if (button) {
							button.style.backgroundColor = "var(--color-button-raw)";
						}
					},
					function(item) {
						var button = document.getElementById('raw_materials_selection-button-' + item);
						if (button) {
							button.style.backgroundColor = "";
						}
					}
				);

				app.factorioEnvironment.addRecipeListener(
					function(recipe) {
						var item = recipe.outputItem();
						var button = document.getElementById('raw_materials_selection-button-' + item);
						if (button) {
							button.disabled = false;
						}
					}
				);
			}
		);
	},
	false
);