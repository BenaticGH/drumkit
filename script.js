const drumSamples = {
    kick: 'C1',
    closedHiHat: 'C#1',
    openHiHat: 'D1',
    snare: 'D#1',
    clap: 'E1',
    crash: 'F1'
};

const sampleURLs = {
    'C1': 'kick.wav',
    'C#1': 'closed-hihat.wav',
    'D1': 'open-hihat.wav',
    'D#1': 'snare.wav',
    'E1': 'clap.wav',
    'F1': 'crash.wav'
};

const sequencer = document.getElementById('sequencer');
const playPauseButton = document.getElementById('play-pause');
const bpmInput = document.getElementById('bpm');
const volumeSlider = document.getElementById('volume');

const rows = ['kick', 'closedHiHat', 'openHiHat', 'snare', 'clap', 'crash'];
const steps = 16;
let isPlaying = false;
let currentStep = 0;

// Create sequencer grid
rows.forEach(row => {
    const rowElement = document.createElement('div');
    rowElement.className = 'row';
    
    const rowLabel = document.createElement('div');
    rowLabel.className = 'row-label';
    rowLabel.textContent = row;
    rowElement.appendChild(rowLabel);

    for (let i = 0; i < steps; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.step = i;
        cell.addEventListener('click', toggleCell);
        rowElement.appendChild(cell);
    }
    sequencer.appendChild(rowElement);
});

// Toggle cell state
function toggleCell(e) {
    e.target.classList.toggle('active');
}

// Initialize Tone.js
let sampler;
let audioContextStarted = false;

// Create and load sampler
async function createSampler() {
    return new Promise((resolve) => {
        sampler = new Tone.Sampler({
            urls: sampleURLs,
            baseUrl: './', // Set the base URL to the current directory
            onload: () => {
                resolve();
            }
        }).toDestination();
    });
}

// Initialize audio and start playing
async function initAudioAndPlay() {
    if (!audioContextStarted) {
        await Tone.start();
        audioContextStarted = true;
        await createSampler();
    }
    
    if (!isPlaying) {
        Tone.Transport.start();
        playPauseButton.textContent = 'Pause';
        isPlaying = true;
    } else {
        Tone.Transport.stop();
        playPauseButton.textContent = 'Play';
        isPlaying = false;
    }
}

// Play/Pause button
playPauseButton.addEventListener('click', initAudioAndPlay);

// BPM change
bpmInput.addEventListener('input', () => {
    Tone.Transport.bpm.value = parseFloat(bpmInput.value);
});

// Volume change
volumeSlider.addEventListener('input', () => {
    if (sampler) {
        sampler.volume.value = Tone.gainToDb(parseFloat(volumeSlider.value));
    }
});

// Sequencer loop
Tone.Transport.scheduleRepeat((time) => {
    const currentCells = document.querySelectorAll(`.cell[data-step="${currentStep}"]`);
    currentCells.forEach(cell => {
        if (cell.classList.contains('active') && sampler && sampler.loaded) {
            sampler.triggerAttackRelease(drumSamples[cell.dataset.row], '16n', time);
        }
    });

    currentStep = (currentStep + 1) % steps;
}, '16n');

// Set initial BPM
Tone.Transport.bpm.value = parseFloat(bpmInput.value);