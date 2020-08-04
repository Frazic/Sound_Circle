let soundPlayingFlag = false;
let numberOfBins = 1024;
let startDegree = 0;
let nyquist, deltaF, deltaFOctave;
let frequencyBins = [];
let arcArray = new Array(numberOfBins);
let amplitudeThreshold = -90;		// CHANGE THIS
let maxCircleSize;
let cnv;
let fft;
let maxPeakValue = amplitudeThreshold;
let melRangeLow = 0;
let melRangeHigh = 4000;
let octaveAverages;
let octaveBandsArray = [];
let octaveBandsLow = [];
let octaveBandsHigh = [];
let deltaRadiusMax;
let shrinkFactor = 2;
let radiusMaxArray = [];
let octaveRadiusMaxArray;
let startTimeMillis;

//-----------
let numberOfDivisions = 1024;
let lineralyDividedSpectrum = [];
let lineralyDividedCircles = [];
let totalAbsoluteEnergy = 0;
let energyArray = [];

// TESTING
let octaveCircles;

function preload() {
  //sound = loadSound('assets/sounds/meow.wav');
  //sound = loadSound('assets/sounds/sin_440Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/sin_4400Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/JoshWoodward-CS-NoVox-10-HeyRuth.mp3');
  //sound = loadSound('assets/sounds/humpback-whale.mp3');
  //sound = loadSound('assets/sounds/minke-whale.mp3');
  //sound = loadSound('assets/sounds/Tempest.mp3');
  sound = loadSound('assets/sounds/1-02 Don\'t Be Sad.mp3');		// CHANGE THIS  
  //sound = loadSound('assets/sounds/sin_1000Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/short-beaked-common-dolphin.mp3');
  //sound = loadSound('assets/sounds/white_noise.wav');
}

function mousePressed() {
  userStartAudio();
	toggleSound();
}


function setup() {
  // mimics the autoplay policy
  getAudioContext().suspend();

  // Canvas
  createCanvas(windowWidth,windowHeight);
  background(0);
  //frameRate(1);

	maxCircleSize = min(height, width);		// CHANGE THIS

  // FFT object
  fft = new p5.FFT();

  // Add each high frequency limit of our octaveBands to an array
  fft.getOctaveBands().forEach(function(element) {
  	octaveBandsArray.push(element);
  	octaveBandsHigh.push(round(element.hi));
  	octaveBandsLow.push(round(element.lo));
	})
	// Frequency delta between each octave
	deltaFOctave = round(octaveBandsHigh[octaveBandsHigh.length -1] / octaveBandsHigh.length);
	
	/*// Maximum drawing radius difference between each octave "ring"
	deltaRadiusMax = round(maxCircleSize / octaveBandsArray.length);

	// Maximum radius from the center for each octave
	for (let i = 0; i < octaveBandsArray.length; i++) {
		radiusMaxArray[i] = (i + 1) * deltaRadiusMax;
	}*/

	// Prepare our array of radii at the appropriate size (number of octaves)
	octaveRadiusMaxArray = new Array(octaveBandsArray.length);

  // Start sound @ 0 volume
  sound.amp(0);
  sound.loop();

  // Nyquist Hz value
	nyquist = sampleRate() / 2;
	deltaF = nyquist / numberOfBins;

	// Create our bins of frequencies
	for (let i = 0; i < numberOfBins; i++) {
		frequencyBins[i] = round(deltaF * i);
	}

	startTimeMillis = millis();

	octaveCircles = new Array(octaveBandsArray.length);
	for (let i = octaveCircles.length - 1; i >= 0; i--) {
		octaveCircles[i] = new octaveCircle(0);
	}

	//------------

	let frequenceRangeDelta = nyquist / numberOfDivisions;
	for (let i = 0; i < numberOfDivisions; i++) {
		lineralyDividedSpectrum[i] = round((i) * frequenceRangeDelta + 1);
	}

	lineralyDividedCircles = new Array(lineralyDividedSpectrum.length);
	for (let i = lineralyDividedCircles.length - 1; i >= 0; i--) {
		lineralyDividedCircles[i] = new octaveCircle(0, i);
	}

	// Maximum drawing radius difference between each octave "ring"
	deltaRadiusMax = round(maxCircleSize / lineralyDividedCircles.length);

	// Maximum radius from the center for each octave
	for (let i = 0; i < lineralyDividedCircles.length; i++) {
		radiusMaxArray[i] = (i + 1) * deltaRadiusMax;
	}

	//energyArray = new Array(lineralyDividedSpectrum.length).fill(0);

}


