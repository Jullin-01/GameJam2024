import {Cinematic} from './cinematic.js';
import {ResourceLoader} from './resourceManager/resourceLoader.js';
import './styles.css';

let _APP = null;
let _ResourceLoader = null;

window.addEventListener('DOMContentLoaded', () => {
    _ResourceLoader = new ResourceLoader();

    _ResourceLoader.AllLoad(() => {
        const message = document.getElementById("message");
        message.textContent = "Нажмите любую кнопку";
        
        document.addEventListener("click", handleInteraction);
        document.addEventListener("keydown", handleInteraction);
    });
}); 

// Prevent text selection
document.querySelector('.menu').addEventListener('mousedown', (e) => e.preventDefault());

function handleInteraction() {
    document.removeEventListener("click", handleInteraction);
    document.removeEventListener("keydown", handleInteraction);

    _APP = new Cinematic();

    console.log('Start cinematic');
    _ResourceLoader._audioManager.InitAudioPlayer();
    _ResourceLoader._audioManager.StartPlayback('GameSketch1.2.wav', false);

    document.getElementById("loading").style.display = "none";
    document.getElementById("div-canvas").style.display = "flex";
}