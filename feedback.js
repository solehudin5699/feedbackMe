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
    illustration:
      rawConfig?.illustration ??
      dataset?.illustration ??
      'https://www.pngall.com/wp-content/uploads/12/Illustration-PNG-Free-Image.png',
    // API
    api: rawConfig?.api ?? dataset?.api ?? 'https://nps-be.telkom-digital.id/v1/responses',
    apiMethod: rawConfig?.apiMethod ?? dataset?.apiMethod ?? 'POST',
    // OTHERS
    customerId: rawConfig?.customerId ?? dataset?.customerId,
    surveyId: rawConfig?.surveyId ?? dataset?.surveyId,
    variant: rawConfig?.variant ?? dataset?.variant ?? 'modal',
  };
  const FEEDBACKSENT_KEY = 'feedbackSent';

  /* -------------------------------------- */

  // STYLE
  const style = document.createElement('style');
  style.innerHTML = `
    #fm_feedback-tab {
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

    #fm_feedback-tab .tab-content {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      display: inline-block;
      font-weight: semiibold;;
      position: relative;
    }

    #fm_feedback-tab .chevron {
      display: inline-block;
      transform: rotate(90deg);
      font-size: 16px;
      margin-top: 4px;
      transition: transform 0.3s ease;
    }

    #fm_feedback-tab .chevron-icon {
      display: inline-block;
      transform: rotate(90deg);
      transition: transform 0.3s ease;
      margin-top: 4px;
      font-size: 16px;
    }

    #fm_feedback-popup.open ~ #fm_feedback-tab .chevron {
      transform: rotate(180deg); /* mengarah ke bawah */
    }

    #fm_feedback-popup {
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

    #fm_feedback-popup.open {
      right: 0;
    }

    #fm_feedback-popup h4 {
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

    #fm_close-popup {
      position: absolute;
      top: 16px;
      left: 16px;
      background: none;
      border: none;
      font-size: 24px;
      font-weight: light;
      cursor: pointer;
      color: ${config.theme === 'dark' ? 'white' : 'black'};
    }

    .fm_feedback-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    }

    /* -------------------MODAL------------------- */
    #fm_feedback-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      z-index: 9998;
      display: none;
    }
    #fm_feedback-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${config.theme === 'dark' ? '#222' : 'white'};
      color: ${config.theme === 'dark' ? 'white' : 'black'};
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      z-index: 9999;
      width: 350px;
      max-width: 90%;
      padding: 0;
      overflow-y: scroll;
      display: none;
      padding: 20px;
      max-height: 90vh;
    }
    #fm_feedback-modal.open, #fm_feedback-overlay.open {
        display: block;
    }

    .fm_modal-illustration {
      flex: 1;
      background: #fef3f2;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      border-radius: 12px;
    }

    .fm_modal-illustration img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
    }

    .modal-form {
      flex: 1;
      padding: 24px;
      position: relative;
    }

    .modal-form h4 {
      font-size: 18px;
      margin-top: 0;
    }

    .modal-scores {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      margin: 12px 0;
    }
  `;
  document.head.appendChild(style);
  /* -------------------------------------- */

  // TAB OR BUTTON TOGGLE POPUP
  const tab = document.createElement('div');
  tab.id = 'fm_feedback-tab';
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

  // OVERLAY
  const overlay = document.createElement('div');
  overlay.id = 'fm_feedback-overlay';
  document.body.appendChild(overlay);

  /* -------------------------------------- */

  // POPUP
  const isModal = config.variant === 'modal';
  const popup = document.createElement('div');
  popup.id = isModal ? 'fm_feedback-modal' : 'fm_feedback-popup';
  document.body.appendChild(popup);
  const isFeedbackSent = localStorage.getItem(FEEDBACKSENT_KEY) === '1';

  if (isFeedbackSent) {
    popup.innerHTML = `
      <h4 style="margin-top: 40px; text-align: center;">
        ${config.thankyou}
      </h4>
    `;
  } else {
    if (isModal) {
      popup.innerHTML = `
      <div class="modal-wrapper">
        <div class="fm_modal-illustration">
          <img src=${config.illustration} alt="Feedback" />
        </div>
        <div class="modal-content">
          <button id="fm_close-popup">&times;</button>
          <h4 class="fm_feedback-title">${config.title}</h4>
          <div id="scores" class="modal-scores"></div>
          <p id="score-description">${config.descriptionScore}</p>
          <button id="submit-feedback" disabled>Submit</button>
        </div>
      </div>
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
    overlay.classList.toggle('open');
    chevronIcon.style.transform = isOpen ? 'rotate(270deg)' : 'rotate(90deg)';
  });
  popup.querySelector('#fm_close-popup')?.addEventListener('click', () => {
    popup.classList.remove('open');
    chevronIcon.style.transform = 'rotate(90deg)';
  });
  overlay.addEventListener('click', () => {
    popup.classList.remove('open');
    overlay.classList.toggle('open');
    chevronIcon.style.transform = 'rotate(90deg)';
  });
  popup.querySelector('#fm_close-popup')?.addEventListener('click', () => {
    popup.classList.remove('open');
    overlay.classList.toggle('open');
    chevronIcon.style.transform = 'rotate(90deg)';
  });

  // Submit feedback
  popup.querySelector('#submit-feedback').addEventListener('click', () => {
    if (!selectedScore) {
      alert('Pilih skor terlebih dahulu');
      return;
    }
    submitButton.innerHTML = 'Submitting...';

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
        if (Number(res.statusCode) === 200) {
          localStorage.setItem(FEEDBACKSENT_KEY, '1');

          popup.innerHTML = `
          <h4 style="margin-top: 40px; text-align: center;">
            ${config.thankyou}
          </h4>
        `;
          setTimeout(() => {
            popup.classList.remove('open');
            overlay.classList.remove('open');
          }, 2000);
        }
      })
      .catch(() => {
        console.warn('Gagal mengirim feedback');
      })
      .finally(() => {
        submitButton.innerHTML = config.textSubmit;
      });
  });
})();
