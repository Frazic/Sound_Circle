/*----------------------------------------------------------------------
Copyright 2021, Allison Stokoe and Joshua Bruylant, All rights reserved.
----------------------------------------------------------------------*/

const styleTextHidden = '#000000';
const styleTextVisible = '#ffffff';

let showAdvancedCheckBox; // Shows/Hides all advanced settings

// SLIDERS
let fmaxSlider;
let fminSlider;
let dbmaxSlider;
let dbminSlider;
let highPassSlider;
let lowPassSlider;
let circleScaleFactorSlider;
// let numberOfBinsSlider;
let volumeSlider;

let sliderArray = [];

// SLIDER INPUTS
let fmaxInput;
let fminInput;
let dbmaxInput;
let dbminInput;
let highPassInput;
let lowPassInput;
let circleScaleFactorInput;
// let numberOfBinsInput;
let volumeInput;

let inputArray = [];

// SLIDER TEXTS
let fmaxText;
let fminText;
let dbmaxText;
let dbminText;
let highPassText;
let lowPassText;
let circleScaleFactorText;
// let numberOfBinsText;
let volumeText;

let textArray = [];

// Color scheme dropdown
let colorSchemeDropDown;
let colorSchemeText;
let colorHueLow = 320;
let colorHueHigh = 0;
let colorSaturationLow = 46;
let colorSaturationHigh = 100;
let colorBrightnessLow = 10;
let colorBrightnessHigh = 50;

// BUTTONS
let resetToDefaultBtn;
let browseFileBtn;
let playPauseBtn;
let useMicCheckbox;

// Whole sound mode checkbox
let wholeSoundModeCheckbox;

// DEFAULT VALUES
let fmaxDefault = 4300;
let fminDefault = 10;
let dbmaxDefault = -27;
let dbminDefault = -60;
let highPassDefault = 10;
let lowPassDefault = 22050;
let circleScaleFactorDefault = 0.6;
// let numberOfBinsDefault = 10;
let volumeDefault = 1;

// Presets holding default parameters and songs
// [name, fmax, fmin, dbmax, dbmin, highPass, lowPass, circleScaleFactor, NOT USED numberOfBins, songFile (pushed in preload)]
let presetAtlanticDolphin = ['AtlanticDolphin', 24000, 2000, -37, -72, 1000, 22050, 0.5]; //, 10];
let presetMinke = ['Minke', 2000, 10, -35, -60, 10, 22050, 0.6]; //, 10];
let presetHumpback = ['Humpback', 2000, 10, -30, -50, 10, 22050, 0.6]; //, 10];
let presetBeakedDolphin = ['BeakedDolphin', 24000, 1000, -47, -70, 3000, 22050, 0.5]; //, 10];
let presetBeardedSeal = ['BeardedSeal', 5000, 10, -27, -70, 10, 22050, 0.5]; //, 10];
let presetHarborPorpoise = ['HarborPorpoise', 24000, 11000, -68, -87, 10000, 22050, 0.5]; //, 10];
let presetWeddelSeal = ['WeddellSeal', 7500, 10, -38, -70, 10, 22050, 0.5]; //, 10];

let presets = [presetAtlanticDolphin, presetMinke, presetHumpback, presetBeakedDolphin, presetBeardedSeal, presetHarborPorpoise, presetWeddelSeal];

let soundButtonArray = Array(presets.length);
let currentPlayingSoundIndex = -1;
let currentSoundFile;

let numberOfBins = 1024;
let startDegree = 0;
let degreesPerFrame = 1;
let wholeSoundModeFlag = false;
let nyquist;
let fft;
let fftSmoothing = 0.4;
let eraserLineThickness = 8;
let highPass, lowPass;

let fullSoundFrameRate = 20;

let mic;

function preload() {
	presetAtlanticDolphin.push(loadSound('assets/sounds/atlantic-spotted-dolphin.mp3'));
	presetMinke.push(loadSound('assets/sounds/minke-whale.mp3'));
	presetHumpback.push(loadSound('assets/sounds/humpback-whale.mp3'));
	presetBeakedDolphin.push(loadSound('assets/sounds/short-beaked-common-dolphin.mp3'));
	presetBeardedSeal.push(loadSound('assets/sounds/bearded-seal.mp3'));
	presetHarborPorpoise.push(loadSound('assets/sounds/harbor-porpoise.mp3'));
	presetWeddelSeal.push(loadSound('assets/sounds/weddell-seals.mp3'));
}

