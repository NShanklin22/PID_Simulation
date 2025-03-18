// Canvas dimensions
const canvasWidth = 1200;
const canvasHeight = 700;

// Chart dimensions
const margin = 100;
const chartWidth = 700;
const chartHeight = canvasHeight - 2 * margin;

// UI control area - positioning
const controlX = margin + chartWidth + 75;
const controlWidth = 210;

// Signal instances
let signals = {};
let selectedSignals = [];

// Theme settings
const themes = {
    Fallout: {
        bg: [0, 0, 0],
        grid: [0, 95, 0],
        text: [0, 238, 0],
        signal: [0, 238, 0]
    },
    Red: {
        bg: [0, 0, 0],
        grid: [95, 0, 0],
        text: [238, 0, 0],
        signal: [238, 0, 0]
    },
    Blue: {
        bg: [0, 0, 0],
        grid: [0, 0, 95],
        text: [0, 0, 238],
        signal: [0, 0, 238]
    }
};
let currentTheme = 'Fallout';

// Axis properties
const tickLength = 5;
const tickSpacing = 25;
const axisColor = 0;

// Create Labels
const labelX = "Time";
const labelY = "Amplitude";

// UI Components
let themeSelector;
let signalSelector;
let amplitudeSlider;
let frequencySlider;
let setpointSlider;

// Signal class for generating and displaying waveforms
class Signal {
    constructor(name, color, amplitude, frequency, phase, type) {
        this.name = name;           // Name of the signal
        this.color = color;         // Display color
        this.amplitude = amplitude; // Scale factor for height
        this.frequency = frequency; // How many cycles per pixel
        this.phase = phase;         // Phase offset
        this.time = 0;              // Time variable for animation
        this.points = [];           // Array to store calculated points
        this.type = type;           // Type of signal (sine, cosine, random, perlin, setpoint)
        this.setpoint = 0;          // For setpoint signal
        
        // For Perlin noise
        this.noiseOffset = random(1000);
    }
    
    update() {
        // Calculate all points for the signal
        this.points = [];
        
        for (let x = 0; x <= chartWidth; x++) {
            // Calculate y position based on signal type
            let yPos = this.calculateYPosition(x);
            
            // Limit the y position to chart bounds
            yPos = constrain(yPos, -chartHeight/2, chartHeight/2);
            
            // Store the point
            this.points.push({x: x, y: yPos});
        }
        
        // Update the time for animation (except for setpoint)
        if (this.type !== "setpoint") {
            this.time += 0.02;
        }
    }
    
    calculateYPosition(x) {
        switch(this.type) {
            case "sine":
                return this.amplitude * 100 * sin(this.frequency * x + this.phase + this.time);
            case "cosine":
                return this.amplitude * 100 * cos(this.frequency * x + this.phase + this.time);
            case "random":
                const factor = Math.random(-1,1) * 1000;
                return chartHeight/2 * map(noise(factor), 0, 1, -1, 1) * this.amplitude;
            case "perlin":
                // Smooth noise
                return this.amplitude * 100 * map(noise(this.noiseOffset + x * this.frequency * 0.1, this.time * 0.1), 0, 1, -1, 1);
            case "setpoint":
                // Constant value
                return this.setpoint;
            default:
                return 0;
        }
    }
    
    display(index) {
        push();
        // Set drawing styles
        stroke(this.color);
        strokeWeight(2);
        noFill();
        
        // Move to chart coordinates (centered vertically)
        translate(margin, margin + chartHeight/2);
        
        // Start drawing the line
        beginShape();
        for (let i = 0; i < this.points.length; i++) {
            vertex(this.points[i].x, this.points[i].y);
        }
        endShape();
        
        this.drawLegend(index);
        
        // Display time (only for the first signal)
        if (index === 0) {
            this.drawTimeDisplay();
        }
        
        pop();
    }
    
