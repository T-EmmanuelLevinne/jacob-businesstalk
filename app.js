const screens = {
    home: document.getElementById('screen-home'),
    game: document.getElementById('screen-game'),
    finish: document.getElementById('screen-finish')
  };
  const btnPlay = document.getElementById('btn-play');
  const btnExit = document.getElementById('btn-exit');
  const btnExit2 = document.getElementById('btn-exit-2');
  
  const btnHint = document.getElementById('btn-hint');
  const btnReplay = document.getElementById('btn-replay');
  const scoreEl = document.getElementById('score');
  const progressBar = document.getElementById('progress-bar');
  const questionText = document.getElementById('question-text');
  const answersEl = document.getElementById('answers');
  const freeform = document.getElementById('freeform');
  const answerInput = document.getElementById('answer-input');
  const submitInput = document.getElementById('submit-input');
  const finalSummary = document.getElementById('final-summary');
  const hintBox = document.getElementById('hint-box');

  const overlay = document.getElementById('overlay');
  const scareVideo = document.getElementById('scare-video');
  const scareFallback = document.getElementById('scare-fallback');

  const funnyWrongLines = [
    "Close... but not quite.",
    "Plot twist: that's not it.",
    "Computing... nope.",
    "Great confidence. Wrong answer.",
    "404: Correct answer not found.",
    "Enhance! Enhance! Still wrong.",
    "I admire your creativity more than your accuracy.",
  ];

  const fixedQuestions = [
    { type: 'in', q: '1) Your name?', a: 'jacob' },
    { type: 'in', q: "2) Jacob's favorite person", a: 'justin' },
    { type: 'in', q: '3) Jacob favorite place?', a: 'shell' },
    { type: 'mc', q: "4) Are you jacob's friend?", options: ['Yes', 'No'], a: 0, special: 'friend-check' },
    { type: 'in', q: '5) What do you call a marijuana that is made out of jacob?', a: 'marijacob' },
    { type: 'in', q: "6) A jacob's name that is a place?", a: 'milan' },
    { type: 'in', q: '7) complete name of jacob?', a: 'ryan jacob milan solomon' },
    { type: 'mc', q: '8) Favorite food ni jacob?', options: ['justin','hotdog','siomai'], a: 0 },
    { type: 'in', q: '9) Where is jacob solomon located?', a: 'relocation panacan' },
    { type: 'in', q: '10) Jacob solomon is known for what?', a: 'lying' },
    { type: 'in', q: '11) Where is marijacob located?', a: 'relocation panacan' },
    { type: 'in', q: "12) jacob's valorant in game name?", a: 'evil' },
    { type: 'in', q: '13) who made jacob solomon become a star?', a: 'hudson' },
    { type: 'in', q: "14) Jacob's valorant password?", a: 'jacobmilanngdavao<3' },
    { type: 'in', q: '15) Unsay ingon ni jacob kay justin?', a: 'mark my word' },
  ];

  function shuffle(list) { return list.slice(); }

  const game = {
    questions: fixedQuestions,
    index: 0,
    score: 0,
    answered: false,
    hintUsed: false,
  };

  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.add('hidden'));
    screens[name].classList.remove('hidden');
  }

  function startGame() {
    game.questions = fixedQuestions;
    game.index = 0;
    game.score = 0;
    scoreEl.textContent = '0';
    game.hintUsed = false;
    btnHint.disabled = false;
    btnHint.textContent = 'Hint (1 left)';
    updateProgress();
    renderQuestion();
    showScreen('game');
  }

  function updateProgress() {
    const pct = game.questions.length ? (game.index / game.questions.length) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  function normalize(str) {
    return String(str).trim().toLowerCase();
  }

  function clearAnswers() {
    answersEl.innerHTML = '';
    freeform.classList.add('hidden');
    hintBox.classList.add('hidden');
    hintBox.textContent = '';
    game.answered = false;
  }

  function renderQuestion() {
    clearAnswers();
    const q = game.questions[game.index];
    if (!q) return finishGame();
    questionText.textContent = q.q;
    if (q.type === 'mc') {
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn answer-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => onAnswer(idx === q.a, btn));
        answersEl.appendChild(btn);
      });
    } else {
      freeform.classList.remove('hidden');
      answerInput.value = '';
      answerInput.focus();
    }
  }

  function onAnswer(correct, clickedBtn) {
    if (game.answered) return;
    game.answered = true;
    const q = game.questions[game.index];
    if (q.type === 'mc') {
      const buttons = Array.from(document.querySelectorAll('.answer-btn'));
      buttons.forEach((b, i) => {
        if (i === q.a) b.classList.add('correct');
      });
      if (clickedBtn && !correct) clickedBtn.classList.add('wrong');
    }
    if (q.special === 'friend-check' && clickedBtn) {
      if (!correct) {
        showCorrectThenScareThenHome();
        return;
      }
    }
    if (correct) {
      game.score += 1;
      scoreEl.textContent = String(game.score);
      setTimeout(() => { nextQuestion(); }, 500);
    } else {
      showCorrectThenScareThenHome();
    }
  }

  function submitFreeform() {
    const q = game.questions[game.index];
    if (!q || q.type !== 'in') return;
    const ok = normalize(answerInput.value) === normalize(q.a);
    onAnswer(ok, null);
  }

  function nextQuestion() {
    if (!game.answered) return;
    game.index += 1;
    updateProgress();
    if (game.index >= game.questions.length) return finishGame();
    renderQuestion();
  }

