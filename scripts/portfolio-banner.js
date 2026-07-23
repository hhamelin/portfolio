(function () {
  'use strict';

  // Check URL param or sessionStorage or Referrer
  const urlParams = new URLSearchParams(window.location.search);
  const isDismissed =
    urlParams.get('dismiss_portfolio_banner') === '1' ||
    sessionStorage.getItem('from_portfolio_dismissed') === 'true';

  if (isDismissed) return;

  const fromParam = urlParams.get('from') === 'portfolio' || urlParams.get('ref') === 'portfolio';
  const referrer = document.referrer || '';
  const fromReferrer =
    referrer.includes('havenhamelin.work') ||
    referrer.includes('portfolio') ||
    referrer.includes('localhost') ||
    referrer.includes('127.0.0.1');

  if (fromParam || fromReferrer) {
    sessionStorage.setItem('from_portfolio', 'true');
  }

  const showBanner = sessionStorage.getItem('from_portfolio') === 'true';
  if (!showBanner) return;

  // Determine return URL
  let portfolioUrl = 'https://havenhamelin.work';
  if (
    fromReferrer &&
    (referrer.includes('havenhamelin.work') ||
      referrer.includes('localhost') ||
      referrer.includes('127.0.0.1'))
  ) {
    portfolioUrl = referrer;
  }

  // Universal Standalone Styles
  const style = document.createElement('style');
  style.textContent = `
    #portfolioReturnBanner.portfolio-return-banner {
      display: block !important;
      background: linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%) !important;
      border-bottom: 2px solid #38bdf8 !important;
      box-shadow: 0 4px 16px rgba(15, 23, 42, 0.4) !important;
      color: #f8fafc !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      padding: 10px 20px !important;
      position: relative !important;
      width: 100% !important;
      box-sizing: border-box !important;
      z-index: 999999 !important;
      transition: opacity 0.3s ease, transform 0.3s ease !important;
    }
    #portfolioReturnBanner .portfolio-banner-container {
      max-width: 1200px !important;
      margin: 0 auto !important;
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 16px !important;
      flex-wrap: wrap !important;
    }
    #portfolioReturnBanner .portfolio-banner-content {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      font-size: 0.9rem !important;
      color: #e2e8f0 !important;
    }
    #portfolioReturnBanner .portfolio-banner-badge {
      background: #0284c7 !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      font-size: 0.72rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.06em !important;
      padding: 3px 10px !important;
      border-radius: 20px !important;
      display: inline-block !important;
    }
    #portfolioReturnBanner .portfolio-banner-actions {
      display: flex !important;
      align-items: center !important;
      gap: 14px !important;
    }
    #portfolioReturnBanner .portfolio-return-btn {
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      background: rgba(56, 189, 248, 0.12) !important;
      color: #38bdf8 !important;
      border: 1px solid #38bdf8 !important;
      padding: 6px 14px !important;
      border-radius: 6px !important;
      font-size: 0.85rem !important;
      font-weight: 600 !important;
      text-decoration: none !important;
      transition: all 0.2s ease !important;
    }
    #portfolioReturnBanner .portfolio-return-btn:hover {
      background: #38bdf8 !important;
      color: #0f172a !important;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.4) !important;
      text-decoration: none !important;
    }
    #portfolioReturnBanner .portfolio-banner-close {
      background: transparent !important;
      border: none !important;
      color: #94a3b8 !important;
      font-size: 1.3rem !important;
      line-height: 1 !important;
      cursor: pointer !important;
      padding: 0 4px !important;
      transition: color 0.2s ease !important;
    }
    #portfolioReturnBanner .portfolio-banner-close:hover {
      color: #f43f5e !important;
    }
    @media (max-width: 768px) {
      #portfolioReturnBanner .portfolio-banner-container {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      #portfolioReturnBanner .portfolio-banner-actions {
        width: 100% !important;
        justify-content: space-between !important;
      }
    }
  `;

  function initBanner() {
    if (document.getElementById('portfolioReturnBanner')) return;

    document.head.appendChild(style);

    const bannerDiv = document.createElement('div');
    bannerDiv.className = 'portfolio-return-banner';
    bannerDiv.id = 'portfolioReturnBanner';
    bannerDiv.innerHTML = `
      <div class="portfolio-banner-container">
        <div class="portfolio-banner-content">
          <span class="portfolio-banner-badge">Portfolio Demo</span>
          <span class="portfolio-banner-text">You are currently viewing a live demo project by <strong>Haven Hamelin</strong>.</span>
        </div>
        <div class="portfolio-banner-actions">
          <a href="${escapeHtml(portfolioUrl)}" class="portfolio-return-btn" title="Return to Portfolio">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Return to Portfolio
          </a>
          <button type="button" class="portfolio-banner-close" id="closePortfolioBanner" aria-label="Dismiss banner">&times;</button>
        </div>
      </div>
    `;

    document.body.insertBefore(bannerDiv, document.body.firstChild);

    document.getElementById('closePortfolioBanner').addEventListener('click', function () {
      bannerDiv.style.opacity = '0';
      bannerDiv.style.transform = 'translateY(-100%)';
      setTimeout(() => bannerDiv.remove(), 300);
      sessionStorage.setItem('from_portfolio_dismissed', 'true');
    });
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBanner);
  } else {
    initBanner();
  }
})();
