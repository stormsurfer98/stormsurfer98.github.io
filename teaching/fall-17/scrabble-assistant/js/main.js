var baseURL = window.location.href.substring(0, window.location.href.length-10);
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var words = [];
var pointsTable = {};
var rackPoints = 0;

function main() {
	$.get(baseURL+"static/points.txt", function(data) {
		var pointsList = data.split("\n");
		for(var i=0; i<pointsList.length; i++) {
			var points = parseInt(pointsList[i].split(": ")[0]);
			letterList = pointsList[i].split(": ")[1].split(", ");
			for(var j=0; j<letterList.length; j++) pointsTable[letterList[j]] = points;
		}
	});
	$.get(baseURL+"static/words.txt", function(data) {
		words = data.split("\n");
	});
}
main();

function changeValue(element, event) {
	if(event.target == element) {
		if(element.style.background == "rgb(173, 216, 230)") element.style.background = "#87B986";
		else if(element.style.background == "rgb(135, 185, 134)") element.style.background = "#F4A460";
		else element.style.background = "#ADD8E6";
	}
}

function nextElement(element) {
	if(element.value.match(/[a-z]/i)) {
		element.previousElementSibling.style.display = "block";
		element.previousElementSibling.innerHTML = pointsTable[element.value.toUpperCase()].toString();
		if(element.id == "board-10") document.getElementById("rack-1").focus();
		else if(element.id == "rack-7") document.getElementById("button").focus();
		else element.parentElement.nextElementSibling.lastElementChild.focus();
	} else {
		element.previousElementSibling.style.display = "none";
		element.previousElementSibling.innerHTML = "";
		element.value = "";
	}
}

function makeCaps(element) {
	element.value = element.value.toUpperCase();
}

function getPoints(word) {
	var points = 0;
	for(var i=0; i<word.length; i++) {
		points += pointsTable[word[i]];
	}
	return points;
}

function updateBoard(word, points) {
	//modify board colors
	var boardString = "";
	for(i=1; i<=10; i++) {
		ch = document.getElementById("board-"+i).value;
		if(ch !== undefined && ch !== "") boardString += ch;
		else boardString += " ";
	}
	var matches = boardString.match(/\w+/);
	if(matches) index = boardString.indexOf(matches[0]) - word.indexOf(matches[0]);
	else index = 0;
	var count = 0;
	var extraPoints = 0;
	for(i=0; i<word.length; i++) {
		var el = document.getElementById("board-"+(index+i+1));
		if(el.value === undefined || el.value === "") {
			el.value = word[i];
			el.previousElementSibling.style.display = "block";
			el.previousElementSibling.innerHTML = pointsTable[word[i]].toString();
			if(el.parentElement.style.background == "rgb(173, 216, 230)") extraPoints += pointsTable[word[i]];
			else if(el.parentElement.style.background == "rgb(135, 185, 134)") extraPoints += 2*pointsTable[word[i]];
			else el.parentElement.style.background = "#5A6351";

			//modify rack colors
			for(j=1; j<=7; j++) {
				var newEl = document.getElementById("rack-"+j);
				if(el.value == newEl.value && newEl.parentElement.style.background != "rgb(255, 0, 0)") {
					newEl.parentElement.style.background = "#FF0000";
					count += 1;
					break;
				}
			}
		}
	}
	if(count == 7) extraPoints += 50;

	//update button and scores
	document.getElementById("board").innerHTML = "<em>THE BOARD (POINTS EARNED: " + (points+extraPoints) + ")</em>";
	document.getElementById("rack").innerHTML = "<em>YOUR RACK (AVAILABLE POINTS: " + (rackPoints-points) + ")</em>";
	document.getElementById("button").innerHTML = "RESET BOARD";
	document.getElementById("button").onclick = function() { resetBoard(); };
}

function updateRack(element) {
	makeCaps(element);
	var points = 0;
	for(var i=1; i<=7; i++) {
		var ch = document.getElementById("rack-"+i).value;
		if(ch !== undefined && ch !== "") points += pointsTable[ch];
	}
	rackPoints = points;
	document.getElementById("rack").innerHTML = "<em>YOUR RACK (AVAILABLE POINTS: " + points + ")</em>";
}

