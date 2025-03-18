// Current theme
let currentTheme = defaults.theme;

// Apply theme update when changed
function changeTheme() {
    currentTheme = themeSelector.value();
    
    // Update all signal colors
    updateSignalColors();
    
    // Update UI element colors
    updateUIColors();
    
    // Update theme styles
    updateThemeStyles();
}

// Update signal colors based on current theme
function updateSignalColors() {
    // Update signal colors based on theme
    Object.keys(signals).forEach(key => {
        signals[key].color = createThemedColor(key);
    });
}

// Update UI element colors based on current theme
function updateUIColors() {
    const themeColor = getRgbColorString(themes[currentTheme].text);
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
    
    // Update sound button if it exists
    if (soundToggle) {
        updateSoundButtonAppearance(isSoundEnabled);
    }
}

// Update theme styles for UI elements
function updateThemeStyles() {
    // Update sliders and select styling
    updateSliderStyles();
    
    // Update select option styling - use more aggressive styling to override browser defaults
    const selectCSS = createSelectCSS();
    
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
    
    const sliderCSS = createSliderCSS();
    const styleElement = createElement('style', sliderCSS);
    styleElement.id('slider-styles');
}

// Create CSS for select elements
function createSelectCSS() {
    return `
        select option:checked,
        select option[selected],
        select option:hover,
        select option:focus {
            background: ${getRgbaColorString(themes[currentTheme].text, 0.4)} !important;
            background-color: ${getRgbaColorString(themes[currentTheme].text, 0.4)} !important;
            color: white !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
        }
        
        select:focus option:checked,
        select:focus option[selected] {
            background: ${getRgbaColorString(themes[currentTheme].text, 0.7)} !important;
            background-color: ${getRgbaColorString(themes[currentTheme].text, 0.7)} !important;
            color: white !important;
        }
        
        /* Target focus state specifically */
        select:focus {
            outline: 2px solid ${getRgbColorString(themes[currentTheme].text)} !important;
            border-color: ${getRgbColorString(themes[currentTheme].text)} !important;
        }
        
        /* Override browser default focus styling for options */
        select:focus option,
        select option:focus {
            background: ${getRgbaColorString(themes[currentTheme].text, 0.7)} !important;
            background-color: ${getRgbaColorString(themes[currentTheme].text, 0.7)} !important;
            outline: none !important;
            color: white !important;
        }
    `;
}

// Create CSS for sliders
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

// Handle direct styling of options during focus
function styleSelectOptions() {
    // Apply styling to the signal selector options
    const options = signalSelector.elt.options;
    const themeColorRGBA = getRgbaColorString(themes[currentTheme].text, 0.7);
    const themeColorRGB = getRgbColorString(themes[currentTheme].text);
    
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