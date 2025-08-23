import { db } from "../firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { addToCart } from "../main.js";

const apiUrl = "https://dummyjson.com/products";

const hotDealsCont = document.getElementById("swiper_items_sale");

export let allData = [];

export const getData = async (Api = apiUrl) => {
  try {
    let firebaseProdcuts = await getProductsFromFirebase();
    if (firebaseProdcuts.length > 0) {
      allData = firebaseProdcuts;
    } else {
      const res = await fetch(Api);
      const data = await res.json();
      await saveProductsToFirebase(data.products);
      allData = data.products;
    }
    if(document.getElementById("swiper_items_sale")) {
      renderUi(allData);
      attachProductLinksEvents();
      attachAddCartEvents();
    }

    
  } catch (error) {
    console.error("Cannot fetching cards", error);
  }
};

async function saveProductsToFirebase(products) {
  const productsRef = collection(db, "products");
 
  for (let product of products) {
    const q = query(productsRef, where("externalId", "==", product.id));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      await addDoc(productsRef, {
        ...product,
        externalId: product.id,
        source: "dummyjson"
      });
    }
  }
}

async function getProductsFromFirebase() {
  const productsRef = collection(db, "products");
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map((doc) => (
    { id: doc.id,
       ...doc.data() })
  );
}

const renderUi = (data) => {
  const discountedProducts = data.filter((product) => {
    const new_price =
      product.price - (product.price * product.discountPercentage) / 100;

    product.old_price = product.price;
    product.price = Math.floor(new_price);

    return product.discountPercentage > 0;
  });

  const beautySec = data.filter((product) => product.category === "beauty");
  const fragrancesSec = data.filter(
    (product) => product.category === "fragrances"
  );
  const furnitureSec = data.filter(
    (product) => product.category === "furniture"
  );
  const groceriesSec = data.filter(
    (product) => product.category === "groceries"
  );

  discountedProducts.forEach((product) =>
    renderCardContent(hotDealsCont, product)
  );
  beautySec.forEach((product) =>
    renderCardContent(document.getElementById("swiper_beauty"), product)
  );
  fragrancesSec.forEach((product) =>
    renderCardContent(document.getElementById("swiper_fragrances"), product)
  );
  furnitureSec.forEach((product) =>
    renderCardContent(document.getElementById("swiper_furniture"), product)
  );
  groceriesSec.forEach((product) =>
    renderCardContent(document.getElementById("swiper_groceries"), product)
  );
};

const renderCardContent = (container, product) => {
  const percent_price = Math.floor(
    ((product.old_price - product.price) / product.old_price) * 100
  );
  const priceCon =
    percent_price && container == hotDealsCont
      ? ` <span class="sale_present">${percent_price}%</span>`
      : "";

  container.insertAdjacentHTML("beforeend", `
  <div class="swiper-slide product">
    ${priceCon}
    <div class="img_product">
        <a href="#">
          <img src="${product.images?.[0] || product.thumbnail}" alt="">
        </a>
    </div>
    <p class="name_product">
        <a class="product-link" data-id="${product.id}" href="product_details.html" target="_blank">
          ${product.title}
        </a>
    </p>
    <div class="price">
        <p><span>$${product.price}</span></p>
        <p class="old_price">${container == hotDealsCont && product.old_price ? product.old_price : ""}</p>
    </div>
    <div class="icons">
        <span class="btns_add_cart" data-id="${product.id}">
            <i class="fa-solid fa-cart-shopping"></i>
            Add To Cart
        </span>
    </div>
  </div>
`);

};

export function attachAddCartEvents() {
  const addButtons = document.querySelectorAll(".btns_add_cart")
  addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.hasAttribute("disabled")) return;
      const id = btn.dataset.id;
      addToCart(id, btn);
    });
  });
}

function attachProductLinksEvents() {
  document.querySelectorAll(".product-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const productId = e.currentTarget.dataset.id;
      localStorage.setItem("selectedProductId", productId);
    });
  });
}
