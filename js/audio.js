// Enhanced Audio components
let audioContext;
let oscillators = {};
let gainNodes = {};
let filterNodes = {};
let reverbNode;
let masterGainNode;
let reverbGainNode;
let compressorNode;
let isSoundEnabled = false;

// UI elements for audio controls
let filterFreqSlider;
let filterResSlider;
let harmonicsSlider;
let detuneSlider;
let mappingSelector;

// Additional audio parameters
let filterFrequency = 1000; // Default filter cutoff
let filterResonance = 5; // Default filter resonance
let harmonicAmount = 0.5; // Amount of harmonic content
let detune = 5; // Slight detuning for richness
let audioMappingMode = 'exponential'; // 'linear' or 'exponential'

// Initialize audio context and nodes
function initializeAudio() {
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create compressor for better dynamics
        compressorNode = audioContext.createDynamicsCompressor();
        compressorNode.threshold.value = -24;
        compressorNode.knee.value = 30;
        compressorNode.ratio.value = 12;
        compressorNode.attack.value = 0.003;
        compressorNode.release.value = 0.25;
        
        // Create master gain node for overall volume
        masterGainNode = audioContext.createGain();
        masterGainNode.gain.value = defaults.volume;
        
        // Create reverb effect
        createReverb();
        
        // Connect signal chain
        masterGainNode.connect(compressorNode);
        compressorNode.connect(audioContext.destination);
        
        // Don't create audio controls here - they'll be created when UI is ready
        // We'll just return success
        
        return true;
    } catch (e) {
        console.error("WebAudio API not supported:", e);
        // Disable sound functionality if WebAudio is not supported
        if (soundToggle) {
            soundToggle.html('Sound: Not Available');
            soundToggle.attribute('disabled', '');
        }
        return false;
    }
}

// Function to create audio enhancement controls - call this after UI is ready
function createAudioEnhancementControls() {
    if (!select('#control-panel')) {
        console.error("Control panel not found - can't create audio controls");
        return false;
    }
    
    // Create enhanced audio section header
    const audioHeader = createDiv('Enhanced Audio');
    audioHeader.parent('control-panel');
    audioHeader.style('width', '100%');
    audioHeader.style('font-size', '18px');
    audioHeader.style('margin-top', '15px');
    audioHeader.style('margin-bottom', '5px');
    audioHeader.style('text-align', 'center');
    audioHeader.style('color', getRgbColorString(themes[currentTheme].text));
    audioHeader.style('border-bottom', `1px solid ${getRgbColorString(themes[currentTheme].text)}`);
    audioHeader.style('padding-bottom', '5px');
    audioHeader.class('control-header');
    
    // Create filter frequency slider
    createAudioSliderControl('Filter Cutoff:', 'filter-freq', 50, 5000, filterFrequency, 10);
    
    // Create filter resonance slider
    createAudioSliderControl('Resonance:', 'filter-res', 0, 20, filterResonance, 0.1);
    
    // Create harmonics slider
    createAudioSliderControl('Harmonics:', 'harmonics', 0, 1, harmonicAmount, 0.01);
    
    // Create detune slider
    createAudioSliderControl('Detune:', 'detune', 0, 50, detune, 0.5);
    
    // Create audio mapping mode selector
    createAudioMappingSelector();
    
    return true;
}

// Create audio mapping mode selector
function createAudioMappingSelector() {
    const mappingDiv = createDiv();
    mappingDiv.parent('control-panel');
    mappingDiv.style('margin-bottom', '20px');
    mappingDiv.style('width', '100%');
    mappingDiv.class('control-group');
    
    const mappingLabel = createDiv('Frequency Mapping:');
    mappingLabel.parent(mappingDiv);
    mappingLabel.style('margin-bottom', '5px');
    mappingLabel.style('color', getRgbColorString(themes[currentTheme].text));
    mappingLabel.style('text-align', 'center');
    mappingLabel.class('control-label');
    
    mappingSelector = createSelect();
    mappingSelector.parent(mappingDiv);
    mappingSelector.style('width', '180px');
    mappingSelector.style('height', '30px');
    mappingSelector.style('background-color', '#000');
    mappingSelector.style('color', getRgbColorString(themes[currentTheme].text));
    mappingSelector.style('border', `1px solid ${getRgbColorString(themes[currentTheme].text)}`);
    mappingSelector.style('display', 'block');
    mappingSelector.style('margin', '0 auto');
    
    mappingSelector.option('Linear');
    mappingSelector.option('Exponential');
    mappingSelector.selected(audioMappingMode === 'linear' ? 'Linear' : 'Exponential');
    
    mappingSelector.changed(() => {
        audioMappingMode = mappingSelector.value().toLowerCase();
        
        // Update all oscillators if sound is enabled
        if (isSoundEnabled) {
            Object.values(signals).forEach(signal => {
                signal.updateAudio();
            });
        }
    });
}

