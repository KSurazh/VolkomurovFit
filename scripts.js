/* =========================================================
   VolkomurovFit — клиентские скрипты
   - Бургер-меню (mobile)
   - Переключатель темы (auto/dark/light)
   - Контактная форма (Telegram)
   - Загрузка и инициализация Яндекс.Карт
   ---------------------------------------------------------

/* ====== КОНФИГ (замените значения на свои при необходимости) ====== */
const TELEGRAM_BOT_TOKEN_FALLBACK = "8264991850:AAFsRTvk2-YI005iLiuSS5MtS8Wc9sRsVsY";
const TELEGRAM_CHAT_ID_FALLBACK   = "-1004851383447";
const YANDEX_MAPS_API_KEY_FALLBACK = "6dca7c55-faf3-42a1-abf8-c8af616e421e";

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

/* ===========================
   БУРГЕР-МЕНЮ
=========================== */
document.addEventListener("DOMContentLoaded", function () {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("active");
      burger.classList.toggle("toggle");
    });
  }
});

/* ===========================
   ОТПРАВКА ФОРМЫ В TELEGRAM
=========================== */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector("button[type=submit]");
      if (!submitBtn) return;

      // Блокируем кнопку на время отправки
      submitBtn.disabled = true;
      submitBtn.textContent = "Отправка...";

      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const message = document.getElementById("message").value.trim();

      // Валидация телефона: +7 и ещё 10 цифр
      const phoneRegex = /^\+7\d{10}$/;
      if (!phoneRegex.test(phone)) {
        alert("Введите корректный номер телефона в формате +79001112233");
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить";
        return;
      }

      const token = "8264991850:AAFsRTvk2-YI005iLiuSS5MtS8Wc9sRsVsY"; // не удаляй — заменишь на свой
      const chatId = "5014033845";   // не удаляй — заменишь на свой

      const text = `📩 Новая заявка:\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n💬 Сообщение: ${message}`;

      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: "HTML",
          }),
        });

        if (res.ok) {
          alert("Спасибо! Ваша заявка успешно отправлена.");
          form.reset();
        } else {
          alert("Ошибка при отправке. Попробуйте ещё раз.");
        }
      } catch (err) {
        console.error(err);
        alert("Ошибка соединения. Попробуйте ещё раз.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить";
      }
    });
  }
});

/* ===========================
   КАРТА ЯНДЕКС
=========================== */
function initMap() {
  if (typeof ymaps === "undefined") return;
  ymaps.ready(function () {
    const map = new ymaps.Map("map", {
      center: [56.829805, 60.599889], // Корректные данные
      zoom: 16, // увеличил масштаб (по умолчанию было 12–13)
    });

    const placemark = new ymaps.Placemark(map.getCenter(), {
      balloonContent: "Тренер Семён Волкомуров",
    });

    map.geoObjects.add(placemark);
  });
}
initMap();

/* ===========================
   КНОПКА ОПЛАТЫ
=========================== */
document.addEventListener("DOMContentLoaded", function () {
  const payBtn = document.querySelector("#payButton");
  if (payBtn) {
    payBtn.addEventListener("click", function () {
      window.location.href = "https://pay.alfabank.ru/some-link"; // вставишь свою ссылку
    });
  }
});

/* ===========================
   ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ
=========================== */
// Работает с CSS: [data-theme="dark"] { ... }
(() => {
  const BTN_SELECTORS = "#theme-toggle, #themeToggle, [data-role='theme-toggle']";
  const STORAGE_KEY = "theme-mode"; // 'auto' | 'dark' | 'light'
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  const btn = document.querySelector(BTN_SELECTORS);

  const getMode = () => localStorage.getItem(STORAGE_KEY) || "auto";
  const isSysDark = () => (mq ? mq.matches : false);

  const apply = (mode) => {
    const html = document.documentElement;
    const useDark = mode === "dark" || (mode === "auto" && isSysDark());

    if (useDark) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }

    const meta = document.querySelector('meta[name="theme-color"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "theme-color");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute("content", useDark ? "#121212" : "#ffffff");

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

  const init = () => apply(getMode());
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const cur = getMode();
      const next = cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto";
      setMode(next);
    });
  }

  if (mq) {
    mq.addEventListener
      ? mq.addEventListener("change", () => { if (getMode() === "auto") apply("auto"); })
      : mq.addListener && mq.addListener(() => { if (getMode() === "auto") apply("auto"); });
  }
})();
