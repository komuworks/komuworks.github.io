(() => {
  const basePath = document.body.dataset.basePath || './';
  const year = new Date().getFullYear();

  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');

  if (header) {
    header.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <p class="logo">komuworks</p>
          <nav class="site-nav" aria-label="グローバルナビゲーション">
            <ul>
              <li><a href="${basePath}index.html">プロフィールTOP</a></li>
              <li><a href="${basePath}blog/index.html">記事一覧</a></li>
              <li><a href="${basePath}typing/index.html">タイピング計測</a></li>
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
})();
