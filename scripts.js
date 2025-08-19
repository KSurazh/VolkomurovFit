/* =========================================================
   VolkomurovFit — клиентские скрипты
   - Бургер-меню (mobile)
   - Переключатель темы (auto/dark/light)
   - Контактная форма (Telegram)
   - Загрузка и инициализация Яндекс.Карт
   ---------------------------------------------------------
   Ключи/ID:
   1) Глобальные (если объявлены где-то на странице):
      window.TELEGRAM_BOT_TOKEN, window.TELEGRAM_CHAT_ID, window.YANDEX_MAPS_API_KEY
   2) Иначе — константы ниже (замените плейсхолдеры).
   ========================================================= */

/* ====== КОНФИГ (замените значения на свои при необходимости) ====== */
const TELEGRAM_BOT_TOKEN_FALLBACK = "8264991850:AAFsRTvk2-YI005iLiuSS5MtS8Wc9sRsVsY";
const TELEGRAM_CHAT_ID_FALLBACK   = "-1004851383447";
const YANDEX_MAPS_API_KEY_FALLBACK = "6dca7c55-faf3-42a1-abf8-c8af616e421e";

/* ====== ГЕТТЕРЫ КОНФИГА (сначала берём глобальные, потом фолбэки) ====== */
function getTelegramBotToken() {
  return (typeof window.TELEGRAM_BOT_TOKEN !== "undefined" && window.TELEGRAM_BOT_TOKEN) ?
    window.TELEGRAM_BOT_TOKEN : TELEGRAM_BOT_TOKEN_FALLBACK;
}
function getTelegramChatId() {
  return (typeof window.TELEGRAM_CHAT_ID !== "undefined" && window.TELEGRAM_CHAT_ID) ?
    window.TELEGRAM_CHAT_ID : TELEGRAM_CHAT_ID_FALLBACK;
}
function getYandexApiKey() {
  return (typeof window.YANDEX_MAPS_API_KEY !== "undefined" && window.YANDEX_MAPS_API_KEY) ?
    window.YANDEX_MAPS_API_KEY : YANDEX_MAPS_API_KEY_FALLBACK;
}

/* ====== УТИЛИТЫ ====== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

function updateMetaThemeColor(hex) {
  let m = document.querySelector('meta[name="theme-color"]');
  if (!m) {
    m = document.createElement("meta");
    m.setAttribute("name", "theme-color");
    document.head.appendChild(m);
  }
  m.setAttribute("content", hex);
}

function showInlineStatus(box, msg, type = "info", timeoutMs = 5000) {
  if (!box) return;
  box.textContent = msg || "";
  box.classList.remove("error", "success", "info");
  box.classList.add(type);
  box.style.display = msg ? "block" : "none";
  box.setAttribute("role", "alert");
  if (timeoutMs > 0 && msg) {
    window.clearTimeout(box.__hideTimer);
    box.__hideTimer = window.setTimeout(() => {
      box.style.display = "none";
      box.textContent = "";
    }, timeoutMs);
  }
}

/* ====== ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ====== */
// Работает с CSS: [data-theme="dark"] { ... }
// Режимы: auto → dark → light → auto. Сохраняется в localStorage.
(() => {
  const BTN_SELECTORS = "#theme-toggle, #themeToggle, [data-role='theme-toggle']";
  const STORAGE_KEY = "theme-mode"; // значения: 'auto' | 'dark' | 'light'
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  const btn = document.querySelector(BTN_SELECTORS);

  const getMode = () => localStorage.getItem(STORAGE_KEY) || "auto";
  const isSysDark = () => (mq ? mq.matches : false);

  const apply = (mode) => {
    const html = document.documentElement;
    const useDark = mode === "dark" || (mode === "auto" && isSysDark());

    // Ключевая строка: ставим/убираем data-theme="dark" на <html>
    if (useDark) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }

    // Обновляем мета-цвет для мобильных браузеров (не обязательно)
    const meta = document.querySelector('meta[name="theme-color"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "theme-color");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute("content", useDark ? "#121212" : "#ffffff");

    // Обновляем текст/иконку кнопки (если есть)
    if (btn) {
      const label = mode === "auto" ? "🌓" : useDark ? "🌙" : "☀️";
      btn.textContent = label;
      btn.setAttribute("aria-label", `Тема: ${mode}`);
      btn.setAttribute("aria-pressed", String(useDark));
    }
  };

  const setMode = (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    apply(mode);
  };

  // Инициализация при загрузке
  const init = () => apply(getMode());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  // Переключатель: auto -> dark -> light -> auto
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const cur = getMode();
      const next = cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto";
      setMode(next);
    });
  }

  // Следим за системной темой, если режим — auto
  if (mq) {
    mq.addEventListener
      ? mq.addEventListener("change", () => { if (getMode() === "auto") apply("auto"); })
      : mq.addListener && mq.addListener(() => { if (getMode() === "auto") apply("auto"); });
  }
})();

  // первичная инициализация
  apply(getMode());

  // клик по переключателю
  on(btn, "click", (e) => {
    e.preventDefault();
    const cur = getMode();
    const next = cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto";
    setMode(next);
  });

  // реакция на изменение системной темы, если режим — auto
  if (mq) {
    on(mq, "change", () => {
      if (getMode() === "auto") apply("auto");
    });
  }
})();

