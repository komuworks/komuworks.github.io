(() => {
  const PROFILE_JSON_PATH = '../../assets/data/personal-goals.json';
  const components = window.ProfileComponents;

  const status = document.getElementById('goal-detail-status');
  const content = document.getElementById('goal-detail-content');

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

      const detailItems = Array.isArray(goal.detail) ? goal.detail : [];
      const relatedLearnings = (Array.isArray(data?.recentLearnings) ? data.recentLearnings : []).filter((learning) =>
        Array.isArray(learning?.goalIds) && learning.goalIds.includes(goal.id),
      );

      content.replaceChildren();

      const heading = document.createElement('h2');
      heading.textContent = toDisplayValue(goal.title);
      content.append(heading);

      const grid = document.createElement('dl');
      grid.className = 'profile-grid';
      appendGridRow(grid, '優先度', goal.priority);
      appendGridRow(grid, '目標期限', goal.targetPeriod);
      appendGridRow(grid, '概要', goal.summary);
      content.append(grid);

      const detailHeading = document.createElement('h3');
      detailHeading.textContent = 'Details';
      content.append(detailHeading, createDetailList(detailItems));

      if (relatedLearnings.length > 0) {
        const relatedHeading = document.createElement('h3');
        relatedHeading.textContent = '関連する学習';

        const relatedList = document.createElement('ul');
        relatedLearnings.forEach((learning) => {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = `./learning-detail.html?id=${encodeURIComponent(learning?.id || '')}`;
          link.textContent = toDisplayValue(learning?.title);
          item.append(link);
          relatedList.append(item);
        });

        content.append(relatedHeading, relatedList);
      }

      content.hidden = false;
      status.textContent = `ステータス: ${toDisplayValue(goal.title)} を表示しています。`;
    } catch {
      status.textContent = 'ステータス: データの読み込みに失敗しました。';
    }
  };

  load();
})();
