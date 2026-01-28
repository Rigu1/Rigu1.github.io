/* assets/js/github-card.js */

document.addEventListener("DOMContentLoaded", function() {
  const cards = document.querySelectorAll('.github-card-compact');

  if (cards.length === 0) return;

  const CONFIG = {
    LIMIT: 90,
    COLOR: {
      OPEN: '#3fb950',
      CLOSED: '#8957e5'
    },
    ICON: {
      ISSUE_OPEN: 'fas fa-circle-dot',
      ISSUE_CLOSED: 'fas fa-check-circle',
      PR_OPEN: 'fas fa-code-pull-request',
      PR_CLOSED: 'fas fa-code-merge'
    }
  };

  cards.forEach(container => {
    // 중복 실행 방지
    if (container.dataset.loaded) return;
    container.dataset.loaded = "true";

    const cardUrl = container.dataset.url;
    if (!cardUrl) return;

    const parseUrl = (url) => {
      const p = url.replace("https://github.com/", "").split('/');
      // 간단한 파싱: owner/repo/issues/num
      return { owner: p[0], repo: p[1], num: p[p.length - 1] };
    };

    const sanitizeText = (text, limit) => {
      if (!text) return '내용 요약이 없습니다.';
      const clean = text.replace(/!\[.*\]\(.*\)/g, '')
                        .replace(/\[(.*)\]\(.*\)/g, '$1')
                        .replace(/[#*`\r\n]/g, ' ')
                        .trim();
      if (clean.length > limit) {
        return clean.substring(0, limit) + '...';
      }
      return clean;
    };

    const getStatusTheme = (data) => {
      const isPR = !!data.pull_request;
      const isClosed = data.state === 'closed';

      if (isPR) {
        if (isClosed) return { icon: CONFIG.ICON.PR_CLOSED, color: CONFIG.COLOR.CLOSED };
        return { icon: CONFIG.ICON.PR_OPEN, color: CONFIG.COLOR.OPEN };
      }

      if (isClosed) return { icon: CONFIG.ICON.ISSUE_CLOSED, color: CONFIG.COLOR.CLOSED };
      return { icon: CONFIG.ICON.ISSUE_OPEN, color: CONFIG.COLOR.OPEN };
    };

    const renderStatus = (target, data) => {
      const iconEl = target.querySelector('.gh-status-icon i');
      const theme = getStatusTheme(data);
      iconEl.className = theme.icon;
      iconEl.style.color = theme.color;
    };

    const info = parseUrl(cardUrl);
    const apiUrl = `https://api.github.com/repos/${info.owner}/${info.repo}/issues/${info.num}`;

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error('API limit or not found');
        return res.json();
      })
      .then(data => {
        container.querySelector('.gh-title').innerText = data.title;
        container.querySelector('.gh-repo').innerText = `${info.owner}/${info.repo} #${data.number}`;
        container.querySelector('.gh-desc').innerText = sanitizeText(data.body, 90);
        renderStatus(container, data);
      })
      .catch(err => {
        container.querySelector('.gh-title').innerText = "GitHub 링크 확인 불가";
        const iconEl = container.querySelector('.gh-status-icon i');
        iconEl.className = "fas fa-exclamation-triangle";
        iconEl.style.color = "#d2603a";
      });
  });
});