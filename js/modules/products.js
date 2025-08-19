import { db } from "../firebaseConfig.js";
import { collection, addDoc, getDocs, query, where } 
  from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const apiUrl = "https://dummyjson.com/products";
const hotDealsCont =  document.getElementById("swiper_items_sale") 

export let all_json_data = [];
export const getData = async (Api = apiUrl) => {
  try {
     //  ['beauty', 'fragrances', 'furniture', 'groceries']
     const firebaseProdcuts = await getProductsFromFirebase()
     if(firebaseProdcuts.length > 0){
       all_json_data = firebaseProdcuts; 
       renderUi(all_json_data);
     } else {
      const res = await fetch(Api);
      const data = await res.json()
      await saveProductsToFirebase(data.products)
      all_json_data = data.products;
      renderUi(all_json_data);
     }
  } catch (error) {
    console.error("Cannot fetching cards", error);
  }
};


async function saveProductsToFirebase(products) {
  const productsRef = collection(db, "products");

  for (let product of products) {
    const q = query(productsRef, where('id', '==', product.id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(productsRef, product);
    }
  }
}

async function getProductsFromFirebase() {
  const productsRef = collection(db, 'products')
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map((doc) => ({id: doc.data().id, ...doc.data()}))
}

const renderUi = (data) => {
  
  const discountedProducts = data.filter((product) => {
  const new_price = product.price - (product.price * product.discountPercentage / 100);

  product.old_price = product.price;   
  product.price = Math.floor(new_price); 

  return product.discountPercentage > 0;
});

  const beautySec = data.filter(
    (product) => product.category === "beauty"
  );
  const fragrancesSec = data.filter(
    (product) => product.category === "fragrances"
  );
  const furnitureSec = data.filter((product) => product.category === "furniture");
  const groceriesSec = data.filter((product) => product.category === "groceries");

  discountedProducts.forEach((product) =>
    renderCardContent(hotDealsCont, product)
  ); 
  beautySec.forEach((product) =>
    renderCardContent(document.getElementById("swiper_electronics"), product)
  );
  fragrancesSec.forEach((product) =>
    renderCardContent(document.getElementById("swiper_appliances"), product)
  );
  furnitureSec.forEach((product) =>
    renderCardContent(document.getElementById("swiper_mobiles"), product)
  );
};


const renderCardContent = (container, product) => {
  const percent_price = Math.floor(
    ((product.old_price - product.price) / product.old_price) * 100
  );
  const priceCon = percent_price && container == hotDealsCont
    ? ` <span class="sale_present">${percent_price}%</span>`
    : "";

  container.innerHTML += `
    <div class="swiper-slide product">
      ${priceCon}
      <div class="img_product">
          <a href="#" onclick="saveProductDetails(${product.id})">
            <img src="${product.images[0]}" alt="">
          </a>
      </div>
      <p class="name_product">
          <a href="product.html" target="_blank" onclick="saveProductDetails(${product.id})">
            ${product.title}
          </a>
      </p>
      <div class="price">
          <p><span>$${product.price}</span></p>
          <p class="old_price">${container == hotDealsCont && product.old_price ? product.old_price : ""}</p>
      </div>
      <div class="icons">
          <span  class="btns_add_cart" data-id=${product.id}>
              <i class="fa-solid fa-cart-shopping"></i>
              Add To Cart
          </span>
      </div>
    </div>
  `;
};


export function saveProductDetails(productId) {
  const product = all_json_data.find((p) => p.id === productId);
  localStorage.setItem("selectedProduct", JSON.stringify(product));
}
