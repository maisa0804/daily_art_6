import "./style.css";
import * as THREE from "three";
import {
  HandLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

// --- Elements ---
const video = document.getElementById("video") as HTMLVideoElement;
const canvas = document.querySelector("canvas#canvas") as HTMLCanvasElement;
const overlay = document.querySelector("canvas#overlay") as HTMLCanvasElement;
const overlayCtx = overlay.getContext("2d") as CanvasRenderingContext2D;
const startButton = document.getElementById("startButton") as HTMLButtonElement;

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 2;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true, // Make renderer transparent
});
renderer.setClearColor(0x000000, 0); // Set clear color to transparent

const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// --- MediaPipe Setup ---
let handLandmarker: HandLandmarker;
let drawingUtils: DrawingUtils;
let isRunning = false;

async function main() {
  // Setup MediaPipe and webcam
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
  drawingUtils = new DrawingUtils(overlayCtx);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    startButton.disabled = false;
  } catch (error) {
    console.error("Camera access denied or error:", error);
    startButton.textContent = "Camera Error";
  }
}
main();

// --- Event Listeners ---
startButton.addEventListener("click", async () => {
  if (isRunning) return;
  isRunning = true;
  startButton.style.display = "none";

  video.addEventListener("playing", () => {
    // This is the crucial part: set canvas resolution once video is playing
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    tick();
  });

  try {
    await video.play();
  } catch (err) {
    console.error("Failed to play video:", err);
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Main Logic ---
const clock = new THREE.Clock();
let lastVideoTime = -1;

const tick = () => {
  if (video.paused || video.ended) {
    return;
  }

  const now = performance.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const results = handLandmarker.detectForVideo(video, now);

    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    if (results && results.landmarks && results.landmarks.length > 0) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          HandLandmarker.HAND_CONNECTIONS,
          { color: "#00FF00", lineWidth: 5 }
        );
        drawingUtils.drawLandmarks(landmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });
      }

      const firstHand = results.landmarks[0];
      const wrist = firstHand[0];
      const thumbTip = firstHand[4];
      const indexTip = firstHand[8];

      const x = (wrist.x - 0.5) * 5;
      const y = (1 - wrist.y - 0.5) * 5;
      cube.position.set(x, y, 0);

      const distance = new THREE.Vector2(thumbTip.x, thumbTip.y).distanceTo(
        new THREE.Vector2(indexTip.x, indexTip.y)
      );
      const scale = distance * 5;
      cube.scale.set(scale, scale, scale);
      cube.rotation.set(0, 0, 0);
    } else {
      const elapsedTime = clock.getElapsedTime();
      cube.rotation.x = elapsedTime * 0.2;
      cube.rotation.y = elapsedTime * 0.2;
      cube.scale.set(1, 1, 1);
      cube.position.set(0, 0, 0);
    }
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};
