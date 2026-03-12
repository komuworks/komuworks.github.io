(() => {
  const PROFILE_JSON_PATH = '../../assets/data/profile.json';

  const status = document.getElementById('goal-detail-status');
  const content = document.getElementById('goal-detail-content');

  if (!status || !content) {
    return;
  }

  const getId = () => new URLSearchParams(window.location.search).get('id');

  const load = async () => {
    const id = getId();
    if (!id) {
      status.textContent = 'ステータス: 個人目標IDが指定されていません。';
      return;
    }

    try {
      const response = await fetch(PROFILE_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const goal = (Array.isArray(data?.personalGoals) ? data.personalGoals : []).find((item) => item.id === id);

      if (!goal) {
        status.textContent = 'ステータス: 指定された個人目標が見つかりません。';
        return;
      }

      const detailItems = (Array.isArray(goal.detail) ? goal.detail : []).map((line) => `<li>${line}</li>`).join('');
      content.innerHTML = `
        <h2>${goal.title || '-'}</h2>
        <dl class="profile-grid">
          <dt>優先度</dt><dd>${goal.priority || '-'}</dd>
          <dt>目標期限</dt><dd>${goal.targetPeriod || '-'}</dd>
          <dt>概要</dt><dd>${goal.summary || '-'}</dd>
        </dl>
        <h3>Details</h3>
        <ul>${detailItems}</ul>
      `;

      content.hidden = false;
      status.textContent = `ステータス: ${goal.title || '個人目標'} を表示しています。`;
    } catch {
      status.textContent = 'ステータス: データの読み込みに失敗しました。';
    }
  };

  load();
})();
