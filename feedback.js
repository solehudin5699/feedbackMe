// @ts-nocheck
(function () {
  if (window.__FeedbackLoaded) return; // prevent double init
  window.__FeedbackLoaded = true;

  // CONFIG
  const script = document.currentScript;
  const rawConfig = window.FeedbackConfig || {};
  const dataset = script?.dataset;
  const config = {
    projectId: rawConfig?.projectId ?? dataset?.projectId ?? 'unknown',
    theme: rawConfig?.theme ?? dataset?.theme ?? 'light', // light | dark
    title:
      rawConfig?.title ??
      dataset?.title ??
      'Seberapa besar kemungkinan Anda merekomendasikan situs ini ke teman?',
    thankyou: rawConfig?.thankyou ?? dataset?.thankyou ?? '🙏 Terima kasih atas feedback Anda!',
    textButton: rawConfig?.textButton ?? dataset?.textButton ?? '📝 Rate your experience',
    textSubmit: rawConfig?.textSubmit ?? dataset?.textSubmit ?? 'Kirim',
    descriptionScore: rawConfig?.descriptionScore ?? dataset?.descriptionScore,
    // API
    api: rawConfig?.api ?? dataset?.api ?? 'https://nps-be.telkom-digital.id/v1/responses',
    apiMethod: rawConfig?.apiMethod ?? dataset?.apiMethod ?? 'POST',
    // OTHERS
    customerId: rawConfig?.customerId ?? dataset?.customerId,
    surveyId: rawConfig?.surveyId ?? dataset?.surveyId,
    variant: rawConfig?.variant ?? dataset?.variant,
  };
  const FEEDBACKSENT_KEY = 'feedbackSent';

  /* -------------------------------------- */

  // STYLE
  const style = document.createElement('style');
  style.innerHTML = `
    #feedback-tab {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      background-color: ${config.theme === 'dark' ? '#333' : '#e53935'};
      color: white;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      padding: 12px 8px;
      border-top-left-radius: 12px;
      border-bottom-left-radius: 12px;
      cursor: pointer;
      font-family: sans-serif;
      z-index: 9999;
    }

    #feedback-tab .tab-content {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      display: inline-block;
      font-weight: semiibold;;
      position: relative;
    }

    #feedback-tab .chevron {
      display: inline-block;
      transform: rotate(90deg);
      font-size: 16px;
      margin-top: 4px;
      transition: transform 0.3s ease;
    }

    #feedback-tab .chevron-icon {
      display: inline-block;
      transform: rotate(90deg);
      transition: transform 0.3s ease;
      margin-top: 4px;
      font-size: 16px;
    }

    #feedback-popup.open ~ #feedback-tab .chevron {
      transform: rotate(180deg); /* mengarah ke bawah */
    }

    #feedback-popup {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      right: -385px;
      width: 300px;
      height: auto;
      min-height: 200px;
      max-height: 90%;
      background: ${config.theme === 'dark' ? '#222' : 'white'};
      color: ${config.theme === 'dark' ? 'white' : 'black'};
      border-left: ${config.theme === 'dark' ? '1px solid #444' : '1px solid #ccc'};
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.2);
      transition: right 0.3s ease-in-out;
      z-index: 9998;
      font-family: sans-serif;
      padding:20px;
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
      padding-right: 60px;
      display: grid;
      place-content: center;
    }

    #feedback-popup.open {
      right: 0;
    }

    #feedback-popup h4 {
      margin-top: 0;
      font-size: 16px;
    }

    .score-button {
      padding: 6px 12px;
      margin: 4px 2px;
      border: 1px solid #ccc;
      border-radius: 6px;
      cursor: pointer;
      background: #f9f9f9;
    }

    .score-button.selected {
      background: ${config.theme === 'dark' ? '#555' : '#e53935'};
      color: white;
    }

    #score-description {
      font-size: 13px;
      color: ${config.theme === 'dark' ? 'white' : '#666'};
      margin-top: 4px;
      margin-bottom: 10px;
    }

    #submit-feedback {
      margin-top: 20px;
      width: 100%;
      background: ${config.theme === 'dark' ? '#444' : '#e53935'};
      color: white;
      padding: 8px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-size: 14px;
    }
      #submit-feedback:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    #close-popup {
      position: absolute;
      top: 12px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: ${config.theme === 'dark' ? 'white' : 'black'};
    }
  `;
  document.head.appendChild(style);
  /* -------------------------------------- */

  // TAB OR BUTTON TOGGLE POPUP
  const tab = document.createElement('div');
  tab.id = 'feedback-tab';
  // tab.innerText = config.textButton;
  tab.innerHTML = `
    <span class="tab-content">
      ${config.textButton}
      <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
         xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    </span>
  `;
  document.body.appendChild(tab);

  /* -------------------------------------- */

  // POPUP
  const popup = document.createElement('div');
  popup.id = 'feedback-popup';
  document.body.appendChild(popup);
  const isFeedbackSent = localStorage.getItem(FEEDBACKSENT_KEY) === '1';

  if (isFeedbackSent) {
    // <button id="close-popup">&times;</button>
    popup.innerHTML = `
      <h4 style="margin-top: 40px; text-align: center;">
        ${config.thankyou}
      </h4>
    `;
  } else {
    popup.innerHTML = `
      <h4>${config.title}</h4>
      <div id="scores"></div>
      ${
        config.descriptionScore &&
        `<p id="score-description">
        ${config.descriptionScore}
        </p>`
      }
      <button id="submit-feedback" disabled>${config.textSubmit}</button>
    `;
  }
  /* -------------------------------------- */

  // SUBMIT BUTTON
  const submitButton = popup.querySelector('#submit-feedback');

  /* -------------------------------------- */

  // SCORE BUTTONS
  let selectedScore = null;
  if (!isFeedbackSent) {
    const scoreContainer = popup.querySelector('#scores');

    for (let i = 0; i <= 10; i++) {
      const btn = document.createElement('button');
      btn.innerText = i;
      btn.className = 'score-button';
      btn.onclick = () => {
        selectedScore = i;
        scoreContainer.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        submitButton.disabled = false;
      };
      scoreContainer.appendChild(btn);
    }
  }

  /* -------------------------------------- */
  // EVENT LISTENERS
  // Toggle popup
  const chevronIcon = tab.querySelector('.chevron-icon');
  tab.addEventListener('click', () => {
    const isOpen = popup.classList.toggle('open');
    chevronIcon.style.transform = isOpen ? 'rotate(270deg)' : 'rotate(90deg)';
  });
  popup.querySelector('#close-popup')?.addEventListener('click', () => {
    popup.classList.remove('open');
    chevronIcon.style.transform = 'rotate(90deg)';
  });

  // Submit feedback
  popup.querySelector('#submit-feedback').addEventListener('click', () => {
    if (!selectedScore) {
      alert('Pilih skor terlebih dahulu');
      return;
    }

    // Simpan ke backend
    fetch(config.api, {
      method: config.apiMethod,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: config.surveyId,
        survey_id: config.custommerId,
        score: selectedScore,
        comment: 'Great product, but could use more features.',
        response_date: new Date().toISOString(),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          console.log(res);
          localStorage.setItem(FEEDBACKSENT_KEY, '1');

          popup.innerHTML = `
          <h4 style="margin-top: 40px; text-align: center;">
            ${config.thankyou}
          </h4>
        `;
          setTimeout(() => popup.classList.remove('open'), 2000);
        }
      })
      .catch(() => {
        console.warn('Gagal mengirim feedback');
      });
  });
})();
