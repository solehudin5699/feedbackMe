# 📢 FeedbackUs

Widget feedback ringan yang bisa di-embed ke website mana pun. Mendukung popup dari sisi kanan atau modal tengah layar. Konfigurasi mudah via `window.FeedbackConfig` atau `data-\*` attributes.

# Installation

```html
<script>
  window.FeedbackConfig = {
    projectId: 'myproject',
    surveyId: 'survey-001',
    customerId: 'customer-abc',
    variant: 'modal', //OPTIONAL: 'modal' | 'slider' (default modal)
    theme: 'light', //OPTIONAL: light| 'dark' (default light)
    title: 'Seberapa besar kemungkinan Anda merekomendasikan situs ini ke teman?', //OPTIONAL
    thankyou: '🙏 Terima kasih atas feedback Anda!', //Optional
    textButton: '📝 Beri Feedback', //Optional
    textSubmit: 'Kirim', //Optional
    descriptionScore: '0 = Sangat tidak mungkin, 10 = Sangat mungkin', //Optional
    illustration: 'https://yourcdn.com/your-illustration.png', //Optional
    api: 'https://your-backend.com/api/feedback', //Optional
    apiMethod: 'POST', //Optional
  };
</script>

<script src="https://cdn.jsdelivr.net/gh/<username-github>/<repository-github>/path/to/feedback.js"></script>
```

Or use `data-*` attributes:

```html
<script
  src="https://cdn.jsdelivr.net/gh/<username-github>/<repository-github>/path/to/feedback.js"
  data-project-id="myproject"
  data-theme="dark"
  data-title="Beri kami feedback!"
  data-api="https://your-backend.com/api/feedback"
  data-customer-id="customer-abc"
  data-survey-id="survey-001"
></script>
```

# Full Configuration

| Option           | Type   | Description                                   |
| ---------------- | ------ | --------------------------------------------- |
| projectId        | string | Your project ID                               |
| surveyId         | string | Your survey ID                                |
| customerId       | string | Your customer ID                              |
| variant          | string | Optional: 'modal' or 'slider' (default modal) |
| theme            | string | Optional: 'light' or 'dark' (default light)   |
| title            | string | Optional                                      |
| thankyou         | string | Optional                                      |
| textButton       | string | Optional                                      |
| textSubmit       | string | Optional                                      |
| descriptionScore | string | Optional                                      |
| illustration     | string | Optional                                      |
| api              | string | Optional                                      |
| apiMethod        | string | Optional                                      |
