(() => {
  const PROFILE_JSON_PATH = '../../assets/data/personal-goals.json';
  const components = window.ProfileComponents;

  const status = document.getElementById('learning-detail-status');
  const content = document.getElementById('learning-detail-content');

  if (!status || !content) {
    return;
  }

  const toDisplayValue = components?.toDisplayValue || ((value) => (value == null || value === '' ? '-' : String(value)));
  const getId = () => new URLSearchParams(window.location.search).get('id');

  const appendGridRow = (grid, label, value) => {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = toDisplayValue(value);
    grid.append(dt, dd);
  };

  const createDetailList = (details) => {
    const list = document.createElement('ul');

    details.forEach((line) => {
      const item = document.createElement('li');
      item.textContent = toDisplayValue(line);
      list.append(item);
    });

    return list;
  };

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

      const detailItems = Array.isArray(learning.detail) ? learning.detail : [];
      const goalMap = new Map((Array.isArray(data?.personalGoals) ? data.personalGoals : []).map((goal) => [goal?.id, goal]));
      const relatedGoalIds = (Array.isArray(learning?.goalIds) ? learning.goalIds : []).filter((goalId) => goalMap.has(goalId));

      content.replaceChildren();

      const heading = document.createElement('h2');
      heading.textContent = toDisplayValue(learning.title);
      content.append(heading);

      const grid = document.createElement('dl');
      grid.className = 'profile-grid';
      appendGridRow(grid, '学習期間', learning.period);
      appendGridRow(grid, '概要', learning.summary);
      content.append(grid);

      const detailHeading = document.createElement('h3');
      detailHeading.textContent = 'Details';
      content.append(detailHeading, createDetailList(detailItems));

      if (relatedGoalIds.length > 0) {
        const relatedHeading = document.createElement('h3');
        relatedHeading.textContent = '関連する個人目標';

        const relatedList = document.createElement('ul');
        relatedGoalIds.forEach((goalId) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = `./goal-detail.html?id=${encodeURIComponent(goalId)}`;
          link.textContent = toDisplayValue(goalMap.get(goalId)?.title);
          item.append(link);
          relatedList.append(item);
        });

        content.append(relatedHeading, relatedList);
      }

      content.hidden = false;
      status.textContent = `ステータス: ${toDisplayValue(learning.title)} を表示しています。`;
    } catch {
      status.textContent = 'ステータス: データの読み込みに失敗しました。';
    }
  };

  load();
})();
