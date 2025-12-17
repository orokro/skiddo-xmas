// song3.js

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

// --- 2. RAW SONG DATA (VisiPiano 4) ---
const sourceData = {
  "tracks": [
    { "id": 0, "notes": [] },
    {
      "id": 1, "notes": [
        {"midi":60,"time":0},{"midi":64,"time":0},{"midi":67,"time":0},{"midi":71,"time":0},{"midi":74,"time":0},
        {"midi":60,"time":0.342},{"midi":64,"time":0.342},{"midi":67,"time":0.342},{"midi":71,"time":0.342},{"midi":74,"time":0.342},
        {"midi":64,"time":0.514},
        {"midi":60,"time":0.685},{"midi":64,"time":0.685},{"midi":67,"time":0.685},{"midi":71,"time":0.685},{"midi":74,"time":0.685},
        {"midi":60,"time":1.028},{"midi":64,"time":1.028},{"midi":69,"time":1.028},{"midi":71,"time":1.028},{"midi":74,"time":1.028},
        {"midi":67,"time":1.199},{"midi":72,"time":1.199},{"midi":60,"time":1.371},
        {"midi":64,"time":2.228},{"midi":67,"time":2.399},{"midi":64,"time":2.571},
        {"midi":60,"time":2.742},{"midi":60,"time":2.742},{"midi":63,"time":2.742},{"midi":67,"time":2.742},{"midi":67,"time":2.742},{"midi":70,"time":2.742},{"midi":74,"time":2.742},
        {"midi":64,"time":3.085},{"midi":67,"time":3.428},
        {"midi":61,"time":3.771},{"midi":61,"time":3.771},{"midi":65,"time":3.771},{"midi":68,"time":3.771},{"midi":69,"time":3.771},{"midi":72,"time":3.771},{"midi":75,"time":3.771},
        {"midi":70,"time":3.942},
        {"midi":67,"time":5.314},{"midi":60,"time":5.485},{"midi":64,"time":5.485},{"midi":67,"time":5.485},{"midi":71,"time":5.485},{"midi":74,"time":5.485},
        {"midi":60,"time":5.828},{"midi":64,"time":5.828},{"midi":67,"time":5.828},{"midi":71,"time":5.828},{"midi":74,"time":5.828},
        {"midi":64,"time":5.999},
        {"midi":60,"time":6.171},{"midi":64,"time":6.171},{"midi":67,"time":6.171},{"midi":71,"time":6.171},{"midi":74,"time":6.171},
        {"midi":64,"time":6.514},{"midi":69,"time":6.514},{"midi":71,"time":6.514},{"midi":74,"time":6.514},
        {"midi":60,"time":6.685},{"midi":67,"time":6.685},
        {"midi":67,"time":7.885},{"midi":69,"time":8.057},
        {"midi":64,"time":8.228},{"midi":67,"time":8.228},{"midi":71,"time":8.228},{"midi":71,"time":8.228},{"midi":74,"time":8.228},{"midi":78,"time":8.228},
        {"midi":67,"time":8.571},{"midi":64,"time":8.742},{"midi":67,"time":8.914},
        {"midi":62,"time":9.257},{"midi":65,"time":9.257},{"midi":69,"time":9.257},{"midi":72,"time":9.257},{"midi":74,"time":9.257},{"midi":76,"time":9.257},
        {"midi":71,"time":9.428},
        {"midi":61,"time":10.285},{"midi":64,"time":10.285},{"midi":68,"time":10.285},{"midi":69,"time":10.285},{"midi":71,"time":10.285},{"midi":74,"time":10.285},
        {"midi":67,"time":10.457},{"midi":61,"time":10.628},{"midi":67,"time":10.628},{"midi":67,"time":10.799},
        {"midi":60,"time":10.971},{"midi":64,"time":10.971},{"midi":67,"time":10.971},{"midi":71,"time":10.971},{"midi":71,"time":10.971},{"midi":74,"time":10.971},
        {"midi":67,"time":11.314},{"midi":67,"time":11.657},
        {"midi":60,"time":11.999},{"midi":64,"time":11.999},{"midi":67,"time":11.999},{"midi":69,"time":11.999},{"midi":71,"time":11.999},{"midi":74,"time":11.999},
        {"midi":67,"time":12.171},
        {"midi":67,"time":13.028},{"midi":60,"time":13.114},{"midi":64,"time":13.199},{"midi":67,"time":13.371},{"midi":69,"time":13.542},
        {"midi":60,"time":13.714},{"midi":63,"time":13.714},{"midi":67,"time":13.714},{"midi":67,"time":13.714},{"midi":70,"time":13.714},{"midi":74,"time":13.714},
        {"midi":64,"time":14.057},{"midi":67,"time":14.399},
        {"midi":61,"time":14.742},{"midi":65,"time":14.742},{"midi":68,"time":14.742},{"midi":69,"time":14.742},{"midi":72,"time":14.742},{"midi":75,"time":14.742},
        {"midi":70,"time":14.914},
        {"midi":61,"time":15.771},{"midi":60,"time":15.857},{"midi":67,"time":16.114},{"midi":69,"time":16.285},
        {"midi":60,"time":16.457},{"midi":64,"time":16.457},{"midi":67,"time":16.457},{"midi":71,"time":16.457},{"midi":74,"time":16.457},
        {"midi":64,"time":16.714},{"midi":71,"time":16.714},{"midi":74,"time":16.714},{"midi":67,"time":16.799},
        {"midi":60,"time":16.971},{"midi":64,"time":16.971},{"midi":71,"time":16.971},{"midi":74,"time":16.971},{"midi":67,"time":17.142},
        {"midi":60,"time":17.228},{"midi":64,"time":17.228},{"midi":71,"time":17.228},{"midi":74,"time":17.228},
        {"midi":60,"time":17.485},{"midi":64,"time":17.485},{"midi":67,"time":17.485},{"midi":69,"time":17.485},{"midi":71,"time":17.485},{"midi":74,"time":17.485},
        {"midi":67,"time":17.657},
        {"midi":60,"time":17.742},{"midi":64,"time":17.742},{"midi":71,"time":17.742},{"midi":74,"time":17.742},
        {"midi":60,"time":17.999},{"midi":64,"time":17.999},{"midi":71,"time":17.999},{"midi":74,"time":17.999},{"midi":67,"time":18.171},
        {"midi":60,"time":18.257},{"midi":64,"time":18.257},{"midi":71,"time":18.257},{"midi":74,"time":18.257},
        {"midi":60,"time":18.514},{"midi":64,"time":18.514},{"midi":67,"time":18.514},{"midi":71,"time":18.514},{"midi":74,"time":18.514},
        {"midi":60,"time":18.685},{"midi":64,"time":18.685},{"midi":67,"time":18.685},{"midi":71,"time":18.685},{"midi":74,"time":18.685},
        {"midi":60,"time":18.857},{"midi":64,"time":18.857},{"midi":67,"time":18.857},{"midi":71,"time":18.857},{"midi":74,"time":18.857},
        {"midi":60,"time":19.028},{"midi":64,"time":19.028},{"midi":67,"time":19.028},{"midi":71,"time":19.028},{"midi":74,"time":19.028},
        {"midi":60,"time":19.199},{"midi":64,"time":19.199},{"midi":67,"time":19.199},{"midi":67,"time":19.199},{"midi":71,"time":19.199},{"midi":74,"time":19.199},
        {"midi":67,"time":19.371},
        {"midi":60,"time":19.457},{"midi":64,"time":19.457},{"midi":71,"time":19.457},{"midi":74,"time":19.457},{"midi":67,"time":19.542},
        {"midi":60,"time":19.714},{"midi":64,"time":19.714},{"midi":67,"time":19.714},{"midi":67,"time":19.714},{"midi":71,"time":19.714},{"midi":74,"time":19.714},
        {"midi":67,"time":19.885},
        {"midi":60,"time":19.971},{"midi":64,"time":19.971},{"midi":71,"time":19.971},{"midi":74,"time":19.971},{"midi":67,"time":20.057},
        {"midi":60,"time":20.228},{"midi":64,"time":20.228},{"midi":67,"time":20.228},{"midi":67,"time":20.228},{"midi":71,"time":20.228},{"midi":74,"time":20.228},
        {"midi":67,"time":20.399},
        {"midi":60,"time":20.485},{"midi":64,"time":20.485},{"midi":71,"time":20.485},{"midi":74,"time":20.485},
        {"midi":67,"time":20.571},{"midi":67,"time":20.914},{"midi":67,"time":21.257},{"midi":67,"time":21.599},
        {"midi":64,"time":21.942},{"midi":67,"time":21.942},{"midi":71,"time":21.942},{"midi":74,"time":21.942},
        {"midi":60,"time":22.114},{"midi":60,"time":22.457},{"midi":74,"time":22.457},{"midi":60,"time":22.799},{"midi":74,"time":22.971},{"midi":60,"time":23.142},{"midi":60,"time":23.485},{"midi":74,"time":23.485},{"midi":60,"time":23.828},{"midi":74,"time":23.999},{"midi":60,"time":24.171},{"midi":60,"time":24.514},
        {"midi":62,"time":24.685},{"midi":66,"time":24.685},{"midi":69,"time":24.685},{"midi":71,"time":24.685},{"midi":67,"time":24.857},
        {"midi":67,"time":25.199},{"midi":69,"time":25.199},{"midi":67,"time":25.542},{"midi":69,"time":25.714},{"midi":67,"time":25.885},
        {"midi":67,"time":26.228},{"midi":69,"time":26.228},{"midi":67,"time":26.571},{"midi":69,"time":26.742},{"midi":67,"time":26.914},{"midi":69,"time":27.085},{"midi":67,"time":27.257},
        {"midi":64,"time":27.428},{"midi":67,"time":27.428},{"midi":71,"time":27.428},{"midi":74,"time":27.428},
        {"midi":60,"time":27.599},{"midi":60,"time":27.942},{"midi":74,"time":27.942},{"midi":60,"time":28.285},{"midi":74,"time":28.457},{"midi":60,"time":28.628},{"midi":60,"time":28.971},{"midi":74,"time":28.971},{"midi":60,"time":29.314},{"midi":74,"time":29.485},{"midi":60,"time":29.657},{"midi":74,"time":29.828},{"midi":60,"time":29.999},
        {"midi":62,"time":30.171},{"midi":66,"time":30.171},{"midi":69,"time":30.171},{"midi":71,"time":30.171},{"midi":67,"time":30.342},
        {"midi":67,"time":30.685},{"midi":69,"time":30.685},{"midi":67,"time":31.028},{"midi":69,"time":31.199},{"midi":67,"time":31.371},
        {"midi":67,"time":31.714},{"midi":69,"time":31.714},{"midi":67,"time":32.057},{"midi":69,"time":32.228},{"midi":67,"time":32.399},{"midi":69,"time":32.571},{"midi":67,"time":32.742},
        {"midi":64,"time":32.914},{"midi":67,"time":32.914},{"midi":71,"time":32.914},{"midi":74,"time":32.914},
        {"midi":60,"time":33.085},{"midi":60,"time":33.428},{"midi":74,"time":33.428},{"midi":60,"time":33.771},{"midi":74,"time":33.942},{"midi":60,"time":34.114},{"midi":60,"time":34.457},{"midi":74,"time":34.457},{"midi":60,"time":34.799},{"midi":74,"time":34.971},{"midi":60,"time":35.142},{"midi":74,"time":35.314},{"midi":60,"time":35.485},
        {"midi":62,"time":35.657},{"midi":66,"time":35.657},{"midi":69,"time":35.657},{"midi":71,"time":35.657},{"midi":67,"time":35.828},
        {"midi":67,"time":36.171},{"midi":69,"time":36.171},{"midi":67,"time":36.514},{"midi":69,"time":36.685},{"midi":67,"time":36.857},
        {"midi":67,"time":37.199},{"midi":69,"time":37.199},{"midi":67,"time":37.542},{"midi":69,"time":37.714},{"midi":67,"time":37.885},{"midi":69,"time":38.057},{"midi":67,"time":38.228},
        {"midi":74,"time":38.399},{"midi":74,"time":38.914},{"midi":74,"time":39.428},{"midi":74,"time":39.942},{"midi":74,"time":40.457},{"midi":74,"time":40.799},
        {"midi":69,"time":41.142},{"midi":69,"time":41.657},{"midi":69,"time":42.171},{"midi":69,"time":42.685},{"midi":69,"time":43.199},{"midi":67,"time":43.542}
      ]
    }
  ]
};

// --- 3. PROCESSING LOGIC ---

function mapPitchToKeyIndex(midi) {
    // Fold Octaves: Bring extremely high/low notes into the 55-84 range
    let safeguard = 0;
    while (midi < 55 && safeguard < 10) { midi += 12; safeguard++; }
    safeguard = 0;
    while (midi > 84 && safeguard < 10) { midi -= 12; safeguard++; }

    // Direct Match?
    if (midiMap[midi] !== undefined) return midiMap[midi];

    // Nearest Neighbor (Quantize to Scale)
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
const seen = new Set(); 

// Iterate ALL tracks
sourceData.tracks.forEach(track => {
    track.notes.forEach(n => {
        const k = mapPitchToKeyIndex(n.midi);
        
        // Round time to 3 decimals 
        const tRounded = n.time.toFixed(3);
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

export const song = { 
    songName: "Cosmic Music Box Pitched Down", 
    speed: 0.75, 
    keys: keys, 
    notes: processedNotes 
};