// Signal instances
let signals = {};

// p5.js setup function - initializes the signal visualizer
function setup() {
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('signal-container');
    
    // Initialize signals for each type
    initializeSignals();
    
    // Function from controls.js - make sure it's loaded before main.js
    if (typeof createUIControls === 'function') {
        createUIControls();
    } else {
        console.error("createUIControls function not found. Make sure ui/controls.js is loaded before main.js");
    }
}

// p5.js draw function - called every frame to update display
function draw() {
    drawSignalVisualizer();
}

// Initialize signal instances
function initializeSignals() {
    // Create different signal types with default parameters
    signals = {};
    signalTypes.forEach(type => {
        signals[type] = new Signal(
            getSignalName(type),
            createThemedColor(type),
            getDefaultAmplitude(type),
            getDefaultFrequency(type),
            getSignalPhase(type),
            type.toLowerCase()
        );
    });
}

// Window resize event handler
function windowResized() {
    // Optional: Make the canvas responsive to window size changes
    // This would require recalculating dimensions and positions
}

// p5.js keyPressed function - for keyboard shortcuts
function keyPressed() {
    // Optional: Add keyboard shortcuts
    // Example: Toggle sound with 'S' key
    if (key === 's' || key === 'S') {
        if (typeof toggleSound === 'function') {
            toggleSound();
        }
    }
}