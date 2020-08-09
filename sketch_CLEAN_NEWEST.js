let fontInconsolata;

const styleTextHidden = '#000000';
const styleTextVisible = '#ffffff';

let showAdvancedCheckBox;	// Shows/Hides all advanced settings

// SLIDERS
let fmaxSlider;
let fminSlider;
let dbmaxSlider;
let dbminSlider;
let highPassSlider;
let lowPassSlider;

let sliderArray = [];

// SLIDER INPUTS
let fmaxInput;
let fminInput;
let dbmaxInput;
let dbminInput;
let highPassInput;
let lowPassInput;

let inputArray = [];

// SLIDER TEXTS
let fmaxText;
let fminText;
let dbmaxText;
let dbminText;
let highPassText;
let lowPassText;

let textArray = [];


// Color scheme dropdown
let colourSchemeDropDown;
let colourSchemeText;

// BUTTONS
let resetToDefaultBtn;
let browseFileBtn;
let playPauseBtn;

// Presets holding default parameters and songs
// REMOVE MUSIC AFTER
// [name, amplitudeThreshold, maxAmplitudeExpectancy, scaleMultiplier, eraserLineThickness, songFile]
let presetTempest 				= ['Tempest',-70, -35, 1, 8];
let presetAtlanticDolphin = ['AtlanticDolphin',-70, -50, 1, 8];
let presetMinke 					= ['Minke',-70, -50, 1, 8];
let presetDontBeSad 			= ['DontBeSad',-70, -30, 1, 8];
let presetHumpback 				= ['Humpback',-70, -30, 1, 8];
let presetBeakedDolphin 	= ['BeakedDolphin',-70, -65, 1, 8];
let presetJekyll 					= ['Jekyll',-70, -35, 1, 8];
let presetShineOn 				= ['ShineOn',-70, -20, 1, 8];
let presetEcstasyOfGold		= ['EcstasyOfGold',-70, -30, 1, 8];

let presets = [presetTempest, presetAtlanticDolphin, presetMinke, presetDontBeSad, presetHumpback, presetBeakedDolphin, presetJekyll, presetShineOn, presetEcstasyOfGold];

let songButtonArray = Array(presets.length);
let currentPlayingSongIndex = -1;

let customSoundFile;

let nyquist;



function preload() {	
  fontInconsolata = loadFont('assets/fonts/Inconsolata-Regular.otf');

}

function setup() {

  // mimics the autoplay policy for google chrome
  getAudioContext().suspend();

  // Canvas
  createCanvas(windowWidth,windowHeight);
  background(0);

	nyquist = sampleRate() / 2;

	showAdvancedCheckBox = createCheckbox('Show Advanced Settings', false);
	showAdvancedCheckBox.style('color', '#ffffff');
	showAdvancedCheckBox.style('font-size', '20px');
	showAdvancedCheckBox.position(windowWidth - 300, 10);
	showAdvancedCheckBox.changed(advanceSettingsToggle);

	// ----- FMAX -----
	// Slider
	fmaxSlider = createSlider(0, nyquist, nyquist).hide();
	fmaxSlider.position(showAdvancedCheckBox.x + 20, showAdvancedCheckBox.y + 50);
	// Input
	fmaxInput = createInput(fmaxSlider.value()).hide();
	fmaxInput.input(sliderValueInput);
	fmaxInput.size(40);
	fmaxInput.position(fmaxSlider.x + 180, fmaxSlider.y);
	// Text
	fmaxText = createDiv('Max Frequency (Hz)');
	fmaxText.position(fmaxSlider.x+5, fmaxSlider.y-15);
	fmaxText.style('color', styleTextHidden);


	// ----- FMIN -----
	// Slider
	fminSlider = createSlider(0, nyquist, 0).hide();
	fminSlider.position(showAdvancedCheckBox.x + 20, fmaxSlider.y + 50);
	// Input
	fminInput = createInput(fminSlider.value()).hide();
	fminInput.input(sliderValueInput);
	fminInput.size(40);
	fminInput.position(fminSlider.x + 180, fminSlider.y);
	// Text
	fminText = createDiv('Min Frequency (Hz)');
	fminText.position(fminSlider.x+5, fminSlider.y-15);
	fminText.style('color', styleTextHidden);

	// ----- DBMAX -----
	// Slider
	dbmaxSlider = createSlider(-90, -20, -40).hide();
	dbmaxSlider.position(showAdvancedCheckBox.x + 20, fminSlider.y + 50);
	// Input
	dbmaxInput = createInput(dbmaxSlider.value()).hide();
	dbmaxInput.input(sliderValueInput);
	dbmaxInput.size(40);
	dbmaxInput.position(dbmaxSlider.x + 180, dbmaxSlider.y);
	// Text
	dbmaxText = createDiv('Max Amplitude (dB)');
	dbmaxText.position(dbmaxSlider.x+5, dbmaxSlider.y-15);
	dbmaxText.style('color', styleTextHidden);

	// ----- DBMIN -----
	// Slider
	dbminSlider = createSlider(-90, -20, -70).hide();
	dbminSlider.position(showAdvancedCheckBox.x + 20, dbmaxSlider.y + 50);
	// Input
	dbminInput = createInput(dbminSlider.value()).hide();
	dbminInput.input(sliderValueInput);
	dbminInput.size(40);
	dbminInput.position(dbminSlider.x + 180, dbminSlider.y);
	// Text
	dbminText = createDiv('Min Amplitude (dB)');
	dbminText.position(dbminSlider.x+5, dbminSlider.y-15);
	dbminText.style('color', styleTextHidden);

	// ----- HIGHPASS -----
	// Slider
	highPassSlider = createSlider(10, 22050, 10).hide();
	highPassSlider.position(showAdvancedCheckBox.x + 20, dbminSlider.y + 50);
	// Input
	highPassInput = createInput(highPassSlider.value()).hide();
	highPassInput.input(sliderValueInput);
	highPassInput.size(40);
	highPassInput.position(highPassSlider.x + 180, highPassSlider.y);
	// Text
	highPassText = createDiv('HighPass Filter (Hz)');
	highPassText.position(highPassSlider.x+5, highPassSlider.y-15);
	highPassText.style('color', styleTextHidden);

	// ----- LOWPASS -----
	// Slider
	lowPassSlider = createSlider(10, 22050, 22050).hide();
	lowPassSlider.position(showAdvancedCheckBox.x + 20, highPassSlider.y + 50);
	// Input
	lowPassInput = createInput(lowPassSlider.value()).hide();
	lowPassInput.input(sliderValueInput);
	lowPassInput.size(40);
	lowPassInput.position(lowPassSlider.x + 180, lowPassSlider.y);
	// Text
	lowPassText = createDiv('LowPass Filter (Hz)');
	lowPassText.position(lowPassSlider.x+5, lowPassSlider.y-15);
	lowPassText.style('color', styleTextHidden);
	
	sliderArray = [fmaxSlider, 
							 	fminSlider, 
							 	dbmaxSlider, 
							 	dbminSlider, 
							 	highPassSlider, 
							 	lowPassSlider];	

	inputArray = [fmaxInput, 
								fminInput, 
								dbmaxInput, 
								dbminInput, 
								highPassInput, 
								lowPassInput];

	textArray = [fmaxText, 
							fminText, 
							dbmaxText, 
							dbminText, 
							highPassText, 
							lowPassText];

	// ----- COLOR SCHEME -----
	// Drop down
	colourSchemeDropDown = createSelect().hide();
	colourSchemeDropDown.position(showAdvancedCheckBox.x + 20, lowPassSlider.y + 55);
	colourSchemeDropDown.option('ALLISON');
	colourSchemeDropDown.option('PLEASE');
	colourSchemeDropDown.option('FILL');
	colourSchemeDropDown.option('THIS');
	colourSchemeDropDown.option('IN');
	colourSchemeDropDown.changed(colourSchemeChanged);
	// Text
	colourSchemeText = createDiv('Color Scheme :');
	colourSchemeText.position(colourSchemeDropDown.x, colourSchemeDropDown.y-25);
	colourSchemeText.style('color', styleTextHidden);

	// ----- RESET TO DEFAULT -----
	// Button
	resetToDefaultBtn = createButton('Reset to Default').hide();
	resetToDefaultBtn.mousePressed(resetToDefault);
	resetToDefaultBtn.position(colourSchemeDropDown.x, colourSchemeDropDown.y+40)

	// ----- BROWSE BUTTON -----
	browseFileBtn = createFileInput(handleFile);
  browseFileBtn.position(10, showAdvancedCheckBox.y);

}