function setup() {

	// mimics the autoplay policy for google chrome
	getAudioContext().suspend();

	// Canvas
	createCanvas(windowWidth, windowHeight);
	background(0);

	colorMode(HSL);
	angleMode(DEGREES);

	// FFT object
	fft = new p5.FFT(fftSmoothing);

	mic = new p5.AudioIn();

	// Nyquist Hz value
	nyquist = sampleRate() / 2;

	circleScale = Math.min(windowWidth, windowHeight) * circleScaleFactorDefault;

	// ----- SETTINGS CHECKBOX -----
	showAdvancedCheckBox = createCheckbox('Show Settings', false);
	showAdvancedCheckBox.style('color', styleTextVisible);
	showAdvancedCheckBox.style('font-size', '15px');
	showAdvancedCheckBox.position(windowWidth - 300, 10);
	showAdvancedCheckBox.changed(advanceSettingsToggle);

	// ----- FMAX -----
	// Slider
	fmaxSlider = createSlider(10, nyquist, fmaxDefault).hide();
	fmaxSlider.position(showAdvancedCheckBox.x + 20, showAdvancedCheckBox.y + 50);
	fmaxSlider.input(sliderValueChanged);
	// Input
	fmaxInput = createInput(fmaxSlider.value()).hide();
	fmaxInput.input(sliderValueInput);
	fmaxInput.size(40);
	fmaxInput.position(fmaxSlider.x + 180, fmaxSlider.y);
	fmaxInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	fmaxText = createDiv('Max Frequency (Hz)');
	fmaxText.position(fmaxSlider.x + 5, fmaxSlider.y - 15);
	fmaxText.style('display', 'none');
	fmaxText.style('color', styleTextVisible);


	// ----- FMIN -----
	// Slider
	fminSlider = createSlider(10, nyquist, fminDefault).hide();
	fminSlider.position(showAdvancedCheckBox.x + 20, fmaxSlider.y + 50);
	fminSlider.input(sliderValueChanged);
	// Input
	fminInput = createInput(fminSlider.value()).hide();
	fminInput.input(sliderValueInput);
	fminInput.size(40);
	fminInput.position(fminSlider.x + 180, fminSlider.y);
	fminInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	fminText = createDiv('Min Frequency (Hz)');
	fminText.position(fminSlider.x + 5, fminSlider.y - 15);
	fminText.style('display', 'none');
	fminText.style('color', styleTextVisible);

	// ----- DBMAX -----
	// Slider
	dbmaxSlider = createSlider(-140, 0, dbmaxDefault).hide();
	dbmaxSlider.position(showAdvancedCheckBox.x + 20, fminSlider.y + 50);
	dbmaxSlider.input(sliderValueChanged);
	// Input
	dbmaxInput = createInput(dbmaxSlider.value()).hide();
	dbmaxInput.input(sliderValueInput);
	dbmaxInput.size(40);
	dbmaxInput.position(dbmaxSlider.x + 180, dbmaxSlider.y);
	dbmaxInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	dbmaxText = createDiv('Max Amplitude (dB)');
	dbmaxText.position(dbmaxSlider.x + 5, dbmaxSlider.y - 15);
	dbmaxText.style('display', 'none');
	dbmaxText.style('color', styleTextVisible);

	// ----- DBMIN -----
	// Slider
	dbminSlider = createSlider(-140, 0, dbminDefault).hide();
	dbminSlider.position(showAdvancedCheckBox.x + 20, dbmaxSlider.y + 50);
	dbminSlider.input(sliderValueChanged);
	// Input
	dbminInput = createInput(dbminSlider.value()).hide();
	dbminInput.input(sliderValueInput);
	dbminInput.size(40);
	dbminInput.position(dbminSlider.x + 180, dbminSlider.y);
	dbminInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	dbminText = createDiv('Min Amplitude (dB)');
	dbminText.position(dbminSlider.x + 5, dbminSlider.y - 15);
	dbminText.style('display', 'none');
	dbminText.style('color', styleTextVisible);

	// ----- HIGHPASS -----
	highPass = new p5.HighPass();
	// Slider
	highPassSlider = createSlider(10, 22050, highPassDefault).hide();
	highPassSlider.position(showAdvancedCheckBox.x + 20, dbminSlider.y + 50);
	highPassSlider.input(sliderValueChanged);
	// Input
	highPassInput = createInput(highPassSlider.value()).hide();
	highPassInput.input(sliderValueInput);
	highPassInput.size(40);
	highPassInput.position(highPassSlider.x + 180, highPassSlider.y);
	highPassInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	highPassText = createDiv('HighPass Filter (Hz)');
	highPassText.position(highPassSlider.x + 5, highPassSlider.y - 15);
	highPassText.style('display', 'none');
	highPassText.style('color', styleTextVisible);

	// ----- LOWPASS -----
	lowPass = new p5.LowPass();
	// Slider
	lowPassSlider = createSlider(10, 22050, lowPassDefault).hide();
	lowPassSlider.position(showAdvancedCheckBox.x + 20, highPassSlider.y + 50);
	lowPassSlider.input(sliderValueChanged);
	// Input
	lowPassInput = createInput(lowPassSlider.value()).hide();
	lowPassInput.input(sliderValueInput);
	lowPassInput.size(40);
	lowPassInput.position(lowPassSlider.x + 180, lowPassSlider.y);
	lowPassInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	lowPassText = createDiv('LowPass Filter (Hz)');
	lowPassText.position(lowPassSlider.x + 5, lowPassSlider.y - 15);
	lowPassText.style('display', 'none');
	lowPassText.style('color', styleTextVisible);

	// ----- CIRCLE SCALE FACTOR -----
	// Slider
	circleScaleFactorSlider = createSlider(0.1, 0.6, circleScaleFactorDefault, 0.1).hide();
	circleScaleFactorSlider.position(showAdvancedCheckBox.x + 20, lowPassSlider.y + 50);
	circleScaleFactorSlider.input(sliderValueChanged);
	// Input
	circleScaleFactorInput = createInput(circleScaleFactorSlider.value()).hide();
	circleScaleFactorInput.input(sliderValueInput);
	circleScaleFactorInput.size(40);
	circleScaleFactorInput.position(circleScaleFactorSlider.x + 180, circleScaleFactorSlider.y);
	circleScaleFactorInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	circleScaleFactorText = createDiv('Circle Scale (0.1 - 0.6)');
	circleScaleFactorText.position(circleScaleFactorSlider.x + 5, circleScaleFactorSlider.y - 15);
	circleScaleFactorText.style('display', 'none');
	circleScaleFactorText.style('color', styleTextVisible);

	/*// ----- NUMBER OF BINS -----
	// Slider
	numberOfBinsSlider = createSlider(7, 12, numberOfBinsDefault).hide();
	numberOfBinsSlider.position(showAdvancedCheckBox.x + 20, circleScaleFactorSlider.y + 50);
	numberOfBinsSlider.input(sliderValueChanged);
	// Input
	numberOfBinsInput = createInput(Math.pow(2, numberOfBinsSlider.value())).hide();
	numberOfBinsInput.input(sliderValueInput);
	numberOfBinsInput.size(40);
	numberOfBinsInput.position(numberOfBinsSlider.x + 180, numberOfBinsSlider.y);
	numberOfBinsInput.elt.onkeypress = function(e){
    sliderValueInput(e);
  }
	// Text
	numberOfBinsText = createDiv('Number of FFT Bins');
	numberOfBinsText.position(numberOfBinsSlider.x+5, numberOfBinsSlider.y-15);
	numberOfBinsText.style('display', 'none');
	numberOfBinsText.style('color', styleTextVisible);*/

	// N.B. : NUMBER OF BINS SLIDER AND INPUT TREATED SEPARATELY BECAUSE IT HAS TO BE A POWER OF 2

	// ----- VOLUME -----
	// Slider
	volumeSlider = createSlider(0, 5, volumeDefault, 0.1).hide();
	volumeSlider.position(showAdvancedCheckBox.x + 20, circleScaleFactorSlider.y + 50);
	volumeSlider.input(sliderValueChanged);
	// Input
	volumeInput = createInput(volumeSlider.value()).hide();
	volumeInput.input(sliderValueInput);
	volumeInput.size(40);
	volumeInput.position(volumeSlider.x + 180, volumeSlider.y);
	volumeInput.elt.onkeypress = function (e) {
		sliderValueInput(e);
	}
	// Text
	volumeText = createDiv('Volume (0 - 5)');
	volumeText.position(volumeSlider.x + 5, volumeSlider.y - 15);
	volumeText.style('display', 'none');
	volumeText.style('color', styleTextVisible);

	sliderArray = [fmaxSlider,
		fminSlider,
		dbmaxSlider,
		dbminSlider,
		highPassSlider,
		lowPassSlider,
		circleScaleFactorSlider,
		volumeSlider
	];

	inputArray = [fmaxInput,
		fminInput,
		dbmaxInput,
		dbminInput,
		highPassInput,
		lowPassInput,
		circleScaleFactorInput,
		volumeInput
	];

	textArray = [fmaxText,
		fminText,
		dbmaxText,
		dbminText,
		highPassText,
		lowPassText,
		circleScaleFactorText,
		volumeText
	];
	// numberOfBinsText];

	// ----- COLOR SCHEME -----
	// Drop down
	colorSchemeDropDown = createSelect().hide();
	colorSchemeDropDown.position(showAdvancedCheckBox.x + 20, volumeSlider.y + 55); //numberOfBinsSlider.y + 55);
	colorSchemeDropDown.option('Jet');
	colorSchemeDropDown.option('Inverse Jet');
	colorSchemeDropDown.option('Grayscale');
	colorSchemeDropDown.option('Viridis');
	colorSchemeDropDown.option('Warm');
	colorSchemeDropDown.option('Winter');
	colorSchemeDropDown.changed(colorSchemeChanged);
	// Text
	colorSchemeText = createDiv('Color Scheme :');
	colorSchemeText.position(colorSchemeDropDown.x, colorSchemeDropDown.y - 25);
	colorSchemeText.style('display', 'none');
	colorSchemeText.style('color', styleTextVisible);

	// ----- RESET TO DEFAULT -----
	// Button
	resetToDefaultBtn = createButton('Reset to Default').hide();
	resetToDefaultBtn.mousePressed(resetToDefault);
	resetToDefaultBtn.position(colorSchemeDropDown.x, colorSchemeDropDown.y + 40);

	// ----- USE MICROPHONE -----
	// Button
	useMicCheckbox = createCheckbox('Use Microphone', false);
	useMicCheckbox.style('color', '#ffffff');
	useMicCheckbox.style('font-size', '15px');
	useMicCheckbox.hide();
	useMicCheckbox.position(colorSchemeDropDown.x, resetToDefaultBtn.y + 40);
	useMicCheckbox.changed(useMicrophoneToggle);

	// ----- WHOLE SOUND MODE -----
	wholeSoundModeCheckbox = createCheckbox('Whole sound mode', false);
	wholeSoundModeCheckbox.style('color', '#ffffff');
	wholeSoundModeCheckbox.style('font-size', '15px');
	wholeSoundModeCheckbox.hide();
	wholeSoundModeCheckbox.position(colorSchemeDropDown.x, useMicCheckbox.y + 40);
	wholeSoundModeCheckbox.changed(wholeSoundModeToggle);

	// ----- BROWSE BUTTON -----
	browseFileBtn = createFileInput(handleFile);
	browseFileBtn.position(10, showAdvancedCheckBox.y);

	// ----- PLAY/PAUSE BUTTON -----
	playPauseBtn = createButton('Play/Pause');
	playPauseBtn.mousePressed(playPause);
	playPauseBtn.position(browseFileBtn.x, browseFileBtn.y + 30);

	// ----- PRESET SOUND BUTTONS -----
	for (let i = 0; i < soundButtonArray.length; i++) {
		soundButtonArray[i] = createButton(presets[i][0]);
		soundButtonArray[i].mousePressed(() => playSound(i));

		if (i == 0) {
			soundButtonArray[i].position(playPauseBtn.x, playPauseBtn.y + 50);
		} else {
			soundButtonArray[i].position(playPauseBtn.x, soundButtonArray[i - 1].y + 22);
		}
	}
}

