/************ 
 * thefly.js
 * author: Hèctor Vidal Teixidó
 * description. This library generates a fly that is inserted on the
 * body section of an html document.
 * Usage:   1- link this script file on your html document 
 *          2- write the js code to create a fly. 
 *              <script>initFly(root);</script>
 * where parameters:
 *      root: the install directory of the plugin, with trailing "/"
 * 
 * 
 */

// Define a namespace
var theFly_plugin = {};

// Define the Class Fly
theFly_plugin.Fly = class {

    constructor(insectsFamily, posTop = 0, posLeft = 0) {

        // What beehive this insect belongs to.
        this.insectsFamily = insectsFamily;

        // Register this new fly to its comunity.
        this.insectsFamily.comunity.push(this);

        // Create a new <div> element for the container
        this.flyContainer = document.createElement('div');
        this.flyContainer.className = 'theFly-fly-container';
        this.flyContainer.style.position = 'absolute';
        this.flyContainer.style.left = '0px';
        this.flyContainer.style.top = '0px';
        this.flyContainer.style.zIndex = 999;

        // Append the container to the document body or any other desired parent element
        document.body.appendChild(this.flyContainer);

        // Define the flyImage as a property of the class
        this.flyImage = new Image();

        // Set the source of the fly image
        this.flyImage.src = this.insectsFamily.root+'img/fly.gif';

        // Set the fly image size (random size between 10mm and 15mm)
        const minSize = 10; // Minimum size in millimeters
        const maxSize = 15; // Maximum size in millimeters
        const randomSize = parseInt(Math.random() * (maxSize - minSize) + minSize);
        this.flyImage.style.width = `${randomSize}mm`;

        // Calculate random position within the available screen
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const targetLeft = parseInt(Math.random() * (screenWidth - randomSize));
        const targetTop = parseInt(Math.random() * (screenHeight - randomSize));
        this.flyImage.style.left = `${targetLeft}px`;
        this.flyImage.style.top = `${targetTop}px`;

        // Set the image to have a transparent background
        this.flyImage.style.backgroundColor = 'transparent';

        // Set a random z-index value to ensure the image appears on top of other elements
        const randomZIndex = Math.floor(Math.random() * 1000)+9000; // Random z-index between 9000 and 9999
        this.flyImage.style.zIndex = randomZIndex;

        // Set the position to absolute
        this.flyImage.style.position = 'fixed';

        // Add the fly image to the container
        this.flyContainer.appendChild(this.flyImage);

        // Create an audio element for the buzzing sound
        this.buzzingSound = new Audio(this.insectsFamily.root+'sfx/buzzing_fly.ogg'); 

        // Set audio options (loop and volume)
        this.buzzingSound.loop = false; 
        this.buzzingSound.volume = 1; // Adjust the volume (0.0 to 1.0)
        this.buzzingSound.preload = "auto";


        this.squishSound = new Audio(this.insectsFamily.root+'sfx/squish.mp3');
        this.squishSound.loop = false;
        this.squishSound.volume = 0.25;

        // Define an array to save timeout references
        this.timeOuts = new Array();

        // Start the random movement. First stop at where defined by posTop, posLeft.
        this.moveFly(posTop, posLeft);

        // Add an onmouseover event to change the cursor to a hand
        this.flyImage.addEventListener('mouseover', () => {
            this.flyImage.style.cursor = 'grab';
        });

        // Add an onmouseout event to reset the cursor to the default arrow
        this.flyImage.addEventListener('mouseout', () => {
            this.flyImage.style.cursor = 'default';
        });

        // Add a click event to call the smashFly method
        this.flyImage.addEventListener('click', () => {
            this.smashFly();
        });

        // Add a contextmenu (right-click) event to kill a whole family
        this.flyImage.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent the default context menu
            theFly_plugin.killAllInsects(this.insectsFamily); // Call the killAllInsects function which will remove all references of insects of the same beehive.
        });
    }

    moveFly(posTop = 0, posLeft = 0) {

        // check if sound is ready to play. Then play.
        if (this.buzzingSound.readyState == 4){ 
            // Rewind the audio to the beginning if ended (maybe loop is true, but...)
            if (this.buzzingSound.ended) this.buzzingSound.currentTime = 0;

            // Start/Continue playing the sound
            this.buzzingSound.play();
        }

        // Calculate random position within the available screen
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let targetLeft = posLeft;
        let targetTop = posTop;
        // If no position defined, calculate random one.
        if (posLeft == 0 & posTop == 0){
            targetLeft = parseInt(Math.random() * (screenWidth - this.flyImage.clientWidth));
            targetTop = parseInt(Math.random() * (screenHeight - this.flyImage.clientHeight));
        }

        // Calculate the number of steps 
        const numSteps = this.numSteps(targetTop,targetLeft);

        // Set stepInterval to set the SPEED
        const stepInterval = 20 * numSteps;

        // Calculate step distances
        const stepX = (targetLeft - parseInt(this.flyImage.style.left)) / numSteps;
        const stepY = (targetTop - parseInt(this.flyImage.style.top)) / numSteps;

        // Face the fly to next position (cancel all previus timeouts)
        this.timeOuts.forEach(clearTimeout);
        this.lookAt(targetTop, targetLeft);

        // Apply transition for smoother movement
        this.flyImage.style.transition = `left ${stepInterval}ms linear, top ${stepInterval}ms linear`;
        
        // Move to the next step 
        this.flyImage.style.left = `${targetLeft}px`;
        this.flyImage.style.top = `${targetTop}px`;


        // Clear transition property after the movement is complete
        // This timeOut should'nt be deleted in order to complete the css animation and do not repeat it. Stop playing the sound too.
        setTimeout(() => {
            this.flyImage.style.transition = 'none';
            this.buzzingSound.pause(); // Pause the sound

            //Activate again the standing animation with little delay.
            setTimeout(() => {
                this.rotateFly();
            }, 250);
        }, stepInterval);
         

        // Set a random timeout before the next movement (between 1 and 5 seconds)
        const randomTimeout = Math.random() * 4000 + 1000; // Random timeout between 1000ms (1s) and 5000ms (5s)

        // Schedule the next movement
        this.timeOuts[this.timeOuts.length] = setTimeout(() => {
            this.moveFly();
        }, randomTimeout);
    }

    rotateFly(maxRotation = 120) {
        // Calculate a random rotation angle between -maxRotation and +maxRotation degrees
        const randomRotation = Math.random() * (2 * maxRotation) - maxRotation; // Random rotation between -maxRotation/2 and +maxRotation/2 degrees

        // Calculate the current rotation angle
        const currentRotation = parseInt(this.flyImage.style.transform.replace('rotate(', '').replace('deg)', ''));

        // Calculate the new rotation angle relative to the current rotation
        const newRotation = currentRotation + randomRotation;

        // Apply the new rotation immediately
        this.flyImage.style.transform = `rotate(${newRotation}deg)`;

        // Set a random timeout before the next rotation (between 0.5 and 2 seconds)
        const randomTimeout = Math.random() * 1500 + 500; // Random timeout between 500ms (0.5s) and 2000ms (2s)

        // Schedule the next rotation
        this.timeOuts[this.timeOuts.length] = setTimeout(() => {
            this.rotateFly();
        }, randomTimeout);
    }

    smashFly() {
        this.squishSound.play(); 

        // Clear old and pending timeouts for this fly
        this.clearTimeouts();

        // Replace the source image with "img/smashedFly.gif"
        this.flyImage.src = this.insectsFamily.root+'img/smashedFly.gif';

        // Create between 1 and 3 new FlyImage objects
        const numNewFlies = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
        setTimeout(()=>{
            for (let i = 0; i < numNewFlies; i++) {
                let margin = this.flyImage.clientWidth;
                this.insectsFamily.comunity.push(new theFly_plugin.Fly(
                    this.insectsFamily,
                    parseInt(this.flyImage.style.top)+(Math.random() * (2 * margin) - margin),
                    parseInt(this.flyImage.style.left)+(Math.random() * (2 * margin) - margin)));
            }
        },1000);
    }

    distanceTo(targetTop, targetLeft) {
        // Get the current position of the flyImage
        const currentTop = parseInt(this.flyImage.style.top);
        const currentLeft = parseInt(this.flyImage.style.left);

        // Calculate the horizontal and vertical distances
        const horizontalDistance = Math.abs(currentLeft - targetLeft);
        const verticalDistance = Math.abs(currentTop - targetTop);

        // Calculate the overall distance using the Pythagorean theorem
        const overallDistance = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);

        return overallDistance;
    }

    numSteps(targetTop, targetLeft) {
        // Calculate the distance to the target position
        const overallDistance = this.distanceTo(targetTop, targetLeft);

        // Get the current width of the flyImage
        const flyImageWidth = this.flyImage.clientWidth;

        // Calculate the number of steps (rounded to the nearest integer)
        const steps = Math.round(overallDistance / flyImageWidth);

        return steps;
    }

    lookAt(targetTop, targetLeft) {
        // Get the current position of the flyImage
        const currentTop = parseInt(this.flyImage.style.top);
        const currentLeft = parseInt(this.flyImage.style.left);

        // Calculate the horizontal and vertical differences
        const dx = targetLeft - currentLeft;
        const dy = currentTop - targetTop; // de locos, pero sí.

        // Calculate the angle in radians between the current position and the target position
        const radians = Math.atan2(dy, dx);
        
        // Convert the angle from radians to degrees
        const degreesToFaceTarget = (radians * 180) / Math.PI;

        // Set the rotation to face the target point
        this.flyImage.style.transform = `rotate(${-degreesToFaceTarget}deg`;
    }

    // Stops all timeouts of each fly
    clearTimeouts(){
        this.timeOuts.forEach(clearTimeout);
    }

    removeHTML(){
        this.flyContainer.remove();
    }

}

// Define an object which contains all classes of insects (for further releases if any).
theFly_plugin.insectsClassMap = {"Fly" : theFly_plugin.Fly};

// Define the Insects class (to hold insects families)
theFly_plugin.Insects = class{
    constructor(root, insectClass = 'Fly') {
        this.root = root; // root install directory
        this.insectClass = theFly_plugin.insectsClassMap[insectClass];
        this.comunity = new Array();
    }

    newInsect() {
        // Create a new insect and let it know which family belongs to
        const insect = new this.insectClass(this);
    }
}

// Initiates a FLY comunity
theFly_plugin.initFly = function(root){
    // Start new insects beehive (colmena)
    flies = new theFly_plugin.Insects(root, 'Fly')

    // Create first subject
    flies.newInsect();
}

// Removes insects of an specific family from the DOM and memory.
theFly_plugin.killAllInsects = function(insectsFamily) {
    // remove each individual
    insectsFamily.comunity.forEach((insect)=>{
        insect.clearTimeouts();
        insect.removeHTML();
        insect = null;
    })
    // And extintion
    insectsFamily = null;
}