function findMatches(regEx) {
	var bestWord = "";
	var maxPoints = 0;
	var lostPoints = 0;
	var alphaCount = {};
	for(var i=0; i<26; i++) alphaCount[alphabet[i]] = 0;
	var boardPoints = 0;
	for(i=1; i<=10; i++) {
		var ch = document.getElementById("board-"+i).value;
		if(ch !== undefined && ch !== "") boardPoints += pointsTable[ch];
	}

	//update alphaCount
	for(i=1; i<=10; i++) {
		ch = document.getElementById("board-"+i).value;
		if(ch !== undefined && ch !== "") alphaCount[ch] += 1;
	}
	for(i=1; i<=7; i++) {
		ch = document.getElementById("rack-"+i).value;
		if(ch !== undefined && ch !== "") alphaCount[ch] += 1;
	}

	//look for matches
	matchFound = false;
	for(i=0; i<words.length; i++) {
		if(words[i].match(regEx)) {
			var alphaCountCopy = $.extend({}, alphaCount);
			var enoughLetters = true;
			for(var j=0; j<words[i].length; j++) {
				alphaCountCopy[words[i][j]] -= 1;
				if(alphaCountCopy[words[i][j]] < 0) enoughLetters = false;
			}
			if(enoughLetters) {
				matchFound = true;
				var points = getPoints(words[i]) - boardPoints;

				var boardString = "";
				for(j=1; j<=10; j++) {
					ch = document.getElementById("board-"+j).value;
					if(ch !== undefined && ch !== "") boardString += ch;
					else boardString += " ";
				}
				var matches = boardString.match(/\w+/);
				if(matches) index = boardString.indexOf(matches[0]) - words[i].indexOf(matches[0]);
				else index = 0;
				var count = 0;
				var extraPoints = 0;
				for(j=0; j<words[i].length; j++) {
					var el = document.getElementById("board-"+(index+j+1));
					if(el.value === undefined || el.value === "") {
						if(el.parentElement.style.background == "rgb(173, 216, 230)") extraPoints += pointsTable[words[i][j]];
						else if(el.parentElement.style.background == "rgb(135, 185, 134)") extraPoints += 2*pointsTable[words[i][j]];
						count += 1;
					}
				}
				if(count == 7) extraPoints += 50;

				if(points+extraPoints > maxPoints) {
					bestWord = words[i];
					lostPoints = points;
					maxPoints = points + extraPoints;
				}
			}
		}
	}
	if(!matchFound) {
		alert("No matches found!");
		document.getElementById("board-1").focus();
	} else {
		updateBoard(bestWord, lostPoints);
	}
}

function resetBoard() {
	//reset colors
	for(i=1; i<=10; i++) {
		document.getElementById("board-"+i+"-h").innerHTML = "";
		document.getElementById("board-"+i+"-h").style.display = "none";
		document.getElementById("board-"+i).value = "";
		document.getElementById("board-"+i).parentElement.style.background = "#F4A460";
	}
	for(i=1; i<=7; i++) {
		document.getElementById("rack-"+i+"-h").innerHTML = "";
		document.getElementById("rack-"+i+"-h").style.display = "none";
		document.getElementById("rack-"+i).value = "";
		document.getElementById("rack-"+i).parentElement.style.background = "#F4A460";
	}
	rackPoints = 0;
	document.getElementById("board").innerHTML = "<em>THE BOARD (POINTS EARNED: 0)</em>";
	document.getElementById("rack").innerHTML = "<em>YOUR RACK (AVAILABLE POINTS: 0)</em>";

	//reset button
	document.getElementById("button").innerHTML = "FIND BEST MATCH";
	document.getElementById("button").onclick = function() { createRegEx(); };
	document.getElementById("board-1").focus();
}

function createRegEx() {
	var regEx = "";
	for(var i=1; i<=10; i++) {
		var ch = document.getElementById("board-"+i).value;
		if(ch === undefined || ch === "") regEx += ".";
		else regEx += ch;
	}

	//check beginning of RegEx string
	var count = 0;
	for(i=10; i>=1; i--) {
		if(regEx[regEx.length-i] == ".") count += 1;
		else break;
	}
	if(count !== 0) {
		regEx = ".{0," + count + "}" + regEx.substring(count, regEx.length);
	}

	//check end of RegEx string
	if(count != 10) {
		count = 0;
		for(i=1; i<=10; i++) {
			if(regEx[regEx.length-i] == ".") count += 1;
			else break;
		}
		if(count !== 0) {
			regEx = regEx.substring(0, regEx.length-count) + ".{0," + count + "}";
		}
	}

	//find available tiles on rack
	regEx = ("^" + regEx + "$").replace(/\./g, "\\w");
	findMatches(new RegExp(regEx));
}