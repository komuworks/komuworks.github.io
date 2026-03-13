(() => {
  const POSTS_PATH = '../../assets/data/posts.json';

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
        legacySlug: slugify(post.title),
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

  const findPostByQueryId = (posts, queryId) => {
    if (!queryId) {
      return null;
    }

    return (
      posts.find((entry) => entry.id === queryId) ||
      posts.find((entry) => entry.legacySlug === queryId) ||
      null
    );
  };

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
      tagContainer.textContent = '';
      tags.forEach((tag) => {
        tagContainer.appendChild(createTagButton(tag, activeTag));
      });
    };

    const renderPosts = () => {
      const targetPosts =
        activeTag === 'すべて' ? posts : posts.filter((post) => post.tags.includes(activeTag));

      listContainer.textContent = '';

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

        const cardLink = document.createElement('a');
        cardLink.className = 'card-link';
        cardLink.href = `./post.html?id=${encodeURIComponent(post.id)}`;

        const article = document.createElement('article');

        const date = document.createElement('p');
        date.className = 'blog-date';
        date.textContent = formatDate(post.date);

        const title = document.createElement('h2');
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
    const targetId = query.get('id');

    const post = findPostByQueryId(posts, targetId);

    if (!post) {
      articleContainer.textContent = '';
      const article = document.createElement('article');
      const title = document.createElement('h1');
      title.textContent = '記事が見つかりませんでした';
      const backWrap = document.createElement('p');
      const backLink = document.createElement('a');
      backLink.href = './index.html';
      backLink.textContent = 'Back to Articles';
      backWrap.appendChild(backLink);
      article.append(title, backWrap);
      articleContainer.appendChild(article);
      return;
    }

    articleContainer.textContent = '';

    const article = document.createElement('article');

    const date = document.createElement('p');
    date.className = 'blog-date';
    date.textContent = formatDate(post.date);

    const title = document.createElement('h1');
    title.textContent = post.title;

    const tags = document.createElement('p');
    tags.className = 'blog-tags';
    tags.textContent = post.tags.map((tag) => `#${tag}`).join(' ');

    const summary = document.createElement('p');
    summary.className = 'blog-summary';
    summary.textContent = post.summary;

    const body = document.createElement('div');
    body.className = 'blog-body';
    post.body.split(/\n\s*\n/g).forEach((paragraphText) => {
      const paragraph = document.createElement('p');
      paragraphText.split('\n').forEach((line, index) => {
        if (index > 0) {
          paragraph.appendChild(document.createElement('br'));
        }
        paragraph.appendChild(document.createTextNode(line));
      });
      body.appendChild(paragraph);
    });

    const backWrap = document.createElement('p');
    const backLink = document.createElement('a');
    backLink.href = './index.html';
    backLink.textContent = '← Back to Articles';
    backWrap.appendChild(backLink);

    article.append(date, title, tags, summary, body, backWrap);
    articleContainer.appendChild(article);
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
        area.textContent = '';
        const message = document.createElement('p');
        message.textContent = error.message;
        area.appendChild(message);
      }
    });
})();