function draw() {
	// ---------- SLIDER CONTROL ----------
  for (var i = 0; i < sliderArray.length; i++) {
  	inputArray[i].value(sliderArray[i].value());
  }
  fminSlider.value(constrain(fminSlider.value(), 0, fmaxSlider.value()));
  dbminSlider.value(constrain(dbminSlider.value(), -90, dbmaxSlider.value()));

}

function mousePressed() {
  userStartAudio();
}

function advanceSettingsToggle() {
	console.log('advanceSettingsToggle : ' + showAdvancedCheckBox.checked());

	// Checkbox is ticked : show it all !
	if (showAdvancedCheckBox.checked() == true) {
		for (var i = 0; i < sliderArray.length; i++) {
			sliderArray[i].show();
		}

		for (var i = 0; i < inputArray.length; i++) {
			inputArray[i].show();
		}

		for (var i = 0; i < textArray.length; i++) {
			textArray[i].style('color', styleTextVisible);
		}

		colourSchemeDropDown.show();		
		colourSchemeText.style('color', styleTextVisible);

		resetToDefaultBtn.show();

	} else {
		for (var i = 0; i < sliderArray.length; i++) {
			sliderArray[i].hide();
		}

		for (var i = 0; i < inputArray.length; i++) {
			inputArray[i].hide();
		}

		for (var i = 0; i < textArray.length; i++) {
			textArray[i].style('color', styleTextHidden);
		}

		colourSchemeDropDown.hide();		
		colourSchemeText.style('color', styleTextHidden);

		resetToDefaultBtn.hide();
	}

}

function sliderValueInput(){
	console.log('sliderValueInput');
  for (var i = 0; i < sliderArray.length; i++) {
  	sliderArray[i].value(inputArray[i].value());
  }
}

function colourSchemeChanged() {
	console.log('colourSchemeChanged : ' + colourSchemeDropDown.value());
}

function resetToDefault() {
	console.log('resetToDefault');
	fmaxSlider.value(nyquist);
	fminSlider.value(0);
	dbmaxSlider.value(-40);
	dbminSlider.value(-70);
	highPassSlider.value(10);
	lowPassSlider.value(22050);
}

function handleFile(file){
	console.log('handleFile');
	if (file.type === 'audio') {
		customSoundFile = loadSound(file, fileLoaded);
	}
}

function fileLoaded() {
	customSoundFile.amp(1);
	customSoundFile.play();
	console.log(customSoundFile);
}