function draw() {
  angleMode(DEGREES);
  colorMode(HSB);
	//background(0);

  let spectrum = fft.analyze(numberOfBins, "dB");

  // --------------------ERASER LINES GOING ROUND THE CIRCLE-----------------------
  for (let i = 0; i < frequencyBins.length; i++) {
  	// MEL SCALE https://en.wikipedia.org/wiki/Mel_scale
		let radius = round(map(frequencyBins[i], 1, nyquist, 0, maxCircleSize)); // Hz from 1 to 23kHz -> 10 to 100 radius
		let xE1 = width/2 + round(radius * cos(startDegree+3));
		let yE1 = height/2 + round(radius * sin(startDegree+3));
		let xE2 = width/2 + round(radius * cos(startDegree+4));
		let yE2 = height/2 + round(radius * sin(startDegree+4));

		strokeWeight(3);
		stroke(0);
		line(xE1, yE1, xE2, yE2);
  }






  // Get energy in each range of linearly subdivided frequency range
  totalAbsoluteEnergy = 0;
	energyArray = new Array(lineralyDividedSpectrum.length);
	for (let i = 0; i < lineralyDividedSpectrum.length; i++) {
  	if (i == 0) {
  		energyArray[i] = constrain(fft.getEnergy(20, lineralyDividedSpectrum[i]), -140, 0);
  	} else {
  		energyArray[i] = constrain(fft.getEnergy(lineralyDividedSpectrum[i-1], lineralyDividedSpectrum[i]), -140, 0);
  	}
  	totalAbsoluteEnergy += abs(energyArray[i]);
  }

  	


  circleRadiusMaxArray = new Array(lineralyDividedSpectrum.length);
 	for (let j = 0; j < lineralyDividedSpectrum.length; j++) {
		let relativeAbsoluteEnergy = abs(energyArray[j]) / totalAbsoluteEnergy;
		radiusMaxArray[j] = map(relativeAbsoluteEnergy, 140/totalAbsoluteEnergy, 1/totalAbsoluteEnergy, 0, maxCircleSize/2);

		if (j == 0) {
			circleRadiusMaxArray[j] = round(map(constrain(energyArray[j], -140, 0), -140, 0, 10 + deltaRadiusMax, radiusMaxArray[j], true));
		}else {
			circleRadiusMaxArray[j] = round(map(constrain(energyArray[j], -140, 0), -140, 0, circleRadiusMaxArray[j-1], radiusMaxArray[j], true));
		}

		


		/*lineralyDividedCircles[j].updater(circleRadiusMaxArray[j]);
		lineralyDividedCircles[j].show();*/
	}

	maxPeakValue = amplitudeThreshold;
	for (let i = 0; i< spectrum.length; i++){

		// We have something above our threshold ! Draw it !
	  if (spectrum[i] > amplitudeThreshold) {
	  	// Maximum amplitude for this part of the spectrum. Used to scale colours later on
			if (spectrum[i] > maxPeakValue) {
				maxPeakValue = spectrum[i];
			}

			let peakFrequency = i * (nyquist / numberOfBins);
			let peakBinIndex = findClosestFrequencyBinIndex(peakFrequency);
			let radius = 10;
			if (peakBinIndex == 0) {
				radius = map(peakFrequency, 1, frequencyBins[peakBinIndex], 10, circleRadiusMaxArray[peakBinIndex], true);
			} else {
				radius = map(peakFrequency, frequencyBins[peakBinIndex-1], frequencyBins[peakBinIndex], 10, circleRadiusMaxArray[peakBinIndex], true);
			}

			let x1 = width/2 + round(radius * cos(startDegree));
			let y1 = height/2 + round(radius * sin(startDegree));
			let x2 = width/2 + round(radius * cos(startDegree+1));
			let y2 = height/2 + round(radius * sin(startDegree+1));

			let thickness = round(map(spectrum[i], amplitudeThreshold, maxPeakValue, 0.1, 3));	// dB from -140 to 0 -> 0 to 50 thickness		// CHANGE LAST NUMBER
			let colour = map(spectrum[i], amplitudeThreshold, maxPeakValue, 360, 0);

			strokeWeight(thickness);
			stroke(colour, 100, 50);
			line(x1, y1, x2, y2);
		}

  }

  if (startDegree >= 360) {
		startDegree = 0;
	} else {
		startDegree++;
	}
















  // --------------------ACTUAL SOUND LINES-----------------------

  

  // Average amplitude at each octave
  //octaveAverages = fft.logAverages(octaveBandsArray);

  /*maxPeakValue = amplitudeThreshold;
	for (let i = 0; i< spectrum.length; i++){

		// Maximum amplitude for this part of the spectrum. Used to scale colours later on
		if (spectrum[i] > maxPeakValue) {
			maxPeakValue = spectrum[i];
		}

		// Determine actual max drawing radius for each octave depending on its average amplitude
		if (millis() - startTimeMillis >= 1) {
			startTimeMillis = millis();
			for (let j = 0; j < octaveRadiusMaxArray.length; j++) {
				if (j == 0) {
					octaveRadiusMaxArray[j] = round(map(constrain(octaveAverages[j], -140, 0), -140, 0, 0 + deltaRadiusMax, radiusMaxArray[j], true));
				}else {
					//octaveRadiusMaxArray[j] = round(map(constrain(octaveAverages[j], -140, 0), -140, 0, octaveRadiusMaxArray[j-1] + deltaRadiusMax/shrinkFactor, radiusMaxArray[j], true));
					octaveRadiusMaxArray[j] = round(map(constrain(octaveAverages[j], -140, 0), -140, 0, octaveRadiusMaxArray[j-1], radiusMaxArray[j], true));
				}

				octaveCircles[j].updater(octaveRadiusMaxArray[j]);
				octaveCircles[j].show();
			}
		}
	}*/



		/*
		// We have something above our threshold ! Draw it !
    if (spectrum[i] > amplitudeThreshold) {

			
			//let peakBinIndex = findClosestFrequencyBinIndex(peakFrequency);

			// MEL SCALE https://en.wikipedia.org/wiki/Mel_scale
			//let melFrequency = round(2595 * Math.log10(1 + (frequencyBins[peakBinIndex]/700)));
			//let radius = round(map(melFrequency, 0, 4000, 10, maxCircleSize));

			let peakFrequency = i * (nyquist / numberOfBins);
			let peakOctaveIndex = findClosestOctaveBandHighIndex(peakFrequency);
			let radius = map(peakFrequency, octaveBandsLow[peakOctaveIndex], octaveBandsHigh[peakOctaveIndex], 10, octaveRadiusMaxArray[peakOctaveIndex], true);
			//let radius = round(map(peakFrequency, 1, nyquist, 10, octaveRadiusMaxArray[peakOctaveIndex]));

			let thickness = round(map(spectrum[i], amplitudeThreshold, maxPeakValue, 0.1, 3));	// dB from -140 to 0 -> 0 to 50 thickness		// CHANGE LAST NUMBER
			let x1 = width/2 + round(radius * cos(startDegree));
			let y1 = height/2 + round(radius * sin(startDegree));
			let x2 = width/2 + round(radius * cos(startDegree+1));
			let y2 = height/2 + round(radius * sin(startDegree+1));

			let colour = map(spectrum[i], amplitudeThreshold, maxPeakValue, 360, 0);

			strokeWeight(thickness);
			stroke(colour, 100, 50);
			line(x1, y1, x2, y2);
		}
	}

	if (startDegree >= 360) {
		startDegree = 0;
	} else {
		startDegree++;
	}
	*/
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

function findClosestFrequencyBinIndex(needle) {
	return round(closest(needle, frequencyBins) / deltaF);
}

function findClosestOctaveBandHighIndex(frequency) {
	// Returns the index of the last octave the frequency fits in 
	const octaveMaxFrequency = (element) => element > frequency;
	return octaveBandsHigh.findIndex(octaveMaxFrequency);
}

function closest(needle, haystack) {
    return haystack.reduce((a, b) => {
        let aDiff = Math.abs(a - needle);
        let bDiff = Math.abs(b - needle);

        if (aDiff == bDiff) {
            return a > b ? a : b;
        } else {
            return bDiff < aDiff ? b : a;
        }
    });
}

// TESTING
class octaveCircle {
	constructor (radius, identifier){
		this.radius = radius;
		this.identifier = identifier;
	}

	updater(radius){
		this.radius = radius;
	}

	show(){
		// TESTING ONLY
		push();
		strokeWeight(1);
		stroke(69, 100, 50);
		noFill();
		ellipse(width/2, height/2, this.radius, this.radius);
		translate(width/2, height/2);
		text(this.identifier, this.radius);
		pop();
	}
}





// TODO 
/*
	Add sliders for :
		maxCircleSize
		threshold

	Add your own file button

	Press play to play, not continuous loop

	Play/Pause

	logarithmic maxCircleSize instead of linear : NOT ANYMORE
		See blackoard.png

	dynamic threshold over frequencies (lower threshold for higher frequencies for example)
		low mid high thresh slider

	Threshold presets available with button click (Whale species)

	slider hider toggle

	resise window

	instead of eraser line from center have black line on all frequency bin draw itself : DONE

	Playhead(startDegree) depends on song.currentTime(), not just frames

	COLOURS : YAY

	Have lines draw themselves and go around from a fixed line
		Fixed reference point for view is playhead, not vinyl


	Next thing to try : Global flat scaling of all bins according to overall amplitude
	maxCircleSize = f(overall amplitude)

	Have frequency bins expand from central radius, instead of depending on the previous one to grow out
*/