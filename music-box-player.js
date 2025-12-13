// music-box-player.js

export class MusicBoxPlayer {
    constructor(options = {}) {
        // How long the prong takes to lift before snapping (in seconds)
        // 0.1s is a good mechanical "tick"
        this.rampDurationSeconds = options.rampTime || 0.1; 
        
        this.songData = null;
        this.totalDuration = 0;
        
        this.notes = []; // The processed notes ready for playback
        this.keys = [];  // The final list of 18 keys (strings)
        
        this.isPlaying = false;
        this.rafId = null;
        this.onPlayDataCallback = null;

        // --- AUDIO SETUP ---
        // Use Tone.Sampler for realistic sound
        this.sampler = new Tone.Sampler({
            urls: {
                C4: "assets/C4.wav", // Ensure this file exists in /assets/
            },
            release: 1, 
            onload: () => {
                console.log("MusicBox Sampler Loaded.");
            }
        }).toDestination();

        this.sampler.volume.value = -5;
    }

    /**
     * Loads the song object and performs collision detection/channel duplication
     * options: { collisionThreshold: 0.3 } (seconds)
     */
    async load(songObj, loadOptions = {}) {
        this.stop();

        // --- CONFIGURATION ---
        // Minimum time required between notes on the same channel
        // Real music boxes need about 0.3s - 0.5s to reset the prong vibration
        const threshold = loadOptions.collisionThreshold || 0.3; 
        const maxChannels = 18;
        const speedMultiplier = songObj.speed || 1.0;

        console.log(`Analyzing song for mechanical collisions (Threshold: ${threshold}s)...`);

        // --- STEP 1: NORMALIZE TIME ---
        // Create a temporary list of notes with calculated times
        // We sort by start time to make linear scanning easier
        let tempNotes = songObj.notes.map(n => ({
            ...n,
            scaledStart: n.startTime / speedMultiplier,
            scaledEnd: n.endTime / speedMultiplier,
            originalKeyIndex: n.key // Store the old index (0-17)
        })).sort((a, b) => a.scaledStart - b.scaledStart);

        // --- STEP 2: DETECT COLLISIONS ---
        const collisionsPerKey = {}; // { originalKeyIndex: count }
        const lastTimePerKey = {};   // { originalKeyIndex: lastEndTime }

        tempNotes.forEach(n => {
            const k = n.originalKeyIndex;
            const lastStart = lastTimePerKey[k];
            
            if (lastStart !== undefined) {
                // Check if the gap is too small
                const timeDiff = n.scaledStart - lastStart;
                if (timeDiff < threshold) {
                    collisionsPerKey[k] = (collisionsPerKey[k] || 0) + 1;
                }
            }
            lastTimePerKey[k] = n.scaledStart;
        });

        // --- STEP 3: PRIORITIZE DUPLICATION ---
        const originalKeys = songObj.keys;
        let slotsAvailable = maxChannels - originalKeys.length;
        const keysToDuplicate = new Set(); 

        if (slotsAvailable > 0) {
            // Sort keys by most collisions first
            const sortedCollisions = Object.entries(collisionsPerKey)
                .sort(([, countA], [, countB]) => countB - countA);

            for (let [keyIndexStr, count] of sortedCollisions) {
                if (slotsAvailable <= 0) break;
                
                const keyIndex = parseInt(keyIndexStr);
                console.log(`Key "${originalKeys[keyIndex]}" has ${count} collisions. allocating twin channel.`);
                
                keysToDuplicate.add(keyIndex);
                slotsAvailable--;
            }
        } else {
            const totalCollisions = Object.values(collisionsPerKey).reduce((a, b) => a + b, 0);
            if(totalCollisions > 0) {
                console.warn(`Comb full (18/18). ${totalCollisions} collisions will remain unresolved.`);
            }
        }

        // --- STEP 4: REBUILD KEYS (PRONGS) ---
        // We must preserve pitch order. If C4 is duplicated, we want [..., "C4", "C4", ...]
        const newKeys = [];
        const keyMapping = {}; // oldIndex -> [newIndex1, newIndex2]

        originalKeys.forEach((pitch, oldIndex) => {
            // 1. Add the primary channel
            const newIndex1 = newKeys.length;
            newKeys.push(pitch);
            
            // Initialize the map
            keyMapping[oldIndex] = [newIndex1];

            // 2. If flagged for duplication, add the twin immediately after
            if (keysToDuplicate.has(oldIndex)) {
                const newIndex2 = newKeys.length;
                newKeys.push(pitch);
                keyMapping[oldIndex].push(newIndex2);
            }
        });

        // Save the final hardware configuration
        this.keys = newKeys;
        console.log(`Final Comb Layout: ${this.keys.length} prongs.`);

        // --- STEP 5: ASSIGN NOTES TO CHANNELS ---
        // We round-robin (alternate) the notes for duplicated channels
        const nextChannelToggle = {}; // oldIndex -> 0 or 1
        
        let maxEndTime = 0;

        this.notes = tempNotes.map(n => {
            const oldKey = n.originalKeyIndex;
            const targetChannels = keyMapping[oldKey];
            
            let finalKeyIndex;

            if (targetChannels.length === 1) {
                finalKeyIndex = targetChannels[0];
            } else {
                // Alternate between the available twins
                const toggle = nextChannelToggle[oldKey] || 0;
                finalKeyIndex = targetChannels[toggle];
                
                // Flip for next time
                nextChannelToggle[oldKey] = (toggle + 1) % targetChannels.length;
            }

            if (n.scaledEnd > maxEndTime) maxEndTime = n.scaledEnd;

            return {
                ...n, // keeps startTime, endTime, etc
                key: finalKeyIndex, // The NEW key index (0-17)
                pitch: this.keys[finalKeyIndex],
                scaledDuration: n.scaledEnd - n.scaledStart
            };
        });

        this.totalDuration = maxEndTime + 2.0;

        // --- STEP 6: SCHEDULE AUDIO ---
        Tone.Transport.cancel();
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = this.totalDuration;

        this.notes.forEach(note => {
            Tone.Transport.schedule((time) => {
                // Trigger Sample
                this.sampler.triggerAttackRelease(note.pitch, 1.0, time);
            }, note.scaledStart);
        });
    }

