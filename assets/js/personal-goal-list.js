(() => {
  const DATA_PATH = '../../assets/data/personal-goals.json';
  const components = window.ProfileComponents;

  if (!components) {
    return;
  }

  const { renderGoalList, renderLearningList } = components;
  const root = document.getElementById('goal-list-root');
  const container = document.getElementById('all-personal-goals');
  const learningContainer = document.getElementById('all-recent-learnings');

  if (!root || !container || !learningContainer) {
    return;
  }

  const load = async () => {
    try {
      const response = await fetch(DATA_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      container.innerHTML = renderGoalList(data?.personalGoals, { basePath: '../../' });
      learningContainer.innerHTML = renderLearningList(data?.recentLearnings, { basePath: '../../', goals: data?.personalGoals });
    } catch {
      root.innerHTML = '<p>個人目標一覧の読み込みに失敗しました。</p>';
    }
  };

  load();
})();
