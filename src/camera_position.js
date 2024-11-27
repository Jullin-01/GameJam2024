export class CameraPositions {
    constructor() {
        // Array of camera positions
        this.cameraPositions = [
            { x: 1.5, y: 0.2, z: 4 },   // Camera 1
            { x: 1.2, y: 0.08, z: 1 }, // Camera 2
            { x: 8, y: 10, z: 8 },      // Camera 3
            { x: 8, y: 1, z: 8 }       // Camera 4
        ];
        this.currentIndex = 0; // Current camera index
    }

    // Get the current camera position
    getCurrentPosition() {
        return this.cameraPositions[this.currentIndex];
    }

    // Switch camera to next
    switchToNextCamera() {
        this.currentIndex = (this.currentIndex + 1) % this.cameraPositions.length;
        console.log(this.currentIndex);
        return this.getCurrentPosition();
    }
}