const purify = DOMPurify.sanitize;

document.addEventListener('DOMContentLoaded', pageHasLoaded);
const queryParams = new URLSearchParams(window.location.search);
let products = sessionStorage.getItem('products') ? JSON.parse(sessionStorage.getItem('products')) : null;

async function fetchProducts() {
    const response = await fetch('http://localhost:3000/api/products')
    if (!response.ok)
        throw new Error('Failed to fetch products')

    // Simulate slow network (to show loader)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return await response.json();
}

async function placeOrder(e) {
    e.preventDefault();
    const productId = queryParams.get('productId');
    const formElement = document.querySelector('.pay__form form');
    if (!formElement || !productId)
        return;

    const {name} = products.find(x => x.id == productId);

    const ordererName = formElement.querySelector('input[name="name"]').value;
    const ordererEmail = formElement.querySelector('input[name="email"]').value;
    
    // Validate orderer name and email, name and email should not be empty
    if ([ordererName, ordererEmail].some(x => x == null || x == '')) {
        alert('Please enter your name and email');
        return;
    }

    const order = {
        name: ordererName,
        email: ordererEmail,
        productId: Number(productId)
    };

    const createOrderResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    });

    if (!createOrderResponse.ok)
        throw new Error('Failed to create order');

    replaceFormWithSuccess(ordererName, name);
}

function replaceFormWithSuccess(ordererName, productName) {
    const formParent = document.querySelector('.pay__form');
    if (!formParent)
        return;

    formParent.innerHTML = `
        <h1 class="order__success">Yay! Tak for din ordre, ${ordererName}</h1>
        <p class="order__success-desc">Tak for dit køb af <b>${productName}</b>. Din ordre er allerede i gang med at blive behandlet og vil blive afsendt fra vores lager inden for 1-2 hverdage.</p>        
    `;
}

const productCardComponent = ({ name, price, description, image }) => {
    const element = document.createElement('article')

    element.classList.add('item__card')
    element.innerHTML = `
        <img class="item__img" src="${purify(image)}" alt="${purify(name)}">
        <h2 class="item__title">${purify(name)}</h2>
        <p class="item__desc">${purify(description)}</p>
        <p class="item__price">${purify(price)},-</p>
    `

    return element
}

async function loadProductCard() {
    const productId = queryParams.get('productId');
    if (!productId)
        return;
        
    const product = products.find(x => x.id == productId);
    if (!product)
        return;
        
    const orderView = document.querySelector('.order__view');
    if (!orderView)
        return;

    orderView.appendChild(productCardComponent(product));
}

async function pageHasLoaded() {
    if (!products){
        const orderView = document.querySelector('.order__view');
        if (!orderView)
            return;

        orderView.innerHTML = '<div class="loader"><div></div></div>';
        products = await fetchProducts();

        orderView.innerHTML = '';
    }

    loadProductCard();
    document.getElementsByClassName('place_order_btn')[0].addEventListener('click', placeOrder);
}