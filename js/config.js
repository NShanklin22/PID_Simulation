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

// Scrolling parameters
const scrollSpeed = 1; // Default speed at which the chart scrolls horizontally

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
    },
    Amber: {
        bg: [0, 0, 0],
        grid: [102, 51, 0],
        text: [255, 191, 0],
        signal: [255, 191, 0]
    },
    Cyan: {
        bg: [0, 0, 0],
        grid: [0, 95, 95],
        text: [0, 255, 255],
        signal: [0, 255, 255]
    },
    Purple: {
        bg: [0, 0, 0],
        grid: [55, 0, 55],
        text: [138, 43, 226],
        signal: [138, 43, 226]
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
    signals: ['Sine'],
    filterFreq: 1000,
    filterRes: 5,
    harmonics: 0.5,
    detune: 5
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

// Analyzer node and buffer for audio visualization
let analyzerNode;
let analyzerBuffer;

// Musical note frequencies (A4 = 440Hz standard tuning)
const musicNotes = {
    'C3': 130.81,
    'C#3/Db3': 138.59,
    'D3': 146.83,
    'D#3/Eb3': 155.56,
    'E3': 164.81,
    'F3': 174.61,
    'F#3/Gb3': 185.00,
    'G3': 196.00,
    'G#3/Ab3': 207.65,
    'A3': 220.00,
    'A#3/Bb3': 233.08,
    'B3': 246.94,
    'C4': 261.63,
    'C#4/Db4': 277.18,
    'D4': 293.66,
    'D#4/Eb4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4/Gb4': 369.99,
    'G4': 392.00,
    'G#4/Ab4': 415.30,
    'A4': 440.00,
    'A#4/Bb4': 466.16,
    'B4': 493.88,
    'C5': 523.25
};

// Keyboard shortcuts info
const keyboardShortcuts = {
    'S': 'Toggle Sound',
    'T': 'Cycle Themes',
    '1-5': 'Toggle Signal Types'
};