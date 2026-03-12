(() => {
  const PROFILE_JSON_PATH = '../../assets/data/profile.json';
  const components = window.ProfileComponents;

  if (!components) {
    return;
  }

  const { renderSkillTable, renderCertifications, renderGoalList } = components;

  const root = document.getElementById('profile-list-root');
  const skillSetContainer = document.getElementById('all-skill-set');
  const certContainer = document.getElementById('all-certifications');
  const goalContainer = document.getElementById('all-personal-goals');

  if (!root || !skillSetContainer || !certContainer || !goalContainer) {
    return;
  }

  const load = async () => {
    try {
      const response = await fetch(PROFILE_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      skillSetContainer.innerHTML = renderSkillTable(data?.skillSet?.categories, { basePath: '../../' });
      certContainer.innerHTML = renderCertifications(data?.certifications);
      goalContainer.innerHTML = renderGoalList(data?.personalGoals, { basePath: '../../', learnings: data?.recentLearnings });
    } catch {
      root.innerHTML = '<p>プロフィール一覧の読み込みに失敗しました。</p>';
    }
  };

  load();
})();
