let handPose;
let video;
let hands = [];
let p5canvas = null;
var instruments;
var currentRight;
var currentRightHandLevel = 0;
var currentRightHandNote = 0;
var currentLeft;
var currentLeftHandLevel = 0;
var currentLeftHandNote = 0;
var rightHandfinger;
var leftHandfinger;

let camSignal = false;

function cameraOnSignal() {
  camSignal = true;
}

function setup() {
  p5canvas = createCanvas(640, 480);
  p5canvas.parent('#canvas');
  video = createCapture(VIDEO);
  video.hide();
  handPose = ml5.handPose(modelReady);

  instruments = SampleLibrary.load({
    instruments: ["violin","flute"], ext: ".wav", baseUrl: "samples/"
  });

  // Setting up the sound libraries
  Tone.Buffer.on('load', function() {
  currentRight = instruments["violin"];
  currentRight.toMaster();
  currentLeft = instruments["flute"];
  currentLeft.toMaster();
  });

}

function windowResized() {
// Repeat the logic here so it stays fixed when rotating/resizing
  let targetRatio = 16 / 9;
  let w = (windowWidth / windowHeight > targetRatio) ? windowHeight * targetRatio : windowWidth;
  let h = (windowWidth / windowHeight > targetRatio) ? windowHeight : windowWidth / targetRatio;
  
  resizeCanvas(w * 0.95, h * 0.95);
}

function modelReady() {
  handPose.detectStart(video, gotHands);
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // Save the output to the hands variable
  hands = results;
}

function draw() {
// 1. FLIP THE VIDEO HORIZONTALLY (Mirror Mode)
  push(); // Save the current drawing state
  translate(width, 0); // Move the drawing origin to the top-right corner
  scale(-1, 1); // Flip the x-axis completely
  
  if (video) {
    image(video, 0, 0, width, height);
  }
  pop(); // Restore the normal drawing state so your circles aren't flipped!
    // If there is at least one hand
    if ((hands.length > 0)&&(camSignal)) {
        stroke(0);
        strokeWeight(2);
		if (hands.length == 1) {
			// Subtract x from width to mirror the tracking point
			rightHandfinger = { x: width - hands[0].index_finger_tip.x, y: hands[0].index_finger_tip.y };
		}
		if (hands.length > 1) {
			rightHandfinger = { x: width - hands[0].index_finger_tip.x, y: hands[0].index_finger_tip.y };
			leftHandfinger = { x: width - hands[1].index_finger_tip.x, y: hands[1].index_finger_tip.y };
		}
		for (let i = 0; i < hands.length; i++) 
		{

			if (i == 0)
			{
				fill(0, 255, 0, 200);
				circle(rightHandfinger.x, rightHandfinger.y, 20);
				if (currentRightHandLevel != floor(10-(rightHandfinger.y-50)/(height/11)))
				{
					currentRight.triggerRelease(Tone.Frequency(currentRightHandNote, "midi").toNote());
					currentRightHandLevel = floor(10-(rightHandfinger.y-50)/(height/11));
					
					switch (currentRightHandLevel) 
					{
						case 0:
						currentRightHandNote = 72;
						break;
						case 1:
						currentRightHandNote = 74;
						break;
						case 2:
						currentRightHandNote = 76;
						break;
						case 3:
						currentRightHandNote = 77;
						break;
						case 4:
						currentRightHandNote = 79;
						break;
						case 5:
						currentRightHandNote = 81;
						break;
						case 6:
						currentRightHandNote = 83;
						break;
						case 7:
						currentRightHandNote = 84;
						break;
						default:
						currentRight.triggerRelease(Tone.Frequency(currentRightHandNote, "midi").toNote());
						break;
					}
					currentRight.triggerAttack(Tone.Frequency(currentRightHandNote, "midi").toNote());
				}
			}
			else if (i == 1)
			{
				fill(255, 0, 0, 200);
				circle(leftHandfinger.x, leftHandfinger.y, 20);
				if (currentLeftHandLevel != floor(10-(leftHandfinger.y-50)/(height/11)))
				{
					currentLeft.triggerRelease(Tone.Frequency(currentLeftHandNote, "midi").toNote());
					currentLeftHandLevel = floor(10-(leftHandfinger.y-50)/(height/11));
					switch (currentLeftHandLevel) 
					{
						case 0:
						currentLeftHandNote = 72;
						break;
						case 1:
						currentLeftHandNote = 74;
						break;
						case 2:
						currentLeftHandNote = 76;
						break;
						case 3:
						currentLeftHandNote = 77;
						break;
						case 4:
						currentLeftHandNote = 79;
						break;
						case 5:
						currentLeftHandNote = 81;
						break;
						case 6:
						currentLeftHandNote = 83;
						break;
						case 7:
						currentLeftHandNote = 84;
						break;
						default:
						currentLeft.triggerRelease(Tone.Frequency(currentLeftHandNote, "midi").toNote());
						break;
					}
				currentLeft.triggerAttack(Tone.Frequency(currentLeftHandNote, "midi").toNote());
				}
			}
		}
    }
	if ((hands.length == 0) && (currentRight) && (currentLeft))
	{
		currentRight.triggerRelease(Tone.Frequency(currentRightHandNote, "midi").toNote());
		currentLeft.triggerRelease(Tone.Frequency(currentLeftHandNote, "midi").toNote());
	}
	if ((hands.length == 1) && (currentRight) && (currentLeft))
	{
		currentLeft.triggerRelease(Tone.Frequency(currentLeftHandNote, "midi").toNote());
	}
}
