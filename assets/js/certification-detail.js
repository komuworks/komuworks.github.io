(() => {
  const PROFILE_JSON_PATH = '../../assets/data/profile.json';
  const components = window.ProfileComponents;

  const status = document.getElementById('certification-detail-status');
  const content = document.getElementById('certification-detail-content');

  if (!components || !status || !content) {
    return;
  }

  const { toDisplayText } = components;
  const getId = () => new URLSearchParams(window.location.search).get('id');

  const load = async () => {
    const id = getId();
    if (!id) {
      status.textContent = 'ステータス: 資格IDが指定されていません。';
      return;
    }

    try {
      const response = await fetch(PROFILE_JSON_PATH, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const certification = (Array.isArray(data?.certifications) ? data.certifications : []).find((item) => item.id === id);

      if (!certification) {
        status.textContent = 'ステータス: 指定された資格が見つかりません。';
        return;
      }

      content.innerHTML = `
        <h2>${toDisplayText(certification.name)}</h2>
        <dl class="profile-grid">
          <dt>${toDisplayText(certification.result)}日</dt><dd>${toDisplayText(certification.acquiredDate)}</dd>
          <dt>資格名</dt><dd>${toDisplayText(certification.organizer)}　${toDisplayText(certification.name)}</dd>
        </dl>
      `;

      content.hidden = false;
      status.textContent = `ステータス: ${toDisplayText(certification.name)} を表示しています。`;
    } catch {
      status.textContent = 'ステータス: データの読み込みに失敗しました。';
    }
  };

  load();
})();
