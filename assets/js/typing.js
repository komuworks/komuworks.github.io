(() => {
  const startBtn = document.getElementById('start-btn');
  const input = document.getElementById('typing-input');
  const status = document.getElementById('typing-status');
  const result = document.getElementById('typing-result');

  if (!startBtn || !input || !status || !result) return;

  let timer = null;

  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    input.disabled = false;
    input.value = '';
    input.focus();
    status.textContent = 'ステータス: 計測中（10秒）';
    result.textContent = '結果: 計測中...';

    timer = window.setTimeout(() => {
      input.disabled = true;
      startBtn.disabled = false;
      const length = input.value.length;
      status.textContent = 'ステータス: 完了';
      result.textContent = `結果: ${length} 文字 / 10秒`;
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    }, 10000);
  });
})();
