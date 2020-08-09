var x = 0;
var f = 0; // fill
var slider;

// FUNCTION IS X/(X^-1), CHECK OUT WOLFRAM ALPHA

function setup() {
	createCanvas(400, 400);
  	noStroke();

	createP('Move the ellipse back and forth.');

	slider = createSlider(20, width, 0);
	slider.input(update);

}

function update() {
  	// get the value of the slider
  	var value = slider.value();
    
    let minModValue = 20/(pow(20, -1));
    let maxModValue = width/(pow(width, -1));
    let modValue = value/(pow(value, -1));
    let modMapValue = map(modValue, minModValue, maxModValue, 1, 255, true);
  
  
    console.log(round(slider.value()) + "," + round(modMapValue));
  	// the x position is set to value
	x = value;
  	/* the fill color is mapped 
  		from slider range 0 - width		
  		to the range 0 - 255 */
  	f = map(value, 0, width, 0, 255);
}


function draw() {
	background(220);
  	fill(f);
	ellipse(x, height/2, 100);
    slider.value(slider.value()+1);
    update();
}