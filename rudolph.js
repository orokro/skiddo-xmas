// song5.js

export const keys = [
    "G3", "A3", "B3", 
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", 
    "C6"
];

// Indices Map
// G3=0, A3=1, B3=2, C4=3, ...
const [G3, B3, C4, D4, E4, F4, G4, A4, B4, C5, D5, A5] = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15];

const notes = [
    // "Rudolph the Red-Nosed Reindeer"
    // Melody: G A G E C A G
    {t:0, k:G4}, {t:1, k:A4}, {t:2, k:G4}, {t:3, k:E4}, {t:4, k:C5}, {t:6, k:A4}, {t:8, k:G4},
    // Bass
    {t:0, k:C4}, {t:4, k:E4}, {t:8, k:C4},

    // "Had a very shiny nose"
    // Melody: G A G A G C B
    {t:10, k:G4}, {t:11, k:A4}, {t:12, k:G4}, {t:13, k:A4}, {t:14, k:G4}, {t:16, k:C5}, {t:18, k:B4},
    // Bass
    {t:14, k:E4}, {t:18, k:G3},

    // "And if you ever saw it"
    // Melody: F G F D B A G
    {t:20, k:F4}, {t:21, k:G4}, {t:22, k:F4}, {t:23, k:D4}, {t:24, k:B4}, {t:26, k:A4}, {t:28, k:G4},
    // Bass
    {t:20, k:D4}, {t:24, k:G3}, {t:28, k:B3}, // <--- B3 is now defined!

    // "You would even say it glows"
    // Melody: G A G A G D C
    {t:30, k:G4}, {t:31, k:A4}, {t:32, k:G4}, {t:33, k:A4}, {t:34, k:G4}, {t:36, k:D5}, {t:38, k:C5},
    // Bass
    {t:34, k:F4}, {t:38, k:C4}, {t:38, k:E4}, {t:38, k:G4} // Final Chord
];

// Process (0.35s per tick = ~170 BPM)
const processedNotes = notes.map(n => ({
    startTime: n.t * 0.35, 
    endTime: (n.t * 0.35) + 0.5,
    key: n.k
}));

export const song = { 
    songName: "Rudolph", 
    speed: 1.0, 
    keys: keys, 
    notes: processedNotes 
};