// Create a more complex reverb effect
function createReverb() {
    try {
        // Create reverb nodes
        reverbNode = audioContext.createConvolver();
        reverbGainNode = audioContext.createGain();
        
        // Set reverb gain
        reverbGainNode.gain.value = defaults.reverb;
        
        // Create impulse response for reverb
        const sampleRate = audioContext.sampleRate;
        const length = sampleRate * 3; // 3 seconds reverb
        const impulse = audioContext.createBuffer(2, length, sampleRate);
        
        // Fill impulse with more natural decay
        for (let channel = 0; channel < 2; channel++) {
            const impulseData = impulse.getChannelData(channel);
            
            // Create a more complex reverb tail with early reflections
            for (let i = 0; i < length; i++) {
                // Early reflections (first 100ms)
                if (i < sampleRate * 0.1) {
                    const earlyDecay = Math.pow(0.9, i / (sampleRate * 0.02));
                    impulseData[i] = (Math.random() * 2 - 1) * earlyDecay; 
                } 
                // Main reverb tail
                else {
                    // Exponential decay with slight oscillation
                    const decay = Math.pow(0.98, (i - sampleRate * 0.1) / (sampleRate * 0.1));
                    const oscillation = Math.sin(i * 0.03) * 0.1;
                    impulseData[i] = (Math.random() * 2 - 1) * decay * (1 + oscillation);
                }
            }
        }
        
        // Set the impulse response
        reverbNode.buffer = impulse;
        
        // Connect wet path
        masterGainNode.connect(reverbGainNode);
        reverbGainNode.connect(reverbNode);
        reverbNode.connect(compressorNode);
    } catch (e) {
        console.error("Reverb creation failed:", e);
    }
}

// Update reverb mix level with smoother transition
function updateReverbMix(reverbAmount) {
    if (!reverbGainNode) return;
    
    // Smooth transition for reverb amount
    reverbGainNode.gain.linearRampToValueAtTime(
        reverbAmount, 
        audioContext.currentTime + 0.1
    );
}

// Toggle sound on/off
function toggleSound() {
    // If audio context doesn't exist, create it
    if (!audioContext) {
        if (!initializeAudio()) {
            return; // Exit if audio initialization failed
        }
    }
    
    // Check if we need to create audio enhancement controls
    if (isSoundEnabled === false && select('#control-panel') && !filterFreqSlider) {
        createAudioEnhancementControls();
    }
    
    // Toggle sound state
    isSoundEnabled = !isSoundEnabled;
    
    if (isSoundEnabled) {
        // Resume audio context if suspended (autoplay policy)
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Create oscillators for all signals
        Object.values(signals).forEach(signal => {
            signal.createAudio();
        });
        
        // Update button text and appearance
        updateSoundButtonAppearance(true);
    } else {
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
        filterNodes = {};
        
        // Update button text and appearance
        updateSoundButtonAppearance(false);
    }
}

// Update the sound button appearance based on state
function updateSoundButtonAppearance(isEnabled) {
    if (!soundToggle) return;
    
    const themeColor = `rgb(${themes[currentTheme].text[0]}, ${themes[currentTheme].text[1]}, ${themes[currentTheme].text[2]})`;
    
    if (isEnabled) {
        soundToggle.html('Sound: ON');
        soundToggle.style('background-color', themeColor);
        soundToggle.style('color', 'black');
    } else {
        soundToggle.html('Sound: OFF');
        soundToggle.style('background-color', 'black');
        soundToggle.style('color', themeColor);
    }
    
    soundToggle.style('border', `1px solid ${themeColor}`);
}

// Generate harmonics based on fundamental frequency
function createHarmonics(signal, oscillator, harmonicGain) {
    // Create harmonics
    const harmonics = [];
    
    // Create suboscillator (one octave lower)
    const subOsc = audioContext.createOscillator();
    subOsc.type = oscillator.type;
    subOsc.frequency.value = oscillator.frequency.value / 2;
    
    // Create gain for subosc
    const subGain = audioContext.createGain();
    subGain.gain.value = 0.5 * harmonicAmount;
    
    // Connect sub oscillator
    subOsc.connect(subGain);
    subGain.connect(harmonicGain);
    subOsc.start();
    harmonics.push({ osc: subOsc, gain: subGain });
    
    // Create up to 3 harmonics with decreasing amplitude
    for (let i = 2; i <= 4; i++) {
        const harmOsc = audioContext.createOscillator();
        
        // Alternate between sine and triangle for harmonics
        harmOsc.type = i % 2 === 0 ? 'sine' : 'triangle';
        
        // Slight detuning for more richness
        const detuneAmount = (Math.random() * 2 - 1) * detune;
        harmOsc.detune.value = detuneAmount;
        
        // Set harmonic frequency
        harmOsc.frequency.value = oscillator.frequency.value * i;
        
        // Create gain for this harmonic
        const harmGain = audioContext.createGain();
        
        // Each harmonic has lower amplitude
        harmGain.gain.value = harmonicAmount / i;
        
        // Connect this harmonic
        harmOsc.connect(harmGain);
        harmGain.connect(harmonicGain);
        harmOsc.start();
        
        // Store reference
        harmonics.push({ osc: harmOsc, gain: harmGain });
    }
    
    return harmonics;
}

