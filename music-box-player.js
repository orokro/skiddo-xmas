// music-box-player.js

// Note: Tone.js is loaded globally via CDN in the HTML, 
// so we access it via 'window.Tone' or just 'Tone'.

export class MusicBoxPlayer {
    constructor(options = {}) {
        this.rampDurationSeconds = options.rampTime || 0.1; 
        
        this.songData = null;
        this.totalDuration = 0;
        this.notes = [];
        this.keys = [];
        this.isPlaying = false;
        this.rafId = null;
        this.onPlayDataCallback = null;

        // --- THE SOUND UPGRADE ---
        // We use a Sampler instead of a Synth.
        // It maps a specific note (C4) to a file. 
        // Tone.js automatically repitches it for other keys!
        this.sampler = new Tone.Sampler({
            urls: {
                C4: "assets/C4.wav", // Make sure this file exists!
            },
            // A nice release ensures the bell rings out even if the note duration is short
            release: 1, 
            
            // This handles the "loading" callback
            onload: () => {
                console.log("Sampler loaded C4.wav successfully!");
            }
        }).toDestination();

        // Music boxes are usually quiet, boost volume if needed
        this.sampler.volume.value = -5;
    }

    /**
     * Loads the song object
     */
    async load(songObj) {
        this.stop();

        this.keys = songObj.keys;
        const speedMultiplier = songObj.speed || 1.0;

        // Calculate Scale and Duration
        let maxEndTime = 0;
        
        this.notes = songObj.notes.map(n => {
            const scaledStart = n.startTime / speedMultiplier;
            const scaledEnd = n.endTime / speedMultiplier;
            
            if (scaledEnd > maxEndTime) maxEndTime = scaledEnd;

            return {
                ...n,
                scaledStart: scaledStart,
                scaledEnd: scaledEnd,
                // Tone.js duration
                scaledDuration: scaledEnd - scaledStart,
                // Map the key index to the actual pitch string (e.g. "C4")
                pitch: this.keys[n.key] 
            };
        });

        this.totalDuration = maxEndTime + 2.0; 
        console.log(`Song loaded: ${this.totalDuration.toFixed(2)}s`);

        // Schedule Tone.js
        Tone.Transport.cancel();
        Tone.Transport.loop = true;
        Tone.Transport.loopStart = 0;
        Tone.Transport.loopEnd = this.totalDuration;

        this.notes.forEach(note => {
            Tone.Transport.schedule((time) => {
                // Trigger the sample
                // We use a fixed duration or let the sample ring out?
                // Usually triggerAttack is better for samples if we want them to ring naturally,
                // but triggerAttackRelease works if we want to choke them (not typical for music box).
                // Let's use triggerAttackRelease but with a long release in the constructor.
                this.sampler.triggerAttackRelease(note.pitch, 1.0, time);
            }, note.scaledStart);
        });
    }

    async play() {
        if (!this.notes.length) return;
        await Tone.start();
        
        // Ensure sampler is loaded before playing to avoid silence
        if(!this.sampler.loaded) {
            console.log("Waiting for sample to load...");
            await Tone.loaded();
        }

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
}