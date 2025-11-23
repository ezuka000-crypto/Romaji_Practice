import { Ball } from './Ball.js';
import { romajiData } from './data.js';
import confetti from 'canvas-confetti';

export class Game {
    constructor(canvas, questionEl) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.questionEl = questionEl;
        this.balls = [];
        this.isPlaying = false;
        this.animationId = null;
        this.targetChar = null;
        this.settings = {
            count: 10,
            size: 'large' // small, medium, large
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.handleClick(e.changedTouches[0]);
        }, { passive: false });
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    }

    init(settings) {
        this.settings = settings;
        this.balls = [];
        this.isPlaying = false;
        this.targetChar = null;
        this.questionEl.textContent = '';

        // Generate balls
        const availableChars = this.getRandomChars(this.settings.count);

        let radius = 40;
        if (this.settings.size === 'medium') radius = 30;
        if (this.settings.size === 'small') radius = 20;

        const colors = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F0E68C', '#DDA0DD', '#87CEFA'];

        for (let i = 0; i < availableChars.length; i++) {
            const char = availableChars[i];
            const color = colors[i % colors.length];

            // Random position (avoiding walls)
            let x = Math.random() * (this.canvas.width - radius * 2) + radius;
            let y = Math.random() * (this.canvas.height - radius * 2) + radius;

            // Random velocity
            let vx = (Math.random() - 0.5) * 4;
            let vy = (Math.random() - 0.5) * 4;

            this.balls.push(new Ball(x, y, vx, vy, radius, color, char.romaji, i));
            // Store hiragana on the ball object for checking? Or just use the romaji to lookup?
            // Better to store the full char object or hiragana reference.
            this.balls[i].data = char;
        }

        this.setNextQuestion();
        this.isPlaying = true;
        this.loop();
    }

    getRandomChars(count) {
        // Shuffle data and pick count
        const shuffled = [...romajiData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    setNextQuestion() {
        if (this.balls.length === 0) {
            this.gameWin();
            return;
        }
        const targetBall = this.balls[Math.floor(Math.random() * this.balls.length)];
        this.targetChar = targetBall.data;
        this.questionEl.textContent = this.targetChar.hiragana;
    }

    loop() {
        if (!this.isPlaying) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let ball of this.balls) {
            ball.update(this.canvas.width, this.canvas.height, this.balls);
            ball.draw(this.ctx);
        }

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    handleClick(e) {
        if (!this.isPlaying) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check clicked ball (iterate backwards to handle overlapping visual order, though they shouldn't overlap much)
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            const dx = x - ball.x;
            const dy = y - ball.y;

            const hitRadius = ball.radius * 1.5;
            if (dx * dx + dy * dy < hitRadius * hitRadius) {
                // Clicked
                if (ball.data.hiragana === this.targetChar.hiragana) {
                    this.handleCorrect(i);
                } else {
                    this.handleIncorrect(ball);
                }
                break; // Only handle one ball click
            }
        }
    }

    handleCorrect(index) {
        this.playCorrectSound();
        this.balls.splice(index, 1);
        this.setNextQuestion();
    }

    handleIncorrect(ball) {
        this.playIncorrectSound();
        ball.shake();
    }

    gameWin() {
        this.isPlaying = false;
        this.questionEl.textContent = "GREAT!";
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Dispatch event to show result screen
        const event = new CustomEvent('game-win');
        window.dispatchEvent(event);
    }

    stop() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationId);
    }

    playCorrectSound() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }

    playIncorrectSound() {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    }
}
