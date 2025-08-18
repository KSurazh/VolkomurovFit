/* ===========================
   Константы и плейсхолдеры
   =========================== */
/**
 * Telegram:
 *  1) Создать бота у @BotFather и получить токен.
 *  2) Узнать свой chat_id (бот @getmyid_bot или getUpdates).
 *  3) Подставить значения ниже.
 */
const TELEGRAM_BOT_TOKEN = '8264991850:AAFsRTvk2-YI005iLiuSS5MtS8Wc9sRsVsY';
const TELEGRAM_CHAT_ID   = '-1004851383447';

/**
 * Карта (Яндекс):
 *  Получите API-ключ JS API 2.1 и подставьте ниже.
 *  При отсутствии ключа/ошибке будет показан fallback-ссылкой.
 */
const YANDEX_MAPS_API_KEY = '6dca7c55-faf3-42a1-abf8-c8af616e421e';

/* Координаты */
const LOCATION = { lat: 56.829805, lng: 60.599889 };
const MAP_LINK = 'https://maps.google.com/?q=Екатеринбург,+ул.+8+марта,+46';

/* ===========================
   Утилиты
   =========================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ===========================
   Тема: системная + ручной переключатель
   =========================== */
(function theme(){
  const root = document.documentElement;
  const btn = $('#theme-toggle');
  const storageKey = 'theme';
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const setMeta = (mode) => {
    if (themeMeta) themeMeta.setAttribute('content', mode === 'dark' ? '#121212' : '#F8F9FA');
  };
  const apply = (mode) => {
    root.setAttribute('data-theme', mode);
    btn?.setAttribute('aria-pressed', String(mode === 'dark'));
    btn && (btn.textContent = mode === 'dark' ? '☀️' : '🌙');
    setMeta(mode);
  };

  const saved = localStorage.getItem(storageKey);
  if (saved === 'dark' || saved === 'light') {
    apply(saved);
  } else {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    apply(prefersDark ? 'dark' : 'light');
  }

  btn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, next);
    apply(next);
  });
})();

/* ===========================
   Мобильное меню
   =========================== */
(function menu(){
  const btn = $('#menu-toggle');
  const nav = $('#mobile-nav');

  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });

  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
})();

/* ===========================
   Карта
   =========================== */
(function map(){
  const container = $('#map');
  if (!container) return;

  if (typeof ymaps === 'undefined') {
    container.innerHTML = `<a href="${MAP_LINK}" target="_blank" rel="noopener">
      <img src="https://static-maps.yandex.ru/1.x/?ll=${LOCATION.lng},${LOCATION.lat}&size=450,300&z=16&l=map&pt=${LOCATION.lng},${LOCATION.lat},pm2rdm"
           alt="Открыть карту" loading="lazy" style="max-width:100%;border-radius:12px;">
    </a>`;
    return;
  }

  ymaps.ready(() => {
    const map = new ymaps.Map('map', {
      center: [LOCATION.lat, LOCATION.lng],
      zoom: 16,
      controls: ['zoomControl']
    });
    const placemark = new ymaps.Placemark([LOCATION.lat, LOCATION.lng], { balloonContent: 'Тренер здесь' });
    map.geoObjects.add(placemark);
  });
})();

/* ===========================
   Форма: Telegram + маска телефона + подсветка + tooltip
   =========================== */
(function form(){
  const form = $('#contact-form');
  if (!form) return;

  const nameInput = $('#name');
  const phoneInput = $('#phone');
  const msgInput = $('#message');
  const statusBox = document.createElement('div');
  statusBox.id = 'form-status';
  form.appendChild(statusBox);

  // Создание подсказки
  function setTooltip(field, message) {
    let tooltip = field.parentNode.querySelector('.tooltip');
    if (!tooltip && message) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      field.parentNode.appendChild(tooltip);
    }
    if (tooltip) {
      tooltip.textContent = message || '';
      tooltip.style.display = message ? 'block' : 'none';
    }
  }

  // Маска телефона
  phoneInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, ''); // только цифры
    if (v.startsWith('8')) v = v.substring(1); // убираем 8
    if (!v.startsWith('7')) v = '7' + v; // всегда начинается с 7
    e.target.value = '+' + v;
    validateField(phoneInput, phoneInput.value.length >= 12, "Введите корректный номер");
  });

  nameInput.addEventListener('input', () => {
    validateField(nameInput, nameInput.value.trim().length > 1, "Имя должно содержать минимум 2 символа");
  });

  msgInput.addEventListener('input', () => {
    validateField(msgInput, msgInput.value.trim().length > 0, "Поле не должно быть пустым");
  });

  // Валидация отдельного поля
  function validateField(field, condition, errorMsg) {
    if (condition) {
      field.classList.add('valid');
      field.classList.remove('invalid');
      setTooltip(field, "");
      return true;
    } else {
      field.classList.add('invalid');
      field.classList.remove('valid');
      setTooltip(field, errorMsg);
      return false;
    }
  }

  // Проверка всех полей
  function validateForm() {
    const validName = validateField(nameInput, nameInput.value.trim().length > 1, "Имя должно содержать минимум 2 символа");
    const validPhone = validateField(phoneInput, phoneInput.value.length >= 12, "Введите корректный номер");
    const validMsg = validateField(msgInput, msgInput.value.trim().length > 0, "Поле не должно быть пустым");
    return validName && validPhone && validMsg;
  }

  // Отправка формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 🔥 Сразу подсвечиваем все ошибки, даже если юзер не трогал поля
    if (!validateForm()) {
      showStatus('❌ Пожалуйста, заполните корректно все поля.', true);
      return;
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const message = msgInput.value.trim();

    const text = `📩 Новая заявка:\nИмя: ${name}\nТелефон: ${phone}\nСообщение: ${message}`;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text
        })
      });

      if (res.ok) {
        showStatus('✅ Заявка успешно отправлена!');
        form.reset();
        phoneInput.value = '+7'; // сброс к начальному виду
        [nameInput, phoneInput, msgInput].forEach(f => {
          f.classList.remove('valid', 'invalid');
          setTooltip(f, "");
        });
      } else {
        throw new Error('Ошибка при отправке');
      }
    } catch (err) {
      console.error(err);
      showStatus('❌ Не удалось отправить. Попробуйте ещё раз.', true);
    }
  });

  function showStatus(msg, error = false) {
    statusBox.textContent = msg;
    statusBox.style.color = error ? 'red' : 'green';
    statusBox.style.marginTop = '10px';
    setTimeout(() => { statusBox.textContent = ''; }, 5000);
  }

  // Начальное значение телефона
  if (!phoneInput.value) phoneInput.value = '+7';
})();
