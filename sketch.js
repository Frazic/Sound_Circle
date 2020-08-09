let soundPlayingFlag = false;
let numberOfBins = 1024;
let startDegree = 0;
let deltaDegree = 1;
let nyquist, deltaF;
let frequencyBins = [];
let melFrequencyBins = [];
let arcArray = new Array(numberOfBins);
let ampthreshSlider;
let amplitudeThreshold;		// CHANGE THIS
let circleScale;
let maxPeakValue = amplitudeThreshold;
let maxAmplitudeExpectancy = -30;
let scaleMultiplier;
let melRangeLow = 0;
let melRangeHigh = 4000;
let eraserLineThickness = 10;
let fft;
let HighPass;
let LowPass;
let maxAmpdB = -40;

// TESTS
let new_fft;

let custom_sound_file_input;
let custom_sound_file;

//	[name, amplitudeThreshold, maxAmplitudeExpectancy, scaleMultiplier, eraserLineThickness, songFile]
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

// Tempest [-52, -35], scale*8
// Atlantic dolphin [-70, -50, *.6]
// Minke [-70, -50, *9]
// Don't be sad [-65, -30, *5]
// Humpback [-70, -30, *10]
// beaked dolphin [-76, -70, *.5]
// Jekyll [-55, -35, *12]

function preload() {
  //sound = loadSound('assets/sounds/meow.wav');
  //sound = loadSound('assets/sounds/sin_440Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/sin_4400Hz_-3dBFS_3s.wav');
  //sound = loadSound('assets/sounds/JoshWoodward-CS-NoVox-10-HeyRuth.mp3');humpback-whale.mp3
  presetTempest.push(loadSound('assets/sounds/Tempest.mp3'));
  presetAtlanticDolphin.push(loadSound('assets/sounds/atlantic-spotted-dolphin.mp3'));
  presetMinke.push(loadSound('assets/sounds/minke-whale.mp3'));
  presetDontBeSad.push(loadSound('assets/sounds/1-02 Don\'t Be Sad.mp3'));
  presetHumpback.push(loadSound('assets/sounds/humpback-whale.mp3'));
  presetBeakedDolphin.push(loadSound('assets/sounds/short-beaked-common-dolphin.mp3'));
  presetJekyll.push(loadSound('assets/sounds/10 Jekyll.m4a'));
  presetShineOn.push(loadSound('assets/sounds/Pink_Floyd_-_Shine_On_You_Crazy_Diamond_Parts_I-V.mp3'));
  presetEcstasyOfGold.push(loadSound('assets/sounds/Carolina_Eyck_The_Ecstasy_of_Gold_by_Ennio_Morricone.wav'));
  //sound = loadSound('assets/sounds/sin_1000Hz_-3dBFS_3s.wav');
}

function mousePressed() {
  userStartAudio();
	//toggleSound();
}


function setup() {
  // mimics the autoplay policy
  getAudioContext().suspend();

  // Canvas
  createCanvas(windowWidth,windowHeight);
  background(0);

  //filter & compressor object

  HighPass = new p5.HighPass();
  Limiter = new p5.Compressor();

  //LowPass = new p5.LowPass();

  //filter sliders
  highSlider = createSlider(10, 22050, 10);
  highSlider.size().width = 50
  highSlider.position(windowWidth-highSlider.size().width, 20);
  //lowSlider = createSlider(10, 22050, 22050);
  //lowSlider.size().width = 50
  //lowSlider.position(windowWidth-lowSlider.size().width, 40);
  
  //gainSlider = createSlider(0, 100, 0);
  //gainSlider.size().width = 50
  //gainSlider.position(windowWidth-gainSlider.size().width, 40);

  // FFT object
  fft = new p5.FFT();

  //circleScale slider
  circleSlider = createSlider(0.5, 12, 5);
  circleSlider.position(windowWidth-circleSlider.size().width, 40);
  ampthreshSlider = createSlider(-70, -40 ,-55);
  ampthreshSlider.position(windowWidth-ampthreshSlider.size().width, 60);

  // Start sound @ 0 volume
  /*sound.amp(0);
  sound.loop();*/

  // Nyquist Hz value
	nyquist = sampleRate() / 2;
	deltaF = nyquist / numberOfBins;

	// Create our bins of frequencies
	for (let i = 0; i < numberOfBins; i++) {
		frequencyBins[i] = round(deltaF * i);
	}

	// Create our bins of mel scaled frequencies
	melFrequencyBins = frequencyBins.map((freq) => round(2595 * Math.log10(1 + (freq/700))));

	// Buttons for each song
	for (let i = 0; i < songButtonArray.length; i++) {
		songButtonArray[i] = createButton(presets[i][0]); // Name each button
		songButtonArray[i].mousePressed(() => playSong(i));	// Call playSong with the index of played song
		songButtonArray[i].position(10, (i+1) * 20);
	}

	/*
	playButton = createButton('Play / Pause');
	playButton.mousePressed(toggleSound);
	playButton.position(10,radiusSliderArray[radiusSliderArray.length - 1].y + 20);*/


  custom_sound_file_input = createFileInput(handleFile);
  custom_sound_file_input.position(songButtonArray[songButtonArray.length - 1].x, songButtonArray[songButtonArray.length - 1].y + songButtonArray[songButtonArray.length - 1].height+2);

}


