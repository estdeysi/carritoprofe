// Funcionalidad del carrito
let cart = [];
let selectedColor = '';

// Elementos DOM
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

// Inicializar la aplicación
function init() {
    loadCart();
    setupEventListeners();
    updateCartUI();
}

// configurar oyentes de eventos
function setupEventListeners() {
    // Alternar carrito
    cartToggle.addEventListener('click', toggleCart);
    
    // Cerrar carrito
    closeCart.addEventListener('click', toggleCart);
    
    // Superposicion hacer click para cerrar el carrito
    overlay.addEventListener('click', toggleCart);
    
    // botones agregar al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCartHandler);
    });
    
    // seleccion del color
    document.querySelectorAll('.color-option').forEach(button => {
        button.addEventListener('click', selectColor);
    });
    
    // boton de pago
    checkoutBtn.addEventListener('click', checkout);
}

// Activar o desactivar la visibilidad del carrito
function toggleCart() {
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
}

// Manejar la selección de color
function selectColor(e) {
    const colorButton = e.target;
    
    // Eliminar la clase activa de todos los botones de este grupo
    const colorOptions = colorButton.parentElement.querySelectorAll('.color-option');
    colorOptions.forEach(btn => btn.classList.remove('active'));
    
    // Agregar clase activa al botón en el que se hizo clic
    colorButton.classList.add('active');
    
    // Guardar color seleccionado
    selectedColor = colorButton.getAttribute('data-color');
}

// Agregar al carrito de compras
function addToCartHandler(e) {
    const button = e.target;
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    
    // Obtener el color seleccionado o usar la primera opción como predeterminada
    const colorOptions = button.parentElement.querySelectorAll('.color-option');
    let color = selectedColor;
    
    if (!color && colorOptions.length > 0) {
        color = colorOptions[0].getAttribute('data-color');
        colorOptions[0].classList.add('active');
    }
    
    addToCart(id, name, price, color);
    
    // Mostrar notificación
    showNotification(`${name} agregado al carrito`);
}

// Añadir artículo al carrito
function addToCart(id, name, price, color) {
    // Comprobar si el artículo ya existe en el carrito
    const existingItemIndex = cart.findIndex(item => 
        item.id === id && item.color === color
    );
    
    if (existingItemIndex !== -1) {
        // Cantidad de incremento
        cart[existingItemIndex].quantity += 1;
    } else {
        // Agregar nuevo elemento
        cart.push({
            id,
            name,
            price,
            color,
            quantity: 1
        });
    }
    
    // Guardar carrito y actualizar la interfaz de usuario
    saveCart();
    updateCartUI();
    
    // Abrir el carrito si está cerrado
    if (!cartSidebar.classList.contains('open')) {
        toggleCart();
    }
}

// Quitar artículo del carrito
function removeFromCart(id, color) {
    cart = cart.filter(item => !(item.id === id && item.color === color));
    saveCart();
    updateCartUI();
}

// Actualizar cantidad de artículo
function updateQuantity(id, color, newQuantity) {
    const itemIndex = cart.findIndex(item => 
        item.id === id && item.color === color
    );
    
    if (itemIndex !== -1) {
        if (newQuantity <= 0) {
            removeFromCart(id, color);
        } else {
            cart[itemIndex].quantity = newQuantity;
            saveCart();
            updateCartUI();
        }
    }
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Cargar carrito desde localStorage
function loadCart() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Actualizar la interfaz de usuario del carrito
function updateCartUI() {
    // Actualizar el recuento de carritos
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar artículos del carrito
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItems.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío</p>';
    } else {
        emptyCartMessage.style.display = 'none';
        renderCartItems();
    }
    
    // Actualizar total
    updateCartTotal();
}

// Renderizar artículos del carrito
function renderCartItems() {
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="https://placeholder-image-service.onrender.com/image/60x60?prompt=Fashion%20product%20thumbnail&id=thumb-${item.id}" alt="Miniatura de ${item.name}">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-color">Color: ${item.color}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease" data-id="${item.id}" data-color="${item.color}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}" data-color="${item.color}">
                        <button class="quantity-btn increase" data-id="${item.id}" data-color="${item.color}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}" data-color="${item.color}">Eliminar</button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItemElement);
    });
    
    // Agregar detectores de eventos a los controles de cantidad
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const color = this.getAttribute('data-color');
            const item = cart.find(item => item.id === id && item.color === color);
            if (item) {
                updateQuantity(id, color, item.quantity - 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const color = this.getAttribute('data-color');
            const item = cart.find(item => item.id === id && item.color === color);
            if (item) {
                updateQuantity(id, color, item.quantity + 1);
            }
        });
    });
    
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const id = this.getAttribute('data-id');
            const color = this.getAttribute('data-color');
            const newQuantity = parseInt(this.value) || 1;
            updateQuantity(id, color, newQuantity);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const color = this.getAttribute('data-color');
            removeFromCart(id, color);
        });
    });
}

// Actualizar el total del carrito
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Proceso de pago
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos productos antes de finalizar la compra.');
        return;
    }
    
    const confirmed = confirm(`¿Estás seguro de que quieres finalizar tu compra por un total de ${cartTotal.textContent}?`);
    
    if (confirmed) {
        // En una aplicación real, esto redirigiría a una página de pago.
        // o procesar el pago. Para esta demostración, solo mostraremos un mensaje.
        alert('¡Compra realizada con éxito! Gracias por tu compra.');
        
        // Limpiar carrito
        cart = [];
        saveCart();
        updateCartUI();
        toggleCart();
    }
}

// Mostrar notificación
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.3s, transform 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    // animar en
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Animar y eliminar después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Inicializar la aplicación cuando se carga el DOM
document.addEventListener('DOMContentLoaded', init);