# Signal Project Structure

```
signal/
│
├── index.html            - Main HTML file
├── css/
│   └── styles.css        - Main stylesheet
│
├── js/
│   ├── main.js           - Entry point and setup
│   ├── config.js         - Configuration and constants
│   ├── Signal.js         - Signal class definition
│   ├── audio.js          - Audio functionality
│   ├── ui/
│   │   ├── controls.js   - UI controls creation
│   │   ├── themes.js     - Theme management
│   │   └── rendering.js  - Drawing functions
│   └── utils.js          - Utility functions
```

## File Responsibilities

1. **index.html**: HTML structure and script loading
2. **styles.css**: Basic styling for the page
3. **main.js**: Initializes the signal visualizer, connects components
4. **config.js**: Constants, defaults, and configuration settings
5. **Signal.js**: Signal class for generating and displaying waveforms
6. **audio.js**: Audio context creation and sound generation
7. **ui/controls.js**: Creates UI control elements
8. **ui/themes.js**: Theme management and styling
9. **ui/rendering.js**: Grid, axes, and label drawing functions
10. **utils.js**: Helper and utility functions