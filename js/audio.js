// Audio components
let audioContext;
let oscillators = {};
let gainNodes = {};
let reverbNode;
let masterGainNode;
let reverbGainNode;
let isSoundEnabled = false;

// Initialize audio context and nodes
function initializeAudio() {
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node for overall volume
        masterGainNode = audioContext.createGain();
        masterGainNode.gain.value = defaults.volume;
        
        // Create reverb effect
        createReverb();
        
        // Connect master gain to destination
        masterGainNode.connect(audioContext.destination);
        
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

// Create a reverb effect
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
        
        // Fill impulse with noise that decays exponentially
        for (let channel = 0; channel < 2; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Decay factor
                const decay = Math.pow(0.95, i / (sampleRate * 0.1));
                // Random noise with decay
                impulseData[i] = (Math.random() * 2 - 1) * decay;
            }
        }
        
        // Set the impulse response
        reverbNode.buffer = impulse;
        
        // Create wet/dry paths
        // Dry path - direct to output
        masterGainNode.connect(audioContext.destination);
        
        // Wet path - through reverb
        masterGainNode.connect(reverbGainNode);
        reverbGainNode.connect(reverbNode);
        reverbNode.connect(audioContext.destination);
    } catch (e) {
        console.error("Reverb creation failed:", e);
    }
}

// Update reverb mix level
function updateReverbMix(reverbAmount) {
    if (!reverbGainNode) return;
    
    // Update the gain of the reverb node to adjust wet/dry mix
    reverbGainNode.gain.setValueAtTime(
        reverbAmount, 
        audioContext.currentTime
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
}