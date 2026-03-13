(() => {
  const DEFAULT_TEXT = '-';
  const STAR_ASSETS = {
    full: 'star-full.svg',
    half: 'star-half.svg',
    empty: 'star-empty.svg',
    frame: 'star-frame.svg',
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const toDisplayValue = (value) => (value == null || value === '' ? DEFAULT_TEXT : String(value));
  const toDisplayText = (value) => escapeHtml(toDisplayValue(value));
  const normalizeArray = (value) => (Array.isArray(value) ? value : []);

  const buildLayeredStar = (basePath, backAsset) =>
    `<span class="skill-star-stack"><img src="${basePath}assets/${backAsset}" alt="" class="skill-star-icon skill-star-icon-back" /><img src="${basePath}assets/${STAR_ASSETS.frame}" alt="" class="skill-star-icon skill-star-icon-front" /></span>`;

  const levelToStars = (level, basePath) => {
    const normalized = Math.max(1, Math.min(10, Number(level) || 1));
    const starsOutOfFive = normalized / 2;
    const fullStars = Math.floor(starsOutOfFive);
    const hasHalfStar = starsOutOfFive % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [
      ...Array.from({ length: fullStars }, () => buildLayeredStar(basePath, STAR_ASSETS.full)),
      ...(hasHalfStar ? [buildLayeredStar(basePath, STAR_ASSETS.half)] : []),
      ...Array.from({ length: emptyStars }, () => buildLayeredStar(basePath, STAR_ASSETS.empty)),
    ];

    return `<span class="skill-star-rating" aria-label="${normalized} / 10">${stars.join('')}</span>`;
  };

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

  const renderSkillTable = (categories, options = {}) => {
    const { categoryLimit, basePath = './' } = options;
    const source = normalizeArray(categories);
    const limited = Number.isInteger(categoryLimit) && categoryLimit > 0 ? source.slice(0, categoryLimit) : source;

    const groups = limited
      .map((category) => ({
        categoryName: category?.name,
        skills: normalizeArray(category?.skills),
      }))
      .filter((group) => group.skills.length > 0);

    if (groups.length === 0) {
      return '<p>表示可能なスキルはありません。</p>';
    }

    const rows = groups
      .map(
        (group) =>
          group.skills
            .map(
              (skill, index) => `
                <tr>
                  ${
                    index === 0
                      ? `<td class="skill-category-cell" rowspan="${group.skills.length}">${toDisplayText(group.categoryName)}</td>`
                      : ''
                  }
                  <td>${toDisplayText(skill?.name)}</td>
                  <td>${toDisplayText(skill?.years)}年</td>
                  <td>${levelToStars(skill?.level, basePath)}</td>
                </tr>
              `,
            )
            .join(''),
      )
      .join('');

    return `
      <table class="skill-table">
        <thead>
          <tr>
            <th>分野</th>
            <th>スキル</th>
            <th>実務年数</th>
            <th>レベル</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  };

  const renderCertifications = (certifications, options = {}) => {
    const { limit, today = new Date(), includeDetailLink = false, detailBasePath = './pages/profile/' } = options;
    const filtered = normalizeArray(certifications).filter((cert) => isCertificationValid(cert, today));
    const items = Number.isInteger(limit) && limit > 0 ? filtered.slice(0, limit) : filtered;

    if (items.length === 0) {
      return '<p>表示可能な資格はありません。</p>';
    }

    return `
      <ul class="certification-list">
        ${items
          .map((cert) => {
            const detailHref =
              includeDetailLink && cert?.id
                ? `${detailBasePath}certification-detail.html?id=${encodeURIComponent(cert.id)}`
                : '';

            return `
              <li class="interactive-list-item">
                ${
                  detailHref
                    ? `<a class="interactive-row-link" href="${detailHref}">
                        <span class="certification-row">
                          <span class="certification-date">${toDisplayText(cert?.acquiredDate)}</span>
                          <strong class="certification-name">${toDisplayText(cert?.name)}</strong>
                        </span>
                        <span class="interactive-row-icon" aria-hidden="true">→</span>
                      </a>`
                    : `<span class="certification-row">
                        <span class="certification-date">${toDisplayText(cert?.acquiredDate)}</span>
                        <strong class="certification-name">${toDisplayText(cert?.name)}</strong>
                      </span>`
                }
              </li>
            `;
          })
          .join('')}
      </ul>
    `;
  };

  const renderGoalList = (goals, options = {}) => {
    const { limit, basePath = './' } = options;
    const source = normalizeArray(goals);
    const items = Number.isInteger(limit) && limit > 0 ? source.slice(0, limit) : source;
    if (items.length === 0) {
      return '<p>個人目標はありません。</p>';
    }

    return `
      <ul class="goal-list">
        ${items
          .map((goal) => {
            const goalDetailHref = `${basePath}pages/profile/goal-detail.html?id=${encodeURIComponent(goal?.id || '')}`;

            return `
              <li class="interactive-list-item goal-item-card">
                <a class="goal-primary-link" href="${goalDetailHref}">
                  <strong>${toDisplayText(goal?.title)}</strong>
                </a>
                <p>${toDisplayText(goal?.summary)}</p>
                <p class="goal-action-row">
                  <a class="goal-sub-link interactive-row-link goal-inline-cta" href="${goalDetailHref}" aria-label="詳細を見る">
                    <span class="interactive-row-icon" aria-hidden="true">→</span>
                  </a>
                </p>
              </li>
            `;
          })
          .join('')}
      </ul>
    `;
  };

  const renderLearningList = (learnings, options = {}) => {
    const { limit, basePath = './', goals = [] } = options;
    const source = normalizeArray(learnings);
    const items = Number.isInteger(limit) && limit > 0 ? source.slice(0, limit) : source;

    if (items.length === 0) {
      return '<p>学習内容はありません。</p>';
    }

    const goalMap = new Map(normalizeArray(goals).map((goal) => [goal?.id, goal]));

    return `
      <ul class="goal-list learning-list">
        ${items
          .map((learning) => {
            const learningDetailHref = `${basePath}pages/profile/learning-detail.html?id=${encodeURIComponent(learning?.id || '')}`;
            const relatedGoalIds = normalizeArray(learning?.goalIds).filter((goalId) => goalMap.has(goalId));
            const relatedLinks = relatedGoalIds
              .map((goalId) => {
                const goal = goalMap.get(goalId);
                return `<a class="goal-sub-link" href="${basePath}pages/profile/goal-detail.html?id=${encodeURIComponent(goalId)}">${toDisplayText(goal?.title)}</a>`;
              })
              .join('<span class="goal-action-divider">・</span>');

            return `
              <li class="interactive-list-item goal-item-card">
                <a class="goal-primary-link" href="${learningDetailHref}">
                  <strong>${toDisplayText(learning?.title)}</strong>
                </a>
                <p>${toDisplayText(learning?.summary)}</p>
                ${relatedLinks ? `<p class="goal-action-row"><span class="learning-related-label">関連目標:</span>${relatedLinks}</p>` : ''}
                <p class="goal-action-row">
                  <a class="goal-sub-link interactive-row-link goal-inline-cta" href="${learningDetailHref}" aria-label="詳細を見る">
                    <span class="interactive-row-icon" aria-hidden="true">→</span>
                  </a>
                </p>
              </li>
            `;
          })
          .join('')}
      </ul>
    `;
  };

  window.ProfileComponents = {
    normalizeArray,
    toDisplayValue,
    toDisplayText,
    isCertificationValid,
    renderSkillTable,
    renderCertifications,
    renderGoalList,
    renderLearningList,
  };
})();
