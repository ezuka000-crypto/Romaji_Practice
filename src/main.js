import '../style.css';
import { Game } from './Game.js';

console.log('Main script started');

try {
  document.querySelector('#app').innerHTML = `
  <div id="settings-screen" class="screen">
    <h1>ローマ字練習</h1>
    
    <div class="setting-group">
      <label>出題数: <span id="count-val">10</span>個</label>
      <input type="range" id="count-slider" min="5" max="20" value="10">
    </div>

    <div class="setting-group">
      <label>文字の大きさ</label>
      <div class="radio-group">
        <label><input type="radio" name="size" value="small"> 小</label>
        <label><input type="radio" name="size" value="medium"> 中</label>
        <label><input type="radio" name="size" value="large" checked> 大</label>
      </div>
    </div>

    <button id="start-btn" class="primary-btn">スタート</button>
  </div>

  <div id="game-screen" class="screen hidden">
    <div id="top-bar">
      <div id="question-area">あ</div>
      <button id="exit-btn" class="secondary-btn">Exit</button>
    </div>
    <canvas id="game-canvas"></canvas>
  </div>

  <div id="result-screen" class="screen overlay hidden">
    <div class="result-content">
      <h2>GREAT!</h2>
      <p>よくできました！</p>
      <button id="replay-btn" class="primary-btn">もう一度遊ぶ</button>
    </div>
  </div>
`;

  // Elements
  const settingsScreen = document.getElementById('settings-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultScreen = document.getElementById('result-screen');
  const countSlider = document.getElementById('count-slider');
  const countVal = document.getElementById('count-val');
  const startBtn = document.getElementById('start-btn');
  const exitBtn = document.getElementById('exit-btn');
  const replayBtn = document.getElementById('replay-btn');
  const canvas = document.getElementById('game-canvas');
  const questionEl = document.getElementById('question-area');

  // Update slider value display
  countSlider.addEventListener('input', (e) => {
    countVal.textContent = e.target.value;
  });

  // Game Instance
  const game = new Game(canvas, questionEl);

  // Start Game
  startBtn.addEventListener('click', () => {
    const count = parseInt(countSlider.value);
    const size = document.querySelector('input[name="size"]:checked').value;

    settingsScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    game.init({ count, size });
  });

  // Exit Game
  exitBtn.addEventListener('click', () => {
    game.stop();
    gameScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
  });

  // Replay
  replayBtn.addEventListener('click', () => {
    resultScreen.classList.add('hidden');
    settingsScreen.classList.remove('hidden');
  });

  // Game Win Event
  window.addEventListener('game-win', () => {
    setTimeout(() => {
      resultScreen.classList.remove('hidden');
    }, 1000);
  });
} catch (e) {
  console.error('Initialization error:', e);
  alert('Error: ' + e.message);
}
