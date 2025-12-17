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

// --- 2. RAW SONG DATA (From VisiPiano (3).json) ---
const sourceData = {
  "tracks": [
    {
      "id": 0, "name": "Music Box", "notes": [
        {"midi":72,"time":0}, {"midi":83,"time":0},
        {"midi":79,"time":0.342},
        {"midi":76,"time":0.514},
        {"midi":79,"time":0.685},
        {"midi":72,"time":1.028}, {"midi":81,"time":1.028},
        {"midi":79,"time":1.199}, {"midi":84,"time":1.199},
        {"midi":72,"time":1.371},
        {"midi":76,"time":2.228},
        {"midi":79,"time":2.399},
        {"midi":76,"time":2.571},
        {"midi":72,"time":2.742}, {"midi":79,"time":2.742},
        {"midi":76,"time":3.085},
        {"midi":79,"time":3.428},
        {"midi":73,"time":3.771}, {"midi":81,"time":3.771}, {"midi":82,"time":3.942},
        {"midi":79,"time":5.314},
        {"midi":72,"time":5.485}, {"midi":83,"time":5.485},
        {"midi":79,"time":5.828},
        {"midi":76,"time":5.999},
        {"midi":79,"time":6.171},
        {"midi":72,"time":6.514}, {"midi":81,"time":6.514},
        {"midi":79,"time":6.685}, {"midi":84,"time":6.685},
        {"midi":72,"time":6.857},
        {"midi":79,"time":7.885},
        {"midi":81,"time":8.057},
        {"midi":76,"time":8.228}, {"midi":83,"time":8.228},
        {"midi":79,"time":8.571},
        {"midi":76,"time":8.742},
        {"midi":79,"time":8.914},
        {"midi":74,"time":9.085},
        {"midi":79,"time":9.257}, {"midi":86,"time":9.257},
        {"midi":76,"time":9.428}, {"midi":83,"time":9.428},
        {"midi":74,"time":9.599},
        {"midi":73,"time":10.285}, {"midi":81,"time":10.285},
        {"midi":79,"time":10.457},
        {"midi":79,"time":10.628}, {"midi":85,"time":10.628},
        {"midi":73,"time":10.799}, {"midi":79,"time":10.799},
        {"midi":76,"time":10.971}, {"midi":79,"time":10.971}, {"midi":83,"time":10.971}, {"midi":86,"time":10.971},
        {"midi":72,"time":11.142},
        {"midi":72,"time":11.485}, {"midi":86,"time":11.485},
        {"midi":72,"time":11.828},
        {"midi":86,"time":11.999},
        {"midi":72,"time":12.171},
        {"midi":72,"time":12.514}, {"midi":86,"time":12.514},
        {"midi":72,"time":12.857},
        {"midi":86,"time":13.028},
        {"midi":72,"time":13.199},
        {"midi":72,"time":13.542},
        {"midi":74,"time":13.714}, {"midi":78,"time":13.714}, {"midi":81,"time":13.714}, {"midi":83,"time":13.714},
        {"midi":79,"time":13.885},
        {"midi":79,"time":14.228}, {"midi":81,"time":14.228},
        {"midi":79,"time":14.571},
        {"midi":81,"time":14.742},
        {"midi":79,"time":14.914},
        {"midi":79,"time":15.257}, {"midi":81,"time":15.257},
        {"midi":79,"time":15.599},
        {"midi":81,"time":15.771},
        {"midi":79,"time":15.942},
        {"midi":81,"time":16.114},
        {"midi":79,"time":16.285},
        {"midi":76,"time":16.457}, {"midi":79,"time":16.457}, {"midi":83,"time":16.457}, {"midi":86,"time":16.457},
        {"midi":72,"time":16.628},
        {"midi":72,"time":16.971}, {"midi":86,"time":16.971},
        {"midi":72,"time":17.314},
        {"midi":86,"time":17.485},
        {"midi":72,"time":17.657},
        {"midi":72,"time":17.999}, {"midi":86,"time":17.999},
        {"midi":72,"time":18.342},
        {"midi":86,"time":18.514},
        {"midi":72,"time":18.685},
        {"midi":86,"time":18.857},
        {"midi":72,"time":19.028},
        {"midi":74,"time":19.199}, {"midi":78,"time":19.199}, {"midi":81,"time":19.199}, {"midi":83,"time":19.199},
        {"midi":79,"time":19.371},
        {"midi":79,"time":19.714}, {"midi":81,"time":19.714},
        {"midi":79,"time":20.057},
        {"midi":81,"time":20.228},
        {"midi":79,"time":20.399},
        {"midi":79,"time":20.742}, {"midi":81,"time":20.742},
        {"midi":79,"time":21.085},
        {"midi":81,"time":21.257},
        {"midi":79,"time":21.428},
        {"midi":81,"time":21.599},
        {"midi":79,"time":21.771},
        {"midi":76,"time":21.942}, {"midi":79,"time":21.942}, {"midi":83,"time":21.942}, {"midi":86,"time":21.942},
        {"midi":72,"time":22.114},
        {"midi":72,"time":22.457}, {"midi":86,"time":22.457},
        {"midi":72,"time":22.799},
        {"midi":86,"time":22.971},
        {"midi":72,"time":23.142},
        {"midi":72,"time":23.485}, {"midi":86,"time":23.485},
        {"midi":72,"time":23.828},
        {"midi":86,"time":23.999},
        {"midi":72,"time":24.171},
        {"midi":72,"time":24.514},
        {"midi":74,"time":24.685}, {"midi":78,"time":24.685}, {"midi":81,"time":24.685}, {"midi":83,"time":24.685},
        {"midi":79,"time":24.857},
        {"midi":79,"time":25.199}, {"midi":81,"time":25.199},
        {"midi":79,"time":25.542},
        {"midi":81,"time":25.714},
        {"midi":79,"time":25.885},
        {"midi":79,"time":26.228}, {"midi":81,"time":26.228},
        {"midi":79,"time":26.571},
        {"midi":81,"time":26.742},
        {"midi":79,"time":26.914},
        {"midi":81,"time":27.085},
        {"midi":79,"time":27.257},
        {"midi":76,"time":27.428}, {"midi":79,"time":27.428}, {"midi":83,"time":27.428}, {"midi":86,"time":27.428},
        {"midi":72,"time":27.599},
        {"midi":72,"time":27.942}, {"midi":86,"time":27.942},
        {"midi":72,"time":28.285},
        {"midi":86,"time":28.457},
        {"midi":72,"time":28.628},
        {"midi":72,"time":28.971}, {"midi":86,"time":28.971},
        {"midi":72,"time":29.314},
        {"midi":86,"time":29.485},
        {"midi":72,"time":29.657},
        {"midi":86,"time":29.828},
        {"midi":72,"time":29.999},
        {"midi":74,"time":30.171}, {"midi":78,"time":30.171}, {"midi":81,"time":30.171}, {"midi":83,"time":30.171},
        {"midi":79,"time":30.342},
        {"midi":79,"time":30.685}, {"midi":81,"time":30.685},
        {"midi":79,"time":31.028},
        {"midi":81,"time":31.199},
        {"midi":79,"time":31.371},
        {"midi":79,"time":31.714}, {"midi":81,"time":31.714},
        {"midi":79,"time":32.057},
        {"midi":81,"time":32.228},
        {"midi":79,"time":32.399},
        {"midi":81,"time":32.571},
        {"midi":79,"time":32.742},
        {"midi":76,"time":32.914}, {"midi":79,"time":32.914}, {"midi":83,"time":32.914}, {"midi":86,"time":32.914},
        {"midi":72,"time":33.085},
        {"midi":72,"time":33.428}, {"midi":86,"time":33.428},
        {"midi":72,"time":33.771},
        {"midi":86,"time":33.942},
        {"midi":72,"time":34.114},
        {"midi":72,"time":34.457}, {"midi":86,"time":34.457},
        {"midi":72,"time":34.799},
        {"midi":86,"time":34.971},
        {"midi":72,"time":35.142},
        {"midi":86,"time":35.314},
        {"midi":72,"time":35.485},
        {"midi":74,"time":35.657}, {"midi":78,"time":35.657}, {"midi":81,"time":35.657}, {"midi":83,"time":35.657},
        {"midi":79,"time":35.828},
        {"midi":79,"time":36.171}, {"midi":81,"time":36.171},
        {"midi":79,"time":36.514},
        {"midi":81,"time":36.685},
        {"midi":79,"time":36.857},
        {"midi":79,"time":37.199}, {"midi":81,"time":37.199},
        {"midi":79,"time":37.542},
        {"midi":81,"time":37.714},
        {"midi":79,"time":37.885},
        {"midi":81,"time":38.057},
        {"midi":79,"time":38.228},
        {"midi":86,"time":38.399},
        {"midi":86,"time":38.914},
        {"midi":86,"time":39.428},
        {"midi":86,"time":39.942},
        {"midi":86,"time":40.457},
        {"midi":86,"time":40.799},
        {"midi":81,"time":41.142},
        {"midi":81,"time":41.657},
        {"midi":81,"time":42.171},
        {"midi":81,"time":42.685},
        {"midi":81,"time":43.199},
        {"midi":79,"time":43.542}
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
    songName: "Cosmic Music Box", 
    speed: 1.0, 
    keys: keys, 
    notes: processedNotes 
};