document.addEventListener(
	'deviceready', 
	function() {
		var mainMenuPage = new Page(document.getElementById('main_menu'))
		content.addPage('main_menu', mainMenuPage);
		content.switchToPage('main_menu');

                var ratioButton = document.getElementById('main_menu-button-ratio');
                ratioButton.onclick = function() {
                	content.switchToPage('ratio_selection');
                }
                var rawMatButton = document.getElementById('main_menu-button-raw_materials');
                rawMatButton.onclick = function () {
                	content.switchToPage('raw_materials_selection');
                }
                var machineLevelsButton = document.getElementById('main_menu-button-machine_levels');
                machineLevelsButton.onclick = function () {
                	content.switchToPage('machine_level_selection');
                }
	},
	false
);