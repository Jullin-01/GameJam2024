import {Cinematic} from './cinematic/cinematic.js';
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

    _APP = new Cinematic(_ResourceLoader);

    console.log('Start cinematic');
    _ResourceLoader._audioManager.InitAudioPlayer();
    _ResourceLoader._audioManager.StartPlayback('GameSketch1.wav', false);

    document.getElementById("loading").style.display = "none";
    document.getElementById("div-canvas").style.display = "flex";


/*    
    // Timer for text appearance
      setTimeout(() => {
        const greetings = document.getElementById("greetings");
        greetings.style.opacity = '1'; 
        setTimeout(() => {
          greetings.style.opacity = '0'; 
        }, 7000);
      }, 15000);
*/
}

const registrationWin = document.querySelector('#registration');
const gameWin = document.querySelector('#game');
const input = document.querySelector('.player-name');
const startButton = document.querySelector('#button-start');
const greeting = document.querySelector('#greeting');
const canvasWin = document.getElementById("canvas");


startButton.addEventListener('click', () => {
  const playerName = input.value.trim(); // Getting the username

      if (playerName) {
        greeting.textContent = `Привет, ${playerName}!`; // Updating the greeting
      } else {
        greeting.textContent = 'Привет, незнакомец!'; // Handling empty input
      }

  registrationWin.style.display = 'none';
  gameWin.style.display = 'flex';
  canvasWin.style.display = "none";
});