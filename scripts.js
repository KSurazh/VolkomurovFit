/* ===========================
   Константы и плейсхолдеры
   =========================== */
/**
 * Telegram:
 *  1) Создать бота у @BotFather и получить токен.
 *  2) Узнать свой chat_id (бот @getmyid_bot или getUpdates).
 *  3) Подставить значения ниже.
 */
const TELEGRAM_BOT_TOKEN = 'ВАШ_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID   = 'ВАШ_CHAT_ID';

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
    // синхронизируем цвет адресной строки
    if (themeMeta) themeMeta.setAttribute('content', mode === 'dark' ? '#121212' : '#F8F9FA');
  };
  const apply = (mode) => {
    root.setAttribute('data-theme', mode);
    btn?.setAttribute('aria-pressed', String(mode === 'dark'));
    btn && (btn.textContent = mode === 'dark' ? '☀️' : '🌙');
    setMeta(mode);
  };

  // начальное состояние
  const saved = localStorage.getItem(storageKey);
  if (saved === 'dark' || saved === 'light') {
    apply(saved);
  } else {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    apply(prefersDark ? 'dark' : 'light');
  }

  // переключатель
  btn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(storageKey, current);
    apply(current);
  });

  // если пользователь не переопределял — реагируем на смену системной темы
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  mq?.addEventListener('change', (e) => {
    if (!localStorage.getItem(storageKey)) {
      apply(e.matches ? 'dark' : 'light');
    }
  });
})();

/* ===========================
   Мобильное боковое меню (drawer)
   =========================== */
(function mobileMenu(){
  const btn = $('#menu-toggle');
  const drawer = $('#mobile-drawer');
  const backdrop = $('#drawer-backdrop');

  const open = () => {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
  };

  btn?.addEventListener('click', () => {
    drawer.classList.contains('open') ? close() : open();
  });
  backdrop?.addEventListener('click', close);
  // закрытие по Esc
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  // клики по пунктам меню
  $$('.drawer-link').forEach(a => a.addEventListener('click', close));
})();

/* ===========================
   Кнопка «Оплата» в шапке -> прокрутка к кнопке после услуг
   =========================== */
(function paymentScroll(){
  const topBtn = $('#pay-top');
  const anchor = $('#pay-anchor');
  topBtn?.addEventListener('click', (e) => {
    // если это ссылка-якорь, браузер сам прокрутит; на всякий случай:
    if (anchor) {
      e.preventDefault();
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

/* ===========================
   Контактная форма -> Telegram Bot API
   =========================== */
(function contactForm(){
  const form = $('#contact-form');
  if (!form) return;

  const statusBox = $('#form-status');
  const errName = $('#err-name');
  const errPhone = $('#err-phone');
  const errMsg = $('#err-message');

  const validate = () => {
    let valid = true;
    errName.textContent = '';
    errPhone.textContent = '';
    errMsg.textContent = '';

    const name = $('#name').value.trim();
    const phone = $('#phone').value.trim();
    const message = $('#message').value.trim();

    if (name.length < 2){
      errName.textContent = 'Укажите имя (не короче 2 символов).';
      valid = false;
    }
    if (!/^[0-9+()\s-]{5,}$/.test(phone)){
      errPhone.textContent = 'Укажите корректный телефон.';
      valid = false;
    }
    if (message.length < 5){
      errMsg.textContent = 'Сообщение слишком короткое.';
      valid = false;
    }
    return valid;
  };

  const sendToTelegram = async (payloadText) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const body = { chat_id: TELEGRAM_CHAT_ID, text: payloadText };
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Telegram API error: ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error('Telegram responded with ok=false');
    return data;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const name = $('#name').value.trim();
    const phone = $('#phone').value.trim();
    const message = $('#message').value.trim();

    const text = [
      'Новая заявка с сайта VolkomurovFit:',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Сообщение: ${message}`
    ].join('\n');

    statusBox.textContent = 'Отправляем...';

    try{
      if (TELEGRAM_BOT_TOKEN === 'ВАШ_TELEGRAM_BOT_TOKEN' || TELEGRAM_CHAT_ID === 'ВАШ_CHAT_ID') {
        throw new Error('Необходимо указать TELEGRAM_BOT_TOKEN и CHAT_ID в scripts.js');
      }
      await sendToTelegram(text);
      statusBox.textContent = 'Сообщение отправлено! Я свяжусь с вами в ближайшее время.';
      form.reset();
    }catch(err){
      console.error(err);
      statusBox.textContent = 'Ошибка отправки. Проверьте интернет или настройки Telegram.';
    }finally{
      setTimeout(()=>{ statusBox.textContent=''; }, 5000);
    }
  });
})();

/* ===========================
   Карта: лениво загружаем Яндекс.Карты, при ошибке — fallback
   =========================== */
(function mapInit(){
  const mapEl = $('#map');
  const fallbackLink = $('#map-fallback');
  if (!mapEl) return;

  const showFallback = () => {
    fallbackLink.style.display = 'inline-flex';
    mapEl.style.display = 'none';
  };

  const loadYandexScript = () => new Promise((resolve, reject) => {
    if (!YANDEX_MAPS_API_KEY || YANDEX_MAPS_API_KEY === 'ВАШ_YANDEX_MAPS_API_KEY'){
      reject(new Error('YANDEX_MAPS_API_KEY не указан'));
      return;
    }
    const s = document.createElement('script');
    s.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${encodeURIComponent(YANDEX_MAPS_API_KEY)}`;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Не удалось загрузить Яндекс.Карты'));
    document.head.appendChild(s);
  });

  const initYandexMap = () => {
    if (!window.ymaps) throw new Error('ymaps не найден');
    ymaps.ready(() => {
      const center = [Number(mapEl.dataset.lat) || LOCATION.lat, Number(mapEl.dataset.lng) || LOCATION.lng];
      const map = new ymaps.Map('map', { center, zoom: 16, controls: ['zoomControl'] });
      const placemark = new ymaps.Placemark(center, { balloonContent: 'Фитнес-клуб «Green Fitness»' }, { preset: 'islands#blueSportIcon' });
      map.geoObjects.add(placemark);
      map.behaviors.disable('scrollZoom');
    });
  };

  const io = new IntersectionObserver(async (entries) => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    try{
      await loadYandexScript();
      initYandexMap();
    }catch(err){
      console.warn(err);
      showFallback();
    }
  }, { rootMargin: '200px' });
  io.observe(mapEl);
})();

// Маска ввода телефона
const phoneInput = document.getElementById("phone");

phoneInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, ""); // убираем всё, кроме цифр
  if (!value.startsWith("79")) {
    value = "79" + value.replace(/^7?9?/, ""); // всегда начинаем с 79
  }

  let formatted = "+7-";
  if (value.length > 1) formatted += value.substring(1, 2); // 9
  if (value.length >= 2) formatted += value.substring(2, 4);
  if (value.length >= 4) formatted += "-" + value.substring(4, 7);
  if (value.length >= 7) formatted += "-" + value.substring(7, 9);
  if (value.length >= 9) formatted += "-" + value.substring(9, 11);

  e.target.value = formatted;
});

