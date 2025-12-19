// song7.js

// --- 1. THE HARDWARE (18-Note Scale: G3 to C6) ---
export const keys = [
    "G3", "A3", "B3", 
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", 
    "C6"
];

// --- 2. MAPPING LOGIC ---
// The input is in D Major (F#, C#). 
// We transpose DOWN 2 semitones to C Major to fit the white-key drum.
// Mapping:
// D4  -> C4  (Index 3)
// C#4 -> B3  (Index 2)
// E4  -> D4  (Index 4)
// F#4 -> E4  (Index 5)
// G4  -> F4  (Index 6)
// A4  -> G4  (Index 7)

const keyMap = {
    "C#4": 2, // B3
    "D4":  3, // C4
    "E4":  4, // D4
    "F#4": 5, // E4
    "G4":  6, // F4
    "A4":  7  // G4
};

// --- 3. SONG DATA (From your JSON) ---
const rawData = [
    { "note": "A4", "duration": 1 },
    { "note": "F#4", "duration": 0.5 },
    { "note": "D4", "duration": 1 },
    { "note": "F#4", "duration": 1 },
    { "note": "A4", "duration": 1 },
    { "note": "G4", "duration": 1 },
    { "note": "E4", "duration": 2 },
    { "note": "REST", "duration": 0.5 },
    
    { "note": "A4", "duration": 1 },
    { "note": "F#4", "duration": 0.5 },
    { "note": "D4", "duration": 1 },
    { "note": "F#4", "duration": 1 },
    { "note": "A4", "duration": 1 },
    { "note": "G4", "duration": 1 },
    { "note": "E4", "duration": 2 },
    { "note": "REST", "duration": 0.5 },
    
    { "note": "D4", "duration": 0.5 },
    { "note": "D4", "duration": 0.5 },
    { "note": "C#4", "duration": 0.5 },
    { "note": "D4", "duration": 0.5 },
    { "note": "E4", "duration": 0.5 },
    { "note": "F#4", "duration": 0.5 },
    { "note": "G4", "duration": 2 },
    { "note": "REST", "duration": 1 },
    
    { "note": "A4", "duration": 1 },
    { "note": "G4", "duration": 1 },
    { "note": "F#4", "duration": 1 },
    { "note": "E4", "duration": 1 },
    { "note": "D4", "duration": 3 }
];

// --- 4. GENERATE TIMELINE ---
// Tempo = 110 BPM. 
// 1 Beat = 60/110 seconds = ~0.545 seconds
const beatDuration = 60 / 110; 

const processedNotes = [];
let currentTime = 0;

rawData.forEach(n => {
    // If it's a note (not a rest), add it
    if (n.note !== "REST" && keyMap[n.note] !== undefined) {
        processedNotes.push({
            startTime: currentTime,
            endTime: currentTime + (n.duration * beatDuration), // Sustain for full duration
            key: keyMap[n.note]
        });
    }
    // Advance time
    currentTime += (n.duration * beatDuration);
});

export const song = { 
    songName: "We're a Couple of Misfits (JSON)", 
    speed: 1.0, 
    keys: keys, 
    notes: processedNotes 
};