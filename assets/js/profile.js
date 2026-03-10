(() => {
  const DEFAULT_TEXT = '-';
  const STAR_ASSETS = {
    full: 'star-full.svg',
    half: 'star-half.svg',
    empty: 'star-empty.svg',
    frame: 'star-frame.svg',
  };

  const basePath = document.body?.dataset?.basePath || './';

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const toDisplayText = (value) => (value == null || value === '' ? DEFAULT_TEXT : escapeHtml(value));

  const buildLayeredStar = (backAsset) =>
    `<span class="skill-star-stack"><img src="${basePath}assets/${backAsset}" alt="" class="skill-star-icon skill-star-icon-back" /><img src="${basePath}assets/${STAR_ASSETS.frame}" alt="" class="skill-star-icon skill-star-icon-front" /></span>`;

  const levelToStars = (level) => {
    const normalized = Math.max(1, Math.min(10, Number(level) || 1));
    const starsOutOfFive = normalized / 2;
    const fullStars = Math.floor(starsOutOfFive);
    const hasHalfStar = starsOutOfFive % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [
      ...Array.from({ length: fullStars }, () => buildLayeredStar(STAR_ASSETS.full)),
      ...(hasHalfStar ? [buildLayeredStar(STAR_ASSETS.half)] : []),
      ...Array.from({ length: emptyStars }, () => buildLayeredStar(STAR_ASSETS.empty)),
    ];

    return `<span class="skill-star-rating" aria-label="${normalized} / 10">${stars.join('')}</span>`;
  };

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

  const renderIntro = (intro = {}) => `
    <dl class="profile-grid">
      <dt>名前</dt><dd>${toDisplayText(intro.name)}</dd>
      <dt>得意領域</dt><dd>${toDisplayText(intro.specialty)}</dd>
      <dt>現在の志向</dt><dd>${toDisplayText(intro.careerPreference)}</dd>
    </dl>
  `;

  const renderSkillCategories = (categories) =>
    normalizeArray(categories)
      .map(
        (category) => `
          <section class="skill-category">
            <h3>${toDisplayText(category?.name)}</h3>
            <table class="skill-table">
              <thead>
                <tr>
                  <th>スキル</th>
                  <th>実務年数</th>
                  <th>レベル</th>
                </tr>
              </thead>
              <tbody>
                ${normalizeArray(category?.skills)
                  .map(
                    (skill) => `
                      <tr>
                        <td>${toDisplayText(skill?.name)}</td>
                        <td>${toDisplayText(skill?.years)}年</td>
                        <td>${levelToStars(skill?.level)}</td>
                      </tr>
                    `,
                  )
                  .join('')}
              </tbody>
            </table>
          </section>
        `,
      )
      .join('');

  const renderCertifications = (certifications, today) => {
    const validCertifications = normalizeArray(certifications).filter((cert) => isCertificationValid(cert, today));

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

  const renderGoals = (goals = {}) => `
    <dl class="profile-grid">
      <dt>個人目標</dt><dd>${toDisplayText(goals.goal)}</dd>
      <dt>直近の学習内容</dt><dd>${toDisplayText(goals.recentLearning)}</dd>
    </dl>
  `;

  const getElement = (id) => document.getElementById(id);

  const renderProfile = (data) => {
    const introContainer = getElement('self-introduction');
    const skillContainer = getElement('skill-set');
    const certContainer = getElement('certifications');
    const goalContainer = getElement('personal-goals');

    if (!introContainer || !skillContainer || !certContainer || !goalContainer) {
      throw new Error('プロフィール描画先の要素が見つかりません');
    }

    introContainer.innerHTML = renderIntro(data?.selfIntroduction);
    skillContainer.innerHTML = renderSkillCategories(data?.skillSet?.categories);
    certContainer.innerHTML = renderCertifications(data?.certifications, new Date());
    goalContainer.innerHTML = renderGoals(data?.personalGoals);
  };

  const renderError = () => {
    const root = getElement('profile-root');
    if (root) {
      root.innerHTML = '<p>プロフィールの読み込み中にエラーが発生しました。</p>';
    }
  };

  const loadProfile = async () => {
    try {
      const response = await fetch(`${basePath}assets/data/profile.json`);
      if (!response.ok) {
        throw new Error('プロフィールデータの読み込みに失敗しました');
      }

      const data = await response.json();
      renderProfile(data);
    } catch (error) {
      console.error(error);
      renderError();
    }
  };

  loadProfile();
})();
