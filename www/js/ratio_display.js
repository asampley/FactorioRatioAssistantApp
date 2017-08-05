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
				var machine = treeRoot.machine;
				var machineCount = treeRoot.machineCount;
				var outputItem = treeRoot.item;
				var outputCountPerSec = treeRoot.itemPerSec;
				var outputIconPath = app.factorioEnvironment.itemImgPaths[outputItem];

				var treeNode = treeTemplate.cloneNode(true);
				parent.appendChild(treeNode);

				var childrenElement = treeNode.getElementsByClassName('tree-node-children')[0];

				treeNode.classList.remove('hidden');
				outputInt = outputCountPerSec.toIntegerQuotient();
				outputFrac = outputCountPerSec.toAbsRemainderFraction();
				treeNode.getElementsByClassName('tree-node-item-pre-icon-int')[0].textContent = "(" + (outputInt == 0 ? "" : outputInt);
				treeNode.getElementsByClassName('tree-node-item-pre-icon-frac')[0].textContent = (outputFrac.num == 0 ? "" : outputFrac);
				treeNode.getElementsByClassName('tree-node-item-post-icon-text')[0].textContent = " / s)";
				var treeNodeIcon = treeNode.getElementsByClassName('tree-node-item-icon')[0];
				treeNodeIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
				if (machine != null) {
					var machineIconPath = app.factorioEnvironment.itemImgPaths[machine.name()];
					var treeNodeMachineIcon = treeNode.getElementsByClassName('tree-node-machine-icon')[0];
					treeNodeMachineIcon.onerror = function() {this.onerror = null; this.src = 'img/default.png'};
					treeNodeMachineIcon.src = machineIconPath;
					machineInt = machineCount.toIntegerQuotient();
					machineFrac = machineCount.toAbsRemainderFraction();
					treeNode.getElementsByClassName('tree-node-machine-int')[0].textContent = (machineInt == 0 ? "" : machineInt);
					treeNode.getElementsByClassName('tree-node-machine-frac')[0].textContent = (machineFrac.num == 0 ? "" : machineFrac);
				}
				treeNodeIcon.src = outputIconPath;
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