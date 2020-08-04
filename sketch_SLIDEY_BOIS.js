let fft;
let soundPlayingFlag = false;
let numberOfBins = 1024;
let amplitudeThreshold = -100;		// SLIDER IN FUTURE
let nyquist;
let frequencyRanges = [1, 65.4, 196, 440, 1318, 4186, 20000];
let maxRadiusArray = Array(frequencyRanges.length);
let maxCircleRadius;
let currentDegree = 0;
let deltaDegree = 1;
let radiusSliderArray = Array(maxRadiusArray.length - 1);
let radiusInputArray = Array(radiusSliderArray.length);
let playButton, sliderValueButton;

function preload(){
  //sound = loadSound('assets/sounds/meow.wav');
  //sound = loadSound('assets/sounds/sin_440Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/sin_4400Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/JoshWoodward-CS-NoVox-10-HeyRuth.mp3');humpback-whale.mp3
  //sound = loadSound('assets/sounds/humpback-whale.mp3');
  //sound = loadSound('assets/sounds/minke-whale.mp3');
  //sound = loadSound('assets/sounds/Tempest.mp3');
  sound = loadSound('assets/sounds/1-02 Don\'t Be Sad.mp3');		// CHANGE THIS  
  //sound = loadSound('assets/sounds/sin_1000Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/short-beaked-common-dolphin.mp3');
  //sound = loadSound('assets/sounds/atlantic-spotted-dolphin.mp3');
  //sound = loadSound('assets/sounds/white_noise.wav');
}

// ---------------------------------
// ------------- SETUP -------------
// ---------------------------------
function setup(){
  // mimics the autoplay policy
  getAudioContext().suspend();

  // Canvas
  createCanvas(windowWidth,windowHeight);
  background(0);

  // FFT object
  fft = new p5.FFT();

  // Start sound @ 0 volume
  sound.amp(0);
  sound.loop();

  // Nyquist Hz value
	nyquist = sampleRate() / 2;

	maxCircleRadius = Math.min(windowWidth,windowHeight);

	let defaultDeltaRadius = maxCircleRadius / maxRadiusArray.length;

	// Default linear radii for our ranges.
	for (var i = 0; i < maxRadiusArray.length; i++) {
		maxRadiusArray[i] = (i) * defaultDeltaRadius;
	}

	for (var i = 0; i < radiusSliderArray.length; i++) {
		radiusSliderArray[i] = createSlider(0, maxCircleRadius, maxRadiusArray[i+1]);
		radiusSliderArray[i].position(10, 15*(i+1));
	}

	for (var i = 0; i < radiusInputArray.length; i++) {
		radiusInputArray[i] = createInput(radiusSliderArray[i].value());
		radiusInputArray[i].input(sliderValueInput);
		radiusInputArray[i].position(radiusSliderArray[i].x + 180, radiusSliderArray[i].y);
	}

	// Play/Pause playButton
	playButton = createButton('Play / Pause');
	playButton.mousePressed(toggleSound);
	playButton.position(10,radiusSliderArray[radiusSliderArray.length - 1].y + 20);

	sliderValueButton = createButton('Log sliders');
	sliderValueButton.mousePressed(logSliders);
	sliderValueButton.position(playButton.x,playButton.y + 20);

}