function draw() {
  angleMode(DEGREES);
  colorMode(HSB);

	circleScale = Math.min(windowWidth,windowHeight)*circleSlider.value();		// CHANGE THIS

  let spectrum = fft.analyze(numberOfBins, "dB");

  HighPass.freq(highSlider.value());
  Limiter.ratio(10);
  Limiter.threshold(-40);
  //LowPass.freq(lowSlider.value());

 // HighPass.gain(gainSlider.value());

  /*let energyArray = [];
  for (let i = 0; i < frequencyBins.length; i++) {
  	// -------------------------ERASER LINES GOING ROUND THE CIRCLE-----------------
  	// MEL SCALE https://en.wikipedia.org/wiki/Mel_scale
		let melFrequency = round(2595 * Math.log10(1 + (frequencyBins[i]/700)));
		//let radius = round(map(melFrequency, 0, 4000, 10, circleScale, true));
  	//let radius = round(exp(i/numberOfBins)*circleScale/10);
  	//let radius = round(log(i)/log(numberOfBins)*circleScale);
  	let radius = round(map(frequencyBins[i], 1, nyquist, 10, circleScale, true)); // Hz from 1 to 23kHz -> 10 to 100 radius
		//let radius = round(map(peakFrequency, 1, nyquist, 10, circleScale, true));
		let xE1 = width/2 + round(radius * cos(startDegree+2));
		let yE1 = height/2 + round(radius * sin(startDegree+2));
		let xE2 = width/2 + round(radius * cos(startDegree+3));
		let yE2 = height/2 + round(radius * sin(startDegree+3));

		strokeWeight(8);
		stroke(0);
		line(xE1, yE1, xE2, yE2);

		// Get energy in each frequency bin
		
  }*/

  // ---------- ERASER LINES ----------
  strokeWeight(eraserLineThickness);
  stroke(0);
  for (var i = 0; i < numberOfBins*2; i++) {
  	/*let eraserRadius = (map(frequencyBins[i], 10, nyquist, 1, Math.min(windowWidth,windowHeight)*12, true)); // Hz from 1 to 23kHz -> 10 to 100 radius*/
  	let eraserRadius = (map(i, 0, numberOfBins*2, 1, Math.min(windowWidth,windowHeight)*12, true)); // Hz from 1 to 23kHz -> 10 to 100 radius
  	let xE1 = width/2 + (eraserRadius * cos(startDegree+3*deltaDegree));
		let yE1 = height/2 + (eraserRadius * sin(startDegree+3*deltaDegree));
		let xE2 = width/2 + (eraserRadius * cos(startDegree+4*deltaDegree));
		let yE2 = height/2 + (eraserRadius * sin(startDegree+4*deltaDegree));

		//strokeWeight(map(i, 1, circleScale, 10, 15));
		line(xE1, yE1, xE2, yE2);
  }

  // ACTUAL SOUND LINES
	for (let i = 0; i< spectrum.length; i++){
    if (spectrum[i] > ampthreshSlider.value()) {

			let peakFrequency = i * (nyquist / numberOfBins);
			let peakBinIndex = findClosestFrequencyBinIndex(peakFrequency);

			// MEL SCALE https://en.wikipedia.org/wiki/Mel_scale
			let melFrequency = round(2595 * Math.log10(1 + (frequencyBins[peakBinIndex]/700)));
			//let radius = round(map(melFrequency, 0, 4000, 10, circleScale, true));
			//let radius = round(exp(peakBinIndex/(numberOfBins/4)));
			//let radius = round(log(peakBinIndex)/log(numberOfBins)*circleScale);
			let radius = (map(frequencyBins[peakBinIndex], 10, nyquist, ((circleSlider.value())*3)+20, circleScale, true)); // Hz from 1 to 23kHz -> 10 to 100 radius
			//let radius = round(map(peakFrequency, 1, nyquist, 20, circleScale, true));
			let amplitudeThreshold = ampthreshSlider.value();
			let thickness = map(spectrum[i], -70, maxAmpdB, 0.6, 3.5, true);
			let x1 = width/2 + round(radius * cos(startDegree));
			let y1 = height/2 + round(radius * sin(startDegree));
			let x2 = width/2 + round(radius * cos(startDegree+1));
			let y2 = height/2 + round(radius * sin(startDegree+1));

			//let colour = 0;
			// if (i < numberOfBins/20) {
			// 	colour = map(i, 0, numberOfBins/20, 360, 0);
			// } else {
			// 	colour = map(i, numberOfBins/20, numberOfBins/10, 360, 0);
			// }

			//let colour = map(spectrum[i], amplitudeThreshold, maxPeakValue, 360, 0);
			let colour = map(spectrum[i], -70, maxAmpdB, 270, 0);
			/*let bright = map(i, 0, numberOfBins/30, 0, 100);
			let sat = map(thickness, 0, numberOfBins/30, 25, 100);*/

			strokeWeight(thickness);
			//strokeWeight(7);
			stroke(colour, 100, 50);
			line(x1, y1, x2, y2);
		}
	}

	if (startDegree >= 360) {
		startDegree = 0;
	} else {
		startDegree += deltaDegree;
	}
}

