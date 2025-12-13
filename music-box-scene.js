import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
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
        this.state = 'LOADING'; 
        
        // Animation Timers
        this.animStartTime = 0;
        this.lastFrameTime = 0;

        // Gear Ratios
        this.gearRatio = 0.1564 / 0.0789; // ~1.98

        this._buildScene();
    }

    _buildScene() {
        const mount = document.getElementById('threeJSMount');
        if (!mount) return;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(mount.clientWidth, mount.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2; // Slightly higher exposure
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        mount.appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
        this.camera.position.set(0, 1, 5);

        // Lights (BRIGHTER)
        const ambient = new THREE.AmbientLight(0xffffff, 0.8); // Was 0.2
        this.scene.add(ambient);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 3.0); // Was 1.0
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);

        // Assets
        this._loadAssets();

        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = mount.clientWidth / mount.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(mount.clientWidth, mount.clientHeight);
        });

        this._tick();
    }

    async _loadAssets() {
        const manager = new THREE.LoadingManager();
        
        // FIX: Use standard TextureLoader for JPGs
        const texLoader = new THREE.TextureLoader(manager);
        texLoader.load('assets/Basic_2K_01.jpg', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.colorSpace = THREE.SRGBColorSpace; // Ensure correct color profile
            this.scene.environment = texture;
            
            // Optional: If you want the background to be visible (not black), uncomment this:
            // this.scene.background = texture; 
        });

        const gltfLoader = new GLTFLoader(manager);
        gltfLoader.load('assets/scene.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.setScalar(this.initialScale);
            this.scene.add(this.model);
            
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
        this.$.refKeys = [];

        root.traverse((obj) => {
            if (obj.isMesh || obj.isObject3D) {
                switch(obj.name) {
                    case 'refStartPos': this.$.refStartPos = obj; break;
                    case 'refEndPos':   this.$.refEndPos = obj; break;
                    case 'refFocus':    this.$.refFocus = obj; break;
                    case 'BlackoutWall':this.$.blackoutWall = obj; break;
                    case 'WindKey':     this.$.windKey = obj; break;
                    case 'Wall':        this.$.wall = obj; break;
                    case 'TableCloth':  this.$.tableCloth = obj; break; // NEW
                    case 'BoxLid':      this.$.boxLid = obj; break;
                    case 'Comb':        this.$.comb = obj; break;
                    case 'Drum':        this.$.drum = obj; break;
                    case 'Peg':         this.$.peg = obj; break;
                    case 'SmallGears':  this.$.smallGears = obj; break;
                    case 'FlyWeight':   this.$.flyWeight = obj; break;
                }
                if (obj.name.startsWith('refKey')) {
                    const index = parseInt(obj.name.replace('refKey', '')) - 1;
                    if (!isNaN(index)) this.$.refKeys[index] = obj;
                }
            }
        });
    }

    _initObjectStates() {
        // 1. Hide Wall initially
        if (this.$.wall) this.$.wall.visible = false;

        // 2. Setup Blackout Wall
        if (this.$.blackoutWall) {
            this.$.blackoutWall.visible = true;
            if (this.$.blackoutWall.material) {
                this.$.blackoutWall.material.transparent = true;
                this.$.blackoutWall.material.opacity = 1.0;
                this.$.blackoutWall.material.depthWrite = false;
            }
        }

        // 3. Setup TableCloth (Start transparent/hidden)
        if (this.$.tableCloth) {
            this.$.tableCloth.visible = true;
            if (this.$.tableCloth.material) {
                this.$.tableCloth.material.transparent = true;
                this.$.tableCloth.material.opacity = 0.0; // Start invisible
                this.$.tableCloth.material.depthWrite = true; 
            }
        }

		// 1. Force Drum to Start Position (Fixes the "Pop")
        if (this.$.drum) {
            this.$.drum.rotation.x = 0;
        }

        // 2. Force Small Gears to Start Position
        if (this.$.smallGears) {
            this.$.smallGears.rotation.x = 0;
        }		

        // 4. Camera Init
        if (this.$.refStartPos && this.$.refFocus) {
            const startVec = new THREE.Vector3();
            const focusVec = new THREE.Vector3();
            this.$.refStartPos.getWorldPosition(startVec);
            this.$.refFocus.getWorldPosition(focusVec);
            this.camera.position.copy(startVec);
            this.camera.lookAt(focusVec);
        }
        
        if (this.$.peg) this.$.peg.visible = false;
    }

    // --- PUBLIC ---

    crank() {
        if (!this.isLoaded) return;

        if (this.$.windKey) {
            this.$.windKey.rotateZ(THREE.MathUtils.degToRad(-15));
        }

        this.crankCount++;
        if (this.crankCount >= 6 && this.state === 'IDLE') {
            this._startScene();
        }
    }
    
    handleFrameData(data) {
        if (this.$.drum) {
            const angle = data.time * Math.PI * 2 * -1;
            this.$.drum.rotation.x = angle;
            if (this.$.smallGears) {
                this.$.smallGears.rotation.x = (angle * -1) * this.gearRatio;
            }
        }

        if (this.$.flyWeight) {
            this.$.flyWeight.rotation.y -= 0.2; 
        }

        if (this.$.comb && this.$.comb.morphTargetInfluences) {
            data.morphTargets.forEach(mt => {
                const idx = this.$.comb.morphTargetDictionary[mt.name];
                if (idx !== undefined) {
                    this.$.comb.morphTargetInfluences[idx] = mt.value;
                }
            });
        }
    }

    // --- ANIMATION ---

    _startScene() {
        this.state = 'FADING_WALL';
        this.animStartTime = performance.now();
    }

    _tick() {
        requestAnimationFrame(() => this._tick());
        
        const now = performance.now();
        this.lastFrameTime = now;
        
        this.renderer.render(this.scene, this.camera);
        
        if (this.state === 'IDLE' || this.state === 'LOADING') return;

        // --- STATE MACHINE ---

        if (this.state === 'FADING_WALL') {
            const elapsed = (now - this.animStartTime) / 1000;
            const duration = 1.0;
            
            // Calculate Opacity (0.0 to 1.0 progress)
            let progress = elapsed / duration;
            if (progress > 1.0) progress = 1.0;

            // Blackout Fades OUT (1 -> 0)
            if (this.$.blackoutWall) {
                this.$.blackoutWall.material.opacity = 1.0 - progress;
                if (progress >= 1.0) this.$.blackoutWall.visible = false;
            }

            // TableCloth Fades IN (0 -> 1)
            if (this.$.tableCloth) {
                this.$.tableCloth.material.opacity = progress;
            }

            if (progress >= 1.0) {
                this.state = 'CAMERA_MOVE';
                this.animStartTime = now;
                this._initCameraLerpValues();
            }
        }

        else if (this.state === 'CAMERA_MOVE') {
            if (!this.camLerp) { this._initCameraLerpValues(); }

            const elapsed = (now - this.animStartTime) / 1000;
            const duration = 5.0; // SLOWER (Was 2.5)
            const progress = Math.min(elapsed / duration, 1.0);
            
            const t = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            this._updateCameraLerp(t);

            if (progress > 0.3 && this.$.wall && !this.$.wall.visible) {
                this.$.wall.visible = true;
            }

            if (progress >= 1.0) {
                this.state = 'OPENING_LID';
                this.animStartTime = now;
                this._enableControls();
            }
        }

        else if (this.state === 'OPENING_LID') {
            const elapsed = (now - this.animStartTime) / 1000;
            const duration = 1.0;
            const progress = Math.min(elapsed / duration, 1.0);
            const t = progress * progress * (3 - 2 * progress);

            if (this.$.boxLid) {
                this.$.boxLid.rotation.x = THREE.MathUtils.lerp(0, -Math.PI/2, t);
            }

            if (progress >= 1.0) {
                this.state = 'PLAYING';
                this.onMusicPlay();
            }
        }

        if (this.controls) this.controls.update();
    }

    _initCameraLerpValues() {
        if (!this.$.refStartPos || !this.$.refEndPos || !this.$.refFocus) {
             console.error("Missing refs for camera lerp");
             // Fallback to prevent crash
             this.camLerp = { start: new THREE.Vector3(), end: new THREE.Vector3(), focus: new THREE.Vector3() };
             return;
        }

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
        // N-Lerp / Arc Logic
        const vStart = new THREE.Vector3().subVectors(this.camLerp.start, this.camLerp.focus);
        const vEnd = new THREE.Vector3().subVectors(this.camLerp.end, this.camLerp.focus);

        const startDist = vStart.length();
        const endDist = vEnd.length();
        const currentDist = THREE.MathUtils.lerp(startDist, endDist, t);

        const vCurrent = new THREE.Vector3().lerpVectors(vStart, vEnd, t).normalize();
        vCurrent.multiplyScalar(currentDist);

        const finalPos = vCurrent.add(this.camLerp.focus);

        this.camera.position.copy(finalPos);
        this.camera.lookAt(this.camLerp.focus);
    }

    _enableControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        if (this.$.refFocus) {
            const focusVec = new THREE.Vector3();
            this.$.refFocus.getWorldPosition(focusVec);
            this.controls.target.copy(focusVec);
        }
    }
}