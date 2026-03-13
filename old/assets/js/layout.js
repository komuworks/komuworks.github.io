(() => {
  const basePath = document.body.dataset.basePath || './';
  const year = new Date().getFullYear();

  const scrollToHashSection = () => {
    if (!window.location.hash) {
      return;
    }

    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) {
      return;
    }

    target.scrollIntoView({ block: 'start' });
  };

  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');

  if (header) {
    const homeSections = {
      home: `${basePath}index.html#home-section`,
      profile: `${basePath}index.html#profile-section`,
      articles: `${basePath}index.html#articles-section`,
      typing: `${basePath}index.html#typing-section`,
    };

    header.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <p class="logo">komuworks</p>
          <nav class="site-nav" aria-label="Global Navigation">
            <ul>
              <li><a href="${homeSections.home}">Home</a></li>
              <li><a href="${homeSections.profile}">Profile</a></li>
              <li><a href="${homeSections.articles}">Articles</a></li>
              <li><a href="${homeSections.typing}">Typing Log</a></li>
            </ul>
          </nav>
        </div>
      </header>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <small>&copy; ${year} komuworks</small>
        </div>
      </footer>
    `;
  }

  scrollToHashSection();

  // 別ページから index.html のハッシュ付きURLへ遷移した場合、
  // 直後に描画される動的コンテンツで位置がずれることがあるため再調整する。
  [200, 500, 1000].forEach((delay) => {
    window.setTimeout(scrollToHashSection, delay);
  });
})();
