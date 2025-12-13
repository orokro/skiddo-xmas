import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class MusicBoxScene {
    constructor(options = {}) {
        this.onSceneReady = options.onSceneReady || (() => {});
        this.onMusicPlay = options.onMusicPlay || (() => {});
        this.initialScale = options.initialScale || 1.0;

        // State
        this.$ = {}; // Asset Cache
        this.crankCount = 0;
        this.isLoaded = false;
        
        // Animation States
        this.state = 'LOADING'; // LOADING, IDLE, FADING_WALL, CAMERA_MOVE, OPENING_LID, PLAYING
        
        // Animation Timers
        this.animStartTime = 0;
        this.lastFrameTime = 0;

        // Gear Ratios
        // Drum Gear = 0.1564, Small Gear = 0.0789
        // Ratio = Driven / Driver ... wait, speed is inverse diameter.
        // Small gear spins faster. SpeedRatio = BigDiam / SmallDiam
        this.gearRatio = 0.1564 / 0.0789; // ~1.98

        this._buildScene();
    }

    _buildScene() {
        // 1. DOM Mount
        const mount = document.getElementById('threeJSMount');
        if (!mount) {
            console.error("Could not find #threeJSMount");
            return;
        }

        // 2. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(mount.clientWidth, mount.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        mount.appendChild(this.renderer.domElement);

        // 3. Scene
        this.scene = new THREE.Scene();
        
        // 4. Camera (Dummy position, will be reset by RefStartPos)
        this.camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
        this.camera.position.set(0, 1, 5);

        // 5. Lighting (IBL + Helper Light)
        const ambient = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambient);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);

        // 6. Load Assets
        this._loadAssets();

        // 7. Handle Window Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = mount.clientWidth / mount.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(mount.clientWidth, mount.clientHeight);
        });

        // 8. Start Loop
        this._tick();
    }

    async _loadAssets() {
        const manager = new THREE.LoadingManager();
        
        // A. Load Environment
        new RGBELoader(manager).load('assets/Basic_2K_01.jpg', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = texture;
            // We don't set background, so it remains transparent/black as requested
        });

        // B. Load GLTF
        const gltfLoader = new GLTFLoader(manager);
        gltfLoader.load('assets/scene.glb', (gltf) => {
            this.model = gltf.scene;
            
            // Apply Initial Scale
            this.model.scale.setScalar(this.initialScale);
            
            this.scene.add(this.model);
            
            // Cache References
            this._loadAndCacheAssetRefs(this.model);
            this._initObjectStates();
        });

        manager.onLoad = () => {
            console.log("ThreeJS Scene Loaded.");
            this.isLoaded = true;
            this.state = 'IDLE';
            this.onSceneReady();
        };
    }

    _loadAndCacheAssetRefs(root) {
        // Prepare storage for the 18 key refs
        this.$.refKeys = [];

        root.traverse((obj) => {
            if (obj.isMesh || obj.isObject3D) {
                // Check specific names
                switch(obj.name) {
                    case 'refStartPos': this.$.refStartPos = obj; break;
                    case 'refEndPos':   this.$.refEndPos = obj; break;
                    case 'refFocus':    this.$.refFocus = obj; break;
                    case 'BlackoutWall':this.$.blackoutWall = obj; break;
                    case 'WindKey':     this.$.windKey = obj; break;
                    case 'Wall':        this.$.wall = obj; break;
                    case 'BoxLid':      this.$.boxLid = obj; break;
                    case 'Comb':        this.$.comb = obj; break;
                    case 'Drum':        this.$.drum = obj; break;
                    case 'Peg':         this.$.peg = obj; break;
                    case 'SmallGears':  this.$.smallGears = obj; break;
                    case 'FlyWeight':   this.$.flyWeight = obj; break;
                }

                // Check for keys (refKey1 ... refKey18)
                if (obj.name.startsWith('refKey')) {
                    const index = parseInt(obj.name.replace('refKey', '')) - 1;
                    if (!isNaN(index)) {
                        this.$.refKeys[index] = obj;
                    }
                }
            }
        });

        // Validate essentials
        if (!this.$.refStartPos || !this.$.refEndPos || !this.$.refFocus) {
            console.warn("Missing critical Camera References in GLTF");
        }
    }

    _initObjectStates() {
        // 1. Hide Wall initially
        if (this.$.wall) this.$.wall.visible = false;

        // 2. Ensure Blackout Wall is visible and opaque
        if (this.$.blackoutWall) {
            this.$.blackoutWall.visible = true;
            // Ensure material allows opacity
            if (this.$.blackoutWall.material) {
                this.$.blackoutWall.material.transparent = true;
                this.$.blackoutWall.material.opacity = 1.0;
                this.$.blackoutWall.material.depthWrite = false; // often needed for fades
            }
        }

        // 3. Set Camera to Start Position
        if (this.$.refStartPos && this.$.refFocus) {
            // World positions might be affected by scaling, so we get world pos
            const startVec = new THREE.Vector3();
            const focusVec = new THREE.Vector3();
            
            this.$.refStartPos.getWorldPosition(startVec);
            this.$.refFocus.getWorldPosition(focusVec);

            this.camera.position.copy(startVec);
            this.camera.lookAt(focusVec);
        }
        
        // 4. Hide Original Peg (it's just a reference for cloning later)
        if (this.$.peg) this.$.peg.visible = false;
    }

    // --- PUBLIC METHODS ---

    crank() {
        if (!this.isLoaded) return;

        // Rotate WindKey on Y (or Z depending on export). 
        // Assuming Blender Y-up export -> ThreeJS Y.
        // Prompt says "rotates in -degree direction".
        if (this.$.windKey) {
            // -15 degrees in radians
            this.$.windKey.rotation.y -= THREE.MathUtils.degToRad(15);
        }

        this.crankCount++;
        console.log("Crank:", this.crankCount);

        if (this.crankCount >= 6 && this.state === 'IDLE') {
            this._startScene();
        }
    }
    
    // Receives data from MusicBoxPlayer
    handleFrameData(data) {
        // data = { time: 0.0-1.0, morphTargets: [] }

        // 1. Rotate Drum
        // 0 to -360 degrees
        if (this.$.drum) {
            const angle = data.time * Math.PI * 2 * -1;
            this.$.drum.rotation.x = angle;

            // 2. Rotate Small Gears (Opposite direction, scaled by ratio)
            // Drum goes Negative, Gears go Positive
            if (this.$.smallGears) {
                // If drum does 1 turn, gear does 1.98 turns
                this.$.smallGears.rotation.x = (angle * -1) * this.gearRatio;
            }
        }

        // 3. Flyweight 
        // Spins arbitrarily fast on Vertical axis (ThreeJS Y)
        if (this.$.flyWeight) {
            // Just increment based on real time or frame
            this.$.flyWeight.rotation.y -= 0.2; 
        }

        // 4. Comb Morphs
        if (this.$.comb && this.$.comb.morphTargetInfluences) {
            data.morphTargets.forEach(mt => {
                // Map name "Key 1" to index in ThreeJS dictionary?
                // GLTFLoader usually creates a dictionary: mesh.morphTargetDictionary
                const idx = this.$.comb.morphTargetDictionary[mt.name];
                if (idx !== undefined) {
                    this.$.comb.morphTargetInfluences[idx] = mt.value;
                }
            });
        }
    }

    // --- ANIMATION SEQUENCE ---

    _startScene() {
        console.log("Starting Scene Sequence...");
        this.state = 'FADING_WALL';
        this.animStartTime = performance.now();
    }

    _tick() {
        requestAnimationFrame(() => this._tick());
        
        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        this.renderer.render(this.scene, this.camera);
        
        if (this.state === 'IDLE') return;

        // --- STATE MACHINE ---

        if (this.state === 'FADING_WALL') {
            const elapsed = (now - this.animStartTime) / 1000;
            const duration = 1.0; // 1 second fade
            
            if (this.$.blackoutWall) {
                let opacity = 1.0 - (elapsed / duration);
                if (opacity <= 0) {
                    opacity = 0;
                    this.$.blackoutWall.visible = false;
                    
                    // Next State
                    this.state = 'CAMERA_MOVE';
                    this.animStartTime = now;
                    this._initCameraLerpValues();
                }
                this.$.blackoutWall.material.opacity = opacity;
            } else {
                 // Skip if missing
                 this.state = 'CAMERA_MOVE';
                 this.animStartTime = now;
            }
        }

        else if (this.state === 'CAMERA_MOVE') {
            const elapsed = (now - this.animStartTime) / 1000;
            const duration = 2.5; // 2.5 seconds move
            const progress = Math.min(elapsed / duration, 1.0);
            
            // Ease out cubic
            const t = 1 - Math.pow(1 - progress, 3);

            this._updateCameraLerp(t);

            // Trigger Wall Visibility at 30%
            if (progress > 0.3 && this.$.wall && !this.$.wall.visible) {
                this.$.wall.visible = true;
            }

            if (progress >= 1.0) {
                this.state = 'OPENING_LID';
                this.animStartTime = now;
                this._enableControls(); // Switch to orbit controls
            }
        }

        else if (this.state === 'OPENING_LID') {
            const elapsed = (now - this.animStartTime) / 1000;
            const duration = 1.0;
            const progress = Math.min(elapsed / duration, 1.0);

            // Smoothstep
            const t = progress * progress * (3 - 2 * progress);

            if (this.$.boxLid) {
                // 0 to -90 deg (-PI/2)
                this.$.boxLid.rotation.x = THREE.MathUtils.lerp(0, -Math.PI/2, t);
            }

            if (progress >= 1.0) {
                this.state = 'PLAYING';
                console.log("Scene Ready. Playing Music.");
                this.onMusicPlay();
            }
        }

        // If 'PLAYING', OrbitControls handles the camera, 
        // handleFrameData handles the objects.
        if (this.controls) this.controls.update();
    }

    _initCameraLerpValues() {
        // We want to spherical lerp around the Focus point.
        const startPos = new THREE.Vector3();
        const endPos = new THREE.Vector3();
        const focusPos = new THREE.Vector3();

        this.$.refStartPos.getWorldPosition(startPos);
        this.$.refEndPos.getWorldPosition(endPos);
        this.$.refFocus.getWorldPosition(focusPos);

        this.camLerp = {
            start: startPos,
            end: endPos,
            focus: focusPos
        };
    }

    _updateCameraLerp(t) {
        // 1. Get vectors relative to focus
        const vStart = new THREE.Vector3().subVectors(this.camLerp.start, this.camLerp.focus);
        const vEnd = new THREE.Vector3().subVectors(this.camLerp.end, this.camLerp.focus);

        // 2. Calculate the interpolated distance (radius)
        const startDist = vStart.length();
        const endDist = vEnd.length();
        const currentDist = THREE.MathUtils.lerp(startDist, endDist, t);

        // 3. Create the Arc (N-LERP method)
        // Linearly lerp the vector, then normalize it to make it spherical.
        // This replaces .slerp() and is compatible with all ThreeJS versions.
        const vCurrent = new THREE.Vector3().lerpVectors(vStart, vEnd, t).normalize();

        // 4. Apply the calculated distance
        vCurrent.multiplyScalar(currentDist);

        // 5. Add Focus position back to get absolute world position
        const finalPos = vCurrent.add(this.camLerp.focus);

        // 6. Apply
        this.camera.position.copy(finalPos);
        this.camera.lookAt(this.camLerp.focus);
    }

    _enableControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        // Optional: lock target to focus
        if (this.$.refFocus) {
            const focusVec = new THREE.Vector3();
            this.$.refFocus.getWorldPosition(focusVec);
            this.controls.target.copy(focusVec);
        }
    }
}
