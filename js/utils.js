// Utility functions for the signal visualizer

// Format a number to a specified number of decimal places
function formatNumber(number, decimalPlaces = 2) {
    return number.toFixed(decimalPlaces);
}

// Get RGB color string from theme color array
function getRgbColorString(colorArray) {
    return `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`;
}

// Get RGBA color string from theme color array with opacity
function getRgbaColorString(colorArray, opacity = 1.0) {
    return `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, ${opacity})`;
}

// Create signal name from type
function getSignalName(type) {
    return type === 'Sine' ? 'Sine Wave' : 
           type === 'Cosine' ? 'Cosine Wave' : type;
}

// Get appropriate signal phase based on type
function getSignalPhase(type) {
    return type === 'Cosine' ? PI/2 : 0;
}

// Get default amplitude based on signal type
function getDefaultAmplitude(type) {
    return type === 'Random' ? 0.5 : 
           type === 'Perlin' ? 0.7 : 1;
}

// Get default frequency based on signal type
function getDefaultFrequency(type) {
    return type === 'Setpoint' ? 0 : defaults.frequency;
}

// Create a colored p5.js color object with opacity
function createThemedColor(type) {
    return color(
        themes[currentTheme].signal[0],
        themes[currentTheme].signal[1],
        themes[currentTheme].signal[2],
        signalOpacities[type] || 255
    );
}

// Safely handle select elements (avoid errors if element doesn't exist)
function updateSelectValue(selector, value) {
    const element = select(selector);
    if (element) {
        element.html(value);
    }
}

// Safely get slider value with fallback to default
function getSliderValue(slider, defaultValue) {
    return (slider && slider.value) ? slider.value() : defaultValue;
}