// Update audio controls in the draw loop
function updateAudioControls() {
    if (!isSoundEnabled || !audioContext) return;
    
    // Update volume display
    if (volumeSlider) {
        const volumeValue = volumeSlider.value();
        select('#volume-value').html(volumeValue.toFixed(2));
        
        // Update master gain if context exists
        if (masterGainNode) {
            masterGainNode.gain.value = volumeValue;
        }
    }
    
    // Update reverb display
    if (reverbSlider) {
        const reverbValue = reverbSlider.value();
        select('#reverb-value').html(reverbValue.toFixed(2));
        
        // Update reverb mix
        updateReverbMix(reverbValue);
    }
    
    // Update filter frequency if the slider exists
    if (filterFreqSlider) {
        filterFrequency = filterFreqSlider.value();
        select('#filter-freq-value').html(filterFrequency.toFixed(0) + ' Hz');
        
        // Update all filter nodes
        Object.values(filterNodes).forEach(filter => {
            filter.frequency.linearRampToValueAtTime(
                filterFrequency, 
                audioContext.currentTime + 0.1
            );
        });
    }
    
    // Update filter resonance if the slider exists
    if (filterResSlider) {
        filterResonance = filterResSlider.value();
        select('#filter-res-value').html(filterResonance.toFixed(1) + ' Q');
        
        // Update all filter nodes
        Object.values(filterNodes).forEach(filter => {
            filter.Q.linearRampToValueAtTime(
                filterResonance, 
                audioContext.currentTime + 0.1
            );
        });
    }
    
    // Update harmonics amount if the slider exists
    if (harmonicsSlider) {
        harmonicAmount = harmonicsSlider.value();
        select('#harmonics-value').html(harmonicAmount.toFixed(2));
        
        // Update all oscillators
        if (isSoundEnabled) {
            Object.values(signals).forEach(signal => {
                if (signal.harmonics) {
                    signal.harmonics.forEach((harmonic, i) => {
                        // Different amplitude for each harmonic
                        let gain = i === 0 ? 0.5 * harmonicAmount : harmonicAmount / (i + 1);
                        harmonic.gain.gain.linearRampToValueAtTime(
                            gain, 
                            audioContext.currentTime + 0.1
                        );
                    });
                }
            });
        }
    }
    
    // Update detune amount if the slider exists
    if (detuneSlider) {
        detune = detuneSlider.value();
        select('#detune-value').html(detune.toFixed(1) + ' cents');
        
        // No need to update existing oscillators - will apply on next creation
    }
}

// Map visual frequency to audio frequency with different mappings
function mapFrequency(visualFreq) {
    if (audioMappingMode === 'linear') {
        return audioBaseFrequency + (visualFreq * audioFrequencyMultiplier);
    } else {
        // Exponential mapping for more musical results
        const baseFreq = 220; // A3
        const maxFreq = 1760; // A6 (3 octaves up)
        
        // Map visual frequency range to exponential audio frequency range
        const normalizedFreq = constrain(visualFreq, 0.005, 5) / 5;
        return baseFreq * Math.pow(maxFreq/baseFreq, normalizedFreq);
    }
}

// Create additional audio enhancement UI controls
function createAudioSliderControl(labelText, id, min, max, defaultValue, step) {
    const sliderDiv = createDiv();
    sliderDiv.parent('control-panel');
    sliderDiv.style('margin-bottom', '5px');
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
    if (id === 'filter-freq') {
        filterFreqSlider = createSlider(min, max, defaultValue, step);
        slider = filterFreqSlider;
    } else if (id === 'filter-res') {
        filterResSlider = createSlider(min, max, defaultValue, step);
        slider = filterResSlider;
    } else if (id === 'harmonics') {
        harmonicsSlider = createSlider(min, max, defaultValue, step);
        slider = harmonicsSlider;
    } else if (id === 'detune') {
        detuneSlider = createSlider(min, max, defaultValue, step);
        slider = detuneSlider;
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