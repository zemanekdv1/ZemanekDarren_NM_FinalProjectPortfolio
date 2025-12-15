import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(780, 520);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, 780 / 520, 0.1, 1000);
camera.position.y = 3;
camera.position.z = 6;
scene.add(camera);

const ambientLight = new THREE.AmbientLight('white', 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('white', 5.5);
directionalLight.position.set(1, 2, 2);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);

const grid = new THREE.GridHelper(50, 50, 0x888888, 0xcccccc); 
scene.add(grid);


const gltfLoader = new GLTFLoader();
let currentModel = null;
let activeThumbnail = null;

function loadModel(modelPath, thumbnail) {
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse(child => {
            if (child.isMesh) child.geometry.dispose();
        });
        currentModel = null;
    }

    if (activeThumbnail) activeThumbnail.style.borderColor = '#aaa';
    if (thumbnail) {
        thumbnail.style.borderColor = 'rgba(255, 119, 0, 1)';
        activeThumbnail = thumbnail;
    }

    gltfLoader.load(modelPath, (gltf) => {
        currentModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(currentModel);
        const size = box.getSize(new THREE.Vector3());
        const min = box.min;

        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 2 / maxDim;
        currentModel.scale.setScalar(scaleFactor);

        const newBox = new THREE.Box3().setFromObject(currentModel);
        const newSize = newBox.getSize(new THREE.Vector3());
        const newMin = newBox.min;

        currentModel.position.set(0, -newMin.y, 0);

        scene.add(currentModel);

        // Fixes camera for some reason
        const fitDist = Math.max(newSize.x, newSize.y, newSize.z) * 2;
        camera.position.set(0, newSize.y * 0.8, fitDist);
        controls.update();
    });
}


document.querySelectorAll('.thumbnail').forEach(thumb => {
    thumb.addEventListener('click', () => {
        const modelPath = thumb.dataset.model;
        loadModel(modelPath, thumb);
    });
});


const firstThumb = document.querySelector('.thumbnail');
loadModel(firstThumb.dataset.model, firstThumb);

function draw() {
    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
}
draw();
