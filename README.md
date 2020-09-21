# Sound Circle of Beauty
Creative artistic way of visualising sounds, music and animal calls  
Check out [the live website!](https://frazic.github.io/Sound_Circle_of_Beauty/)

## Description
Artistic circular spectrogram visualiser made with [P5.js](https://p5js.org/)

## How to
On the left side of the screen are preset buttons and a browse button to play your own files (tested with mp3, wav and m4a)

On the right side you can show advanced settings : 
- **Min and Max Frequency** (Hz) : Determines which band of frequencies are drawn.
- **Min and Max Amplitude** (dB) : Determines the threshold at which frequencies are detected to be drawn. Anything below your Min Amplitude will not appear. Warning : Lower Threshold = More lines to draw = More processing power required = Possibly slower drawing.
- **LowPass and HighPass filters** (Hz) : Filters applied directly to the sound playing, adjust to cut out high and low frequencies
- **Circle Scale** : This is just the size of the circle on your screen
- **Color Scheme** : Play around with pretty colors !
- **Reset to Default** : Resets all settings to default except the color scheme
- **Whole sound mode** : With this checked, the sound played will take up the full 360° of the circle, no overlapping and erasing. Once the circle completes, the sound ends. 

Pressing the **F** key on your keyboard will toggle fullscreen

## Setup
You will need to have a local http server running on your machine to host this code. 
[This is how I did it](https://github.com/processing/p5.js/wiki/Local-server#node-http-server)

Once you've installed Node.js and http-server just run either scripts called `start_http_server` and navigate to `localhost:8080` on your browser

## TO-DO
- Microphone input
- Possibility to show exact frequency under the mouse cursor if you want further analysis

### Copyright 2020, Allison Stokoe and Joshua Bruylant, All rights reserved.
