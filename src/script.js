import {Cinematic} from './cinematic.js';
import './styles.css';

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new Cinematic();
}); 

// Prevent text selection
document.querySelector('.menu').addEventListener('mousedown', (e) => e.preventDefault());