/* ====== БУРГЕР-МЕНЮ (мобилка) ====== */
(function initBurger() {
  const burger = $("#burger, .burger, [data-role='burger']");
  const drawer = $("#mobile-drawer, #mobile-nav, .nav-mobile, [data-role='mobile-drawer']");
  const links = $$("#mobile-drawer a, #mobile-nav a, .nav-mobile a, [data-role='mobile-drawer'] a");

  const toggle = (force) => {
    if (!drawer) return;
    const willOpen = typeof force === "boolean" ? force : !drawer.classList.contains("open") && !drawer.classList.contains("active");
    drawer.classList.toggle("open", willOpen);
    drawer.classList.toggle("active", willOpen); // на случай, если стили завязаны на .active
    document.body.classList.toggle("no-scroll", willOpen);
    if (burger) burger.setAttribute("aria-expanded", String(willOpen));
  };

  on(burger, "click", (e) => {
    e.preventDefault();
    toggle();
  });

  links.forEach((a) => on(a, "click", () => toggle(false)));

  on(document, "keydown", (e) => {
    if (e.key === "Escape") toggle(false);
  });
})();

/* ====== КОНТАКТНАЯ ФОРМА (Telegram) ====== */
(function initContactForm() {
  const form =
    $("#contactForm, #contact-form, form[data-role='contact'], form.contact-form") ||
    $("section#contacts form") ||
    $("form[action*='telegram']");

  if (!form) return;

  const nameInput    = $("#name, input[name='name'], input[data-name='name']", form) || $("input[type='text']", form);
  const phoneInput   = $("#phone, input[name='phone'], input[type='tel']", form);
  const messageInput = $("#message, textarea[name='message'], textarea[data-name='message']", form) || $("textarea", form);
  let statusBox      = $("#form-status, .form-status, .response", form);
  if (!statusBox) {
    statusBox = document.createElement("div");
    statusBox.id = "form-status";
    statusBox.style.display = "none";
    statusBox.style.marginTop = "8px";
    form.appendChild(statusBox);
  }

  // Мягкая нормализация телефона при вводе:
  // - всегда принудительно префикс +7
  // - если начали с 8 — превращаем в +7
  // - только цифры, максимум 11 (7 + 10 цифр)
  if (phoneInput) {
    on(phoneInput, "input", () => {
      let digits = phoneInput.value.replace(/\D/g, "");
      if (digits.startsWith("8")) digits = "7" + digits.slice(1);
      if (!digits.startsWith("7")) digits = "7" + digits;
      digits = digits.slice(0, 11);
      phoneInput.value = "+" + digits;
    });

    // При фокусе, если поле пустое — подставить +7
    on(phoneInput, "focus", () => {
      const v = (phoneInput.value || "").trim();
      if (!v) phoneInput.value = "+7";
    });
  }

  const isPhoneValid = () => {
    const v = (phoneInput?.value || "").trim();
    return /^\+7\d{10}$/.test(v);
  };

  let controller = null;

  on(form, "submit", async (e) => {
    e.preventDefault(); // критично: не прыгать в начало страницы

    const submitBtn = $("button[type='submit'], .form-submit, #submit-btn, button", form);

    const name = (nameInput?.value || "").trim();
    const phone = (phoneInput?.value || "").trim();
    const msg = (messageInput?.value || "").trim();

    // Валидации
    if (!isPhoneValid()) {
      showInlineStatus(statusBox, "Введите корректный номер телефона в формате +7XXXXXXXXXX", "error");
      phoneInput?.focus();
      return;
    }
    if (!name) {
      showInlineStatus(statusBox, "Пожалуйста, укажите ваше имя", "error");
      nameInput?.focus();
      return;
    }
    if (!msg) {
      showInlineStatus(statusBox, "Напишите, пожалуйста, сообщение", "error");
      messageInput?.focus();
      return;
    }

    // Токен/чат — из формы (data-*) или глобала, или фолбэка
    const token  = form.getAttribute("data-bot-token") || getTelegramBotToken();
    const chatId = form.getAttribute("data-chat-id")  || getTelegramChatId();

    if (!token || token.includes("PASTE_YOUR_TELEGRAM_BOT_TOKEN_HERE") || !chatId || chatId.includes("PASTE_YOUR_TELEGRAM_CHAT_ID_HERE")) {
      showInlineStatus(statusBox, "Не задан токен бота или chat_id. Проверьте настройки ключей.", "error");
      return;
    }

    const text =
      `📩 Заявка с сайта\n` +
      `👤 Имя: ${name}\n` +
      `📱 Телефон: ${phone}\n` +
      `✉️ Сообщение: ${msg}`;

    // Блокировка кнопки
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
      if (!submitBtn.dataset._label) submitBtn.dataset._label = submitBtn.textContent;
      submitBtn.textContent = "Отправляем...";
    }

    // Отмена предыдущего запроса при повторной отправке
    if (controller) { try { controller.abort(); } catch(_){} }
    controller = new AbortController();

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: controller.signal
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Telegram API error: ${res.status} ${t}`);
      }

      showInlineStatus(statusBox, "Сообщение успешно отправлено! Я свяжусь с вами в ближайшее время.", "success");
      form.reset();
      if (phoneInput) phoneInput.value = "+7";
    } catch (err) {
      if (err && err.name === "AbortError") {
        showInlineStatus(statusBox, "Предыдущая отправка отменена. Повторите ещё раз.", "error");
      } else {
        console.error("[ContactForm] send error:", err);
        showInlineStatus(statusBox, "Ошибка при отправке. Проверьте интернет и попробуйте снова.", "error");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
        if (submitBtn.dataset._label) submitBtn.textContent = submitBtn.dataset._label;
      }
      controller = null;
    }
  });
})();

/* ====== ЯНДЕКС.КАРТЫ ====== */
(function initYandexMap() {
  // Если на странице нет контейнера карты — выходим тихо
  const mapEl =
    $("#map, #yandex-map, .yandex-map, [data-role='map']") ||
    document.getElementById("map");
  if (!mapEl) return;

  // Если скрипт уже подключён — ничего не делаем
  if ([...document.scripts].some((s) => s.src && s.src.includes("api-maps.yandex.ru/2.1"))) {
    // Когда готово — проинициализируем
    if (window.ymaps && window.ymaps.ready) {
      window.ymaps.ready(initMapInstance);
    } else {
      // на всякий случай подождём
      const t = setInterval(() => {
        if (window.ymaps && window.ymaps.ready) {
          clearInterval(t);
          window.ymaps.ready(initMapInstance);
        }
      }, 200);
    }
    return;
  }

  // Иначе — подключаем скрипт с ключом
  const KEY = getYandexApiKey();
  const src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${KEY ? "&apikey=" + encodeURIComponent(KEY) : ""}`;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.onerror = function () {
    console.warn("[Maps] Не удалось загрузить Яндекс.Карты");
  };
  s.onload = function () {
    if (window.ymaps && window.ymaps.ready) {
      window.ymaps.ready(initMapInstance);
    }
  };
  document.head.appendChild(s);

  // Базовая инициализация карты (координаты — примеры, замени на свои при необходимости)
  function initMapInstance() {
    if (!window.ymaps) return;
    try {
      const map = new ymaps.Map(mapEl, {
        center: [56.829805, 60.599889],
        zoom: 14,
        controls: ["zoomControl"]
      });

      const placemark = new ymaps.Placemark([56.829805, 60.599889], {
        balloonContent: "Тренер Семён Волкомуров"
      }, { preset: "islands#redDotIcon" });

      map.geoObjects.add(placemark);
    } catch (e) {
      console.error("[Maps] init error:", e);
    }
  }
})();
