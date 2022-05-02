(async () => {
  let searchIndex;
  try {
    searchIndex = await fetch('/_search/index.json').then(response => response.text());
    if (!('MiniSearch' in window)) {
      throw new Error('MiniSearch not available');
    }
  } catch (error) {
    console.warn(error.toString());
    return;
  }

  const index = window.MiniSearch.loadJSON(searchIndex, { fields: ['title', 'content'] });

  const initialQuery = new URLSearchParams(window.location.search).get('q');
  const input = document.querySelector('input[type=search]');
  input.value = initialQuery;
  const container = document.createElement('div');
  container.setAttribute('id', 'search-results');

  const search = query => {
    if (query.length > 1) {
      const results = index.search(query, { boost: { title: 3 }, prefix: true, fuzzy: 0.3 });
      const list = document.createElement('ol');
      results.slice(0, 10).forEach(result => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.setAttribute('href', result.pathname);
        link.appendChild(document.createTextNode(result.title));
        item.appendChild(link);
        list.append(item);
      });
      container.replaceChildren(list);
      input.after(container);
    } else {
      container.parentNode?.removeChild(container);
    }
  };

  input.addEventListener('input', event => {
    search(event.target.value);
  });

  if (initialQuery) {
    search(initialQuery);
  }
})();
