(() => {
  const DATA_PATH = '../../assets/data/personal-goals.json';
  const components = window.ProfileComponents;

  if (!components) {
    return;
  }

  const { renderGoalList } = components;
  const root = document.getElementById('goal-list-root');
  const container = document.getElementById('all-personal-goals');

  if (!root || !container) {
    return;
  }

  const load = async () => {
    try {
      const response = await fetch(DATA_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      container.innerHTML = renderGoalList(data?.personalGoals, { basePath: '../../', learnings: data?.recentLearnings });
    } catch {
      root.innerHTML = '<p>個人目標一覧の読み込みに失敗しました。</p>';
    }
  };

  load();
})();
