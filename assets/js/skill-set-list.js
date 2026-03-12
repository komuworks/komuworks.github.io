(() => {
  const DATA_PATH = '../../assets/data/skill-set.json';
  const components = window.ProfileComponents;

  if (!components) {
    return;
  }

  const { renderSkillTable } = components;
  const root = document.getElementById('skill-set-list-root');
  const container = document.getElementById('all-skill-set');

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
      container.innerHTML = renderSkillTable(data?.categories, { basePath: '../../' });
    } catch {
      root.innerHTML = '<p>スキルセット一覧の読み込みに失敗しました。</p>';
    }
  };

  load();
})();
