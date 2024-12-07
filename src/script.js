import { Cinematic } from './cinematic/cinematic.js';
import { Game } from './game/game.js';
import { ResourceLoader } from './resourceManager/resourceLoader.js';
import { Viewport } from './common/viewport.js';
import './styles.css';

let _ResourceLoader = null;
let _Viewport = null;
let _Cinematic = null;
let _Game = null;
let _Utils = null;

let _APP = { _ResourceLoader, _Viewport, _Cinematic, _Game, _Utils };
_APP._Utils = {};

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

    _APP._Utils.removeHandleSkipCinematic = removeHandleSkipCinematic;

    _APP._Cinematic = new Cinematic(_APP);
    _APP._Game = new Game(_APP);

    _APP._ResourceLoader._audioManager.InitAudioPlayer();

    if (1) {
        console.log('Start cinematic');
        _APP._Cinematic.StartRendering();
        _APP._ResourceLoader._audioManager.StartPlaybackBackground('GameSketch1.4.mp3', false);
        document.addEventListener("click", handleSkipCinematic);
    }
    else {
        _APP._Game.StartRendering();
    }

    document.getElementById("loading").style.display = "none";
    document.getElementById("mainDiv").style.display = "flex";
    document.getElementById("div-canvas").style.display = "flex";
}

const registrationWin = document.querySelector('#registration');
const skipCinematicWin = document.querySelector('#skip-cinematic');
const gameWin = document.querySelector('#game');
const input = document.querySelector('.player-name');
const startButton = document.querySelector('#button-start');
const gameFinishText = document.querySelector('#game-finish-text');
const canvasWin = document.getElementById("canvas");

const skipCinematicButton = document.querySelector('#button-skip');
const stayCinematicButton = document.querySelector('#button-stay');

const soundButton = document.querySelector('#sound');
const fullscreenButton = document.querySelector('#fullscreen');

function handleSkipCinematic() {
    console.log("handleSkipCinematic");
    skipCinematicWin.style.display = 'flex'; // TODO: ???
}

function removeHandleSkipCinematic() {
    document.removeEventListener("click", handleSkipCinematic);
}

skipCinematicButton.addEventListener('click', (event) => {
    event.stopPropagation();
    removeHandleSkipCinematic();
    skipCinematicWin.style.display = 'none';
    _APP._Cinematic.SkipCinematic();
});

stayCinematicButton.addEventListener('click', (event) => {
    event.stopPropagation();
    skipCinematicWin.style.display = 'none';
});

soundButton.addEventListener('click', (event) => {
    event.stopPropagation();
    console.log("click soundButton");
    let status = _APP._ResourceLoader._audioManager.SwitchVolume();

    const soundOn = document.querySelector('#sound-on');
    const soundOff = document.querySelector('#sound-off');

    if (status)
    {
        soundOn.style.display = 'flex';
        soundOff.style.display = 'none';
    } else {
        soundOn.style.display = 'none';
        soundOff.style.display = 'flex';
    }
});

fullscreenButton.addEventListener('click', (event) => {
    event.stopPropagation();
    console.log("click fullscreenButton");

    const mainDiv = document.getElementById('mainDiv');
    
    const fullscreenOn = document.querySelector('#fullscreen-on');
    const fullscreenOff = document.querySelector('#fullscreen-off');

    if (!document.fullscreenElement) {
        mainDiv.requestFullscreen()
            .then(() => {
                fullscreenOn.style.display = 'none';
                fullscreenOff.style.display = 'flex';
            })
            .catch(err => {
                alert(`Error when switching to full screen mode: ${err.message}`);
            });
    } else {
        document.exitFullscreen();
        fullscreenOn.style.display = 'flex';
        fullscreenOff.style.display = 'none';
    }
});

document.addEventListener('fullscreenchange', () => {
    const fullscreenOn = document.querySelector('#fullscreen-on');
    const fullscreenOff = document.querySelector('#fullscreen-off');

    if (!document.fullscreenElement) {
        fullscreenOn.style.display = 'flex';
        fullscreenOff.style.display = 'none';
    }
});

startButton.addEventListener('click', (event) => {
    event.stopPropagation();

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