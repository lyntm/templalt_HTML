// ADDS BG COLOR TO ANY ELEMENTS WITH CLASS "highlight"
const colorBG = () => {
	const colorClasses = document.getElementsByClassName('highlight');

	for (let i = 0; i < colorClasses.length; i++) {
		const color = Math.floor(Math.random() * 16777215).toString(16);
		colorClasses[i].style.backgroundColor = '#' + color;
	}
};

// ===== FUNCTION CALLS =====
colorBG();
