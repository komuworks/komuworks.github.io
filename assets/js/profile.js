(function () {
  const basePath = document.body?.dataset?.basePath || "./";
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function buildLayeredStar(frontAsset) {
    return `<span class="skill-star-stack"><img src="${basePath}assets/star-empty.svg" alt="" class="skill-star-icon skill-star-icon-back" /><img src="${basePath}assets/${frontAsset}" alt="" class="skill-star-icon skill-star-icon-front" /></span>`;
  }

  function levelToStars(level) {
    const normalized = Math.max(1, Math.min(10, Number(level) || 1));
    const starsOutOfFive = normalized / 2;
    const fullStars = Math.floor(starsOutOfFive);
    const hasHalfStar = starsOutOfFive % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const stars = [];

    for (let i = 0; i < fullStars; i += 1) {
      stars.push(buildLayeredStar("star-full.svg"));
    }

    if (hasHalfStar) {
      stars.push(buildLayeredStar("star-half.svg"));
    }

    for (let i = 0; i < emptyStars; i += 1) {
      stars.push(buildLayeredStar("star-empty.svg"));
    }

    return `<span class="skill-star-rating" aria-label="${normalized} / 10">${stars.join("")}</span>`;
  }

  function isCertificationValid(certification, today) {
    if (!certification.expiryDate) {
      return true;
    }

    const expiry = new Date(certification.expiryDate);
    if (Number.isNaN(expiry.getTime())) {
      return true;
    }

    expiry.setHours(23, 59, 59, 999);
    return expiry >= today;
  }

  function renderProfile(data) {
    const intro = data.selfIntroduction || {};
    const introContainer = document.getElementById("self-introduction");
    introContainer.innerHTML = `
      <dl class="profile-grid">
        <dt>名前</dt><dd>${escapeHtml(intro.name || "-")}</dd>
        <dt>得意領域</dt><dd>${escapeHtml(intro.specialty || "-")}</dd>
        <dt>現在の志向</dt><dd>${escapeHtml(intro.careerPreference || "-")}</dd>
      </dl>
    `;

    const skillContainer = document.getElementById("skill-set");
    const categories = data.skillSet?.categories || [];
    skillContainer.innerHTML = categories
      .map(
        (category) => `
        <section class="skill-category">
          <h3>${escapeHtml(category.name)}</h3>
          <table class="skill-table">
            <thead>
              <tr>
                <th>スキル</th>
                <th>実務年数</th>
                <th>レベル（10段階）</th>
              </tr>
            </thead>
            <tbody>
              ${(category.skills || [])
                .map(
                  (skill) => `
                  <tr>
                    <td>${escapeHtml(skill.name)}</td>
                    <td>${escapeHtml(skill.years)}年</td>
                    <td>${levelToStars(skill.level)}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
        </section>
      `
      )
      .join("");

    const certContainer = document.getElementById("certifications");
    const today = new Date();
    const validCertifications = (data.certifications || []).filter((cert) => isCertificationValid(cert, today));

    if (validCertifications.length === 0) {
      certContainer.innerHTML = "<p>表示可能な資格はありません。</p>";
    } else {
      certContainer.innerHTML = `
        <ul class="certification-list">
          ${validCertifications
            .map(
              (cert) => `
              <li>
                <strong>${escapeHtml(cert.name)}</strong><br />
                取得日: ${escapeHtml(cert.acquiredDate || "-")}
              </li>
            `
            )
            .join("")}
        </ul>
      `;
    }

    const goals = data.personalGoals || {};
    const goalContainer = document.getElementById("personal-goals");
    goalContainer.innerHTML = `
      <dl class="profile-grid">
        <dt>個人目標</dt><dd>${escapeHtml(goals.goal || "-")}</dd>
        <dt>直近の学習内容</dt><dd>${escapeHtml(goals.recentLearning || "-")}</dd>
      </dl>
    `;
  }

  fetch(basePath + "data/profile.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("プロフィールデータの読み込みに失敗しました");
      }
      return response.json();
    })
    .then((data) => renderProfile(data))
    .catch((error) => {
      console.error(error);
      const root = document.getElementById("profile-root");
      root.innerHTML = "<p>プロフィールの読み込み中にエラーが発生しました。</p>";
    });
})();
