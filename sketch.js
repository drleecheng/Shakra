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

// Loading state tracking flags
let modelLoaded = false;
let audioLoaded = false;
let camSignal = false;

// Triggered ONLY when the user clicks the colorful "Click Anywhere to Start" screen
async function startGameSequence() {
  if (Tone.context && typeof Tone.context.resume === 'function') {
    await Tone.context.resume();
    console.log("Audio Context Resumed");
  } else if (typeof Tone.start === 'function') {
    await Tone.start();
    console.log("Audio Context Started");
  }
  
  displayCamera();

  // Fix stretching: Create capture with explicit fallback dimensions
  video = createCapture(VIDEO);
  video.size(640, 480); // Establish explicit internal video tracking aspect ratio
  video.hide();
  
  handPose.detectStart(video, gotHands);
  camSignal = true;
}

function setup() {
  let targetRatio = 4 / 3;
  let w = windowWidth;
  let h = windowHeight;

  if (windowWidth / windowHeight > targetRatio) {
    w = windowHeight * targetRatio;
  } else {
    h = windowWidth / targetRatio;
  }

  p5canvas = createCanvas(w * 0.95, h * 0.95); 
  p5canvas.parent('#canvas');
  
  handPose = ml5.handPose(modelReady);

  instruments = SampleLibrary.load({
    instruments: ["violin","flute"], ext: ".wav", baseUrl: "samples/"
  });

  Tone.Buffer.on('load', function() {
    currentRight = instruments["violin"];
    currentRight.toMaster();
    currentLeft = instruments["flute"];
    currentLeft.toMaster();
    
    audioLoaded = true;
    checkIfReady(); 
  });
}

function modelReady() {
  console.log("HandPose Model Loaded!");
  modelLoaded = true;
  checkIfReady(); 
}

function checkIfReady() {
  if (modelLoaded && audioLoaded) {
    let startImg = document.getElementById("startGraphic");
    if (startImg) {
      startImg.src = "ready_screen.png";
      startImg.style.cursor = "pointer";
      startImg.style.pointerEvents = "auto";
      console.log("Assets loaded completely. Application unlocked.");
    }
  }
}

function windowResized() {
  let targetRatio = 16 / 9;
  let w = (windowWidth / windowHeight > targetRatio) ? windowHeight * targetRatio : windowWidth;
  let h = (windowWidth / windowHeight > targetRatio) ? windowHeight : windowWidth / targetRatio;
  resizeCanvas(w * 0.95, h * 0.95);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background(255); // Clears background to prevent artifacts

  // 1. DRAW FLIPPED VIDEO
  push(); 
  translate(width, 0); 
  scale(-1, 1); 
  if (video) {
    // Draws the video to seamlessly stretch to your responsive canvas sizes
    image(video, 0, 0, width, height);
  }
  pop(); 

  // 2. TRACK AND CALIBRATE COORDINATES
  if ((hands.length > 0) && (camSignal)) {
    stroke(0);
    strokeWeight(2);
    
    // We use video.width & video.height (the model's reference grid) 
    // and scale them proportionally to match current canvas width & height!
    if (hands.length == 1) {
        let rawX = map(hands[0].index_finger_tip.x, 0, video.width, 0, width);
        let scaledY = map(hands[0].index_finger_tip.y, 0, video.height, 0, height);
        rightHandfinger = { x: width - rawX, y: scaledY };
    }
    if (hands.length > 1) {
        let rawX0 = map(hands[0].index_finger_tip.x, 0, video.width, 0, width);
        let scaledY0 = map(hands[0].index_finger_tip.y, 0, video.height, 0, height);
        rightHandfinger = { x: width - rawX0, y: scaledY0 };
        
        let rawX1 = map(hands[1].index_finger_tip.x, 0, video.width, 0, width);
        let scaledY1 = map(hands[1].index_finger_tip.y, 0, video.height, 0, height);
        leftHandfinger = { x: width - rawX1, y: scaledY1 };
    }
    
    for (let i = 0; i < hands.length; i++) 
    {
        if (i == 0)
        {
            fill(0, 255, 0, 200);
            circle(rightHandfinger.x, rightHandfinger.y, 25); // Slightly larger circle for children
            if (currentRightHandLevel != floor(10-(rightHandfinger.y-50)/(height/11)))
            {
                currentRight.triggerRelease(Tone.Frequency(currentRightHandNote, "midi").toNote());
                currentRightHandLevel = floor(10-(rightHandfinger.y-50)/(height/11));
                
                switch (currentRightHandLevel) 
                {
                    case 0: currentRightHandNote = 72; break;
                    case 1: currentRightHandNote = 74; break;
                    case 2: currentRightHandNote = 76; break;
                    case 3: currentRightHandNote = 77; break;
                    case 4: currentRightHandNote = 79; break;
                    case 5: currentRightHandNote = 81; break;
                    case 6: currentRightHandNote = 83; break;
                    case 7: currentRightHandNote = 84; break;
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
            circle(leftHandfinger.x, leftHandfinger.y, 25);
            if (currentLeftHandLevel != floor(10-(leftHandfinger.y-50)/(height/11)))
            {
                currentLeft.triggerRelease(Tone.Frequency(currentLeftHandNote, "midi").toNote());
                currentLeftHandLevel = floor(10-(leftHandfinger.y-50)/(height/11));
                switch (currentLeftHandLevel) 
                {
                    case 0: currentLeftHandNote = 72; break;
                    case 1: currentLeftHandNote = 74; break;
                    case 2: currentLeftHandNote = 76; break;
                    case 3: currentLeftHandNote = 77; break;
                    case 4: currentLeftHandNote = 79; break;
                    case 5: currentLeftHandNote = 81; break;
                    case 6: currentLeftHandNote = 83; break;
                    case 7: currentLeftHandNote = 84; break;
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