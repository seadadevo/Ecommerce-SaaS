import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { addToCart, products_cart } from "./main.js";


const productTitle = document.getElementById("productTitle");
const productDescription = document.getElementById("productDescription");
const productPrice = document.getElementById("productPrice");
const productOldPrice = document.getElementById("productOldPrice");
const productImage = document.getElementById("productImage");
const btns_add_cart = document.querySelector(".btn-buy");

let currentUser = null;
let currentProductId = null;

async function loadProductDetails() {
  currentProductId = localStorage.getItem("selectedProductId");
  console.log("Selected ID:", currentProductId);

  if (!currentProductId) return;

  const productsRef = collection(db, "products");
  const q = query(productsRef, where("id", "==", Number(currentProductId)));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const product = snapshot.docs[0].data();
    console.log("Product found:", product);

    productTitle.textContent = product.title;
    productDescription.textContent = product.description;
    productPrice.textContent = "$" + product.price;
    productOldPrice.textContent = "$" + (product.old_price ?? "");
    productImage.src = product.images[0];

    if (btns_add_cart) {
      btns_add_cart.setAttribute("data-id", currentProductId);

      btns_add_cart.addEventListener("click", () => {
        if (btns_add_cart.hasAttribute("disabled")) {
          return;
        }
        addToCart(currentProductId, btns_add_cart);
        updateAddToCartButton(currentProductId, currentUser);
      });

      updateAddToCartButton(currentProductId, currentUser);
    }
  } else {
    console.log("No such product!");
  }
}

function updateAddToCartButton(productId, user) {
  if (!btns_add_cart) return;

  const productInCart = products_cart.find(
    (product) => product.id == productId
  );

  if (!user) {
    btns_add_cart.setAttribute("disabled", true);
    btns_add_cart.innerHTML = `<i class="fa-solid fa-user"></i> Login to Add`;
    return;
  }

  if (productInCart) {
    btns_add_cart.setAttribute("disabled", true);
    btns_add_cart.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item In Cart`;
  } else {
    btns_add_cart.removeAttribute("disabled");
    btns_add_cart.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add To Cart`;
  }
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateAddToCartButton(currentProductId, currentUser);
});

loadProductDetails();