function draw() {

	/*numberOfBins = numberOfBinsInput.value();
	numberOfBinsEraser = 1024;*/
	circleScale = Math.min(windowWidth, windowHeight) * circleScaleFactorInput.value();
	circleScaleEraser = Math.min(windowWidth, windowHeight) * circleScaleFactorSlider.elt.max;

	let spectrum = fft.analyze(numberOfBins, "dB");

	for (i = 0; i < spectrum.length; i++) {
		// ---------- ERASER LINES ----------
		// Only draw these if we are not using wholeSoundMode
		if (wholeSoundModeFlag == false) {
			/*let eraserRadius = map(i, 0, numberOfBins, 40, circleScale, true); // Hz from 1 to 23kHz -> 10 to 100 radius
	  	let xE1 = width/2 + (eraserRadius * cos(startDegree+3*degreesPerFrame));
			let yE1 = height/2 + (eraserRadius * sin(startDegree+3*degreesPerFrame));
			let xE2 = width/2 + (eraserRadius * cos(startDegree+4*degreesPerFrame));
			let yE2 = height/2 + (eraserRadius * sin(startDegree+4*degreesPerFrame));
		  strokeWeight(eraserLineThickness);
			stroke(0);
			line(xE1, yE1, xE2, yE2);*/

			if (i % 9 == 0) {
				let eraserRadius = map(i, 0, numberOfBins, 40, circleScaleEraser * 2, true); // Hz from 1 to 23kHz -> 10 to 100 radius
				noFill();
				stroke(0);
				strokeWeight(eraserLineThickness);

				arc(width / 2, height / 2, eraserRadius, eraserRadius, startDegree + 8 * degreesPerFrame, startDegree + 9 * degreesPerFrame);
			}
		}

		//  ---------- SOUND LINES ----------
		// Sound is above threshold, draw it !
		if (spectrum[i] > dbminSlider.value()) {
			let peakFrequency = i * (nyquist / numberOfBins);
			// Frequency is within range, draw it !
			if ((peakFrequency => fminSlider.value()) && (peakFrequency <= fmaxSlider.value())) {
				// let peakBinIndex = findClosestFrequencyBinIndex(peakFrequency);

				// Figure out where and how to draw the line
				// let radius = map(frequencyBins[peakBinIndex], fminSlider.value(), fmaxSlider.value(),  50, circleScale, true);
				let radius = map(peakFrequency, fminSlider.value(), fmaxSlider.value(), 40, circleScale, true);
				// let radius = map(i, 0, spectrum.length,  40, circleScale, true);
				let thickness = map(spectrum[i], dbminSlider.value(), dbmaxSlider.value(), 0.2, 2, true);
				let x1 = width / 2 + round(radius * cos(startDegree));
				let y1 = height / 2 + round(radius * sin(startDegree));
				let x2 = width / 2 + round(radius * cos(startDegree + 1 * degreesPerFrame));
				let y2 = height / 2 + round(radius * sin(startDegree + 1 * degreesPerFrame));

				// Finding colors according to color scheme
				let colorHue = map(spectrum[i], dbminSlider.value(), dbmaxSlider.value(), colorHueLow, colorHueHigh, true);
				let colorSaturation = map(spectrum[i], dbminSlider.value(), dbmaxSlider.value(), colorSaturationLow, colorSaturationHigh, true);
				let colorBrightness = map(spectrum[i], dbminSlider.value(), dbmaxSlider.value(), colorBrightnessLow, colorBrightnessHigh, true);
				strokeWeight(thickness);

				if (colorSchemeDropDown.value() == 'Grayscale') {
					stroke(colorHue);
				} else {
					stroke(colorHue, colorSaturation, colorBrightness);
				}

				// Line
				line(x1, y1, x2, y2);
			}
		}
	}

	// Go around the circle drawing
	if (startDegree >= 360) {
		startDegree = 0;
	} else {
		startDegree += degreesPerFrame;
	}
}

