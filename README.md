# Interactive Hand-Tracking Demo with Three.js and MediaPipe

This project is a web-based demonstration of real-time hand tracking used to manipulate a 3D object. It leverages the power of Google's MediaPipe for computer vision and Three.js for 3D rendering directly in the browser.

The application uses the device's webcam to detect a user's hand. The position and shape of a 3D cube are controlled by the hand's movements:

- **Position:** The cube's position on the screen mirrors the position of the user's wrist.
- **Scale:** The cube's size changes based on the distance between the user's thumb and index finger.

For clear visual feedback, the detected hand landmarks and skeleton are drawn on an overlay canvas.

## Tech Stack

- **3D Rendering:** [Three.js](https://threejs.org/)
- **Hand Tracking:** [Google's MediaPipe](https://developers.google.com/mediapipe)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## Setup and Running Locally

To run this project on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm) installed on your system.
- A device with a webcam.

### Installation & Execution

1.  **Clone the repository or download the source code.**

2.  **Navigate to the project directory** in your terminal:

    ```bash
    cd path/to/your/project
    ```

3.  **Install the necessary dependencies:**

    ```bash
    npm install
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

5.  **Open your web browser** and go to the local URL provided by Vite (usually `http://localhost:5173`).

6.  Allow the browser to access your webcam when prompted.

7.  Click the **"Start"** button to begin the experience.
