// Мобильное меню
const menuBtn = document.getElementById('mobileMenuBtn');
const nav = document.getElementById('mainNav');

menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('active');
    document.body.classList.toggle('menu-open', isOpen);
});

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
});

// Прокрутка к форме оплаты
const headerPaymentBtn = document.getElementById('headerPaymentBtn');
headerPaymentBtn.addEventListener('click', () => {
    document.getElementById('services').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    setTimeout(() => {
        document.getElementById('payment-form').scrollIntoView({
            behavior: 'smooth'
        });
    }, 500);
});

// Выбор услуги
const serviceCards = document.querySelectorAll('.service-card');
const serviceSelect = document.getElementById('service');
const amountInput = document.getElementById('amount');

serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        serviceCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        
        const service = card.dataset.service;
        const price = card.dataset.price;
        
        serviceSelect.value = service;
        amountInput.value = `${parseInt(price).toLocaleString('ru-RU')} ₽`;
    });
});

function updateAmount() {
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const price = selectedOption ? selectedOption.text.match(/\d+[\s\d]*/)?.[0] : '';
    amountInput.value = price ? `${price} ₽` : '';
}

serviceSelect.addEventListener('change', () => {
    serviceCards.forEach(c => c.classList.remove('active'));
    
    if (serviceSelect.value) {
        const selectedCard = document.querySelector(`.service-card[data-service="${serviceSelect.value}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
    }
    updateAmount();
});

// Отправка формы оплаты
const paymentForm = document.getElementById('paymentForm');
paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert(`Перенаправляем на страницу оплаты...`);
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    updateAmount();
    if (serviceCards.length > 0) {
        serviceCards[0].click();
    }
});

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });
});

// Инициализация Яндекс.Карты
function initYandexMap() {
    if (typeof ymaps === 'undefined') return;
    
    ymaps.ready(function() {
        const clubCoordinates = [56.8378, 60.5970];
        const map = new ymaps.Map('map', {
            center: clubCoordinates,
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl']
        });
        
        map.behaviors.disable('scrollZoom');
        
        const placemark = new ymaps.Placemark(clubCoordinates, {}, {
            iconLayout: 'default#image',
            iconImageHref: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -40]
        });
        
        map.geoObjects.add(placemark);
    });
}

window.addEventListener('load', initYandexMap);