function mousePressed() {
	userStartAudio();
}

function windowResized() {
	//console.log('windowResized : ' + windowWidth, windowHeight);
	resizeCanvas(windowWidth, windowHeight);
	background(0);
	circleScale = Math.min(windowWidth, windowHeight) * circleScaleFactorInput.value();

	// UI Reposition
	showAdvancedCheckBox.position(windowWidth - 300, 10);
	fmaxSlider.position(showAdvancedCheckBox.x + 20, showAdvancedCheckBox.y + 50);
	fmaxInput.position(fmaxSlider.x + 180, fmaxSlider.y);
	fmaxText.position(fmaxSlider.x + 5, fmaxSlider.y - 15);
	fminSlider.position(showAdvancedCheckBox.x + 20, fmaxSlider.y + 50);
	fminInput.position(fminSlider.x + 180, fminSlider.y);
	fminText.position(fminSlider.x + 5, fminSlider.y - 15);
	dbmaxSlider.position(showAdvancedCheckBox.x + 20, fminSlider.y + 50);
	dbmaxInput.position(dbmaxSlider.x + 180, dbmaxSlider.y);
	dbmaxText.position(dbmaxSlider.x + 5, dbmaxSlider.y - 15);
	dbminSlider.position(showAdvancedCheckBox.x + 20, dbmaxSlider.y + 50);
	dbminInput.position(dbminSlider.x + 180, dbminSlider.y);
	dbminText.position(dbminSlider.x + 5, dbminSlider.y - 15);
	highPassSlider.position(showAdvancedCheckBox.x + 20, dbminSlider.y + 50);
	highPassInput.position(highPassSlider.x + 180, highPassSlider.y);
	highPassText.position(highPassSlider.x + 5, highPassSlider.y - 15);
	lowPassSlider.position(showAdvancedCheckBox.x + 20, highPassSlider.y + 50);
	lowPassInput.position(lowPassSlider.x + 180, lowPassSlider.y);
	lowPassText.position(lowPassSlider.x + 5, lowPassSlider.y - 15);
	circleScaleFactorSlider.position(showAdvancedCheckBox.x + 20, lowPassSlider.y + 50);
	circleScaleFactorInput.position(circleScaleFactorSlider.x + 180, circleScaleFactorSlider.y);
	circleScaleFactorText.position(circleScaleFactorSlider.x + 5, circleScaleFactorSlider.y - 15);
	/*numberOfBinsSlider.position(showAdvancedCheckBox.x + 20, circleScaleFactorSlider.y + 50);
	numberOfBinsInput.position(numberOfBinsSlider.x + 180, numberOfBinsSlider.y);
	numberOfBinsText.position(numberOfBinsSlider.x+5, numberOfBinsSlider.y-15);*/
	volumeSlider.position(showAdvancedCheckBox.x + 20, circleScaleFactorSlider.y + 50);
	volumeInput.position(volumeSlider.x + 180, volumeSlider.y);
	volumeText.position(volumeSlider.x + 5, volumeSlider.y - 15);
	colorSchemeDropDown.position(showAdvancedCheckBox.x + 20, volumeSlider.y + 55); //numberOfBinsSlider.y + 55);
	colorSchemeText.position(colorSchemeDropDown.x, colorSchemeDropDown.y - 25);
	resetToDefaultBtn.position(colorSchemeDropDown.x, colorSchemeDropDown.y + 40);
	useMicCheckbox.position(colorSchemeDropDown.x, resetToDefaultBtn.y + 40);
	wholeSoundModeCheckbox.position(colorSchemeDropDown.x, useMicCheckbox.y + 40);
	browseFileBtn.position(10, showAdvancedCheckBox.y);
	playPauseBtn.position(browseFileBtn.x, browseFileBtn.y + 30);

	for (var i = 0; i < soundButtonArray.length; i++) {
		if (i == 0) {
			soundButtonArray[i].position(playPauseBtn.x, playPauseBtn.y + 50);
		} else {
			soundButtonArray[i].position(playPauseBtn.x, soundButtonArray[i - 1].y + 22);
		}
	}
}