    drawLegend(index) {
        const legendX = 10;
        const legendY = -chartHeight/2 + 10;
        const legendWidth = 150;
        const legendHeight = 25;
        const padding = 5;
        
        fill(0, 0, 0, 200);
        stroke(this.color);
        strokeWeight(1);
        rect(legendX, legendY + (index * (legendHeight + 5)), legendWidth, legendHeight, 5);
        
        // Draw a small line sample in the legend
        stroke(this.color);
        strokeWeight(2);
        line(
            legendX + padding, 
            legendY + (index * (legendHeight + 5)) + legendHeight/2,
            legendX + padding + 20, 
            legendY + (index * (legendHeight + 5)) + legendHeight/2
        );
        
        // Display signal name
        fill(this.color);
        noStroke();
        textAlign(LEFT, CENTER);
        text(
            this.name, 
            legendX + padding + 30, 
            legendY + (index * (legendHeight + 5)) + legendHeight/2
        );
    }
    
    drawTimeDisplay() {
        // Create a time display box in the top-right
        fill(0, 0, 0, 200);
        stroke(themes[currentTheme].text);
        strokeWeight(1);
        rect(chartWidth - 90, -chartHeight/2 + 10, 80, 25, 5);
        
        // Display time
        fill(themes[currentTheme].text);
        noStroke();
        textAlign(LEFT, CENTER);
        text("T: " + floor(this.time), chartWidth - 80, -chartHeight/2 + 22);
    }
    
    // Method to change signal parameters
    setParameters(amplitude, frequency, phase, setpoint = 0) {
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.phase = phase;
        this.setpoint = setpoint;
    }
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    
    // Create UI elements
    createUIControls();
    
    // Initialize signals for each type
    initializeSignals();
}

function createUIControls() {
    createControlPanel();
    createThemeSelector();
    createSignalSelector();
    createSliders();
    
    // Apply initial styles
    updateThemeStyles();
}

