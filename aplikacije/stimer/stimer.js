let audioContext;
let micStream;
let pitch;

const canvas = document.getElementById('tunerCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 120;

const noteDisplay = document.querySelector('.note-display');
const frequencyDisplay = document.querySelector('.frequency-display');
const startButton = document.getElementById('startButton');
const pitchDisplay = document.createElement('div');
pitchDisplay.className = 'pitch-direction';
document.querySelector('.tuner-container').insertBefore(pitchDisplay, frequencyDisplay.nextSibling);

const style = document.createElement('style');
style.textContent = `
    .pitch-direction {
        font-size: 24px;
        margin: 10px 0;
        font-weight: bold;
        color: #ff4444;
        height: 29px;
        line-height: 29px;
    }
    .frequency-display {
        height: 29px;
        line-height: 29px;
        min-width: 120px;
    }
    .note-display {
        height: 58px;
        line-height: 58px;
        min-width: 80px;
    }
`;
document.head.appendChild(style);

let tuneAudioContext;
let wasInTune = false;

const SMOOTHING_FACTOR = 0.04;
const MIN_GUITAR_FREQ = 50;
const MAX_GUITAR_FREQ = 1000;
const MAX_NEEDLE_ANGLE = Math.PI;
const IN_TUNE_THRESHOLD = 5;

const guitarStrings = {
    'E2': 82.41,
    'A2': 110.00,
    'D3': 146.83,
    'G3': 196.00,
    'B3': 246.94,
    'E4': 329.63
};

const stringRanges = {
    'E2': { min: 70, max: 95 },
    'A2': { min: 100, max: 125 },
    'D3': { min: 140, max: 155 },
    'G3': { min: 188, max: 204 },
    'B3': { min: 238, max: 256 },
    'E4': { min: 318, max: 341 }
};

let isListening = false;
let targetNote = null;
let currentNeedleAngle = 0;

function playInTuneSound() {
    if (tuneAudioContext) tuneAudioContext.close();

    tuneAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = tuneAudioContext.createOscillator();
    const gainNode = tuneAudioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, tuneAudioContext.currentTime);

    gainNode.gain.setValueAtTime(0, tuneAudioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, tuneAudioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.2, tuneAudioContext.currentTime + 0.5);
    gainNode.gain.linearRampToValueAtTime(0, tuneAudioContext.currentTime + 0.8);

    oscillator.connect(gainNode);
    gainNode.connect(tuneAudioContext.destination);

    oscillator.start();
    oscillator.stop(tuneAudioContext.currentTime + 0.8);
}

function drawTunerFace() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw main circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw green zone at top center
    const greenZoneStartAngle = -Math.PI/6; // -30 degrees
    const greenZoneEndAngle = Math.PI/6;    // +30 degrees
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius - 5, greenZoneStartAngle, greenZoneEndAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 5, greenZoneStartAngle, greenZoneEndAngle);
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw tick marks
    for (let i = -5; i <= 5; i++) {
        const angle = i * Math.PI/6;  // Distribute marks evenly across 180 degrees
        const startRadius = radius - (i === 0 ? 25 : 20);
        const endRadius = radius - 10;
        
        const startX = centerX + Math.cos(angle) * startRadius;
        const startY = centerY - Math.sin(angle) * startRadius;  // Note the minus sign
        const endX = centerX + Math.cos(angle) * endRadius;
        const endY = centerY - Math.sin(angle) * endRadius;      // Note the minus sign

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = i === 0 ? '#4CAF50' : '#666';
        ctx.lineWidth = i === 0 ? 3 : 2;
        ctx.stroke();

        // Add labels
        if (i !== 0) {
            const textRadius = radius - 35;
            const textX = centerX + Math.cos(angle) * textRadius;
            const textY = centerY - Math.sin(angle) * textRadius;  // Note the minus sign
            
            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(-angle);  // Rotate text to be readable
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Show "Low" on left side and "High" on right side
            if (i < 0) {
                ctx.fillText("Low", 0, 0);
            } else if (i > 0) {
                ctx.fillText("High", 0, 0);
            }
            ctx.restore();
        }
    }

    // Draw center point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

function drawNeedleSmooth(angle, isInTune) {
    ctx.save();
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    const x = centerX + Math.cos(angle) * (radius - 20);
    const y = centerY - Math.sin(angle) * (radius - 20);  // Note the minus sign
    ctx.lineTo(x, y);
    
    ctx.strokeStyle = isInTune ? '#4CAF50' : '#ff4444';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.shadowColor = 'transparent';
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, isInTune ? 8 : 6, 0, Math.PI * 2);
    ctx.fillStyle = isInTune ? '#4CAF50' : '#ff4444';
    ctx.fill();
    
    ctx.restore();
}

