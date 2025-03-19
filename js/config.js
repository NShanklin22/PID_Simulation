// Canvas dimensions
const canvasWidth = 1200;
const canvasHeight = 700;

// Chart dimensions
const margin = 100;
const chartWidth = 700;
const chartHeight = canvasHeight - 2 * margin;

// UI control area - positioning
const controlX = chartWidth + margin * 2 - 20;
const controlWidth = 210;

// Axis properties
const tickLength = 5;
const tickSpacing = 25;
const axisColor = 0;

// Create Labels
const labelX = "Time";
const labelY = "Amplitude";

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

// Default settings
const defaults = {
    theme: 'Fallout',
    amplitude: 1,
    frequency: 0.02,
    setpoint: 0,
    volume: 0.5,
    reverb: 0.3,
    signals: ['Sine']
};

// Signal type definitions and opacities
const signalTypes = ['Sine', 'Cosine', 'Random', 'Perlin', 'Setpoint'];

const signalOpacities = {
    Sine: 255,
    Cosine: 180, 
    Random: 160,
    Perlin: 140,
    Setpoint: 120
};

// Audio settings
const audioBaseFrequency = 220; // A3 note
const audioFrequencyMultiplier = 10000;
const audioTransitionTime = 0.1; // seconds