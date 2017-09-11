document.addEventListener(
	'deviceready',
	function() {
        var helpPanel = document.getElementById('help_popup');
        var helpOverlay = document.getElementById('popup_overlay');

		document.getElementById('help_popup-button_close').onclick = function() {
			helpPanel.classList.add('hidden');
			helpOverlay.classList.add('hidden');
		}
    },
	false
);