// song4.js

// --- 1. THE HARDWARE (18-Note Scale: G3 to C6) ---
export const keys = [
    "G3", "A3", "B3", 
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", 
    "C6"
];

// Key Indices for Melody
// C4=3, D4=4, E4=5, F4=6, G4=7, A4=8, B4=9, C5=10, D5=11
const [C4, D4, E4, F4, G4, A4, B4, C5, D5] = [3, 4, 5, 6, 7, 8, 9, 10, 11];

// --- 2. SONG DATA ---
// Manually arranged timeline to ensure mechanical perfection
const notes = [
    // "Jingle bells, jingle bells, jingle all the way"
    { t: 0.0, k: E4 }, { t: 0.5, k: E4 }, { t: 1.0, k: E4 }, // E E E (2 beats)
    { t: 2.0, k: E4 }, { t: 2.5, k: E4 }, { t: 3.0, k: E4 }, // E E E
    { t: 4.0, k: E4 }, { t: 4.5, k: G4 }, { t: 5.0, k: C4 }, { t: 5.5, k: D4 }, { t: 6.0, k: E4 }, // E G C D E...

    // "Oh what fun it is to ride in a one horse open sleigh"
    { t: 8.0, k: F4 }, { t: 8.5, k: F4 }, { t: 9.0, k: F4 }, { t: 9.5, k: F4 }, 
    { t: 10.0, k: F4 }, { t: 10.5, k: E4 }, { t: 11.0, k: E4 }, { t: 11.5, k: E4 }, 
    { t: 12.0, k: E4 }, { t: 12.5, k: D4 }, { t: 13.0, k: D4 }, { t: 13.5, k: E4 }, 
    { t: 14.0, k: D4 }, { t: 15.0, k: G4 },

    // REPEAT: "Jingle bells..."
    { t: 16.0, k: E4 }, { t: 16.5, k: E4 }, { t: 17.0, k: E4 }, 
    { t: 18.0, k: E4 }, { t: 18.5, k: E4 }, { t: 19.0, k: E4 }, 
    { t: 20.0, k: E4 }, { t: 20.5, k: G4 }, { t: 21.0, k: C4 }, { t: 21.5, k: D4 }, { t: 22.0, k: E4 }, 

    // ENDING: "One horse open sleigh!"
    { t: 24.0, k: F4 }, { t: 24.5, k: F4 }, { t: 25.0, k: F4 }, { t: 25.5, k: F4 }, 
    { t: 26.0, k: F4 }, { t: 26.5, k: E4 }, { t: 27.0, k: E4 }, { t: 27.5, k: E4 }, 
    { t: 28.0, k: G4 }, { t: 28.5, k: G4 }, { t: 29.0, k: F4 }, { t: 29.5, k: D4 }, 
    { t: 30.0, k: C4 }
];

// Process into standard format
const processedNotes = notes.map(n => ({
    startTime: n.t * 0.5, // Speed scaling (Make it slightly faster/slower here)
    endTime: (n.t * 0.5) + 0.4,
    key: n.k
}));

export const song = { 
    songName: "Jingle Bells", 
    speed: 1.0, 
    keys: keys, 
    notes: processedNotes 
};