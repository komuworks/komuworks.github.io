(() => {
  const POSTS_PATH = '../data/posts.json';

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

  const createTagButton = (tag, activeTag) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tag-chip${activeTag === tag ? ' is-active' : ''}`;
    button.dataset.tag = tag;
    button.textContent = tag;
    return button;
  };

  const renderListPage = (posts) => {
    const listContainer = document.getElementById('blog-list');
    const tagContainer = document.getElementById('tag-filters');
    if (!listContainer || !tagContainer) return;

    let activeTag = 'すべて';
    const tags = ['すべて', ...new Set(posts.flatMap((post) => post.tags))];

    const renderTags = () => {
      tagContainer.innerHTML = '';
      tags.forEach((tag) => {
        tagContainer.appendChild(createTagButton(tag, activeTag));
      });
    };

    const renderPosts = () => {
      const targetPosts =
        activeTag === 'すべて' ? posts : posts.filter((post) => post.tags.includes(activeTag));

      listContainer.innerHTML = '';

      if (targetPosts.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = '該当する記事はありません。';
        listContainer.appendChild(empty);
        return;
      }

      const ul = document.createElement('ul');
      ul.className = 'blog-post-list';

      targetPosts.forEach((post) => {
        const li = document.createElement('li');
        li.className = 'blog-post-item';
        li.innerHTML = `
          <article>
            <p class="blog-date">${formatDate(post.date)}</p>
            <h2><a href="./post.html?id=${encodeURIComponent(post.slug)}">${post.title}</a></h2>
            <p>${post.summary}</p>
            <p class="blog-tags">${post.tags.map((tag) => `#${tag}`).join(' ')}</p>
          </article>
        `;
        ul.appendChild(li);
      });

      listContainer.appendChild(ul);
    };

    tagContainer.addEventListener('click', (event) => {
      const tagButton = event.target.closest('button[data-tag]');
      if (!tagButton) return;
      activeTag = tagButton.dataset.tag;
      renderTags();
      renderPosts();
    });

    renderTags();
    renderPosts();
  };

  const renderPostPage = (posts) => {
    const articleContainer = document.getElementById('post-detail');
    if (!articleContainer) return;

    const query = new URLSearchParams(window.location.search);
    const targetSlug = query.get('id');

    const post = posts.find((entry) => entry.slug === targetSlug);

    if (!post) {
      articleContainer.innerHTML = `
        <article>
          <h1>記事が見つかりませんでした</h1>
          <p><a href="./index.html">記事一覧に戻る</a></p>
        </article>
      `;
      return;
    }

    const paragraphs = post.body
      .split(/\n\s*\n/g)
      .map((line) => `<p>${line.replace(/\n/g, '<br>')}</p>`)
      .join('');

    articleContainer.innerHTML = `
      <article>
        <p class="blog-date">${formatDate(post.date)}</p>
        <h1>${post.title}</h1>
        <p class="blog-tags">${post.tags.map((tag) => `#${tag}`).join(' ')}</p>
        <p class="blog-summary">${post.summary}</p>
        <div class="blog-body">${paragraphs}</div>
        <p><a href="./index.html">← 記事一覧に戻る</a></p>
      </article>
    `;
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
      renderListPage(posts);
      renderPostPage(posts);
    })
    .catch((error) => {
      const area = document.getElementById('blog-list') || document.getElementById('post-detail');
      if (area) {
        area.innerHTML = `<p>${error.message}</p>`;
      }
    });
})();