function createControlPanel() {
    // Apply direct theme-based styles to document for select elements
    const initSelectCSS = `
        select option:checked, 
        select option[selected] {
            background: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7) !important;
            background-color: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7) !important;
            color: white !important;
        }
    `;
    const initialSelectStyle = createElement('style', initSelectCSS);
    initialSelectStyle.id('initial-select-styles');
    
    // Create a container div for controls
    const controlPanel = createDiv();
    controlPanel.position(controlX + margin + 60, margin - 30);
    controlPanel.size(controlWidth, chartHeight);
    controlPanel.style('padding', '20px');
    controlPanel.style('box-sizing', 'border-box');
    controlPanel.id('control-panel');
    
    // Title for control panel
    const title = createDiv('Signal Controls');
    title.parent('control-panel');
    title.style('width', '100%');
    title.style('font-size', '20px');
    title.style('margin-bottom', '15px');
    title.style('text-align', 'center');
    title.style('color', `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    title.style('border-bottom', `1px solid rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    title.style('padding-bottom', '10px');
}

function createThemeSelector() {
    const themeDiv = createDiv();
    themeDiv.parent('control-panel');
    themeDiv.style('margin-bottom', '10px');
    themeDiv.style('width', '100%');
    
    const themeLabel = createDiv('Theme:');
    themeLabel.parent(themeDiv);
    themeLabel.style('margin-bottom', '5px');
    themeLabel.style('color', `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    themeLabel.style('text-align', 'center');
    
    themeSelector = createSelect();
    themeSelector.parent(themeDiv);
    themeSelector.style('width', '180px');
    themeSelector.style('height', '30px');
    themeSelector.style('background-color', '#000');
    themeSelector.style('color', `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    themeSelector.style('border', `1px solid rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    themeSelector.style('display', 'block');
    themeSelector.style('margin', '0 auto');
    
    Object.keys(themes).forEach(theme => {
        themeSelector.option(theme);
    });
    
    themeSelector.selected('Fallout');
    themeSelector.changed(changeTheme);
}

function createSignalSelector() {
    const signalDiv = createDiv();
    signalDiv.parent('control-panel');
    signalDiv.style('margin-bottom', '5px');
    signalDiv.style('width', '100%');
    
    const signalLabel = createDiv('Signal Types:');
    signalLabel.parent(signalDiv);
    signalLabel.style('margin-bottom', '10px');
    signalLabel.style('color', `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    signalLabel.style('text-align', 'center');
    
    signalSelector = createSelect(true); // true enables multiple selection
    signalSelector.parent(signalDiv);
    signalSelector.style('width', '180px');
    signalSelector.style('height', '100px');
    signalSelector.style('background-color', '#000');
    signalSelector.style('color', `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    signalSelector.style('border', `1px solid rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    signalSelector.style('display', 'block');
    signalSelector.style('margin', '0 auto');
    signalSelector.style('outline', 'none'); // Remove default focus outline
    
    const signalTypes = ['Sine', 'Cosine', 'Random', 'Perlin', 'Setpoint'];
    signalTypes.forEach(type => {
        signalSelector.option(type);
    });
    
    signalSelector.selected('Sine');
    signalSelector.changed(updateSelectedSignals);
    
    // Add event listener to refresh selected option styles after interacting with the select
    signalSelector.elt.addEventListener('mouseup', function() {
        setTimeout(styleSelectOptions, 50); // Short delay to ensure selection is processed
    });
    
    // Add event listeners to handle focus state
    signalSelector.elt.addEventListener('focus', styleSelectOptions);
    signalSelector.elt.addEventListener('blur', styleSelectOptions);
    
    // Initialize selected option styles
    setTimeout(styleSelectOptions, 100);
}

function createSliders() {
    // Create slider CSS based on theme
    const sliderCSS = createCustomSliderCSS();
    const styleElement = createElement('style', sliderCSS);
    styleElement.id('slider-styles');
    
    // Create amplitude slider
    createSliderControl('Amplitude:', 'amp', 0.1, 2, 1, 0.1);
    
    // Create frequency slider
    createSliderControl('Frequency:', 'freq', 0.005, 0.05, 0.02, 0.005);
    
    // Create setpoint slider
    createSliderControl('Setpoint:', 'setpoint', -200, 200, 0, 10);
}

function createSliderControl(labelText, id, min, max, defaultValue, step) {
    const sliderDiv = createDiv();
    sliderDiv.parent('control-panel');
    sliderDiv.style('margin-bottom', '10px');
    sliderDiv.style('width', '100%');
    
    const sliderLabel = createDiv(labelText);
    sliderLabel.parent(sliderDiv);
    sliderLabel.style('margin-bottom', '5px');
    sliderLabel.style('color', `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    sliderLabel.style('text-align', 'center');
    
    const sliderContainer = createDiv();
    sliderContainer.parent(sliderDiv);
    sliderContainer.style('width', '180px');
    sliderContainer.style('margin', '0 auto');
    sliderContainer.style('display', 'block');
    
    let slider;
    if (id === 'amp') {
        amplitudeSlider = createSlider(min, max, defaultValue, step);
        slider = amplitudeSlider;
    } else if (id === 'freq') {
        frequencySlider = createSlider(min, max, defaultValue, step);
        slider = frequencySlider;
    } else if (id === 'setpoint') {
        setpointSlider = createSlider(min, max, defaultValue, step);
        slider = setpointSlider;
    }
    
    slider.parent(sliderContainer);
    slider.style('width', '100%');
    slider.class('themed-slider');
    
    const valueDisplay = createDiv(defaultValue.toString());
    valueDisplay.parent(sliderDiv);
    valueDisplay.style('text-align', 'center');
    valueDisplay.style('color', `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`);
    valueDisplay.style('margin-top', '0px');
    valueDisplay.style('width', '100%');
    valueDisplay.id(`${id}-value`);
}

function createCustomSliderCSS() {
    const themeColor = `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`;
    
    return `
        .themed-slider {
            -webkit-appearance: none;
            height: 8px;
            background: #000;
            border: 1px solid ${themeColor};
            border-radius: 5px;
            outline: none;
        }
        
        .themed-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 15px;
            height: 15px;
            background: ${themeColor};
            border-radius: 50%;
            cursor: pointer;
        }
        
        .themed-slider::-moz-range-thumb {
            width: 15px;
            height: 15px;
            background: ${themeColor};
            border-radius: 50%;
            cursor: pointer;
            border: none;
        }
        
        select option {
            background-color: black;
        }
        
        /* Custom styling for option selection */
        select option:checked,
        select option:hover,
        select option:focus {
            background-color: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.4) !important;
            color: white !important;
        }
        
        /* Custom styling for multi-select when element has focus */
        select:focus option:checked {
            background: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7) !important;
            color: white !important;
        }
    `;
}

function initializeSignals() {
    // Signal opacity values
    const opacityValues = {
        Sine: 255,
        Cosine: 180, 
        Random: 160,
        Perlin: 140,
        Setpoint: 120
    };
    
    // Create different signal types with default parameters
    signals = {};
    Object.keys(opacityValues).forEach(type => {
        signals[type] = new Signal(
            type === 'Sine' ? 'Sine Wave' : 
            type === 'Cosine' ? 'Cosine Wave' : type, 
            color(
                themes[currentTheme].signal[0], 
                themes[currentTheme].signal[1], 
                themes[currentTheme].signal[2], 
                opacityValues[type]
            ),
            type === 'Random' ? 0.5 : 
            type === 'Perlin' ? 0.7 : 1,
            type === 'Setpoint' ? 0 : 0.02,
            type === 'Cosine' ? PI/2 : 0,
            type.toLowerCase()
        );
    });
    
    // Initialize with Sine Wave selected
    selectedSignals = ['Sine'];
}

function updateThemeStyles() {
    // Update sliders and select styling
    updateSliderStyles();
    
    // Update select option styling - use more aggressive styling to override browser defaults
    const selectCSS = `
        select option:checked,
        select option[selected],
        select option:hover,
        select option:focus {
            background: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.4) !important;
            background-color: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.4) !important;
            color: white !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
        }
        
        select:focus option:checked,
        select:focus option[selected] {
            background: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7) !important;
            background-color: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7) !important;
            color: white !important;
        }
        
        /* Target focus state specifically */
        select:focus {
            outline: 2px solid rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}) !important;
            border-color: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}) !important;
        }
        
        /* Override browser default focus styling for options */
        select:focus option,
        select option:focus {
            background: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7) !important;
            background-color: rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7) !important;
            outline: none !important;
            color: white !important;
        }
    `;
    
    // Update the selection style element
    if (select('#select-styles')) {
        select('#select-styles').remove();
    }
    
    const selectStyleElement = createElement('style', selectCSS);
    selectStyleElement.id('select-styles');
    
    // Update applied styling
    styleSelectOptions();
}

// Update slider styles when theme changes
function updateSliderStyles() {
    // Remove old style element and create a new one
    if (select('#slider-styles')) {
        select('#slider-styles').remove();
    }
    
    const sliderCSS = createCustomSliderCSS();
    const styleElement = createElement('style', sliderCSS);
    styleElement.id('slider-styles');
}

function changeTheme() {
    currentTheme = themeSelector.value();
    
    // Update all signal colors
    const opacityValues = {
        Sine: 255,
        Cosine: 180, 
        Random: 160,
        Perlin: 140,
        Setpoint: 120
    };
    
    // Update signal colors based on theme
    Object.keys(signals).forEach(key => {
        signals[key].color = color(
            themes[currentTheme].signal[0], 
            themes[currentTheme].signal[1], 
            themes[currentTheme].signal[2], 
            opacityValues[key] || 255
        );
    });
    
    // Update UI element colors
    const themeColor = `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`;
    const themeBorder = `1px solid ${themeColor}`;
    
    // Update all themed elements
    select('#control-panel').style('border-color', themeColor);
    selectAll('#control-panel div').forEach(el => {
        if (el.style('color')) {
            el.style('color', themeColor);
        }
    });
    
    // Update border-bottom color of title
    select('#control-panel > div:first-child').style('border-bottom', themeBorder);
    
    // Update select elements
    selectAll('select').forEach(el => {
        el.style('color', themeColor);
        el.style('border', themeBorder);
    });
    
    updateThemeStyles();
}

// Handle direct styling of options during focus
function styleSelectOptions() {
    // Apply styling to the signal selector options
    const options = signalSelector.elt.options;
    const themeColorRGBA = `rgba(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]}, 0.7)`;
    const themeColorRGB = `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`;
    
    for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
            options[i].style.backgroundColor = themeColorRGBA;
            options[i].style.color = 'white';
        } else {
            options[i].style.backgroundColor = 'black';
            options[i].style.color = themeColorRGB;
        }
    }

    // Force theme color for focus state
    signalSelector.elt.style.outline = `2px solid ${themeColorRGB}`;
}

function updateSelectedSignals() {
    selectedSignals = signalSelector.selected();
    styleSelectOptions();
}

function draw() {
    // Set background based on theme
    background(themes[currentTheme].bg);
    
    // Draw chart elements
    drawGrid();
    drawAxes();
    drawAxisLabels();
    
    // Update parameters for all signals
    updateSignalParameters();
    
    // Draw control panel background
    fill(0, 0, 0, 230);
    stroke(themes[currentTheme].grid);
    strokeWeight(1);
    rect(margin + chartWidth + 40, margin - 30, controlWidth + 70, chartHeight + 60, 5);
}

function updateSignalParameters() {
    const amplitude = amplitudeSlider.value();
    const frequency = frequencySlider.value();
    const setpoint = setpointSlider.value();
    
    // Update UI display values
    select('#amp-value').html(amplitude.toFixed(1));
    select('#freq-value').html(frequency.toFixed(3));
    select('#setpoint-value').html(setpoint);
    
    // Update and display selected signals
    selectedSignals.forEach((signalType, i) => {
        const signal = signals[signalType];
        
        // Update with current slider values
        if (signalType === 'Setpoint') {
            signal.setParameters(1, 0, 0, setpoint);
        } else {
            signal.setParameters(amplitude, frequency, 0);
        }
        
        signal.update();
        signal.display(i);
    });
}

function drawGrid() {
    stroke(themes[currentTheme].grid);
    strokeWeight(0.5);
    
    // Vertical grid lines
    for (let x = 0; x <= chartWidth; x += tickSpacing) {
        line(margin + x, margin, margin + x, margin + chartHeight);
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= chartHeight; y += tickSpacing) {
        line(margin, margin + y, margin + chartWidth, margin + y);
    }
}

function drawAxes() {
    stroke(axisColor);
    strokeWeight(2);
    
    // X-axis
    line(margin, margin + chartHeight, margin + chartWidth, margin + chartHeight);
    
    // Y-axis
    line(margin, margin, margin, margin + chartHeight);
    
    // X-axis ticks
    for (let x = 0; x <= chartWidth; x += tickSpacing) {
        // Draw tick marks
        line(margin + x, margin + chartHeight, margin + x, margin + chartHeight + tickLength);
        
        // Draw tick labels
        textAlign(CENTER, TOP);
        push();
        translate(margin + x, margin + chartHeight);
        textAlign(RIGHT);
        rotate(-PI/4);
        fill(themes[currentTheme].text);
        text(x, -5, -tickSpacing/2 + 10);
        pop();
    }
    
    // Y-axis ticks
    for (let y = 0; y <= chartHeight; y += tickSpacing) {
        // Draw tick marks
        line(margin, margin + chartHeight - y, margin - tickLength, margin + chartHeight - y);
        
        // Draw tick labels
        textAlign(RIGHT, CENTER);
        fill(themes[currentTheme].text);
        text(y, margin - tickLength - 5, margin + chartHeight - y);
    }
}

function drawAxisLabels() {
    fill(themes[currentTheme].text);
    noStroke();
    textSize(16);
    
    // X-axis label
    textAlign(CENTER, TOP);
    text(labelX, margin + chartWidth / 2, canvasHeight - margin / 3);
    
    // Y-axis label
    push();
    translate(margin / 3, margin + chartHeight / 2);
    rotate(-PI/2);
    textAlign(CENTER, BOTTOM);
    text(labelY, 0, 0);
    pop();
}