import { getData, all_json_data } from "./modules/products.js";
import { auth } from "./firebaseConfig.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// import { btns_add_cart } from "./product_details.js";

const category_btn_menu = document.querySelector(".category_btn");
const category_nav_list = document.querySelector(".category_nav_list");
const cart = document.querySelector(".cart");
const nav_menu = document.querySelector(".nav_links");
const open_menu = document.querySelector(".open_menu");
const close_menu = document.querySelector(".close_menu");
const checkCart = document.querySelector(".items_in_cart1");

const iconOpenCart = document.querySelector(".header_icons .iconOpen");
const iconCloseCart = document.querySelector(".top_cart .close_cart");

category_btn_menu.addEventListener("click", () => {
  category_nav_list.classList.toggle("active");
});
open_menu.addEventListener("click", () => {
  nav_menu.classList.add("active");
});
close_menu.addEventListener("click", () => {
  nav_menu.classList.remove("active");
});

iconOpenCart.addEventListener("click", () => {
  cart.classList.add("active");
});
iconCloseCart.addEventListener("click", () => {
  cart.classList.remove("active");
});

const cart_items = document.getElementById("cart_items");
export let products_cart = JSON.parse(localStorage.getItem("cart")) || [];
console.log(products_cart);

window.addEventListener("load", async () => {
  await getData();
  displayItem();
  getTotalPrice();
  getCount();
  updateAddButtons();
  authIn()
});

function updateAddButtons() {
  const addButtons = document.querySelectorAll(".btns_add_cart");
  addButtons.forEach((btn) => {
    const productId = btn.dataset.id;
    const productInCart = products_cart.find(
      (product) => product.id == productId
    );
    if (productInCart) {
      btn.classList.add("active");
      btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>
                              Item In Cart`;
                              console.log('add')
    } else {
      btn.classList.remove("active");
      btn.innerHTML = ` <i class="fa-solid fa-cart-shopping"></i>
                              Add To Cart`;
    }
  });
}

// ! Add To cart
export function addToCart(id, btn) {
  const product = all_json_data.find((p) => p.id == id);
  products_cart.push({ ...product, quantity: 1 });

  // console.log(products_cart);
  localStorage.setItem("cart", JSON.stringify(products_cart));

  btn.classList.add("active");
  btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item In Cart`;

  displayItem();
  getTotalPrice();
  getCount();
}

// document.addEventListener("click", (e) => {
//   if (e.target.classList.contains("btns_add_cart")) {
//     if (e.target.hasAttribute("disabled")) return;
//     const btn = e.target;
//     const id = btn.dataset.id;
//     addToCart(id, btn);
//   }
// });
// ! Display cards
function displayItem() {
  let item_c = "";
  if (products_cart.length === 0) {
    item_c = `<p class="empty-cart">Your cart is empty</p>`;
  }
  for (let i = 0; i < products_cart.length; i++) {
    const imageUrl =
      products_cart[i].images?.[0] ||
      products_cart[i].thumbnail ||
      "https://unsplash.com/photos/full-moon-in-a-gradient-pink-and-purple-sky-Wg3-Sh7Zh9w";

    item_c += `
      <div class="item_cart">
        <img src="${imageUrl}" alt="${products_cart[i].title}">
        <div class="content">
          <h4>${products_cart[i].title}</h4>
          <p class="price_cart">$${products_cart[i].price}</p>
          <div class="quantity_control" data-id="${products_cart[i].id}">
            <button data-id="${products_cart[i].id}" class="decrease_quantity">-</button>
            <span class="quantity">${products_cart[i].quantity}</span>
            <button data-id="${products_cart[i].id}" class="increase_quantity">+</button>
          </div>
        </div>
        <button><i data-id="${products_cart[i].id}" class="delete_item fa-solid fa-trash-can"></i></button>
      </div>
    `;
  }

  if (cart_items) cart_items.innerHTML = item_c;
  if (checkCart) checkCart.innerHTML = item_c;
}

// ! delete card
function removeFromCart(id) {
  const index = products_cart.findIndex((p) => p.id == id);
  if (index !== -1) {
    const removedProduct = products_cart[index];
    products_cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(products_cart));

    const addButtons = document.querySelectorAll(".btns_add_cart");
    addButtons.forEach((btn) => {
      if (btn.dataset.id == removedProduct.id) {
        btn.classList.remove("active");
        btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add To Cart`;
      }
    });

    displayItem();
    getTotalPrice();
    getCount();
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete_item")) {
    const id = e.target.dataset.id;
    removeFromCart(id);
  }
});

// ! Increase Quantity
function increaseItem(id, delta) {
  const item = products_cart.find((p) => p.id == id);
  if (item) {
    console.log("quantity: ", item.quantity);
    item.quantity += delta;
    localStorage.setItem("cart", JSON.stringify(products_cart));
    displayItem();
    getTotalPrice();
    getCount();
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("increase_quantity")) {
    const id = e.target.dataset.id;
    increaseItem(id, 1);
  }
});
// ! Decrease Quantity
function decreaseItem(id, delta) {
  const item = products_cart.find((p) => p.id == id);
  const index = products_cart.findIndex((p) => p.id == id);
  if (item && item.quantity > 1) {
    item.quantity += delta;
    localStorage.setItem("cart", JSON.stringify(products_cart));
    displayItem();
    getTotalPrice();
    getCount();
  } else if (item.quantity === 1) {
    removeFromCart(id);
  }
}
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("decrease_quantity")) {
    const id = e.target.dataset.id;
    decreaseItem(id, -1);
  }
});

// ! Get Total Price
const price_cart_total = document.querySelector(".price_cart_total");
function getTotalPrice() {
  let total = 0;
  for (let i = 0; i < products_cart.length; i++) {
    total += products_cart[i].price * products_cart[i].quantity;
  }
  price_cart_total.textContent = `$${total}`;
}

// ! Get Count
const count_item_header = document.querySelector(".count_item_header");
const Count_item_cart = document.querySelector(".Count_item_cart");
function getCount() {
  count_item_header.textContent = products_cart.length;
  Count_item_cart.textContent = products_cart.length;
}

let lastScrollTop = 0;
const bottomHeader = document.querySelector(".bottom-header");
const header = document.querySelector("header");

function handleScroll() {
  const currentScroll =
    window.pageYOffset || document.documentElement.scrollTop;
  if (currentScroll > lastScrollTop) {
    bottomHeader.classList.add("hide");
    header.classList.add("hide");
  } else {
    bottomHeader.classList.remove("hide");
    header.classList.remove("hide");
  }
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

const mediaQuery = window.matchMedia("(min-width: 1025px)");

window.addEventListener("scroll", handleScroll);

// ! User Status

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const signupBtn = document.getElementById("signupBtn");
loginBtn.style.display = "none";
logoutBtn.style.display = "none";
signupBtn.style.display = "none";


function authIn() {
  
  onAuthStateChanged(auth, (user) => {
  const addButtons = document.querySelectorAll(".btns_add_cart");
  if (user) {
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "block";
    addButtons.forEach((btn) => {
      btn.removeAttribute("disabled");
    });
  } else {
    loginBtn.style.display = "block";
    signupBtn.style.display = "block";
    logoutBtn.style.display = "none";

    addButtons.forEach((btn) => {
      btn.setAttribute("disabled", true);
    });
    cart_items.innerHTML = `You can't add items please login First`;
    localStorage.removeItem('cart')
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("User signed out");
    })
    .catch((error) => {
      console.error(error);
    });
});
}