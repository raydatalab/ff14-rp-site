// ===== 猜猜这是谁 小游戏 =====
(function(){
    var TOTAL = staffData.length;

  var state = {
    remaining: [],
    score: 0,
    combo: 0,
    maxCombo: 0,
    answered: false,
    currentStaff: null,
    optionStaff: []
  };

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function updateStats() {
    document.getElementById('gameScore').textContent = state.score;
    document.getElementById('gameCombo').textContent = state.combo;
    document.getElementById('gameMaxCombo').textContent = state.maxCombo;
    var done = TOTAL - state.remaining.length;
    document.getElementById('gameProgress').textContent = '第 ' + done + '/' + TOTAL + ' 题';
  }

  function handleAnswer(selectedIdx, btnIdx) {
    if (state.answered) return;
    state.answered = true;

    var correct = state.currentStaff;
    var optionStaff = state.optionStaff;
    var btns = document.querySelectorAll('.game-option');

    // Highlight correct answer (green)
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (optionStaff[i].index === correct.index) {
        btns[i].classList.add('correct');
      }
    }

    // Highlight wrong selection (red)
    if (optionStaff[selectedIdx].index !== correct.index) {
      btns[btnIdx].classList.add('wrong');
    }

    var feedback = document.getElementById('gameFeedback');
    if (optionStaff[selectedIdx].index === correct.index) {
      state.score++;
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      feedback.innerHTML = '✅ 答对了！是 ' + correct.emoji + correct.name + '！';
      feedback.className = 'game-feedback game-feedback-correct';

      if (state.combo === 3) {
        showComboCelebration();
      }
    } else {
      state.combo = 0;
      feedback.innerHTML = '❌ 再想想，正确答案是 ' + correct.emoji + correct.name + '。';
      feedback.className = 'game-feedback game-feedback-wrong';
    }

    feedback.style.display = 'block';
    updateStats();
    document.getElementById('gameNextBtn').style.display = 'inline-block';
  }

  function showComboCelebration() {
    document.getElementById('comboModal').classList.add('active');
  }

  function hideComboCelebration() {
    document.getElementById('comboModal').classList.remove('active');
  }

  function nextQuestion() {
    if (state.remaining.length === 0) {
      gameComplete();
      return;
    }

    state.answered = false;

    // Pick random target from remaining
    var idx = Math.floor(Math.random() * state.remaining.length);
    var targetIdx = state.remaining[idx];
    state.remaining.splice(idx, 1);
    state.currentStaff = staffData.find(function(s) { return s.index === targetIdx; });

    // Build 4 options: 1 correct + 3 random wrong
    var wrongPool = staffData.filter(function(s) { return s.index !== targetIdx; });
    shuffle(wrongPool);
    var options = [state.currentStaff, wrongPool[0], wrongPool[1], wrongPool[2]];
    shuffle(options);
    state.optionStaff = options;

    // Show clue
    document.getElementById('gameDesc').textContent = state.currentStaff.clue;

    // Render options
    var btns = document.querySelectorAll('.game-option');
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = options[i].emoji + ' ' + options[i].name;
      btns[i].className = 'game-option';
      btns[i].disabled = false;
      btns[i].onclick = (function(si, bi) {
        return function() { handleAnswer(si, bi); };
      })(i, i);
    }

    document.getElementById('gameFeedback').style.display = 'none';
    document.getElementById('gameNextBtn').style.display = 'none';
    document.getElementById('gameNextBtn').textContent = '下一题 →';
    document.getElementById('gameOptions').style.display = 'grid';

    updateStats();
  }

  function gameComplete() {
    document.getElementById('gameDesc').textContent = '🎉 全部答完！点击下方按钮重新开始 🎉';
    document.getElementById('gameOptions').style.display = 'none';

    var feedback = document.getElementById('gameFeedback');
    feedback.innerHTML = '🎊 恭喜你完成了所有题目！<br>得分：' + state.score + ' / ' + TOTAL + '，最高连击：' + state.maxCombo + ' 🎊' +
      '<br><br>📜 据不愿透露姓名的乌尔达哈荣誉市民透露：<br>' +
      '“你是瓜店长，娜娜莫，万樂万吉之后又一名到达这里的勇士。<br>' +
      '肥肥之家的炉火，将永远为你而燃。” ✨🔥';
    feedback.style.display = 'block';
    feedback.className = 'game-feedback';

    var nextBtn = document.getElementById('gameNextBtn');
    nextBtn.textContent = '🔄 再来一次';
    nextBtn.style.display = 'inline-block';
    nextBtn.onclick = resetGame;
  }

  function resetGame() {
    state.remaining = staffData.map(function(s) { return s.index; });
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.answered = false;
    document.getElementById('gameNextBtn').onclick = nextQuestion;
    updateStats();
    nextQuestion();
  }

  document.getElementById("gameStaffCount").textContent = TOTAL;

  // Wire combo modal
  document.getElementById('comboContinueBtn').addEventListener('click', hideComboCelebration);
  document.getElementById('comboOverlay').addEventListener('click', hideComboCelebration);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideComboCelebration();
  });

  // Start the game!
  resetGame();
})();

