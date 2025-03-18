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
        
        // For audio - actual frequency in Hz
        this.audioFrequency = audioBaseFrequency; 
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
        
        // Calculate audio frequency based on visual frequency and amplitude
        this.audioFrequency = audioBaseFrequency + (this.frequency * audioFrequencyMultiplier);
        
        // Update audio parameters if sound is enabled
        if (isSoundEnabled && oscillators[this.name]) {
            this.updateAudio();
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
    
    // Create audio oscillator for this signal
    createAudio() {
        if (!audioContext) return;
        
        // Create an oscillator for this signal
        const oscillator = audioContext.createOscillator();
        
        // Set oscillator type based on signal type
        switch(this.type) {
            case "sine":
                oscillator.type = "sine";
                break;
            case "cosine":
                oscillator.type = "sine"; // Cosine is just a phase-shifted sine
                break;
            case "random":
            case "perlin":
                oscillator.type = "sawtooth"; // Use sawtooth for noise-like signals
                break;
            case "setpoint":
                oscillator.type = "square"; // Use square for setpoint
                break;
            default:
                oscillator.type = "sine";
        }
        
        // Set initial frequency
        oscillator.frequency.value = this.audioFrequency;
        
        // Create a gain node for this oscillator's volume
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0; // Start silent
        
        // Connect oscillator to its gain node, then to the master gain (which includes reverb)
        oscillator.connect(gainNode);
        gainNode.connect(masterGainNode);
        
        // Start the oscillator
        oscillator.start();
        
        // Store oscillator and gain node
        oscillators[this.name] = oscillator;
        gainNodes[this.name] = gainNode;
    }
    
    // Update audio parameters based on visual parameters
    updateAudio() {
        if (!oscillators[this.name] || !gainNodes[this.name]) return;
        
        // Update frequency
        if (this.type !== "setpoint") {
            // Scale frequency based on visual frequency parameter
            oscillators[this.name].frequency.setValueAtTime(
                this.audioFrequency, 
                audioContext.currentTime
            );
        }
        
        // Update volume based on amplitude and selected state
        const masterVolume = volumeSlider ? volumeSlider.value() : defaults.volume;
        const isSelected = selectedSignals.includes(this.name === "Sine Wave" ? "Sine" : 
                                                  this.name === "Cosine Wave" ? "Cosine" : 
                                                  this.name);
        
        // Set gain based on whether this signal is selected and its amplitude
        const targetGain = isSelected ? (this.amplitude * masterVolume * 0.2) : 0;
        
        // Smooth transition to new gain value
        gainNodes[this.name].gain.setTargetAtTime(
            targetGain,
            audioContext.currentTime,
            audioTransitionTime
        );
    }
}