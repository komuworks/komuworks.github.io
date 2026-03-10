(() => {
  const PROFILE_JSON_PATH = '../../assets/data/profile.json';
  const DEFAULT_TEXT = '-';

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const toDisplayText = (value) => (value == null || value === '' ? DEFAULT_TEXT : escapeHtml(value));
  const normalizeArray = (value) => (Array.isArray(value) ? value : []);

  const isCertificationValid = (certification, today) => {
    if (!certification?.expiryDate) {
      return true;
    }

    const expiry = new Date(certification.expiryDate);
    if (Number.isNaN(expiry.getTime())) {
      return true;
    }

    expiry.setHours(23, 59, 59, 999);
    return expiry >= today;
  };

  const renderSkills = (categories) =>
    normalizeArray(categories)
      .map(
        (category) => `
          <section class="list-panel">
            <h3>${toDisplayText(category?.name)}</h3>
            <ul>
              ${normalizeArray(category?.skills)
                .map(
                  (skill) =>
                    `<li>${toDisplayText(skill?.name)}（実務 ${toDisplayText(skill?.years)}年 / レベル ${toDisplayText(skill?.level)}）</li>`,
                )
                .join('')}
            </ul>
          </section>
        `,
      )
      .join('');

  const renderCertifications = (certifications) => {
    const validCertifications = normalizeArray(certifications).filter((cert) => isCertificationValid(cert, new Date()));
    if (validCertifications.length === 0) {
      return '<p>表示可能な資格はありません。</p>';
    }

    return `
      <ul class="certification-list">
        ${validCertifications
          .map(
            (cert) => `
              <li>
                <strong>${toDisplayText(cert?.name)}</strong><br />
                取得日: ${toDisplayText(cert?.acquiredDate)}
              </li>
            `,
          )
          .join('')}
      </ul>
    `;
  };

  const renderGoals = (goals, learnings) => {
    const learningMap = new Map(normalizeArray(learnings).map((item) => [item.id, item]));

    return `
      <ul class="goal-list">
        ${normalizeArray(goals)
          .map((goal, index) => {
            const learning = learningMap.get(normalizeArray(learnings)[index]?.id) || normalizeArray(learnings)[index];
            const learningLink = learning?.id
              ? `<a href="./learning-detail.html?id=${encodeURIComponent(learning.id)}">直近の学習内容を見る</a>`
              : '学習内容は未登録です。';

            return `
              <li>
                <strong>${toDisplayText(goal?.title)}</strong>
                <p>${toDisplayText(goal?.summary)}</p>
                <p>
                  <a href="./goal-detail.html?id=${encodeURIComponent(goal?.id || '')}">個人目標詳細を見る</a> /
                  ${learningLink}
                </p>
              </li>
            `;
          })
          .join('')}
      </ul>
    `;
  };

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
      skillSetContainer.innerHTML = renderSkills(data?.skillSet?.categories);
      certContainer.innerHTML = renderCertifications(data?.certifications);
      goalContainer.innerHTML = renderGoals(data?.personalGoals, data?.recentLearnings);
    } catch {
      root.innerHTML = '<p>プロフィール一覧の読み込みに失敗しました。</p>';
    }
  };

  load();
})();
