/**
 * MusicBoxPlayer
 * Handles logic for playing a custom JSON song format using Tone.js
 * and emitting visual data for a 3D music box.
 */
class MusicBoxPlayer {
    constructor(options = {}) {
        // Configuration
        this.rampPercent = options.rampPercent || 0.02; // 2% of song length by default for prong lift
        
        // State
        this.songData = null;
        this.totalDuration = 0;
        this.notes = [];
        this.keys = [];
        this.isPlaying = false;
        
        // Callbacks
        this.onPlayDataCallback = null;
        
        // Animation Loop ID
        this.rafId = null;

        // Initialize Tone.js Synth
        // using a PolySynth to handle multiple notes at once
        // utilizing a simple "Synth" voice which sounds relatively mechanical by default
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.1,
                release: 1
            }
        }).toDestination();
        
        // Volume adjustment
        this.synth.volume.value = -10; 
    }

    /**
     * Loads the song object, parses time, schedules audio.
     */
    async load(songObj) {
        // Stop any current playback
        this.stop();

        // 1. Store basic data
        this.keys = songObj.keys;
        const speedMultiplier = songObj.speed || 1.0;

        // 2. Process Notes & Determine Duration
        // We clone and scale the notes based on speed
        let maxEndTime = 0;
        
        this.notes = songObj.notes.map(n => {
            const scaledStart = n.startTime / speedMultiplier;
            const scaledEnd = n.endTime / speedMultiplier;
            
            if (scaledEnd > maxEndTime) maxEndTime = scaledEnd;

            return {
                ...n,
                scaledStart: scaledStart,
                scaledEnd: scaledEnd,
                scaledDuration: scaledEnd - scaledStart,
                pitch: this.keys[n.key] // Map index to string pitch (e.g., "C4")
            };
        });

        // Add a small buffer to the end so the loop isn't jarring
        this.totalDuration = maxEndTime + 2.0; 

        console.log(`Song "${songObj.songName}" loaded. Duration: ${this.totalDuration.toFixed(2)}s`);

        // 3. Schedule Tone.js
        // Clear previous schedule
        Tone.Transport.cancel();
        
        // Set Loop bounds
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = this.totalDuration;

        // Schedule individual notes
        this.notes.forEach(note => {
            Tone.Transport.schedule((time) => {
                this.synth.triggerAttackRelease(note.pitch, note.scaledDuration, time);
            }, note.scaledStart);
        });
    }

    /**
     * Start Playback
     */
    async play() {
        if (!this.songData && this.notes.length === 0) {
            console.warn("No song loaded.");
            return;
        }

        // Tone.js requires a user interaction to start the audio context
        await Tone.start();

        Tone.Transport.start();
        this.isPlaying = true;
        
        // Start the visual loop
        this.animationLoop();
    }

    /**
     * Pause Playback
     */
    pause() {
        Tone.Transport.pause();
        this.isPlaying = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    /**
     * Stop and Rewind
     */
    stop() {
        Tone.Transport.stop();
        this.isPlaying = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        
        // Emit a reset frame so visuals snap back
        this.emitFrameData(0);
    }

    /**
     * Set callback for visual updates
     */
    onPlayData(fn) {
        this.onPlayDataCallback = fn;
    }

    /**
     * Internal Animation Loop (Visuals)
     * Runs on requestAnimationFrame to stay synced with screen refresh
     */
    animationLoop() {
        if (!this.isPlaying) return;

        // Get current time from Tone.Transport (the source of truth)
        const currentSeconds = Tone.Transport.seconds;

        this.emitFrameData(currentSeconds);

        this.rafId = requestAnimationFrame(() => this.animationLoop());
    }

    /**
     * Calculates state of all keys and emits data
     */
    emitFrameData(currentSeconds) {
        if (!this.onPlayDataCallback) return;

        // 1. Calculate Normalized Time (0.0 -> 1.0)
        // Handle wrapping because Tone.Transport loops, but sometimes seconds can drift slightly over loopEnd before resetting
        const wrappedTime = currentSeconds % this.totalDuration;
        const normalizedTime = wrappedTime / this.totalDuration;

        // 2. Calculate Morph Targets
        const morphTargets = [];
        const rampDurationSeconds = this.totalDuration * this.rampPercent;

        // We have up to 18 keys (0-17)
        for (let i = 0; i < 18; i++) {
            
            // Default value
            let val = 0.0;

            // Find if any note on this key is about to play
            // We need a note where: 
            // note.scaledStart > currentSeconds
            // AND
            // note.scaledStart - rampDuration < currentSeconds
            
            // Optimization: Filter relevant notes for this key first
            // (In a production app, we would pre-group notes by key to avoid this filter every frame)
            const upcomingNote = this.notes.find(n => {
                return n.key === i && 
                       n.scaledStart >= wrappedTime && 
                       (n.scaledStart - rampDurationSeconds) < wrappedTime;
            });

            if (upcomingNote) {
                // We are in the ramp window
                const timeUntilHit = upcomingNote.scaledStart - wrappedTime;
                
                // 1.0 means fully lifted (at start time), 0.0 means resting
                // Linear interpolation
                const progress = 1.0 - (timeUntilHit / rampDurationSeconds);
                val = Math.max(0, Math.min(1, progress));
            }

            // Note: If a note is *currently* playing, the logic above returns undefined,
            // so val defaults to 0.0, which creates the "Snap" effect user requested.

            if (i < this.keys.length) {
                morphTargets.push({
                    name: `Key ${i + 1}`, // "Key 1", "Key 2"...
                    value: val
                });
            }
        }

        // 3. Fire Callback
        this.onPlayDataCallback({
            time: normalizedTime,
            morphTargets: morphTargets
        });
    }
}
