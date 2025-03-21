// UI Components
let themeSelector;
let signalSelector;
let amplitudeSlider;
let frequencySlider;
let setpointSlider;
let scrollSpeedSlider;
let volumeSlider;
let reverbSlider;
let soundToggle;

// Selected signals
let selectedSignals = defaults.signals;

// Create all UI controls
function createUIControls() {
    createControlPanel();
    createThemeSelector();
    createSignalSelector();
    createSliders();
    createSoundControls();
    
    // Apply initial styles
    updateThemeStyles();
}

// Create the main control panel
function createControlPanel() {
    // Apply direct theme-based styles to document for select elements
    const initSelectCSS = `
        select option:checked, 
        select option[selected] {
            background: ${getRgbaColorString(themes[currentTheme].text, 0.7)} !important;
            background-color: ${getRgbaColorString(themes[currentTheme].text, 0.7)} !important;
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
    title.style('margin-bottom', '5px');
    title.style('text-align', 'center');
    title.style('color', getRgbColorString(themes[currentTheme].text));
    title.style('border-bottom', `1px solid ${getRgbColorString(themes[currentTheme].text)}`);
    title.style('padding-bottom', '10px');
    title.class('control-header');
}

// Create theme selector dropdown
function createThemeSelector() {
    const themeDiv = createDiv();
    themeDiv.parent('control-panel');
    themeDiv.style('margin-bottom', '2px');
    themeDiv.style('width', '100%');
    themeDiv.class('control-group');
    
    const themeLabel = createDiv('Theme:');
    themeLabel.parent(themeDiv);
    themeLabel.style('margin-bottom', '2px');
    themeLabel.style('color', getRgbColorString(themes[currentTheme].text));
    themeLabel.style('text-align', 'center');
    themeLabel.class('control-label');
    
    themeSelector = createSelect();
    themeSelector.parent(themeDiv);
    themeSelector.style('width', '180px');
    themeSelector.style('height', '30px');
    themeSelector.style('background-color', '#000');
    themeSelector.style('color', getRgbColorString(themes[currentTheme].text));
    themeSelector.style('border', `1px solid ${getRgbColorString(themes[currentTheme].text)}`);
    themeSelector.style('display', 'block');
    themeSelector.style('margin', '0 auto');
    
    Object.keys(themes).forEach(theme => {
        themeSelector.option(theme);
    });
    
    themeSelector.selected(currentTheme);
    themeSelector.changed(changeTheme);
}

// Create signal type multi-selector
function createSignalSelector() {
    const signalDiv = createDiv();
    signalDiv.parent('control-panel');
    signalDiv.style('margin-bottom', '2px');
    signalDiv.style('width', '100%');
    signalDiv.class('control-group');
    
    const signalLabel = createDiv('Signal Types:');
    signalLabel.parent(signalDiv);
    signalLabel.style('margin-bottom', '2px');
    signalLabel.style('color', getRgbColorString(themes[currentTheme].text));
    signalLabel.style('text-align', 'center');
    signalLabel.class('control-label');
    
    signalSelector = createSelect(true); // true enables multiple selection
    signalSelector.parent(signalDiv);
    signalSelector.style('width', '180px');
    signalSelector.style('height', '100px');
    signalSelector.style('background-color', '#000');
    signalSelector.style('color', getRgbColorString(themes[currentTheme].text));
    signalSelector.style('border', `1px solid ${getRgbColorString(themes[currentTheme].text)}`);
    signalSelector.style('display', 'block');
    signalSelector.style('margin', '0 auto');
    signalSelector.style('outline', 'none'); // Remove default focus outline
    
    signalTypes.forEach(type => {
        signalSelector.option(type);
    });
    
    selectedSignals.forEach(type => {
        signalSelector.selected(type);
    });
    
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

// Create all signal parameter sliders
function createSliders() {
    // Create slider CSS based on theme
    const sliderCSS = createSliderCSS();
    const styleElement = createElement('style', sliderCSS);
    styleElement.id('slider-styles');
    
    // Create amplitude slider
    createSliderControl('Amplitude:', 'amp', 0.1, 2, defaults.amplitude, 0.1);
    
    // Create frequency slider
    createSliderControl('Frequency:', 'freq', 0.005, 5, defaults.frequency, 0.005);
    
    // Create scroll speed slider
    createSliderControl('Scroll Speed:', 'scroll', 1, 100, scrollSpeed, 1);
    
    // Create setpoint slider
    createSliderControl('Setpoint:', 'setpoint', -200, 200, defaults.setpoint, 10);
}

// Create individual slider control
function createSliderControl(labelText, id, min, max, defaultValue, step) {
    const sliderDiv = createDiv();
    sliderDiv.parent('control-panel');
    sliderDiv.style('margin-bottom', '2px');
    sliderDiv.style('width', '100%');
    sliderDiv.class('control-group');
    
    const sliderLabel = createDiv(labelText);
    sliderLabel.parent(sliderDiv);
    sliderLabel.style('margin-bottom', '2px');
    sliderLabel.style('color', getRgbColorString(themes[currentTheme].text));
    sliderLabel.style('text-align', 'center');
    sliderLabel.class('control-label');
    
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
    } else if (id === 'scroll') {
        scrollSpeedSlider = createSlider(min, max, defaultValue, step);
        slider = scrollSpeedSlider;
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
    valueDisplay.style('color', getRgbColorString(themes[currentTheme].text));
    valueDisplay.style('margin-top', '0px');
    valueDisplay.style('width', '100%');
    valueDisplay.id(`${id}-value`);
    valueDisplay.class('value-display');
}

// Create audio controls
function createSoundControls() {
    // Create sound toggle button
    const soundDiv = createDiv();
    soundDiv.parent('control-panel');
    soundDiv.style('width', '100%');
    soundDiv.style('text-align', 'center');
    soundDiv.class('control-group');
    
    soundToggle = createButton('Sound: OFF');
    soundToggle.parent(soundDiv);
    soundToggle.style('background-color', 'black');
    soundToggle.style('color', getRgbColorString(themes[currentTheme].text));
    soundToggle.style('border', `1px solid ${getRgbColorString(themes[currentTheme].text)}`);
    soundToggle.style('padding', '5px 10px');
    soundToggle.style('cursor', 'pointer');
    soundToggle.style('width', '120px');
    soundToggle.style('margin', '10px auto');
    soundToggle.mousePressed(toggleSound);
    soundToggle.class('control-button');
    
    // Create volume slider
    createAudioSliderControl('Volume:', 'volume', 0, 1, defaults.volume, 0.01);
    
    // Create reverb slider
    createAudioSliderControl('Reverb:', 'reverb', 0, 1, defaults.reverb, 0.01);
}

// Create audio sliders
function createAudioSliderControl(labelText, id, min, max, defaultValue, step) {
    const sliderDiv = createDiv();
    sliderDiv.parent('control-panel');
    sliderDiv.style('margin-bottom', '2px');
    sliderDiv.style('width', '100%');
    sliderDiv.class('control-group');
    
    const sliderLabel = createDiv(labelText);
    sliderLabel.parent(sliderDiv);
    sliderLabel.style('margin-bottom', '2px');
    sliderLabel.style('color', getRgbColorString(themes[currentTheme].text));
    sliderLabel.style('text-align', 'center');
    sliderLabel.class('control-label');
    
    const sliderContainer = createDiv();
    sliderContainer.parent(sliderDiv);
    sliderContainer.style('width', '180px');
    sliderContainer.style('margin', '0 auto');
    sliderContainer.style('display', 'block');
    
    let slider;
    if (id === 'volume') {
        volumeSlider = createSlider(min, max, defaultValue, step);
        slider = volumeSlider;
    } else if (id === 'reverb') {
        reverbSlider = createSlider(min, max, defaultValue, step);
        slider = reverbSlider;
    }
    
    slider.parent(sliderContainer);
    slider.style('width', '100%');
    slider.class('themed-slider');
    
    const valueDisplay = createDiv(defaultValue.toString());
    valueDisplay.parent(sliderDiv);
    valueDisplay.style('text-align', 'center');
    valueDisplay.style('color', getRgbColorString(themes[currentTheme].text));
    valueDisplay.style('margin-top', '0px');
    valueDisplay.style('width', '100%');
    valueDisplay.id(`${id}-value`);
    valueDisplay.class('value-display');
}

// Update selected signals when selection changes
function updateSelectedSignals() {
    selectedSignals = signalSelector.selected();
    styleSelectOptions();
    
    // Recreate oscillators if sound is enabled
    if (isSoundEnabled) {
        // Stop and disconnect all oscillators
        Object.values(oscillators).forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) {
                // Oscillator might already be stopped
            }
        });
        
        // Clear oscillators and gain nodes
        oscillators = {};
        gainNodes = {};
        
        // Create oscillators for all signals
        Object.values(signals).forEach(signal => {
            signal.createAudio();
        });
    }
}

// Update signal parameters based on slider values
function updateSignalParameters() {
    const amplitude = getSliderValue(amplitudeSlider, defaults.amplitude);
    const frequency = getSliderValue(frequencySlider, defaults.frequency);
    const setpoint = getSliderValue(setpointSlider, defaults.setpoint);
    
    // Update UI display values
    updateSelectValue('#amp-value', formatNumber(amplitude, 1));
    updateSelectValue('#freq-value', formatNumber(frequency, 3));
    
    // Update scroll speed display
    if (scrollSpeedSlider) {
        updateSelectValue('#scroll-value', formatNumber(scrollSpeedSlider.value(), 0));
    }
    
    updateSelectValue('#setpoint-value', setpoint);
    
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

// Create slider CSS based on theme
function createSliderCSS() {
    const themeColor = getRgbColorString(themes[currentTheme].text);
    
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
            background-color: ${getRgbaColorString(themes[currentTheme].text, 0.4)} !important;
            color: white !important;
        }
        
        /* Custom styling for multi-select when element has focus */
        select:focus option:checked {
            background: ${getRgbaColorString(themes[currentTheme].text, 0.7)} !important;
            color: white !important;
        }
    `;
}

// Add responsive control functionality
function updateUILayout() {
    // Get current window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Get the control panel element
    const controlPanel = select('#control-panel');
    if (!controlPanel) return;
    
    // Recalculate canvas and chart dimensions if needed
    // For now, we'll just handle control panel position
    
    // Ensure control panel stays in visible area
    const currentX = controlPanel.position().x;
    const currentY = controlPanel.position().y;
    
    // Check if control panel is outside visible area
    if (currentX + controlWidth > windowWidth) {
        const newX = Math.max(10, windowWidth - controlWidth - 20);
        controlPanel.position(newX, currentY);
    }
    
    if (currentY + chartHeight > windowHeight) {
        const newY = Math.max(10, windowHeight - chartHeight - 20);
        controlPanel.position(currentX, newY);
    }
    
    // Add scrolling if panel is too tall
    if (chartHeight > windowHeight - 40) {
        controlPanel.style('overflow-y', 'auto');
        controlPanel.style('height', (windowHeight - 40) + 'px');
    }
}

// Call this when window is resized
function handleWindowResize() {
    updateUILayout();
}

// Make sure to call this at the end of setup
window.addEventListener('resize', handleWindowResize);