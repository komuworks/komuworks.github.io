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
          <nav class="site-nav" aria-label="Global Navigation">
            <ul>
              <li><a href="${basePath}index.html">Home</a></li>
              <li><a href="${basePath}pages/profile/index.html">Profile</a></li>
              <li><a href="${basePath}pages/blog/index.html">Articles</a></li>
              <li><a href="${basePath}pages/typing/index.html">Typing Log</a></li>
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
