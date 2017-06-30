document.addEventListener(
	'deviceready', 
	function() {
		var mainElement = document.getElementById('machine_level_selection');
		var treeTemplate = document.getElementById('template-tree-node-machine');
		var rootTreeNode = null;

		app.factorioEnvironment.addMachineClassListener(
			function(machineClass) {
				var machineSelector = treeTemplate.cloneNode(true);
				machineSelector.classList.remove('hidden');
				mainElement.appendChild(machineSelector);

				var machineIcon = machineSelector.getElementsByClassName('tree-node-machine-icon')[0];
				machineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				machineIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(0)];
				machineSelector.getElementsByClassName('tree-node-machine-name')[0].textContent = machineClass.className;
				

				var childElement = machineSelector.getElementsByClassName('tree-node-children')[0];
				var childTemplate = document.getElementById('template-button-machine-level');

				machineSelector.getElementsByClassName('tree-node-button')[0].onclick = function() {
					childElement.classList.toggle('hidden');
				}

				for (var i = 0; i < machineClass.names.length; ++i) {
					var machineLevelButton = childTemplate.cloneNode(true);
					var level = i;
					machineLevelButton.classList.remove('hidden');

					var machineLevelIcon = machineLevelButton.getElementsByClassName('tree-node-machine-icon')[0];
					machineLevelIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
					machineLevelIcon.src = app.factorioEnvironment.itemImgPaths[machineClass.name(level)];
					machineLevelButton.getElementsByClassName('tree-node-machine-name')[0].textContent = machineClass.name(level);

					machineLevelButton.onclick = function() {
						app.ratioSolver.setMachineLevel(machineClass.className, level);
					}

					childElement.appendChild(machineLevelButton);
				}
			}
		);

		content.addPage('machine_level_selection', new Page(mainElement));
	},
	false
);