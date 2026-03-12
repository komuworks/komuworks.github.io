(() => {
  const POSTS_PATH = './assets/data/posts.json';
  const MAX_HOME_ARTICLES = 5;

  const listContainer = document.getElementById('home-articles-list');

  if (!listContainer) {
    return;
  }

  const slugify = (title) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\p{Letter}\p{Number}-]/gu, '')
      .replace(/-+/g, '-');

  const formatDate = (dateText) => {
    const date = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return dateText;
    }
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const normalizePosts = (posts) =>
    posts
      .map((post) => ({
        ...post,
        slug: slugify(post.title),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderPosts = (posts) => {
    const displayPosts = posts.slice(0, MAX_HOME_ARTICLES);

    listContainer.textContent = '';

    if (displayPosts.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = '表示できる記事がありません。';
      listContainer.appendChild(empty);
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'blog-post-list';

    displayPosts.forEach((post) => {
      const li = document.createElement('li');
      li.className = 'blog-post-item';

      const cardLink = document.createElement('a');
      cardLink.className = 'card-link';
      cardLink.href = `./pages/blog/post.html?id=${encodeURIComponent(post.slug)}`;

      const article = document.createElement('article');

      const date = document.createElement('p');
      date.className = 'blog-date';
      date.textContent = formatDate(post.date);

      const title = document.createElement('h3');
      const link = document.createElement('span');
      link.className = 'card-link-title';
      link.textContent = post.title;
      title.appendChild(link);

      const summary = document.createElement('p');
      summary.textContent = post.summary;

      const tagsElement = document.createElement('p');
      tagsElement.className = 'blog-tags';
      tagsElement.textContent = post.tags.map((tag) => `#${tag}`).join(' ');

      const more = document.createElement('span');
      more.className = 'card-link-more';
      more.textContent = '記事を読む→';

      article.append(date, title, summary, tagsElement, more);
      cardLink.appendChild(article);
      li.appendChild(cardLink);
      ul.appendChild(li);
    });

    listContainer.appendChild(ul);
  };

  fetch(POSTS_PATH)
    .then((response) => {
      if (!response.ok) {
        throw new Error('記事データの読み込みに失敗しました。');
      }
      return response.json();
    })
    .then((posts) => normalizePosts(posts))
    .then((posts) => {
      renderPosts(posts);
    })
    .catch((error) => {
      listContainer.textContent = '';
      const message = document.createElement('p');
      message.textContent = error.message;
      listContainer.appendChild(message);
    });
})();
