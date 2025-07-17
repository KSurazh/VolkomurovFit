// Мобильное меню
const menuBtn = document.getElementById('mobileMenuBtn');
const nav = document.getElementById('mainNav');

menuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
});

// Закрытие меню при клике на ссылку
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Прокрутка к форме оплаты
const headerPaymentBtn = document.getElementById('headerPaymentBtn');
headerPaymentBtn.addEventListener('click', () => {
    document.getElementById('payment-form').scrollIntoView({
        behavior: 'smooth'
    });
});

// Выбор услуги
const serviceCards = document.querySelectorAll('.service-card');
const serviceSelect = document.getElementById('service');
const amountInput = document.getElementById('amount');

// Обработчики для карточек услуг
serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        // Убираем выделение со всех карточек
        serviceCards.forEach(c => c.classList.remove('active'));
        
        // Добавляем выделение текущей карточке
        card.classList.add('active');
        
        // Получаем данные из карточки
        const service = card.dataset.service;
        const price = card.dataset.price;
        
        // Устанавливаем значения в форму
        serviceSelect.value = service;
        amountInput.value = `${price} ₽`;
    });
});

// Обработчик для выпадающего списка
serviceSelect.addEventListener('change', () => {
    // Убираем выделение со всех карточек
    serviceCards.forEach(c => c.classList.remove('active'));
    
    // Если выбрана услуга, находим соответствующую карточку
    if (serviceSelect.value) {
        const selectedCard = document.querySelector(`.service-card[data-service="${serviceSelect.value}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
    }
    
    // Обновляем сумму
    updateAmount();
});

// Функция обновления суммы
function updateAmount() {
    switch(serviceSelect.value) {
        case 'single':
            amountInput.value = '2150 ₽';
            break;
        case 'package':
            amountInput.value = '10000 ₽';
            break;
        case 'plan':
            amountInput.value = '7000 ₽';
            break;
        default:
            amountInput.value = '';
    }
}

// Отправка формы оплаты
const paymentForm = document.getElementById('paymentForm');
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Здесь должна быть интеграция с платежной системой
    const service = serviceSelect.value;
    const amount = amountInput.value;
    
    alert(`Вы выбрали: ${service}\nСумма к оплате: ${amount}\nПеренаправляем на страницу оплаты...`);
    
    // В реальном проекте здесь будет перенаправление
    // window.location.href = 'https://payment-gateway.com';
});

// Отправка формы в Telegram
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const phone = document.getElementById('contact-phone').value;
    const message = document.getElementById('message').value;
    
    // Здесь нужно заменить на ваши данные
    const botToken = 'YOUR_BOT_TOKEN';
    const chatId = 'YOUR_CHAT_ID';
    
    const text = `Новая заявка от ${name}%0AТелефон: ${phone}%0AСообщение: ${message}`;
    
    if(botToken && chatId) {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${text}`, {
            method: 'GET'
        })
        .then(response => {
            if (response.ok) {
                alert('Сообщение отправлено! Я свяжусь с вами в ближайшее время.');
                contactForm.reset();
            } else {
                alert('Ошибка при отправке. Пожалуйста, позвоните по телефону.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ошибка при отправке. Пожалуйста, позвоните по телефону.');
        });
    } else {
        alert('Сообщение отправлено! Я свяжусь с вами в ближайшее время.');
        contactForm.reset();
    }
});

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
            
            // Закрытие мобильного меню
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// Инициализация Яндекс.Карты
function initYandexMap() {
    if (typeof ymaps === 'undefined') return;
    
    ymaps.ready(function() {
        // Координаты фитнес-клуба (Екатеринбург, ул. 8 марта, 46)
        const clubCoordinates = [56.8378, 60.5970];
        
        // Создание карты
        const map = new ymaps.Map('map', {
            center: clubCoordinates,
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl']
        });
        
        // Создание метки
        const placemark = new ymaps.Placemark(clubCoordinates, {
            hintContent: 'Фитнес-клуб "Green Fitness"',
            balloonContent: 'г. Екатеринбург, ул. 8 марта, 46'
        }, {
            iconLayout: 'default#image',
            iconImageHref: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -40]
        });
        
        // Добавляем метку на карту
        map.geoObjects.add(placemark);
        
        // Дополнительные настройки карты
        map.behaviors.disable('scrollZoom');
    });
}

// Инициализация карты после загрузки страницы
window.addEventListener('load', initYandexMap);
