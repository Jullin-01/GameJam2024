export class CameraPositions {
    constructor() {
        // Array of camera positions
        this.cameraPositionsAndLookAt = [
            [{ x: -1.965774, y: 0.226256, z: 7.099943 }, { x: -1.783741, y: 0.292891, z: 6.118911 }, { x: -0.016913, y: 0.997766, z: 0.064634 }],  // Camera 1
            [{ x: 2.747388, y: 0.061375, z: 1.055358 }, { x: 1.794722, y: 0.148531, z: 0.764099 }, { x: 0.083347, y: 0.996195, z: 0.025482 }],  // Camera 2
            [{ x: 35.373322, y: 33.873634, z: 6 }, { x: 34.607277, y: 33.230846, z: 6 }, { x: -0.642788, y: 0.766044, z: 0 }],  // Camera 3
            [{ x: 13.871177, y: 2, z: 6 },      { x: 12.871177, y: 2, z: 6 }, { x: 0, y: 1, z: 0 }]   // Camera 4
        ];
        this.currentIndex = 0; // Current camera index
    }

    // Get the current camera position
    getCurrentPosition() {
        return this.cameraPositionsAndLookAt[this.currentIndex][0];
    }

    getCurrentLookAt() {
        return this.cameraPositionsAndLookAt[this.currentIndex][1];
    }

    getCurrentUp() {
        return this.cameraPositionsAndLookAt[this.currentIndex][2];
    }
    // Switch camera to next
    switchToNextCamera() {
        this.currentIndex = (this.currentIndex + 1) % this.cameraPositionsAndLookAt.length;
        console.log(this.currentIndex);
        return this.getCurrentPosition();
    }
}