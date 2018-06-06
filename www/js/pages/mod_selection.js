pages.mod_selection = {
	modButtons: {}
}

document.addEventListener(
	'deviceready', 
	function() {
		var mainElement = document.getElementById('mod_selection');
		var treeTemplate = document.getElementById('template-tree-node-mod');
		var rootTreeNode = null;

		fileutil.readTextAppWWW('mods/mods.txt', function(text) {
			var modNames = [];

			var lines = text.split('\n');
			for (var i = 0; i < lines.length; ++i) {
				var modName = lines[i].trim();
				if (modName.length != 0) {
					modNames.push(modName);
				}
			}

			for (var i = 0; i < modNames.length; ++i) {
				var modName = modNames[i];

				var modSelector = treeTemplate.cloneNode(true);
				modSelector.classList.remove('hidden');
				mainElement.appendChild(modSelector);

				var modIcon = modSelector.getElementsByClassName('tree-node-mod-icon')[0];
				modIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				modSelector.getElementsByClassName('tree-node-mod-name')[0].textContent = modName;
				pages.mod_selection.modButtons[modName] = modSelector.getElementsByClassName('tree-node-button')[0];

				pages.mod_selection.modButtons[modName].onclick = function(mod) {
					console.log('modname ' + mod);
					return function() {
						app.modLoader.mod = mod;
						console.log('Set mod to "' + mod + '"');
									
						for (var modButtonName in pages.mod_selection.modButtons) {
							pages.mod_selection.modButtons[modButtonName].style.backgroundColor = "";
						}
						this.style.backgroundColor = "var(--color-button-selected)";
					}
				}(modName);

				if (app.modLoader.mod == modName) {
					pages.mod_selection.modButtons[modName].style.backgroundColor = "var(--color-button-selected)";
				}
			}
		});

		content.addPage('mod_selection', new Page(
			mainElement,
			undefined,
			function() {
				app.reloadMod();
				app.preferences.save();
			})
		);
	},
	false
);
