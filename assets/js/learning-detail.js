(() => {
  const PROFILE_JSON_PATH = '../../assets/data/personal-goals.json';

  const status = document.getElementById('learning-detail-status');
  const content = document.getElementById('learning-detail-content');

  if (!status || !content) {
    return;
  }

  const getId = () => new URLSearchParams(window.location.search).get('id');

  const load = async () => {
    const id = getId();
    if (!id) {
      status.textContent = 'ステータス: 学習内容IDが指定されていません。';
      return;
    }

    try {
      const response = await fetch(PROFILE_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const learning = (Array.isArray(data?.recentLearnings) ? data.recentLearnings : []).find((item) => item.id === id);

      if (!learning) {
        status.textContent = 'ステータス: 指定された学習内容が見つかりません。';
        return;
      }

      const detailItems = (Array.isArray(learning.detail) ? learning.detail : [])
        .map((line) => `<li>${line}</li>`)
        .join('');
      const goalMap = new Map((Array.isArray(data?.personalGoals) ? data.personalGoals : []).map((goal) => [goal?.id, goal]));
      const relatedGoalLinks = (Array.isArray(learning?.goalIds) ? learning.goalIds : [])
        .filter((goalId) => goalMap.has(goalId))
        .map((goalId) => `<li><a href="./goal-detail.html?id=${encodeURIComponent(goalId)}">${goalMap.get(goalId)?.title || '-'}</a></li>`)
        .join('');
      content.innerHTML = `
        <h2>${learning.title || '-'}</h2>
        <dl class="profile-grid">
          <dt>学習期間</dt><dd>${learning.period || '-'}</dd>
          <dt>概要</dt><dd>${learning.summary || '-'}</dd>
        </dl>
        <h3>Details</h3>
        <ul>${detailItems}</ul>
        ${relatedGoalLinks ? `<h3>関連する個人目標</h3><ul>${relatedGoalLinks}</ul>` : ''}
      `;

      content.hidden = false;
      status.textContent = `ステータス: ${learning.title || '学習内容'} を表示しています。`;
    } catch {
      status.textContent = 'ステータス: データの読み込みに失敗しました。';
    }
  };

  load();
})();
