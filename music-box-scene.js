import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class MusicBoxScene {
    constructor(options = {}) {
        this.onSceneReady = options.onSceneReady || (() => {});
        this.onMusicPlay = options.onMusicPlay || (() => {});
        this.onMusicPause = options.onMusicPause || (() => {}); 
        this.onReadyForPegs = options.onReadyForPegs || (() => {}); 
        this.initialScale = options.initialScale || 1.0;

        // URL Params
        const urlParams = new URLSearchParams(window.location.search);
        this.autoOpen = urlParams.get('autoOpen') === 'true';

        // State
        this.$ = {}; 
        this.generatedPegs = []; 
        this.responsePlanes = []; 
        this.crankCount = 0;
        this.isLoaded = false;
        
        this.isCranking = false;
        this.crankTargetRot = 0;
        
        // Animation States
        this.state = 'LOADING'; 
        this.animStartTime = 0;
        this.playStartTime = 0;
        this.lastFrameTime = 0;

        this.gearRatio = 0.1564 / 0.0789; 

        this.handleFrameData = this.handleFrameData.bind(this);
        this.buildPegs = this.buildPegs.bind(this);

        this._buildScene();
    }

    _buildScene() {
        const mount = document.getElementById('threeJSMount');
        if (!mount) return;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(mount.clientWidth, mount.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0; 
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        mount.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
        this.camera.position.set(0, 1, 5);

        const ambient = new THREE.AmbientLight(0xffffff, 0.5); 
        this.scene.add(ambient);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);

        this._loadAssets();
        this._setupSwipeInteraction(); 

        window.addEventListener('resize', () => {
            this.camera.aspect = mount.clientWidth / mount.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(mount.clientWidth, mount.clientHeight);
        });

        this._tick();
    }

    // --- INTERACTION ---

    // Public method for UI button
    toggle() {
        if (this.state === 'PLAYING') {
            this._triggerClose();
        } else if (this.state === 'PAUSED' || this.state === 'WAIT_FOR_OPEN' || this.state === 'WAIT_DELAY') {
            // Force peg build if we skipped the normal flow
            if (this.generatedPegs.length === 0) {
                 this.onReadyForPegs();
            }
            // Hide swipe UI if we toggled manually
            const zone = document.getElementById('swipe-zone');
            if(zone) zone.style.display = 'none';

            this._triggerOpen();
        }
    }

    _setupSwipeInteraction() {
        const swipeZone = document.getElementById('swipe-zone');
        let startY = 0;

        const onStart = (y) => { startY = y; };
        const onEnd = (y) => {
            if (this.state !== 'WAIT_FOR_OPEN') return;
            const deltaY = startY - y; 
            if (deltaY > 50) { 
                swipeZone.style.display = 'none';
                this._triggerOpen();
            }
        };

        swipeZone.addEventListener('mousedown', (e) => onStart(e.clientY));
        swipeZone.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY));
        
        window.addEventListener('mouseup', (e) => onEnd(e.clientY));
        window.addEventListener('touchend', (e) => onEnd(e.changedTouches[0].clientY));
    }

    _triggerOpen() {
        this.state = 'OPENING_LID';
        this.animStartTime = performance.now();
    }

    _triggerClose() {
        this.state = 'CLOSING_LID';
        this.animStartTime = performance.now();
        this.onMusicPause();
    }

    async _loadAssets() {
        const manager = new THREE.LoadingManager();
        
        const rgbeLoader = new RGBELoader(manager);
        rgbeLoader.load('assets/venice_sunset_2k.hdr', (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            this.scene.environment = texture;
        });

        const gltfLoader = new GLTFLoader(manager);
        gltfLoader.load('assets/scene.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.scale.setScalar(this.initialScale);
            
            this.model.traverse((obj) => {
                if (obj.isMesh) {
                    obj.frustumCulled = false;
                    if (obj.material.isMeshStandardMaterial) {
                        obj.material.envMapIntensity = 1.0; 
                    }
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            });

            this.scene.add(this.model);
            this._loadAndCacheAssetRefs(this.model);
            this._initObjectStates();
        });

        manager.onLoad = () => {
            console.log("ThreeJS Scene Loaded.");
            this.isLoaded = true;
            this.state = 'IDLE';

            setTimeout(() => {
                this.handleFrameData({ time: 0, morphTargets: [] });
                this.onSceneReady();
            }, 1000);
        };
    }
    
    buildPegs(songData) {
        if (!this.$.drum || !this.$.peg) return;

        this.generatedPegs.forEach(p => { if (p.parent) p.parent.remove(p); });
        this.generatedPegs = [];

        songData.forEach((note) => {
            const refKey = this.$.refKeys[note.keyIndex];
            if (!refKey) return; 

            const peg = this.$.peg.clone();
            peg.visible = true; 
            peg.frustumCulled = false; 
            
            peg.scale.set(1, 1, 1);
            peg.scale.copy(this.$.peg.scale);

            this.$.drum.add(peg);

            const targetPos = new THREE.Vector3();
            refKey.getWorldPosition(targetPos);
            this.$.drum.worldToLocal(targetPos);

            peg.position.set(0, 0, 0); 
            peg.position.x = targetPos.x;

            const angle = note.normalizedStart * Math.PI * 2;
            peg.rotation.x = angle;

            peg.updateMatrix();
            this.generatedPegs.push(peg);
        });
    }

    _loadAndCacheAssetRefs(root) {
        this.$.refKeys = [];
        this.responsePlanes = []; 

        root.traverse((obj) => {
            if (obj.isMesh || obj.isObject3D) {
                switch(obj.name) {
                    case 'refStartPos': this.$.refStartPos = obj; break;
                    case 'refEndPos':   this.$.refEndPos = obj; break;
                    case 'refFocus':    this.$.refFocus = obj; break;
                    case 'refFocusEnd': this.$.refFocusEnd = obj; break;
                    case 'BlackoutWall':this.$.blackoutWall = obj; break;
                    case 'WindKey':     this.$.windKey = obj; break;
                    case 'Wall':        this.$.wall = obj; break;
                    case 'TableCloth':  this.$.tableCloth = obj; break; 
                    case 'BoxLid':      this.$.boxLid = obj; break;
                    case 'Comb':        this.$.comb = obj; break;
                    case 'Drum':        this.$.drum = obj; break;
                    case 'Peg':         this.$.peg = obj; break;
                    case 'SmallGears':  this.$.smallGears = obj; break;
                    case 'FlyWeight':   this.$.flyWeight = obj; break;
                    case 'Responses':   
                        obj.traverse((child) => {
                            if (child.isMesh) this.responsePlanes.push(child);
                        });
                        break;
                }
                if (obj.name.startsWith('refKey')) {
                    const index = parseInt(obj.name.replace('refKey', '')) - 1;
                    if (!isNaN(index)) this.$.refKeys[index] = obj;
                }
            }
        });
    }

    _initObjectStates() {
        if (this.$.blackoutWall) {
            this.$.blackoutWall.material = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1.0, depthWrite: false });
            this.$.blackoutWall.visible = true;
        }

        if (this.$.wall) {
            if (this.$.wall.material) {
                this.$.wall.material.transparent = true;
                this.$.wall.material.opacity = 0.0;
                this.$.wall.material.depthWrite = true; 
            }
            this.$.wall.visible = true; 
        }

        if (this.$.tableCloth) {
            if (this.$.tableCloth.material) {
                this.$.tableCloth.material.transparent = true;
                this.$.tableCloth.material.opacity = 0.0;
                this.$.tableCloth.material.depthWrite = true;
            }
            this.$.tableCloth.visible = true;
        }
        
        this.responsePlanes.forEach(plane => {
            plane.renderOrder = 999;
            plane.frustumCulled = false;
            if (plane.geometry) plane.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), Infinity);
            if (plane.material) {
                plane.material = plane.material.clone();
                plane.material.transparent = true;
                plane.material.opacity = 0.0; 
                plane.material.side = THREE.DoubleSide; 
                plane.material.depthWrite = false; 
                plane.material.polygonOffset = true;
                plane.material.polygonOffsetFactor = -1.0;
                plane.material.polygonOffsetUnits = -1.0;
            }
            plane.visible = true;
        });

        const parts = [this.$.drum, this.$.smallGears, this.$.flyWeight];
        parts.forEach(p => { 
            if(p) { p.visible = true; p.frustumCulled = false; p.updateMatrix(); } 
        });

        if (this.$.peg) this.$.peg.visible = false;
        
        if (this.$.windKey) this.crankTargetRot = this.$.windKey.rotation.z; 

        if (this.$.refStartPos && this.$.refFocus) {
            const startVec = new THREE.Vector3();
            const focusVec = new THREE.Vector3();
            this.$.refStartPos.getWorldPosition(startVec);
            this.$.refFocus.getWorldPosition(focusVec);
            this.camera.position.copy(startVec);
            this.camera.lookAt(focusVec);
        }
    }

    crank() {
        if (!this.isLoaded) return;
        if (this.isCranking) return; 

        this.crankTargetRot += Math.PI; 
        this.isCranking = true;
        this.crankCount++;
        
        if (this.crankCount >= 6 && this.state === 'IDLE') {
            this._startScene();
        }
    }
    
    handleFrameData(data) {
        if (this.$.drum) {
            const angle = data.time * Math.PI * 2 * -1;
            this.$.drum.rotation.x = angle;
            if (this.$.smallGears) this.$.smallGears.rotation.x = (angle * -1) * this.gearRatio;
        }
        if (this.$.flyWeight) this.$.flyWeight.rotation.y -= 0.2; 
        if (this.$.comb && this.$.comb.morphTargetInfluences) {
            data.morphTargets.forEach(mt => {
                const idx = this.$.comb.morphTargetDictionary[mt.name];
                if (idx !== undefined) this.$.comb.morphTargetInfluences[idx] = mt.value;
            });
        }
    }

    _startScene() {
        this.state = 'FADING_WALL';
        this.animStartTime = performance.now();
    }

    _tick() {
        requestAnimationFrame(() => this._tick());
        
        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        this._updateCrankAnimation(dt);
        
        this.renderer.render(this.scene, this.camera);
        
        if (this.state === 'IDLE' || this.state === 'LOADING') return;

        // --- STATE MACHINE ---

        if (this.state === 'FADING_WALL') {
            const elapsed = (now - this.animStartTime) / 1000;
            const progress = Math.min(elapsed / 1.0, 1.0);

            if (this.$.blackoutWall) this.$.blackoutWall.material.opacity = 1.0 - progress;
            if (this.$.tableCloth) this.$.tableCloth.material.opacity = progress;

            if (progress >= 1.0) {
                if (this.$.blackoutWall) this.$.blackoutWall.visible = false;
                this.state = 'CAMERA_MOVE';
                this.animStartTime = now;
                this._initCameraLerpValues();
            }
        }

        else if (this.state === 'CAMERA_MOVE') {
            if (!this.camLerp) this._initCameraLerpValues();
            const elapsed = (now - this.animStartTime) / 1000;
            const progress = Math.min(elapsed / 5.0, 1.0);
            const t = 1 - Math.pow(1 - progress, 3);

            this._updateCameraLerp(t);

            if (this.$.wall && this.$.wall.material) {
                const fadeStart = 0.1; const fadeEnd = 0.5;
                if (progress >= fadeStart) {
                    let op = (progress - fadeStart) / (fadeEnd - fadeStart);
                    this.$.wall.material.opacity = Math.min(Math.max(op, 0), 1);
                }
            }

            if (progress >= 1.0) {
                this.handleFrameData({ time: 0, morphTargets: [] });
                // We DON'T toggle open here yet, we wait for swipe/auto
                
                if (this.autoOpen) {
                    // Auto: Go straight to open
                    this.onReadyForPegs(); // Build pegs now
                    this.state = 'OPENING_LID';
                    this.animStartTime = now;
                    this._enableControls();
                } else {
                    // Manual: Wait a sec, then enable swipe UI
                    this.state = 'WAIT_DELAY';
                    this.animStartTime = now; 
                }
            }
        }

        else if (this.state === 'WAIT_DELAY') {
             const elapsed = (now - this.animStartTime) / 1000;
             if (elapsed > 1.0) {
                 this.state = 'WAIT_FOR_OPEN';
                 this._enableControls();
                 // Show Swipe Prompt
                 const zone = document.getElementById('swipe-zone');
                 if(zone) zone.style.display = 'block';
                 // We build pegs now so they are ready when user swipes
                 this.onReadyForPegs();
             }
        }

        else if (this.state === 'WAIT_FOR_OPEN') {
            // Waiting for swipe interaction...
        }

        else if (this.state === 'OPENING_LID') {
            const elapsed = (now - this.animStartTime) / 1000;
            const progress = Math.min(elapsed / 1.0, 1.0);
            const t = progress * progress * (3 - 2 * progress);

            if (this.$.boxLid) {
                this.$.boxLid.rotation.x = THREE.MathUtils.lerp(0, -Math.PI/2, t);
            }

            if (progress >= 1.0) {
                this.state = 'PLAYING';
                this.onMusicPlay();
                // Reset play timer if we are starting fresh
                if (this.playStartTime === 0) this.playStartTime = now;
            }
        }
        
        else if (this.state === 'CLOSING_LID') {
            const elapsed = (now - this.animStartTime) / 1000;
            const progress = Math.min(elapsed / 1.0, 1.0);
            const t = progress * progress * (3 - 2 * progress);

            if (this.$.boxLid) {
                this.$.boxLid.rotation.x = THREE.MathUtils.lerp(-Math.PI/2, 0, t);
            }

            if (progress >= 1.0) {
                this.state = 'PAUSED';
            }
        }

        else if (this.state === 'PLAYING') {
            const timeSincePlay = (now - this.playStartTime) / 1000;
            const interval = 3.0; 
            
            this.responsePlanes.forEach((plane, index) => {
                const startDelay = index * interval;
                if (timeSincePlay > startDelay) {
                    let op = (timeSincePlay - startDelay) / 1.0; 
                    op = Math.min(Math.max(op, 0), 1);
                    if(plane.material) plane.material.opacity = op;
                }
            });
        }

        if (this.controls) this.controls.update();
    }

    _updateCrankAnimation(dt) {
        if (!this.$.windKey) return;
        const currentRot = this.$.windKey.rotation.z;
        const target = this.crankTargetRot;
        if (Math.abs(target - currentRot) > 0.01) {
            const step = (target - currentRot) * (5.0 * dt); 
            this.$.windKey.rotation.z += step;
        } else {
            this.$.windKey.rotation.z = target;
            this.isCranking = false;
        }
    }

    _initCameraLerpValues() {
        if (!this.$.refStartPos || !this.$.refEndPos || !this.$.refFocus) {
             this.camLerp = { start: new THREE.Vector3(), end: new THREE.Vector3(), focusStart: new THREE.Vector3(), focusEnd: new THREE.Vector3() };
             return;
        }
        
        const startPos = new THREE.Vector3();
        const endPos = new THREE.Vector3();
        const focusStart = new THREE.Vector3();
        const focusEnd = new THREE.Vector3(); 

        this.$.refStartPos.getWorldPosition(startPos);
        this.$.refEndPos.getWorldPosition(endPos);
        this.$.refFocus.getWorldPosition(focusStart);
        
        if (this.$.refFocusEnd) {
            this.$.refFocusEnd.getWorldPosition(focusEnd);
        } else {
            focusEnd.copy(focusStart);
        }

        this.camLerp = { start: startPos, end: endPos, focusStart: focusStart, focusEnd: focusEnd };
    }

    _updateCameraLerp(t) {
        const vStart = new THREE.Vector3().subVectors(this.camLerp.start, this.camLerp.focusStart);
        const vEnd = new THREE.Vector3().subVectors(this.camLerp.end, this.camLerp.focusStart);
        const currentDist = THREE.MathUtils.lerp(vStart.length(), vEnd.length(), t);
        const vCurrent = new THREE.Vector3().lerpVectors(vStart, vEnd, t).normalize().multiplyScalar(currentDist);
        const finalPos = vCurrent.add(this.camLerp.focusStart);
        
        this.camera.position.copy(finalPos);
        this.camera.lookAt(new THREE.Vector3().lerpVectors(this.camLerp.focusStart, this.camLerp.focusEnd, t));
    }

    _enableControls() {
        if (this.controls) { 
            this.controls.enabled = true; 
            return;
        }
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.controls.minAzimuthAngle = -1.7;
        this.controls.maxAzimuthAngle = 1.7;
        this.controls.minPolarAngle = 0;
        this.controls.maxPolarAngle = 1.5;
        
        const target = this.$.refFocusEnd ? this.$.refFocusEnd : this.$.refFocus;
        if(target) {
            const v = new THREE.Vector3();
            target.getWorldPosition(v);
            this.controls.target.copy(v);
        }
    }
}