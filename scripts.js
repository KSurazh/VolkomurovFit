/* ===========================
   Константы и плейсхолдеры
   =========================== */
/**
 * 1) Телеграм:
 *    - Создайте бота у @BotFather и получите токен.
 *    - Узнайте свой chat_id (например, написав боту @userinfobot или добавив своего бота в приватный канал/чат и проверив updates).
 *    - Замените значения ниже:
 */
const TELEGRAM_BOT_TOKEN = 'ВАШ_TELEGRAM_BOT_TOKEN';
const TELEGRAM_CHAT_ID   = 'ВАШ_CHAT_ID';

/**
 * 2) Карта:
 *    Вариант: Яндекс.Карты JS API 2.1 (нужен API-ключ).
 *    Получите ключ и вставьте в переменную ниже. Если ключ не указан или загрузка скрипта не удалась — покажем статичную ссылку.
 *    Альтернатива: можно заменить на Google Maps JS API — логика загрузки аналогичная.
 */
const YANDEX_MAPS_API_KEY = '6dca7c55-faf3-42a1-abf8-c8af616e421e';

/* Координаты клуба (примерно для ул. 8 марта, 46, Екатеринбург) */
const LOCATION = { lat: 56.827, lng: 60.597 };
const MAP_LINK = 'https://maps.google.com/?q=Екатеринбург,+ул.+8+марта,+46';

/* ===========================
   Утилиты
   =========================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ===========================
   Мобильное меню (ARIA + scaleY)
   =========================== */
(function mobileMenu(){
  const btn = $('#menu-toggle');
  const nav = $('#nav-menu');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(opened));
  });
  // Закрываем меню по клику на ссылку
  $$('.nav-link').forEach(a => a.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  }));
})();

/* ===========================
   Тёмная тема: системная + ручной переключатель
   =========================== */
(function theme(){
  const btn = $('#theme-toggle');
  const apply = (dark) => {
    document.body.classList.toggle('dark', dark);
    btn?.setAttribute('aria-pressed', String(dark));
  };
  // начальное состояние: сохранённое или системное
  const saved = localStorage.getItem('darkMode');
  if (saved === 'true' || (saved === null && window.matchMedia?.('(prefers-color-scheme: dark)').matches)) {
    apply(true);
  }
  btn?.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    apply(isDark);
    localStorage.setItem('darkMode', String(isDark));
  });
})();

/* ===========================
   Плавный скролл к оплате
   =========================== */
(function paymentScroll(){
  const btn = $('#payment-button');
  const target = $('#payment-container');
  btn?.addEventListener('click', () => {
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    const body = {
      chat_id: TELEGRAM_CHAT_ID,
      text: payloadText
    };
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
      setTimeout(()=>{ statusBox.textContent=''; }, 5000); // авто-скрытие через 5 секунд
    }
  });
})();

/* ===========================
   Карта: Лениво загружаем Яндекс.Карты; если ошибка — fallback
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
    /* глобальный ymaps появится после загрузки скрипта */
    if (!window.ymaps) throw new Error('ymaps не найден');
    ymaps.ready(() => {
      const center = [Number(mapEl.dataset.lat) || LOCATION.lat, Number(mapEl.dataset.lng) || LOCATION.lng];
      const map = new ymaps.Map('map', { center, zoom: 16, controls: ['zoomControl'] });
      const placemark = new ymaps.Placemark(center, { balloonContent: 'Фитнес-клуб «Green Fitness»' }, { preset: 'islands#blueSportIcon' });
      map.geoObjects.add(placemark);
    });
  };

  // Лениво загружаем карту при появлении в вьюпорте
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

/* ===========================
   TODO: Платежи (Альфа-Банк)
   ===========================
   - На этапе интеграции добавьте виджет/редирект Альфа-Банка.
   - Храните публичные ключи/идентификаторы в GitHub Secrets и подставляйте на сборке (или вручную в scripts.js).
   - Кнопка #payment-button уже прокручивает страницу к #payment-container.
*/
