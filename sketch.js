var soundPlayingFlag = false;
var numberOfBins = 1024;
var startDegree = 0;
var nyquist, deltaF;
var frequencyBins = [];
var arcArray = new Array(numberOfBins);
var amplitudeThreshold = -75;		// CHANGE THIS
var circleScale;
var cnv;

function preload() {
  //sound = loadSound('assets/sounds/meow.wav');
  //sound = loadSound('assets/sounds/sin_440Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/sin_4400Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/JoshWoodward-CS-NoVox-10-HeyRuth.mp3');humpback-whale.mp3
  //sound = loadSound('assets/sounds/humpback-whale.mp3');
  //sound = loadSound('assets/sounds/minke-whale.mp3');
  //sound = loadSound('assets/sounds/Tempest.mp3');
  sound = loadSound('assets/sounds/1-02 Don\'t Be Sad.mp3');		// CHANGE THIS
}

function mousePressed() {
  userStartAudio();
	toggleSound();
}


function setup() {
  // mimics the autoplay policy
  getAudioContext().suspend();

  // Canvas
  cnv = createCanvas(windowWidth,windowHeight);
  background(0);

  // FFT object
  fft = new p5.FFT();

  // Start sound @ 0 volume
  sound.amp(0);  
  sound.loop();

  // Nyquist Hz value
	nyquist = sampleRate() / 2;
	deltaF = nyquist / numberOfBins;

	// Create our bins of frequencies
	for (var i = 0; i < numberOfBins; i++) {
		frequencyBins[i] = round(deltaF * i);
	}
}


function draw() {
	circleScale = height * 6;		// CHANGE THIS
  angleMode(DEGREES);

  let spectrum = fft.analyze(numberOfBins, "dB");

  // ERASER LINES GOING ROUND THE CIRCLE
  for (var i = 0; i < frequencyBins.length; i++) {
  	let radius = round(map(frequencyBins[i], 1, nyquist, 10, circleScale)); // Hz from 1 to 23kHz -> 10 to 100 radius
  	//let radius = round(log(i)/log(1024)*circleScale/20);
		let xE1 = width/2 + round(radius * cos(startDegree+2));
		let yE1 = height/2 + round(radius * sin(startDegree+2));
		let xE2 = width/2 + round(radius * cos(startDegree+3));
		let yE2 = height/2 + round(radius * sin(startDegree+3));

		strokeWeight(5);
		stroke(0);
		//point(x1, y1);
		line(xE1, yE1, xE2, yE2);
  }

  // ACTUAL SOUND LINES
	for (let i = 0; i< spectrum.length; i++){
    if (spectrum[i] > amplitudeThreshold) {      
			let peakFrequency = i * (nyquist / numberOfBins);
			let peakBinIndex = findClosestFrequencyBinIndex(peakFrequency);

			let radius = round(map(frequencyBins[peakBinIndex], 1, nyquist, 10, circleScale)); // Hz from 1 to 23kHz -> 10 to 100 radius
			//output = log(input+1)/log(1024)*255;
			//let radius = round(log(peakBinIndex)/log(1024)*circleScale/20);
			let thickness = round(map(spectrum[i], -140, 0, 0.1, 5));	// dB from -140 to 0 -> 0 to 50 thickness
			let x1 = width/2 + round(radius * cos(startDegree));
			let y1 = height/2 + round(radius * sin(startDegree));
			let x2 = width/2 + round(radius * cos(startDegree+1));
			let y2 = height/2 + round(radius * sin(startDegree+1));			

			strokeWeight(thickness);
			stroke(255);
			//point(x1, y1);
			line(x1, y1, x2, y2);
		}
	}

			//arcArray[peakBinIndex] = new SoundPoint(width/2, height/2, peakFrequency, spectrum[i], startDegree, nyquist);

			/*if (arcArray[peakBinIndex] == null) {
				arcArray[peakBinIndex] = new SoundPoint(width/2, height/2, peakFrequency, spectrum[i], startDegree, nyquist);
			} else {
				arcArray[peakBinIndex].update(spectrum[i], startDegree);
			}*/

  /*// Draw play head
	strokeWeight(20);
	stroke(0);
	let limitX = width/2 + round(circleScale * cos(startDegree+5));
	let limitY = height/2 + round(circleScale * sin(startDegree+5));
	line(width/2, height/2, limitX, limitY);*/

	// for (var i = 0; i < arcArray.length; i++) {
	// 	if (arcArray[i] != null) {
	// 		arcArray[i].show();
	// 	}
	// }

	if (startDegree >= 360) {
		startDegree = 0;
	} else {
		startDegree++;
	}
}


function toggleSound() {
	if (soundPlayingFlag) {
    soundPlayingFlag = false;
    sound.amp(0, 0.2);
  } else {
    soundPlayingFlag = true;
    sound.amp(0.2, 0.2);
  }
}

function findClosestFrequencyBinIndex(needle) {
	return round(closest(needle, frequencyBins) / deltaF);
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


// TODO 
/*
	Add sliders for :
		circleScale
		threshold

	Add your own file button

	Press play to play, not continuous loop

	Play/Pause

	logarithmic circleScale instead of linear

	dynamic threshold over frequencies (lower threshold for higher frequencies for example)
		low mid high thresh slider

	Threshold presets available with button click (Whale species)

	slider hider toggle

	resise window

	instead of eraser line from center have black line on all frequency bin draw itself : DONE

	Playhead(startDegree) depends on song.currentTime(), not just frames

	COLOURS 
*/