import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { load } from '..';

class WorldObjects {
    constructor(world) {
        this.scene = world.scene;
        this.camera = world.camera;
        // this.controls = world.controls;
        this.enemies = [];
        this.playerMixers = [];
        this.enemyMixers = [];
        this.loadCharacter();   
        this.loadEnemies();
        this.validSpawnCoords = [];
        for (let i = -200; i < 200; i++) {
            this.validSpawnCoords.push([i + (Math.random() - 0.5) * 50, 2, -(i + (Math.random() - 0.5) * 50)])
        }
    }

    async loadCharacter() {
        let that = this;
        const loader = new FBXLoader();
        loader.load('./assets/player/archer-model.fbx', (fbx) => {
            fbx.scale.setScalar(0.04)
            fbx.rotateY(Math.PI);
            fbx.traverse(c => {
                if (c.isMesh) {
                    c.castShadow = true;
                    c.receiveShadow = false;
                }
            });
            const animation = new FBXLoader();
            animation.load("./assets/player/animation-idle.fbx", (animation) => {
                const mixer = new THREE.AnimationMixer(fbx);
                mixer.name = 'idle'
                this.playerMixers.push(mixer);
                mixer.clipAction(animation.animations[0]).play();
            })

            const animation2 = new FBXLoader();
            animation2.load("./assets/player/animation-run-forward.fbx", (animation) => {
                const mixer = new THREE.AnimationMixer(fbx);
                mixer.name = 'run-forward'
                this.playerMixers.push(mixer);
                mixer.clipAction(animation.animations[0]).play();
            })

            const animation3 = new FBXLoader();
            animation3.load("./assets/player/animation-draw-arrow.fbx", (animation) => {
                const mixer = new THREE.AnimationMixer(fbx);
                mixer.name = 'draw-arrow'
                this.playerMixers.push(mixer);
                mixer.clipAction(animation.animations[0]).play();
            })
            fbx.name = 'player';
            fbx.position.y = 2;
            that.scene.add(fbx);
            that.camera.lookAt(fbx.position);
            load();
        });
    }

    async loadEnemies() {
        const loader = new FBXLoader();
        for (let i = 0; i < 10; i++) {
            loader.load('./assets/zombie/zombie-model.fbx', (fbx) => {
                let enemyMixer = new THREE.AnimationMixer(fbx);
                fbx.traverse(c => {
                    if (c.isMesh) {
                        c.castShadow = true;
                        c.receiveShadow = false;
                    }
                });
                const animation = new FBXLoader();
                animation.load("./assets/zombie/zombie-idle.fbx", (animation) => {
                    let clip = animation.animations[0]
                    let renamedClip = new THREE.AnimationClip('idle', clip.duration, clip.tracks);
                    enemyMixer.clipAction(renamedClip);
                })
                const animation2 = new FBXLoader();
                animation2.load("./assets/zombie/zombie-attack.fbx", (animation) => {
                    let clip = animation.animations[0]
                    let renamedClip = new THREE.AnimationClip('attack', clip.duration, clip.tracks);
                    enemyMixer.clipAction(renamedClip);
                })
                const animation3 = new FBXLoader();
                animation3.load("./assets/zombie/zombie-running.fbx", (animation) => {
                    let clip = animation.animations[0]
                    let renamedClip = new THREE.AnimationClip('running', clip.duration, clip.tracks);
                    enemyMixer.clipAction(renamedClip);
                })
                this.enemyMixers.push(enemyMixer);
                fbx.scale.setScalar(0.04);
                fbx.position.set(...this.validSpawnCoords[Math.floor(Math.random() * this.validSpawnCoords.length)])
                fbx.rotation.y = Math.random() * Math.PI;
                fbx.name = "enemy";
                fbx.health = 3;
                fbx.nametag = 'Zombie';
                // Each enemy has an internal timer to space attacks between
                fbx.clock = new THREE.Clock();
                this.scene.add(fbx);
                this.enemies.push(fbx);
                load();
            })
        }
    }
    
    move() {
        //Handle collision between projectiles and enemies - Map each object to its bounding box
        this.objectsBoundingBox = {}
        this.scene.children.forEach((object) => {
            if (object.name === "multiArrow" || object.name === "arrow") {
                this.objectsBoundingBox[object.uuid] = new THREE.Box3().setFromObject(object);
            }
            if (object.geometry || object.clock || object.name === "player") {
                this.objectsBoundingBox[object.uuid] = new THREE.Box3().setFromObject(object);
            }
        })

        // this.controls.update();
    }
}

export default WorldObjects;