async function finishGame() {
  progressBar.style.width = '100%';
  finalSummary.textContent = `You scored ${game.score} / ${game.questions.length}.`;
  showScreen('finish');
  if (game.score === game.questions.length) {
    await playSpecificJumpscare('congrats.mp4');
  } else {
    await new Promise(r => setTimeout(r, 1200));
  }
  resetToStart();
}

  function playfulNudge(text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.padding = '10px 12px';
    el.style.border = '1px dashed var(--border)';
    el.style.borderRadius = '10px';
    el.style.color = 'var(--danger)';
    el.style.background = '#fff1f2';
    answersEl.appendChild(el);
  }

function showCorrectThenScareThenHome() {
    const q = game.questions[game.index];
    const correctText = q.type === 'mc' ? (q.options[q.a]) : q.a;
    playfulNudge('Correct answer: ' + correctText);
    setTimeout(async () => {
      await playSpecificJumpscare('jacobscare.mp4');
    showScreen('home');
    }, 700);
  }

async function playSpecificJumpscare(filename) {
  overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const exists = await headOk(filename);
    if (exists) {
      scareFallback.classList.add('hidden');
      scareVideo.src = filename;
      scareVideo.currentTime = 0;
      scareVideo.muted = false;
      scareVideo.volume = 1.0;
    let played = false;
    try {
      await scareVideo.play();
      played = true;
    } catch (_) {
      played = false;
    }
    if (played) {
      // Wait until the video ends, with a timeout fallback
      await new Promise((resolve) => {
        const onEnded = () => {
          cleanup();
          resolve();
        };
        const cleanup = () => {
          scareVideo.removeEventListener('ended', onEnded);
        };
        scareVideo.addEventListener('ended', onEnded, { once: true });
        const durationMs = isFinite(scareVideo.duration) && scareVideo.duration > 0 ? (scareVideo.duration * 1000) : 6000;
        setTimeout(() => {
          cleanup();
          resolve();
        }, durationMs + 300);
      });
    } else {
      // If autoplay failed, fall back to short flash duration
      await new Promise(r => setTimeout(r, 1800));
    }
    } else {
      scareVideo.removeAttribute('src');
      scareFallback.classList.remove('hidden');
      scareFallback.src = fallbackImageData();
      flashAndScream();
    await new Promise(r => setTimeout(r, 1800));
    }
  overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  function headOk(url) {
    return fetch(url, { method: 'HEAD' }).then(r => r.ok).catch(() => false);
  }

  function resetToStart() {
    game.index = 0;
    game.score = 0;
    scoreEl.textContent = '0';
    updateProgress();
    renderQuestion();
    showScreen('game');
  }

  // Jumpscare flow
  async function triggerJumpscareAndExit() {
    try {
    await playSpecificJumpscare('jacobscare.mp4');
    } catch (_) {
      // ignore
    }
    setTimeout(() => {
      location.href = 'https://www.google.com';
    }, 3500);
  }

async function playJumpscare() {
  overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const source = await resolveJumpscareSource();
    if (source.kind === 'video') {
      scareFallback.classList.add('hidden');
      scareVideo.src = source.url;
      scareVideo.currentTime = 0;
      scareVideo.muted = false;
      scareVideo.volume = 1.0;
      try { await scareVideo.play(); } catch (_) {}
    } else {
      scareVideo.removeAttribute('src');
      scareFallback.classList.remove('hidden');
      scareFallback.src = source.url;
      flashAndScream();
    }
  }

  function resolveJumpscareSource() {
    // Try local file first: /jumpscare.mp4 placed next to index.html
    return new Promise((resolve) => {
      const testUrl = 'jumpscare.mp4';
      fetch(testUrl, { method: 'HEAD' })
        .then(res => {
          if (res.ok) resolve({ kind: 'video', url: testUrl });
          else resolve({ kind: 'image', url: fallbackImageData() });
        })
        .catch(() => resolve({ kind: 'image', url: fallbackImageData() }));
    });
  }

  function fallbackImageData() {
    // Tiny red PNG data URI (acts as a solid flashing screen)
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  }

function flashAndScream() {
    let flashes = 0;
    const maxFlashes = 18;
    const interval = setInterval(() => {
      overlay.style.background = flashes % 2 === 0 ? '#fff' : '#000';
      flashes++;
      if (flashes > maxFlashes) {
        clearInterval(interval);
        overlay.style.background = '#000';
      }
    }, 80);
    try { synthScream(); } catch (_) {}
  }

  function synthScream() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.3);
  }

  // Events
  btnPlay.addEventListener('click', () => {
    startGame();
  });
  btnExit.addEventListener('click', triggerJumpscareAndExit);
  if (btnExit2) btnExit2.addEventListener('click', triggerJumpscareAndExit);
  
  
  btnReplay.addEventListener('click', () => { showScreen('home'); });
  submitInput.addEventListener('click', submitFreeform);
  answerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitFreeform(); });
  btnHint.addEventListener('click', () => {
    if (game.hintUsed) return;
    const q = game.questions[game.index];
    const text = q.type === 'mc' ? q.options[q.a] : q.a;
    hintBox.textContent = 'Hint: ' + text;
    hintBox.classList.remove('hidden');
    game.hintUsed = true;
    btnHint.disabled = true;
    btnHint.textContent = 'Hint (0 left)';
  });