function advanceSettingsToggle(_fullScreenToggle) {
	console.log('advanceSettingsToggle : ' + showAdvancedCheckBox.checked());

	fullScreenToggle = _fullScreenToggle || false;

	// Checkbox is ticked : show it all !
	if ((showAdvancedCheckBox.checked() == true)) {
		for (var i = 0; i < sliderArray.length; i++) {
			sliderArray[i].show();
		}
		// numberOfBinsSlider.show();

		for (var i = 0; i < inputArray.length; i++) {
			inputArray[i].show();
		}
		// numberOfBinsInput.show();

		for (var i = 0; i < textArray.length; i++) {
			textArray[i].style('display', 'inline');
		}

		colorSchemeDropDown.show();
		colorSchemeText.style('display', 'inline');

		resetToDefaultBtn.show();

		useMicCheckbox.show();

		wholeSoundModeCheckbox.show();
	}

	if ((showAdvancedCheckBox.checked() == false) | (fullScreenToggle == true)) {
		for (var i = 0; i < sliderArray.length; i++) {
			sliderArray[i].hide();
		}
		// numberOfBinsSlider.hide();

		for (var i = 0; i < inputArray.length; i++) {
			inputArray[i].hide();
		}
		// numberOfBinsInput.hide();

		for (var i = 0; i < textArray.length; i++) {
			textArray[i].style('display', 'none');
		}

		colorSchemeDropDown.hide();
		colorSchemeText.style('display', 'none');

		resetToDefaultBtn.hide();

		useMicCheckbox.hide();

		wholeSoundModeCheckbox.hide();
	}

	if (fullScreenToggle == true) {
		showAdvancedCheckBox.hide();

		for (let i = 0; i < soundButtonArray.length; i++) {
			soundButtonArray[i].hide();
		}

		playPauseBtn.hide();

		browseFileBtn.hide();
	} else {
		showAdvancedCheckBox.show();

		for (let i = 0; i < soundButtonArray.length; i++) {
			soundButtonArray[i].show();
		}

		playPauseBtn.show();

		browseFileBtn.show();
	}
}

