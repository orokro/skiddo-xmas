// song.js

// --- 1. THE HARDWARE (18-Note Scale: G3 to C6) ---
export const keys = [
    "G3", "A3", "B3", 
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", 
    "C6"
];

// Map specific MIDI pitch numbers to our 18 indices
const midiMap = {
    55:0, 57:1, 59:2, // G3-B3
    60:3, 62:4, 64:5, 65:6, 67:7, 69:8, 71:9, // C4-B4
    72:10, 74:11, 76:12, 77:13, 79:14, 81:15, 83:16, // C5-B5
    84:17 // C6
};

// --- 2. RAW SONG DATA ---
// We embed the JSON directly here to ensure we get all 43 seconds of data.
const sourceData = {
  "tracks": [
    {
      "notes": [
        {"midi":84,"time":0},{"midi":88,"time":0},{"midi":91,"time":0},{"midi":95,"time":0},{"midi":98,"time":0},
        {"midi":84,"time":0.34},{"midi":88,"time":0.34},{"midi":91,"time":0.34},{"midi":95,"time":0.34},{"midi":98,"time":0.34},
        {"midi":88,"time":0.51},{"midi":84,"time":0.68},{"midi":88,"time":0.68},{"midi":91,"time":0.68},{"midi":95,"time":0.68},{"midi":98,"time":0.68},
        {"midi":84,"time":1.02},{"midi":88,"time":1.02},{"midi":93,"time":1.02},{"midi":95,"time":1.02},{"midi":98,"time":1.02},
        {"midi":91,"time":1.19},{"midi":96,"time":1.19},{"midi":84,"time":1.37},{"midi":88,"time":2.22},{"midi":91,"time":2.39},{"midi":88,"time":2.57},
        {"midi":84,"time":2.74},{"midi":84,"time":2.74},{"midi":87,"time":2.74},{"midi":91,"time":2.74},{"midi":91,"time":2.74},{"midi":94,"time":2.74},{"midi":98,"time":2.74},
        {"midi":88,"time":3.08},{"midi":91,"time":3.42},{"midi":85,"time":3.77},{"midi":85,"time":3.77},{"midi":89,"time":3.77},{"midi":92,"time":3.77},{"midi":93,"time":3.77},{"midi":96,"time":3.77},{"midi":99,"time":3.77},{"midi":94,"time":3.94},
        {"midi":91,"time":5.31},{"midi":84,"time":5.48},{"midi":88,"time":5.48},{"midi":91,"time":5.48},{"midi":95,"time":5.48},{"midi":98,"time":5.48},
        {"midi":84,"time":5.82},{"midi":88,"time":5.82},{"midi":91,"time":5.82},{"midi":95,"time":5.82},{"midi":98,"time":5.82},
        {"midi":88,"time":5.99},{"midi":84,"time":6.17},{"midi":88,"time":6.17},{"midi":91,"time":6.17},{"midi":95,"time":6.17},{"midi":98,"time":6.17},
        {"midi":88,"time":6.51},{"midi":93,"time":6.51},{"midi":95,"time":6.51},{"midi":98,"time":6.51},
        {"midi":84,"time":6.68},{"midi":91,"time":6.68},{"midi":91,"time":7.88},{"midi":93,"time":8.05},
        {"midi":88,"time":8.22},{"midi":91,"time":8.22},{"midi":95,"time":8.22},{"midi":95,"time":8.22},{"midi":98,"time":8.22},{"midi":102,"time":8.22},
        {"midi":91,"time":8.57},{"midi":88,"time":8.74},{"midi":91,"time":8.91},
        {"midi":86,"time":9.25},{"midi":89,"time":9.25},{"midi":93,"time":9.25},{"midi":96,"time":9.25},{"midi":98,"time":9.25},{"midi":100,"time":9.25},
        {"midi":95,"time":9.42},{"midi":85,"time":10.28},{"midi":88,"time":10.28},{"midi":92,"time":10.28},{"midi":93,"time":10.28},{"midi":95,"time":10.28},{"midi":98,"time":10.28},
        {"midi":91,"time":10.45},{"midi":85,"time":10.62},{"midi":91,"time":10.62},{"midi":91,"time":10.79},
        {"midi":84,"time":10.97},{"midi":88,"time":10.97},{"midi":91,"time":10.97},{"midi":95,"time":10.97},{"midi":95,"time":10.97},{"midi":98,"time":10.97},
        {"midi":91,"time":11.31},{"midi":91,"time":11.65},
        {"midi":84,"time":11.99},{"midi":88,"time":11.99},{"midi":91,"time":11.99},{"midi":93,"time":11.99},{"midi":95,"time":11.99},{"midi":98,"time":11.99},
        {"midi":91,"time":12.17},{"midi":91,"time":13.02},{"midi":84,"time":13.11},{"midi":88,"time":13.19},{"midi":91,"time":13.37},{"midi":93,"time":13.54},
        {"midi":84,"time":13.71},{"midi":87,"time":13.71},{"midi":91,"time":13.71},{"midi":91,"time":13.71},{"midi":94,"time":13.71},{"midi":98,"time":13.71},
        {"midi":88,"time":14.05},{"midi":91,"time":14.39},
        {"midi":85,"time":14.74},{"midi":89,"time":14.74},{"midi":92,"time":14.74},{"midi":93,"time":14.74},{"midi":96,"time":14.74},{"midi":99,"time":14.74},{"midi":94,"time":14.91},
        {"midi":85,"time":15.77},{"midi":84,"time":15.85},{"midi":91,"time":16.11},{"midi":93,"time":16.28},
        {"midi":84,"time":16.45},{"midi":88,"time":16.45},{"midi":91,"time":16.45},{"midi":95,"time":16.45},{"midi":98,"time":16.45},
        {"midi":88,"time":16.71},{"midi":95,"time":16.71},{"midi":98,"time":16.71},{"midi":91,"time":16.79},
        {"midi":84,"time":16.97},{"midi":88,"time":16.97},{"midi":95,"time":16.97},{"midi":98,"time":16.97},{"midi":91,"time":17.14},
        {"midi":84,"time":17.22},{"midi":88,"time":17.22},{"midi":95,"time":17.22},{"midi":98,"time":17.22},
        {"midi":84,"time":17.48},{"midi":88,"time":17.48},{"midi":91,"time":17.48},{"midi":93,"time":17.48},{"midi":95,"time":17.48},{"midi":98,"time":17.48},
        {"midi":91,"time":17.65},
        {"midi":84,"time":17.74},{"midi":88,"time":17.74},{"midi":95,"time":17.74},{"midi":98,"time":17.74},
        {"midi":84,"time":17.99},{"midi":88,"time":17.99},{"midi":95,"time":17.99},{"midi":98,"time":17.99},{"midi":91,"time":18.17},
        {"midi":84,"time":18.25},{"midi":88,"time":18.25},{"midi":95,"time":18.25},{"midi":98,"time":18.25},
        {"midi":84,"time":18.51},{"midi":88,"time":18.51},{"midi":91,"time":18.51},{"midi":95,"time":18.51},{"midi":98,"time":18.51},
        {"midi":84,"time":18.68},{"midi":88,"time":18.68},{"midi":91,"time":18.68},{"midi":95,"time":18.68},{"midi":98,"time":18.68},
        {"midi":84,"time":18.85},{"midi":88,"time":18.85},{"midi":91,"time":18.85},{"midi":95,"time":18.85},{"midi":98,"time":18.85},
        {"midi":84,"time":19.02},{"midi":88,"time":19.02},{"midi":91,"time":19.02},{"midi":95,"time":19.02},{"midi":98,"time":19.02},
        {"midi":84,"time":19.19},{"midi":88,"time":19.19},{"midi":91,"time":19.19},{"midi":91,"time":19.19},{"midi":95,"time":19.19},{"midi":98,"time":19.19},
        {"midi":91,"time":19.37},
        {"midi":84,"time":19.45},{"midi":88,"time":19.45},{"midi":95,"time":19.45},{"midi":98,"time":19.45},{"midi":91,"time":19.54},
        {"midi":84,"time":19.71},{"midi":88,"time":19.71},{"midi":91,"time":19.71},{"midi":91,"time":19.71},{"midi":95,"time":19.71},{"midi":98,"time":19.71},
        {"midi":91,"time":19.88},
        {"midi":84,"time":19.97},{"midi":88,"time":19.97},{"midi":95,"time":19.97},{"midi":98,"time":19.97},{"midi":91,"time":20.05},
        {"midi":84,"time":20.22},{"midi":88,"time":20.22},{"midi":91,"time":20.22},{"midi":91,"time":20.22},{"midi":95,"time":20.22},{"midi":98,"time":20.22},
        {"midi":91,"time":20.39},
        {"midi":84,"time":20.48},{"midi":88,"time":20.48},{"midi":95,"time":20.48},{"midi":98,"time":20.48},
        {"midi":91,"time":20.57},{"midi":91,"time":20.91},{"midi":91,"time":21.25},{"midi":91,"time":21.59},
        {"midi":88,"time":21.94},{"midi":91,"time":21.94},{"midi":95,"time":21.94},{"midi":98,"time":21.94},
        {"midi":84,"time":22.11},{"midi":84,"time":22.45},{"midi":98,"time":22.45},{"midi":84,"time":22.79},{"midi":98,"time":22.97},{"midi":84,"time":23.14},{"midi":84,"time":23.48},{"midi":98,"time":23.48},{"midi":84,"time":23.82},{"midi":98,"time":23.99},{"midi":84,"time":24.17},{"midi":84,"time":24.51},
        {"midi":86,"time":24.68},{"midi":90,"time":24.68},{"midi":93,"time":24.68},{"midi":95,"time":24.68},{"midi":91,"time":24.85},
        {"midi":91,"time":25.19},{"midi":93,"time":25.19},{"midi":91,"time":25.54},{"midi":93,"time":25.71},{"midi":91,"time":25.88},
        {"midi":91,"time":26.22},{"midi":93,"time":26.22},{"midi":91,"time":26.57},{"midi":93,"time":26.74},{"midi":91,"time":26.91},{"midi":93,"time":27.08},{"midi":91,"time":27.25},
        {"midi":88,"time":27.42},{"midi":91,"time":27.42},{"midi":95,"time":27.42},{"midi":98,"time":27.42},
        {"midi":84,"time":27.59},{"midi":84,"time":27.94},{"midi":98,"time":27.94},{"midi":84,"time":28.28},{"midi":98,"time":28.45},{"midi":84,"time":28.62},{"midi":84,"time":28.97},{"midi":98,"time":28.97},{"midi":84,"time":29.31},{"midi":98,"time":29.48},{"midi":84,"time":29.65},{"midi":98,"time":29.82},{"midi":84,"time":29.99},
        {"midi":86,"time":30.17},{"midi":90,"time":30.17},{"midi":93,"time":30.17},{"midi":95,"time":30.17},{"midi":91,"time":30.34},
        {"midi":91,"time":30.68},{"midi":93,"time":30.68},{"midi":91,"time":31.02},{"midi":93,"time":31.19},{"midi":91,"time":31.37},
        {"midi":91,"time":31.71},{"midi":93,"time":31.71},{"midi":91,"time":32.05},{"midi":93,"time":32.22},{"midi":91,"time":32.39},{"midi":93,"time":32.57},{"midi":91,"time":32.74},
        {"midi":88,"time":32.91},{"midi":91,"time":32.91},{"midi":95,"time":32.91},{"midi":98,"time":32.91},
        {"midi":84,"time":33.08},{"midi":84,"time":33.42},{"midi":98,"time":33.42},{"midi":84,"time":33.77},{"midi":98,"time":33.94},{"midi":84,"time":34.11},{"midi":84,"time":34.45},{"midi":98,"time":34.45},{"midi":84,"time":34.79},{"midi":98,"time":34.97},{"midi":84,"time":35.14},{"midi":98,"time":35.31},{"midi":84,"time":35.48},
        {"midi":86,"time":35.65},{"midi":90,"time":35.65},{"midi":93,"time":35.65},{"midi":95,"time":35.65},{"midi":91,"time":35.82},
        {"midi":91,"time":36.17},{"midi":93,"time":36.17},{"midi":91,"time":36.51},{"midi":93,"time":36.68},{"midi":91,"time":36.85},
        {"midi":91,"time":37.19},{"midi":93,"time":37.19},{"midi":91,"time":37.54},{"midi":93,"time":37.71},{"midi":91,"time":37.88},{"midi":93,"time":38.05},{"midi":91,"time":38.22},
        {"midi":98,"time":38.39},{"midi":98,"time":38.91},{"midi":98,"time":39.42},{"midi":98,"time":39.94},{"midi":98,"time":40.45},{"midi":98,"time":40.79},
        {"midi":93,"time":41.14},{"midi":93,"time":41.65},{"midi":93,"time":42.17},{"midi":93,"time":42.68},{"midi":93,"time":43.19},{"midi":91,"time":43.54}
      ]
    },
    {
      "notes": [
        {"midi":74,"time":0},{"midi":74,"time":0.51},{"midi":74,"time":1.02},{"midi":74,"time":1.54},{"midi":74,"time":2.05},
        {"midi":69,"time":2.74},{"midi":69,"time":3.25},{"midi":69,"time":3.77},{"midi":69,"time":4.28},{"midi":69,"time":4.79},{"midi":69,"time":5.14},
        {"midi":74,"time":5.48},{"midi":74,"time":5.99},{"midi":74,"time":6.51},{"midi":74,"time":7.02},{"midi":74,"time":7.54},{"midi":74,"time":7.88},
        {"midi":69,"time":8.22},{"midi":69,"time":8.74},{"midi":69,"time":9.25},{"midi":69,"time":9.77},{"midi":69,"time":10.28},{"midi":69,"time":10.62}
      ]
    },
    {
      "notes": [
        {"midi":74,"time":10.97},{"midi":74,"time":11.48},{"midi":74,"time":11.99},{"midi":74,"time":12.51},{"midi":74,"time":13.02},{"midi":74,"time":13.37},
        {"midi":69,"time":13.71},{"midi":69,"time":14.22},{"midi":69,"time":14.74},{"midi":69,"time":15.25},{"midi":69,"time":15.77},{"midi":69,"time":16.11},
        {"midi":74,"time":16.45},{"midi":74,"time":16.97},{"midi":74,"time":17.48},{"midi":74,"time":17.99},{"midi":74,"time":18.51},{"midi":74,"time":18.85},
        {"midi":69,"time":19.19},{"midi":69,"time":19.71},{"midi":69,"time":20.22},{"midi":69,"time":20.74},{"midi":69,"time":21.25},{"midi":67,"time":21.59}
      ]
    },
    {
        "notes": [
            {"midi":48,"time":0.17},{"midi":48,"time":0.51},{"midi":48,"time":0.85},{"midi":48,"time":1.19},{"midi":48,"time":1.54},{"midi":48,"time":1.88},{"midi":48,"time":2.22},{"midi":48,"time":2.57},
            {"midi":43,"time":2.91},{"midi":43,"time":3.25},{"midi":43,"time":3.60},{"midi":43,"time":3.94},{"midi":43,"time":4.28},{"midi":43,"time":4.62},{"midi":43,"time":4.97},{"midi":43,"time":5.31}
        ]
    },
    {
        "notes": [
            {"midi":48,"time":5.65},{"midi":48,"time":6.00},{"midi":48,"time":6.34},{"midi":48,"time":6.68},{"midi":48,"time":7.02},{"midi":48,"time":7.37},{"midi":48,"time":7.71},{"midi":48,"time":8.05},
            {"midi":43,"time":8.40},{"midi":43,"time":8.74},{"midi":43,"time":9.08},{"midi":43,"time":9.42},{"midi":43,"time":9.77},{"midi":43,"time":10.11},{"midi":43,"time":10.45},{"midi":43,"time":10.80}
        ]
    },
    {
        "notes": [
            {"midi":48,"time":11.14},{"midi":48,"time":11.48},{"midi":48,"time":11.82},{"midi":48,"time":12.17},{"midi":48,"time":12.51},{"midi":48,"time":12.85},{"midi":48,"time":13.20},{"midi":48,"time":13.54},
            {"midi":43,"time":13.88},{"midi":43,"time":14.22},{"midi":43,"time":14.57},{"midi":43,"time":14.91},{"midi":43,"time":15.25},{"midi":43,"time":15.60},{"midi":43,"time":15.94},{"midi":43,"time":16.28}
        ]
    },
    {
        "notes": [
            {"midi":48,"time":16.62},{"midi":48,"time":16.97},{"midi":48,"time":17.31},{"midi":48,"time":17.65},{"midi":48,"time":18.00},{"midi":48,"time":18.34},{"midi":48,"time":18.68},{"midi":48,"time":19.02},
            {"midi":43,"time":19.37},{"midi":43,"time":19.71},{"midi":43,"time":20.05},{"midi":43,"time":20.40},{"midi":43,"time":20.74},{"midi":43,"time":21.08}
        ]
    },
    {
        "notes": [
            {"midi":60,"time":0},{"midi":64,"time":0},{"midi":67,"time":0},{"midi":71,"time":0},{"midi":74,"time":0},
            {"midi":55,"time":2.74},{"midi":59,"time":2.74},{"midi":62,"time":2.74},{"midi":66,"time":2.74},{"midi":69,"time":2.74}
        ]
    },
    {
        "notes": [
            {"midi":60,"time":5.48},{"midi":64,"time":5.48},{"midi":67,"time":5.48},{"midi":71,"time":5.48},{"midi":74,"time":5.48},
            {"midi":55,"time":8.22},{"midi":59,"time":8.22},{"midi":62,"time":8.22},{"midi":66,"time":8.22},{"midi":69,"time":8.22}
        ]
    },
    {
        "notes": [
            {"midi":60,"time":10.97},{"midi":64,"time":10.97},{"midi":67,"time":10.97},{"midi":71,"time":10.97},{"midi":74,"time":10.97},
            {"midi":55,"time":13.71},{"midi":59,"time":13.71},{"midi":62,"time":13.71},{"midi":66,"time":13.71},{"midi":69,"time":13.71}
        ]
    },
    {
        "notes": [
            {"midi":60,"time":16.45},{"midi":64,"time":16.45},{"midi":67,"time":16.45},{"midi":71,"time":16.45},{"midi":74,"time":16.45},
            {"midi":55,"time":19.20},{"midi":59,"time":19.20},{"midi":62,"time":19.20},{"midi":66,"time":19.20},{"midi":69,"time":19.20}
        ]
    }
  ]
};