function findClosestNote(frequency) {
    if (frequency < MIN_GUITAR_FREQ || frequency > MAX_GUITAR_FREQ) {
        return null;
    }

    if (frequency < 130) {
        if (frequency >= stringRanges['E2'].min && frequency <= stringRanges['E2'].max) {
            return 'E2';
        }
        if (frequency >= stringRanges['A2'].min && frequency <= stringRanges['A2'].max) {
            return 'A2';
        }
    }

    for (const [note, range] of Object.entries(stringRanges)) {
        if (note !== 'E2' && note !== 'A2' && 
            frequency >= range.min && frequency <= range.max) {
            return note;
        }
    }

    let closestNote = null;
    let minDifference = Infinity;

    for (const [note, noteFreq] of Object.entries(guitarStrings)) {
        const difference = Math.abs(frequency - noteFreq);
        const weight = (note === 'E2' || note === 'A2') ? 0.7 : 1;
        if ((difference * weight) < minDifference) {
            minDifference = difference * weight;
            closestNote = note;
        }
    }

    return closestNote;
}

function centsOffPitch(frequency, targetFrequency) {
    return Math.floor(1200 * Math.log2(frequency / targetFrequency));
}

function frequencyToAngle(freq, targetFreq) {
    const cents = 1200 * Math.log2(freq / targetFreq);
    // Map cents to angle: negative cents (low) to left, positive (high) to right
    let angle = (cents / 50) * (Math.PI / 6);  // Scale factor adjusted for sensitivity
    angle = Math.max(-MAX_NEEDLE_ANGLE/2, Math.min(MAX_NEEDLE_ANGLE/2, angle));
    return angle;
}

async function processAudio() {
    if (!isListening || !pitch) return;

    const frequency = await new Promise((resolve) => {
        pitch.getPitch((err, freq) => {
            if (err) {
                console.error(err);
                resolve(null);
            } else {
                resolve(freq);
            }
        });
    });

    if (frequency && frequency > MIN_GUITAR_FREQ && frequency < MAX_GUITAR_FREQ) {
        const closestNote = findClosestNote(frequency);
        const referenceNote = targetNote || closestNote;
        const referenceFreq = guitarStrings[referenceNote];
        const cents = centsOffPitch(frequency, referenceFreq);

        if (!targetNote) {
            noteDisplay.textContent = closestNote;
        }
        frequencyDisplay.textContent = `${frequency.toFixed(1)} Hz`;

        const isInTune = Math.abs(cents) < IN_TUNE_THRESHOLD;
        
        if (isInTune) {
            pitchDisplay.textContent = "Žica naštimovana";
            pitchDisplay.style.color = "#4CAF50";
            if (!wasInTune) {
                playInTuneSound();
            }
        } else {
            const direction = frequency > referenceFreq ? "Previsoko! ↑" : "Prenisko! ↓";
            pitchDisplay.textContent = direction;
            pitchDisplay.style.color = "#ff4444";
        }
        wasInTune = isInTune;

        let targetAngle = frequencyToAngle(frequency, referenceFreq);
        
        if (isInTune) {
            targetAngle = -Math.PI/2;
        }

        currentNeedleAngle = currentNeedleAngle * (1 - SMOOTHING_FACTOR) + targetAngle * SMOOTHING_FACTOR;

        drawTunerFace();
        drawNeedleSmooth(currentNeedleAngle, isInTune);
    } else {
        pitchDisplay.textContent = "";
    }

    if (isListening) {
        requestAnimationFrame(processAudio);
    }
}

document.querySelectorAll('.string-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.string-button').forEach(btn =>
            btn.classList.remove('active'));
        button.classList.add('active');
        targetNote = button.dataset.note;
        noteDisplay.textContent = targetNote;
    });
});

startButton.addEventListener('click', async () => {
    try {
        if (!isListening) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStream = stream;

            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            
            pitch = ml5.pitchDetection(
                'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/',
                audioContext,
                micStream,
                function() {
                    isListening = true;
                    startButton.textContent = 'Stop';
                    processAudio();
                }
            );
        } else {
            isListening = false;
            startButton.textContent = 'Počni Štimovanje';

            if (pitch && pitch.audioContext) {
                pitch.audioContext.close();
            }

            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
            }

            if (tuneAudioContext) tuneAudioContext.close();
            noteDisplay.textContent = '--';
            frequencyDisplay.textContent = '-- Hz';
            pitchDisplay.textContent = '';
            wasInTune = false;
            drawTunerFace();
            drawNeedleSmooth(0);
        }
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Unable to access microphone. Please ensure you have granted permission.');
    }
});

drawTunerFace();
drawNeedleSmooth(0);