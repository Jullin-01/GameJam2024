import './styles.css';

// Запрещаем выделение текста через события мыши
document.querySelector('.menu').addEventListener('mousedown', (e) => e.preventDefault());