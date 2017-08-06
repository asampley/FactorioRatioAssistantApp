document.addEventListener(
	'deviceready', 
	function() {
		console.log('Loading item buttons for ratio_selection');

		var mainElement = document.getElementById('ratio_selection');
		content.addPage('ratio_selection', new Page(mainElement));
		

		var buttonContainer = document.getElementById('ratio_selection-item_buttons');
		
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
				var buttonContainer = document.getElementById('ratio_selection-item_buttons');
				
				app.factorioEnvironment.addItemListener(
					function(item, itemImgPath) {
						var templateButton = document.getElementById('template-item_button');
						var buttonId = 'ratio_selection-button-' + item;

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
							content.switchToPage('ratio_display', item);
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
						button = document.getElementById('ratio_selection-button-' + item);
						if (button) {
							button.style.backgroundColor = "var(--color-button-raw)";
						}
					},
					function(item) {
						button = document.getElementById('ratio_selection-button-' + item);
						if (button) {
							button.style.backgroundColor = "";
						}
					}
				);

				app.factorioEnvironment.addRecipeListener(
					function(recipe) {
						var item = recipe.outputItem();
						var button = document.getElementById('ratio_selection-button-' + item);
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