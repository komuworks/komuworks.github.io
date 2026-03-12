(() => {
  const DATA_PATH = '../../assets/data/certifications.json';
  const components = window.ProfileComponents;

  if (!components) {
    return;
  }

  const { renderCertifications } = components;
  const root = document.getElementById('certification-list-root');
  const container = document.getElementById('all-certifications');

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
      container.innerHTML = renderCertifications(data?.certifications);
    } catch {
      root.innerHTML = '<p>保有資格一覧の読み込みに失敗しました。</p>';
    }
  };

  load();
})();
