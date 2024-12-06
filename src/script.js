import {Cinematic} from './cinematic/cinematic.js';
import {Game} from './game/game.js';
import {ResourceLoader} from './resourceManager/resourceLoader.js';
import {Viewport} from './common/viewport.js';
import './styles.css';

let _ResourceLoader = null;
let _Viewport = null;
let _Cinematic = null;
let _Game = null;

let _APP = {_ResourceLoader, _Viewport, _Cinematic, _Game};

window.addEventListener('DOMContentLoaded', () => {
  _APP._ResourceLoader = new ResourceLoader();
  _APP._Viewport = new Viewport();

  _APP._ResourceLoader.AllLoad(() => {
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

    _APP._Cinematic = new Cinematic(_APP);
    _APP._Game = new Game(_APP);

    
  if (0) {
    console.log('Start cinematic');
    _APP._Cinematic.StartRendering();
    _APP._ResourceLoader._audioManager.InitAudioPlayer();
    _APP._ResourceLoader._audioManager.StartPlayback('GameSketch1.4.mp3', false);
  }
  else {
    _APP._Game.StartRendering();
  }

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
const gameFinishText = document.querySelector('#game-finish-text');
const canvasWin = document.getElementById("canvas");


startButton.addEventListener('click', () => {

  _APP._Cinematic.StopRendering();
  _APP._Game.StartRendering();
  
  registrationWin.style.display = 'none';

  /*  
  const playerName = input.value.trim(); // Getting the username

      if (playerName) {
        gameFinishText.textContent = `Поздравляем, ${playerName}!`; // Updating 
      } else {
        gameFinishText.textContent = 'Поздравляем, незнакомец!'; // Handling empty input
      }

  registrationWin.style.display = 'none';
  gameWin.style.display = 'flex';
  canvasWin.style.display = "none";
*/
});