    async play() {
        if (!this.notes.length) return;
        
        await Tone.start();
        if(!this.sampler.loaded) await Tone.loaded();

        Tone.Transport.start();
        this.isPlaying = true;
        this.animationLoop();
    }

    pause() {
        Tone.Transport.pause();
        this.isPlaying = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    stop() {
        Tone.Transport.stop();
        this.isPlaying = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.emitFrameData(0);
    }

    onPlayData(fn) {
        this.onPlayDataCallback = fn;
    }

    animationLoop() {
        if (!this.isPlaying) return;
        this.emitFrameData(Tone.Transport.seconds);
        this.rafId = requestAnimationFrame(() => this.animationLoop());
    }

    emitFrameData(currentSeconds) {
        if (!this.onPlayDataCallback) return;

        const wrappedTime = currentSeconds % this.totalDuration;
        const normalizedTime = wrappedTime / this.totalDuration;
        const morphTargets = [];
        const rampWindow = this.rampDurationSeconds;

        for (let i = 0; i < 18; i++) {
            let val = 0.0;
            
            // Look ahead logic
            let upcomingNote = this.notes.find(n => {
                return n.key === i && 
                       n.scaledStart > wrappedTime && 
                       n.scaledStart < (wrappedTime + rampWindow);
            });

            // Loop wrap logic
            if (!upcomingNote) {
                if (wrappedTime > (this.totalDuration - rampWindow)) {
                    upcomingNote = this.notes.find(n => {
                        const effectiveStart = n.scaledStart + this.totalDuration;
                        return n.key === i && 
                               effectiveStart > wrappedTime && 
                               effectiveStart < (wrappedTime + rampWindow);
                    });
                }
            }

            if (upcomingNote) {
                let timeUntilHit;
                if (upcomingNote.scaledStart < wrappedTime) {
                    timeUntilHit = (upcomingNote.scaledStart + this.totalDuration) - wrappedTime;
                } else {
                    timeUntilHit = upcomingNote.scaledStart - wrappedTime;
                }
                val = 1.0 - (timeUntilHit / rampWindow);
                val = Math.max(0, Math.min(1, val));
            }

            morphTargets.push({ name: `Key ${i + 1}`, value: val });
        }

        this.onPlayDataCallback({
            time: normalizedTime,
            morphTargets: morphTargets
        });
    }


	/**
     * Returns normalized song data for visualization.
     * Useful for spawning static 3D geometry (pegs) on the drum.
     */
    getSongData() {
        // Return a clean list of notes with normalized time (0.0 to 1.0)
        // and the final key index (0-17)
        return this.notes.map(n => ({
            keyIndex: n.key, 
            normalizedStart: n.scaledStart / this.totalDuration
        }));
    }

	
	/**
     * Returns normalized song data for visualization.
     * Useful for spawning static 3D geometry (pegs) on the drum.
     */
    getSongData() {
        if (!this.totalDuration) return [];
        return this.notes.map(n => ({
            keyIndex: n.key, 
            normalizedStart: n.scaledStart / this.totalDuration
        }));
    }
	
}