function sliderValueChanged() {
	// ---------- SLIDER CONTROL ----------
	for (var i = 0; i < sliderArray.length; i++) {
		inputArray[i].value(sliderArray[i].value());
		fminSlider.value(constrain(fminSlider.value(), 0, fmaxSlider.value()));
		dbminSlider.value(constrain(dbminSlider.value(), -140, dbmaxSlider.value()));
		highPass.freq(constrain(highPassSlider.value(), 10, 22050));
		lowPass.freq(constrain(lowPassSlider.value(), 10, 22050));
	}
	// numberOfBinsInput.value(Math.pow(2, numberOfBinsSlider.value()));
	if (currentSoundFile && currentSoundFile.isPlaying()) {
		currentSoundFile.amp(volumeSlider.value(), 0.2);
	}
}

function sliderValueInput(e) {
	console.log('sliderValueInput');
	if (!e) e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode == '13') {
		// Only update on Enter Key hit
		for (var i = 0; i < sliderArray.length; i++) {
			inputArray[i].value(constrain(inputArray[i].value(), sliderArray[i].elt.min, sliderArray[i].elt.max));
			sliderArray[i].value(inputArray[i].value());
		}
		// numberOfBinsSlider.value(Math.log2(numberOfBinsInput.value()));
		// numberOfBinsInput.value(constrain(numberOfBinsInput.value(), Math.pow(2, numberOfBinsInput.elt.min), Math.pow(2, numberOfBinsInput.elt.max)));
		sliderValueChanged();
	}
}

