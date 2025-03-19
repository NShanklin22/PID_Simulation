// Drawing functions for signal visualization

// Draw the main signal grid
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

// Draw the X and Y axes with tick marks
function drawAxes() {
    stroke(axisColor);
    strokeWeight(2);
    
    // X-axis
    line(margin, margin + chartHeight, margin + chartWidth, margin + chartHeight);
    
    // Y-axis
    line(margin, margin, margin, margin + chartHeight);
    
    // Use the time from the first signal for x-axis time labels
    const currentTime = selectedSignals.length > 0 && signals[selectedSignals[0]] 
        ? Math.floor(signals[selectedSignals[0]].time)
        : 0;
    
    // X-axis ticks
    for (let x = 0; x <= chartWidth; x += tickSpacing) {
        // Draw tick marks
        line(margin + x, margin + chartHeight, margin + x, margin + chartHeight + tickLength);
        
        // Calculate time value for this position (right = current time, left = older time)
        const timeValue = currentTime - Math.floor((chartWidth - x) / tickSpacing);
        
        // Only show positive time values
        if (timeValue >= 0) {
            // Draw tick labels
            textAlign(CENTER, TOP);
            push();
            translate(margin + x, margin + chartHeight);
            textAlign(RIGHT);
            rotate(-PI/4);
            fill(themes[currentTheme].text);
            text(timeValue, -5, -tickSpacing/2 + 10);
            pop();
        }
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

// Draw the axis labels
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

// Draw the control panel background
function drawControlPanel() {
    fill(0, 0, 0, 230);
    stroke(themes[currentTheme].grid);
    strokeWeight(1);
    rect(margin + chartWidth + 40, margin - 30, controlWidth + 70, chartHeight + 60, 5);
}

// Main draw function to update the signal display
function drawSignalVisualizer() {
    // Set background based on theme
    background(themes[currentTheme].bg);
    
    // Draw chart elements
    drawGrid();
    drawAxes();
    drawAxisLabels();
    
    // Update parameters for all signals
    updateSignalParameters();
    
    // Draw control panel background
    drawControlPanel();
    
    // Update audio controls
    updateAudioControls();
}