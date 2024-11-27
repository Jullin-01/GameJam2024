import {Cinematic} from './cinematic.js';
import './styles.css';

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new Cinematic();
}); 

// Prevent text selection
document.querySelector('.menu').addEventListener('mousedown', (e) => e.preventDefault());


let clickCount = 0;

        function handleInteraction() {
            const loadingDiv = document.getElementById("loading");
            const cinematic = document.getElementById("div-canvas");
            const message = document.getElementById("message");

            if (clickCount === 0) {
                message.textContent = "Нажмите любую кнопку";
            } else if (clickCount === 1) {
                loadingDiv.style.display = "none";
                cinematic.style.display = "flex";
            }
            clickCount++;
        }

// Event handlers for mouse clicks and keypresses
document.addEventListener("click", handleInteraction);
document.addEventListener("keydown", handleInteraction);