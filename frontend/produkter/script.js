const purify = DOMPurify.sanitize;
let products = JSON.parse(sessionStorage.getItem('products')) || null;

async function getProducts() {
    const response = await fetch('http://localhost:3000/api/products')
    if (!response.ok)
        throw new Error('Failed to fetch products')

    return await response.json();
}

function navigateToCheckout(productId) {
    window.location.href = `/checkout/index.html?productId=${productId}`
}

const productCardComponent = ({ name, price, description, image, id }) => {
    const element = document.createElement('article')

    element.classList.add('item__card')
    element.innerHTML = `
        <img class="item__img" src="${purify(image)}" alt="${purify(name)}">
        <h2 class="item__title">${purify(name)}</h2>
        <p class="item__desc">${purify(description)}</p>
        <p class="item__price">${purify(price)},-</p>
        <button class="item__btn" onclick="navigateToCheckout(${purify(id)})">Køb nu</button>
    `
    return element
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!products) {
        products = await getProducts();
        sessionStorage.setItem('products', JSON.stringify(products))
    }
    const productsContainer = document.querySelector('.item__list')

    const loader = document.querySelectorAll('.loader')

    sessionStorage.setItem('products', JSON.stringify(products))

    products.forEach(product => {
        productsContainer.appendChild(productCardComponent(product))
    })

    loader.forEach(loader => {
        loader.remove();
    });
})