import { db } from "../../js/firebaseConfig.js"
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let tbodyCont = document.querySelector('tbody')
let showMoreBtn = document.querySelector('.showMoreBtn')
let searchInput = document.querySelector('[type="search"]')

export const apiUrl = "https://dummyjson.com/products";

export let theAllData = []

export async function getAllData(Api = apiUrl) {
    try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef)
        const productLists = snapshot.docs.map(doc => doc.data());
        return productLists
    } catch (error) {
        console.error("Cannot fetching cards", error);
    }
}


let firebasData = await getAllData()

let end = 10;
let shrinkedData = firebasData.slice(0, end)

function renderTheData (thedata) {
     thedata.forEach(product => {
    let tr = document.createElement('tr')
    tr.innerHTML = `
        <td class="product_name">${product.title}</td>
        <td class="product_price">${product.price}$</td>
        <td class="product_image"><img width="100" src="${product.images[0]}" alt="#"></td>
        <td class="product_category">${product.category}</td>
        <td class="product_brand">${product.brand}</td>
        <td class="product_stock">${product.stock}</td>
        <td class="product_Edit"><a href="#" class="edit">Edit</a></td>
        <td class="product_update"><a href="#" class="delete">Delete</a></td>
    `
    tbodyCont.appendChild(tr)
});
}

renderTheData(shrinkedData)

showMoreBtn.addEventListener('click', () => {
    end += 5;
    shrinkedData = firebasData.slice(0, end)
    tbodyCont.innerHTML = ''
    renderTheData(shrinkedData)
})

searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase();
    const filterdData = firebasData.filter(product =>
        product.title.toLowerCase().includes(value)
    );
    tbodyCont.innerHTML = ''
    renderTheData(filterdData)
})


