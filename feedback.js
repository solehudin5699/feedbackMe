(function () {
  if (window.__FeedbackLoaded) return; // prevent double init
  window.__FeedbackLoaded = true;

  const projectId = document.currentScript?.dataset?.projectId ?? 'unknown';

  // Style
  const style = document.createElement('style');
  style.innerHTML = `
    #feedback-tab {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      background-color: #e53935;
      color: white;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      padding: 12px 8px;
      border-top-left-radius: 8px;
      border-bottom-left-radius: 8px;
      cursor: pointer;
      font-family: sans-serif;
      z-index: 9999;
    }

    #feedback-popup {
      position: fixed;
      top: 0;
      right: -340px;
      width: 300px;
      height: 100%;
      background: white;
      border-left: 1px solid #ccc;
      box-shadow: -4px 0 16px rgba(0, 0, 0, 0.2);
      transition: right 0.3s ease-in-out;
      z-index: 9998;
      font-family: sans-serif;
      padding:20px;
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
      background: #e53935;
      color: white;
    }

    #submit-feedback {
      margin-top: 12px;
      width: 100%;
      background: #e53935;
      color: white;
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    #close-popup {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Tab
  const tab = document.createElement('div');
  tab.id = 'feedback-tab';
  tab.innerText = '📝 Rate your experience';
  document.body.appendChild(tab);

  // Popup
  const popup = document.createElement('div');
  popup.id = 'feedback-popup';
  popup.innerHTML = `
    <button id="close-popup">&times;</button>
    <h4>Seberapa besar kemungkinan Anda merekomendasikan situs ini ke teman?</h4>
    <div id="scores"></div>
    <button id="submit-feedback">Kirim</button>
  `;
  document.body.appendChild(popup);

  // Score buttons
  const scoreContainer = popup.querySelector('#scores');
  let selectedScore = null;

  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = 'score-button';
    btn.onclick = () => {
      selectedScore = i;
      scoreContainer.querySelectorAll('button').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    scoreContainer.appendChild(btn);
  }

  // Toggle popup
  tab.addEventListener('click', () => popup.classList.toggle('open'));
  popup
    .querySelector('#close-popup')
    .addEventListener('click', () => popup.classList.remove('open'));

  // Submit feedback
  popup.querySelector('#submit-feedback').addEventListener('click', () => {
    if (!selectedScore) {
      alert('Pilih skor terlebih dahulu');
      return;
    }

    // Simpan ke backend
    fetch('https://your-backend.com/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score: selectedScore,
        projectId,
        url: location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(() => {
      console.warn('Gagal mengirim feedback');
    });

    localStorage.setItem('feedbackSent', '1'); // 👈 ini bagian penting
    popup.innerHTML = "<p style='margin-top:20px;'>Terima kasih atas feedback Anda! 🙏</p>";
    setTimeout(() => popup.classList.remove('open'), 2000);
  });
})();