// --- 3. PROCESSING LOGIC ---
// This runs once when the app loads to generate the clean note list

function mapPitchToKeyIndex(midi) {
    // 1. Fold Octaves: Bring extremely high/low notes into the 55-84 range (G3 to C6)
    // We want the melody to sit in C5-C6 (72-84) and bass in G3-B4 (55-71)
    
    // Safety break to prevent infinite loops
    let safeguard = 0;
    while (midi < 55 && safeguard < 10) { midi += 12; safeguard++; }
    safeguard = 0;
    while (midi > 84 && safeguard < 10) { midi -= 12; safeguard++; }

    // 2. Exact Match?
    if (midiMap[midi] !== undefined) return midiMap[midi];

    // 3. Nearest Neighbor (Quantize to Scale)
    let closest = -1;
    let minDist = 999;
    for (let keyMidi in midiMap) {
        let dist = Math.abs(midi - parseInt(keyMidi));
        if (dist < minDist) {
            minDist = dist;
            closest = midiMap[keyMidi];
        }
    }
    return closest;
}

const processedNotes = [];
const seen = new Set(); // To remove exact duplicates (time + key)

// Iterate ALL tracks in the source data
sourceData.tracks.forEach(track => {
    track.notes.forEach(n => {
        const k = mapPitchToKeyIndex(n.midi);
        
        // Round time to 2 decimals to catch overlaps effectively
        const tRounded = n.time.toFixed(2);
        const id = `${tRounded}_${k}`;
        
        if (!seen.has(id)) {
            seen.add(id);
            processedNotes.push({
                startTime: n.time,
                endTime: n.time + 1.0,
                key: k
            });
        }
    });
});

// Sort chronologically
processedNotes.sort((a, b) => a.startTime - b.startTime);

// Export Final Object
export const song = { 
    songName: "VisiPiano", 
    speed: 0.75, 
    keys: keys, 
    notes: processedNotes 
};