// --------------------------------
// ------------- DRAW -------------
// --------------------------------
function draw(){
  angleMode(DEGREES);
  colorMode(HSB);  

  /*background(0);
  for (var i = 0; i < maxRadiusArray.length; i++) {
  	strokeWeight(3);
		stroke(180, 100, 50);
		noFill();
  	ellipse(width/2, height/2, maxRadiusArray[i], maxRadiusArray[i]);
  }*/



  // ---------- ERASER LINES ----------
  strokeWeight(Math.ceil(maxCircleRadius / numberOfBins) + 1);
  stroke(0);
  for (var i = 0; i < numberOfBins; i++) {
  	let eraserRadius = map(i, 0, numberOfBins, 0, maxCircleRadius);
  	let xE1 = width/2 + round(eraserRadius * cos(currentDegree+2*deltaDegree));
		let yE1 = height/2 + round(eraserRadius * sin(currentDegree+2*deltaDegree));
		let xE2 = width/2 + round(eraserRadius * cos(currentDegree+3*deltaDegree));
		let yE2 = height/2 + round(eraserRadius * sin(currentDegree+3*deltaDegree));

		line(xE1, yE1, xE2, yE2);
  }


  // ---------- DRAW FREQUENCIES ----------
  let spectrum = fft.analyze(numberOfBins, "dB");

  let maxPeakValue = amplitudeThreshold;
  // Loop through spectrum
  for (var i = 0; i< spectrum.length; i++){
  	// Peak detected above threshold, draw it !
		if (spectrum[i] > amplitudeThreshold) {
			// Amplitude peak detected, keep it
			if (spectrum[i] > maxPeakValue) {
  			maxPeakValue = spectrum[i];
  		}

  		let peakFrequency = i * (nyquist / numberOfBins);
  		let thickness = 5;
			//let thickness = round(map(spectrum[i], amplitudeThreshold, maxPeakValue, 0.1, 3));	// dB from -140 to 0 -> 0 to 50 thickness		// CHANGE LAST NUMBER

			let peakFrequencyRange = findFrequencyRange(peakFrequency);	// [minF, maxF]
			let peakRadiusRange = findFrequencyMinMaxRadius(peakFrequency); // [minR, maxR]

			let radius = map(peakFrequency, peakFrequencyRange[0], peakFrequencyRange[1], peakRadiusRange[0], peakRadiusRange[1]);
			let x1 = width/2 + round(radius * cos(currentDegree));
			let y1 = height/2 + round(radius * sin(currentDegree));
			let x2 = width/2 + round(radius * cos(currentDegree+deltaDegree));
			let y2 = height/2 + round(radius * sin(currentDegree+deltaDegree));

			let colour = map(spectrum[i], amplitudeThreshold, maxPeakValue, 360, 0);

			strokeWeight(thickness);
			stroke(colour, 100, 50);
			line(x1, y1, x2, y2);

		}
  }

  // ---------- SLIDER CONTROL ----------
  for (var i = 0; i < radiusSliderArray.length; i++) {
  	radiusInputArray[i].value(radiusSliderArray[i].value());

		maxRadiusArray[i + 1] = radiusSliderArray[i].value();

		if (i > 0) {
			radiusSliderArray[i].value(
					constrain(
						radiusSliderArray[i].value(),
						radiusSliderArray[i - 1].value(),
						maxCircleRadius
					)
				);
		}


	}

  if (currentDegree >= 360) {
		currentDegree = 0;
	} else {
		currentDegree += deltaDegree;
	}
}

// ----------------------------------
// ------------- OTHERS -------------
// ----------------------------------
function mousePressed() {
  userStartAudio();
}

function toggleSound() {
	if (soundPlayingFlag) {
    soundPlayingFlag = false;
    sound.amp(0, 0.2);
  } else {
    soundPlayingFlag = true;
    sound.amp(1, 0.2);
  }
}

function logSliders(){
	console.log('SLIDERS : ');
	for (var i = 0; i < radiusSliderArray.length; i++) {
		console.log(radiusSliderArray[i].value());
	}
}

function sliderValueInput(){		
  for (var i = 0; i < radiusSliderArray.length; i++) {
  	radiusSliderArray[i].value(radiusInputArray[i].value());
  }
}

function findFrequencyRange(frequency){
	let frequencyBandIndex = constrain(findFrequencyBandIndex(frequency), 1,  frequencyRanges.length);

	let minFrequency = frequencyRanges[frequencyBandIndex - 1];
	let maxFrequency = frequencyRanges[frequencyBandIndex];

	return [minFrequency, maxFrequency];
}

function findFrequencyMinMaxRadius(frequency){

	let frequencyBandIndex = constrain(findFrequencyBandIndex(frequency), 1,  maxRadiusArray.length);

	let minRadius = maxRadiusArray[frequencyBandIndex - 1];
	let maxRadius = maxRadiusArray[frequencyBandIndex];

	return [minRadius, maxRadius];
}

function findFrequencyBandIndex(frequency) {
	// Returns the index of the last octave the frequency fits in 
	const bandMaxFrequency = (element) => element > frequency;
	return frequencyRanges.findIndex(bandMaxFrequency);
}



/*
	TODO 

	PLAY/PAUSE playButton


*/