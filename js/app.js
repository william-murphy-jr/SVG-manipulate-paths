/*********** Sound START  ***********/
// http://stackoverflow.com/questions/1933969/sound-effects-in-javascript-html5
var camera = new Audio().canPlayType("audio/ogg; codecs=vorbis") === ""
	? "sound/snap.wav"
	: "sound/snap.ogv";
var snd = new Audio(camera); // buffers automatically when created
function snap() {
	snd.play();
}
/*********** Sound END  ***********/

var iPosition = 0;

function points(iCount, current) {
	if (iCount <= 0) {
		iPosition += 1;
		return current;
	}
	if (typeof current !== "undefined") {
		iPosition += 1;
	} else {
		current = "";
	}
	return points(
		--iCount,
		current + "%" + iPosition + "% %" + ++iPosition + "% "
	);
}

function addCommand(sType) {
	var ucCommand = sType.toUpperCase();
	if ("ML".indexOf(ucCommand) > -1) {
		return sType + " " + points(1);
	} else {
		if ("C".indexOf(ucCommand) > -1) {
			return sType + " " + points(3);
		} else {
			if ("Q".indexOf(ucCommand) > -1) {
				return sType + " " + points(2);
			}
		}
	}
}

function addCommands(sCommands, data) {
	var d = "";
	for (var i = 0; i < sCommands.length; i++) {
		d += addCommand(sCommands.substr(i, 1));
	}
	var result = {
		d: d,
		data: []
	};
	for (var i = 0; i < iPosition; i++) {
		result.data.push(typeof data[i] !== "undefined" ? data[i] : 0);
	}

	return result;
}

var cx = 100,
	cy = 250,
	draw = addCommands("MCMCMLQMQL", [
		185.5,
		439,
		14.5,
		342,
		78.5,
		139,
		178.5,
		192,
		189.5,
		440,
		342.5,
		435,
		292.5,
		149,
		181.5,
		192,
		176.5,
		165,
		135.5,
		110,
		120.5,
		60,
		45.5,
		73,
		383.5,
		131,
		219.5,
		19,
		209.5,
		65,
		186.5,
		153
	]),
	curves = [
		{
			d: draw.d,
			init: draw.data
		}
	],
	curve = "",
	currentCurve = 0,
	$curve = $("#curve"),
	$data = $(".data"),
	$log = $(".log"),
	$grid = $("#grid"),
	active = -1;

function setActive(a) {
	if (a !== active) {
		snap();
	}
	active = a;
}

// Find your root SVG element
var svg = document.querySelector("svg");

// Create an SVGPoint for future math
var pt = svg.createSVGPoint();

// Get point in global SVG space
function cursorPoint(evt) {
	return getXY(evt.clientX, evt.clientY, true);
}

function getXY(x, y, inverse) {
	pt.x = x;
	pt.y = y;
	return !!inverse ? pt.matrixTransform(svg.getScreenCTM().inverse()) : pt;
}

function generateCurveData(x, y, activePoint) {
	var curveToDraw = curves[currentCurve];
	var d = curveToDraw.d;
	var sHTML = curveToDraw.d;
	var points = curveToDraw.init;
	var ptno = 0;
	for (var point = 0; point < points.length; point += 2) {
		var px = ptno === activePoint
			? x
			: typeof points[point] === "undefined" ? 0 : points[point];
		var py = ptno === activePoint
			? y
			: typeof points[point + 1] === "undefined" ? 0 : points[point + 1];
		curveToDraw.init[point] = px;
		curveToDraw.init[point + 1] = py;
		d = d.replace("%" + point + "%", px).replace("%" + (point + 1) + "%", py);
		sHTML = sHTML
			.replace("%" + point + "%", (ptno === activePoint ? "<mark>" : "") + px)
			.replace(
				"%" + (point + 1) + "%",
				py + (ptno === activePoint ? "</mark>" : "")
			);
		ptno++;
	}
	var curveData = {
		d: d,
		html: sHTML
	};
	return curveData;
}

function handleMouseMove(evt) {
	var loc = cursorPoint(evt);
	var x = loc.x;
	var y = loc.y;

	if (evt.buttons !== 0 || curve == "") {
		curve = generateCurveData(x, y, active);
	}

	var grid = curve.d.replace(/[^0-9.]/g, " ").split(" ").filter(function(ele) {
		return ele != "";
	});
	var sGrid = "";
	var ptno = 0;
	var path = "";
	var gridPath = '<path class="gridPath" d="M %path%" />';
	for (var point = 0; point < grid.length; point += 2) {
		var pt = getXY(grid[point], grid[point + 1]);
		sGrid +=
			'<use onmousemove="setActive(' +
			ptno +
			')" xlink:href="#' +
			(ptno == active ? "crossFilled" : "cross") +
			'" x="' +
			pt.x +
			'" y="' +
			pt.y +
			'"  />\n';
		path += (ptno === 1 ? "L " : "") + grid[point] + " " + grid[point + 1] + " ";
		ptno++;
	}
	sGrid += gridPath.replace("%path%", path);
	$log.html('&lt;path d="' + curve.html + '" &gt;');
	$grid.html(sGrid);
	$data.text(curves[currentCurve].init);
	$curve.html('<path d="' + curve.d + '" >');
}

svg.addEventListener("mousemove", handleMouseMove, false);

document.addEventListener("keyup", function(evt) {
	switch (evt.keyCode) {
		case 37: // LEFT
			active--;
			break;
		case 39: // RIGHT
			active++;
			break;
	}
	
});


// 3. aug. 2017 Added init draw
let pseudoEvt = {
  clientX: 0,
  clientY: 0,
  buttons: 0
}
handleMouseMove(pseudoEvt)