// Set the parameters properly and play the selected song
function playSong(songIndex){

	let songToPlay = presets[songIndex][presets[songIndex].length - 1];

	// Button we clicked on is the current playing song. Pause it
	if ((songIndex == currentPlayingSongIndex) && (songToPlay.isPlaying() == true)) {
		songToPlay.amp(0, 0.2);
		songToPlay.pause();
		noLoop();
	} else if ((songIndex == currentPlayingSongIndex) && (songToPlay.isPlaying() == false)) {
		songToPlay.amp(1, 0.2);
		songToPlay.loop();
		loop();
	} else {
		// Stop current playing song
		if (currentPlayingSongIndex != -1) {
			let currentPlayingSong = presets[currentPlayingSongIndex][presets[currentPlayingSongIndex].length - 1];
			if (currentPlayingSong.isPlaying()) {
				currentPlayingSong.stop();
			}
		}

		// Change parameters
		amplitudeThreshold 			= ampthreshSlider.value();
		maxAmplitudeExpectancy 	= presets[songIndex][2];
		scaleMultiplier 				= circleSlider.value();
		eraserLineThickness			= presets[songIndex][4];

		// Clear screen
		background(0);

		// Play selected song
		let ampPeaks = songToPlay.getPeaks(1024);
		let maxAmp;
		maxAmp = Math.max(...ampPeaks);
		maxAmpdB = map(maxAmp, -1, 1, -70, -40);
		ampthreshSlider.elt.max = maxAmpdB;

		songToPlay.amp(1, 0.2);
		songToPlay.loop();

		// TESTS
		//console.log(songToPlay.buffer.length, songToPlay.buffer.sampleRate);
		//new_fft = new FFT(songToPlay.buffer.length, songToPlay.buffer.sampleRate);

		currentPlayingSongIndex = songIndex;
		
		songToPlay.disconnect();
		songToPlay.connect(HighPass);
		//songToPlay.connect(LowPass);
		loop();
	}
}

function handleFile(file){
	console.log(file);
	if (file.type === 'audio') {
		custom_sound_file = loadSound(file, fileLoaded);
	}
}

function fileLoaded() {
		custom_sound_file.play();
		console.log(custom_sound_file);
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

	logarithmic circleScale instead of linear : NOT ANYMORE
		See blackoard.png

	dynamic threshold over frequencies (lower threshold for higher frequencies for example)
		low mid high thresh slider

	Threshold presets available with button click (Whale species) : DONE

	slider hider toggle

	resise window

	instead of eraser line from center have black line on all frequency bin draw itself : DONE

	Playhead(startDegree) depends on song.currentTime(), not just frames

	COLOURS : YAY

	Have lines draw themselves and go around from a fixed line
		Fixed reference point for view is playhead, not vinyl

	slider based on current song position
	can adjust where we are in song
*/