function resetToDefault() {
	console.log('resetToDefault');
	fmaxSlider.value(fmaxDefault);
	fminSlider.value(fminDefault);
	dbmaxSlider.value(dbmaxDefault);
	dbminSlider.value(dbminDefault);
	highPassSlider.value(highPassDefault);
	lowPassSlider.value(lowPassDefault);
	circleScaleFactorSlider.value(circleScaleFactorDefault);
	// numberOfBinsSlider.value(numberOfBinsDefault);
	volumeSlider.value(volumeDefault);
	sliderValueChanged();
	sliderValueInput();
}

function colorSchemeChanged() {
	console.log('colorSchemeChanged : ' + colorSchemeDropDown.value());
	if (colorSchemeDropDown.value() == 'Jet') {
		colorMode(HSL);
		colorHueLow = 320;
		colorHueHigh = 0;
		colorSaturationLow = 46;
		colorSaturationHigh = 100;
		colorBrightnessLow = 10;
		colorBrightnessHigh = 50;
	}

	if (colorSchemeDropDown.value() == 'Inverse Jet') {
		colorMode(HSL);
		colorHueLow = 0;
		colorHueHigh = 320;
		colorSaturationLow = 100;
		colorSaturationHigh = 46;
		colorBrightnessLow = 50;
		colorBrightnessHigh = 10;
	}

	if (colorSchemeDropDown.value() == 'Grayscale') {
		colorMode(RGB);
		colorHueLow = 10;
		colorHueHigh = 255;
	}

	if (colorSchemeDropDown.value() == 'Viridis') {
		colorMode(HSL);
		colorHueLow = 290;
		colorHueHigh = 60;
		colorSaturationLow = 46;
		colorSaturationHigh = 100;
		colorBrightnessLow = 10;
		colorBrightnessHigh = 85;
	}

	if (colorSchemeDropDown.value() == 'Warm') {
		colorMode(HSL);
		colorHueLow = 0;
		colorHueHigh = 60;
		colorSaturationLow = 60;
		colorSaturationHigh = 100;
		colorBrightnessLow = 10;
		colorBrightnessHigh = 85;
	}

	if (colorSchemeDropDown.value() == 'Winter') {
		colorMode(HSL);
		colorHueLow = 311;
		colorHueHigh = 182;
		colorSaturationLow = 100;
		colorSaturationHigh = 100;
		colorBrightnessLow = 10;
		colorBrightnessHigh = 85;
	}
}

function handleFile(file) {
	console.log('handleFile');
	if (currentSoundFile && currentSoundFile.isPlaying()) {
		currentSoundFile.stop();
	}
	if (file.type === 'audio') {
		currentSoundFile = loadSound(file, fileLoaded);
		/*
				// Set default values
				fmaxDefault = 4300;
				fminDefault = 10;
				dbmaxDefault = -27;
				dbminDefault = -60;
				highPassDefault = 10;
				lowPassDefault = 22050;
				circleScaleFactorDefault = 0.6;
				numberOfBinsDefault = 10;
		resetToDefault();*/
	}
	background(0);
	loop();
}

