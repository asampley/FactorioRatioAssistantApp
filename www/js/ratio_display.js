document.addEventListener(
	'deviceready', 
	function() {
		var mainElement = document.getElementById('ratio_display');
		var treeTemplate = document.getElementById('template-tree-node-ratio');
		var rootTreeNode = null;

		function showTree(item) {
			// clear area
			if (rootTreeNode != null) {
				mainElement.removeChild(rootTreeNode);
				rootTreeNode = null;
			}

			function constructTree(parent, tree) {

				var treeRoot = tree.rootValue();
				var machine = treeRoot[0];
				var machineCount = treeRoot[1];
				var recipe = machine.recipe;
				var outputItem = recipe.outputItem();
				var outputCountPerSec = machine.outputCountPerSec();
				var outputIconPath = app.factorioEnvironment.itemImgPaths[outputItem];
				var machineIconPath = app.factorioEnvironment.itemImgPaths[machine.name()];

				var treeNode = treeTemplate.cloneNode(true);
				parent.appendChild(treeNode);

				var childrenElement = treeNode.getElementsByClassName('tree-node-children')[0];

				treeNode.classList.remove('hidden');
				treeNode.getElementsByClassName('tree-node-machine-count')[0].textContent = machineCount;
				treeNode.getElementsByClassName('tree-node-item-pre-icon-text')[0].textContent = "(" + outputCountPerSec;
				treeNode.getElementsByClassName('tree-node-item-post-icon-text')[0].textContent = " / s)";
				var treeNodeIcon = treeNode.getElementsByClassName('tree-node-item-icon')[0];
				var treeNodeMachineIcon = treeNode.getElementsByClassName('tree-node-machine-icon')[0];
				treeNodeIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				treeNodeMachineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				treeNodeIcon.src = outputIconPath;
				treeNodeMachineIcon.src = machineIconPath;
				var treeNodeButton = treeNode.getElementsByClassName('tree-node-button')[0];

				if (app.ratioSolver.isRaw(outputItem)) {
					treeNodeButton.style.backgroundColor = "var(--color-button-raw)";
					childrenElement.classList.add('hidden');

				} else {
					treeNodeButton.style.backgroundColor = "";
				}

				treeNode.getElementsByClassName('tree-node-button')[0].onclick = function() {
					childrenElement.classList.toggle('hidden');
				}

				for (var i = 0; i < tree.children.length; ++i) {
					constructTree(childrenElement, tree.getChild(i));
				}

				return treeNode;
			}

			var tree = app.ratioSolver.solve(item);
			rootTreeNode = constructTree(mainElement, tree);
			rootTreeNode.getElementsByClassName('tree-node-children')[0].classList.remove('hidden');
		}

		content.addPage('ratio_display', new Page(
			mainElement, 
			function(item) {
				showTree(item);
			}
		));
	},
	false
);