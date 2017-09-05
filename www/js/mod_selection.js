document.addEventListener(
	'deviceready', 
	function() {
		var mainElement = document.getElementById('mod_selection');
		var treeTemplate = document.getElementById('template-tree-node-mod');
		var rootTreeNode = null;

		var modButtons = {};
		var versionButtons = {};

		fileutil.readTextAppWWW('mods/mods.txt', function(text) {
			var modNames = [];

			var lines = text.split('\n');
			for (var i = 0; i < lines.length; ++i) {
				var modName = lines[i].trim();
				if (modName.length != 0) {
					modNames.push(modName);
				}
			}

			var childTemplate = document.getElementById('template-button-mod-version');

			var createChildren = function(modName, parent) {
				return function(text) {
					var modVersions = [];

					var lines = text.split('\n');
					for (var i = 0; i < lines.length; ++i) {
						var modVersion = lines[i].trim();
						if (modVersion.length != 0) {
							modVersions.push(modVersion);
						}
					}
					
					console.log('Found mod "' + modName + '" with versions ' + modVersions);

					modVersions.unshift('none');

					fileutil.readTextAppWWW('mods/' + modName + '/dependencies.txt', function(text) {
						var dependencies = [];

						var lines = text.split('\n');
						for (var i = 0; i < lines.length; ++i) {
							var dependency = lines[i].trim();
							if (dependency.length == 0) continue;
							dependencies.push(dependency);
						}

						if (!(modName in app.modLoader.mods)) {
							app.modLoader.mods[modName] = {version: 'none', dependencies: dependencies};
						}

						for (var i = 0; i < modVersions.length; ++i) {
							var modVersion = modVersions[i];

							var modVersionButton = childTemplate.cloneNode(true);
							modVersionButton.classList.remove('hidden');

							var modVersionIcon = modVersionButton.getElementsByClassName('tree-node-mod-version-icon')[0];
							modVersionIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
							//modVersionIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(i)];
							modVersionButton.getElementsByClassName('tree-node-mod-version-name')[0].textContent = modVersion;

							versionButtons[modName].push(modVersionButton);

							if (app.modLoader.mods[modName].version == modVersion) {
								modButtons[modName].getElementsByClassName('tree-node-mod-version-name')[0].textContent = modVersion;
								modVersionButton.style.backgroundColor = "var(--color-button-selected)";
							}

							function createButtonClick(modName, modVersion) {
								return function() {
									app.modLoader.mods[modName] = {version: modVersion, dependencies: dependencies};
									console.log('Set "' + modName + '" to ' + modVersion);

									for (var i = 0; i < versionButtons[modName].length; ++i) {
										versionButtons[modName][i].style.backgroundColor = "";
									}

									this.style.backgroundColor = "var(--color-button-selected)";

									modButtons[modName].getElementsByClassName('tree-node-mod-version-name')[0].textContent = modVersion;
								}
							}

							modVersionButton.onclick = createButtonClick(modName, modVersion);

							parent.appendChild(modVersionButton);

							//if (app.ratioSolver.getMachineLevel(machineClass.className) == i) {
							//	machineLevelButton.style.backgroundColor = "var(--color-button-selected)";
							//}
						}
					});
				}
			}

			for (var i = 0; i < modNames.length; ++i) {
				var modName = modNames[i];

				var modSelector = treeTemplate.cloneNode(true);
				modSelector.classList.remove('hidden');
				mainElement.appendChild(modSelector);

				var modIcon = modSelector.getElementsByClassName('tree-node-mod-icon')[0];
				modIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				//machineIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(0)];
				modSelector.getElementsByClassName('tree-node-mod-name')[0].textContent = modName;
				modButtons[modName] = modSelector;

				var childElement = modSelector.getElementsByClassName('tree-node-children')[0];

				modSelector.getElementsByClassName('tree-node-button')[0].onclick = (function(childElement) {
					return function() {
						childElement.classList.toggle('hidden');
					}
				})(childElement);

				versionButtons[modName] = [];

				fileutil.readTextAppWWW('mods/' + modName + '/versions.txt', createChildren(modName, childElement));
			}
		});

		content.addPage('mod_selection', new Page(
			mainElement,
			undefined,
			function() {
				app.reloadMods();
				app.preferences.save();
			})
		);
	},
	false
);