function fileLoaded() {
	currentSoundFile.amp(volumeSlider.value(), 0.2);
	calculateDegreesPerFrame();
	if (wholeSoundModeFlag == true) {
		currentSoundFile._looping = false;
		currentSoundFile.play();
	} else {
		currentSoundFile.loop();
	}
	console.log(currentSoundFile);

	// Connect filters
	currentSoundFile.disconnect();
	currentSoundFile.connect(highPass);
	currentSoundFile.connect(lowPass);
}

function playSound(soundIndex) {
	console.log('playSound : ' + soundIndex);

	loop();

	let soundToPlayPreset = presets[soundIndex];
	let soundToPlayFile = soundToPlayPreset[presets[soundIndex].length - 1];

	// stop current playing sound if exists
	if (currentSoundFile && currentSoundFile.isPlaying()) {
		currentSoundFile.disconnect();
		currentSoundFile.stop();
	}

	/* // Set default values
	fmaxDefault = soundToPlayPreset[1];
	fminDefault = soundToPlayPreset[2];
	dbmaxDefault = soundToPlayPreset[3];
	dbminDefault = soundToPlayPreset[4];
	highPassDefault = soundToPlayPreset[5];
	lowPassDefault = soundToPlayPreset[6];
	circleScaleFactorDefault = soundToPlayPreset[7];
	// numberOfBinsDefault = soundToPlayPreset[8];
	resetToDefault(); */

	// Set default values
	fmaxSlider.value(soundToPlayPreset[1]);
	fminSlider.value(soundToPlayPreset[2]);
	dbmaxSlider.value(soundToPlayPreset[3]);
	dbminSlider.value(soundToPlayPreset[4]);
	highPassSlider.value(soundToPlayPreset[5]);
	lowPassSlider.value(soundToPlayPreset[6]);
	circleScaleFactorSlider.value(soundToPlayPreset[7]);
	sliderValueChanged();
	sliderValueInput();

	// Clear screen
	background(0);

	// Connect to filters
	currentSoundFile = soundToPlayFile; // Sound to play becomes current sound
	currentSoundFile.disconnect();
	currentSoundFile.connect(highPass);
	currentSoundFile.connect(lowPass);

	calculateDegreesPerFrame();

	// loop
	currentSoundFile.amp(volumeSlider.value(), 0.2);
	if (wholeSoundModeFlag == true) {
		currentSoundFile._looping = false;
		currentSoundFile.play();
	} else {
		currentSoundFile.loop();
	}
}

function playPause() {
	console.log('playPause');

	if (currentSoundFile && currentSoundFile.isPlaying()) {
		calculateDegreesPerFrame();
		currentSoundFile.pause();
		noLoop();
	} else {
		calculateDegreesPerFrame();
		if (wholeSoundModeFlag == true) {
			currentSoundFile._looping = false;
			currentSoundFile.play();
		} else {
			currentSoundFile.loop();
		}
		loop();
	}
}

function useMicrophoneToggle() {
	console.log('useMicCheckbox :>> ', useMicCheckbox.checked());

	if (useMicCheckbox.checked()) {
		if (currentSoundFile && currentSoundFile.isPlaying()) {
			currentSoundFile.stop();
		}
		mic.start();
		fft.setInput(mic);
	} else {
		mic.stop();
		fft.setInput();
	}
}

function wholeSoundModeToggle() {
	console.log('wholeSoundModeToggle');
	wholeSoundModeFlag = wholeSoundModeCheckbox.checked();
	background(0);

	if (currentSoundFile && currentSoundFile.isPlaying()) {
		calculateDegreesPerFrame();
		currentSoundFile.stop();
		currentSoundFile.jump(0);
		if (wholeSoundModeFlag == true) {
			currentSoundFile._looping = false;
			currentSoundFile.play();
		} else {
			currentSoundFile.loop();
		}
	}

	if (wholeSoundModeFlag == true) {
		frameRate(fullSoundFrameRate);
	} else {
		frameRate(144);
		degreesPerFrame = 1;
	}
}

function calculateDegreesPerFrame() {
	if (wholeSoundModeFlag == true) {
		degreesPerFrame = 360 / (currentSoundFile.duration() * fullSoundFrameRate);
	} else {
		degreesPerFrame = 1;
	}
	console.log('calculateDegreesPerFrame : ' + degreesPerFrame);
}

function keyPressed() {
	if (key === 'f') {
		let fs = fullscreen();
		fullscreen(!fs);
		advanceSettingsToggle(!fs);
	}
}
