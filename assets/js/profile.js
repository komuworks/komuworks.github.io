(() => {
  const basePath = document.body?.dataset?.basePath || './';
  const components = window.ProfileComponents;

  if (!components) {
    return;
  }

  const { toDisplayText, renderSkillTable, renderCertifications, renderGoalList } = components;

  const clampLimit = (value, fallback) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  };

  const renderIntro = (intro = {}) => `
    <dl class="profile-grid">
      <dt>名前</dt><dd>${toDisplayText(intro.name)}</dd>
      <dt>得意領域</dt><dd>${toDisplayText(intro.specialty)}</dd>
      <dt>現在の志向</dt><dd>${toDisplayText(intro.careerPreference)}</dd>
    </dl>
  `;

  const renderSectionLink = (path) => `<p><a href="${basePath}pages/profile/${path}">一覧を見る</a></p>`;
  const getElement = (id) => document.getElementById(id);

  const renderProfile = (data) => {
    const introContainer = getElement('self-introduction');
    const skillContainer = getElement('skill-set');
    const certContainer = getElement('certifications');
    const goalContainer = getElement('personal-goals');

    if (!introContainer || !skillContainer || !certContainer || !goalContainer) {
      throw new Error('プロフィール描画先の要素が見つかりません');
    }

    const limits = data?.displayLimits || {};
    const skillLimit = clampLimit(limits.skillCategories, 3);
    const certificationLimit = clampLimit(limits.certifications, 3);
    const goalLimit = clampLimit(limits.personalGoals, 2);

    introContainer.innerHTML = renderIntro(data?.selfIntroduction);
    skillContainer.innerHTML =
      renderSkillTable(data?.skillSet?.categories, { categoryLimit: skillLimit, basePath }) + renderSectionLink('skill-set.html');
    certContainer.innerHTML = renderCertifications(data?.certifications, { limit: certificationLimit }) + renderSectionLink('certifications.html');
    goalContainer.innerHTML =
      renderGoalList(data?.personalGoals, { limit: goalLimit, basePath, learnings: data?.recentLearnings }) + renderSectionLink('personal-goals.html');
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
