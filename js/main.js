import {
  getData,
  allData,
  attachAddCartEvents,
  renderCardContent,
} from "./modules/products.js";
import { db, auth } from "./firebaseConfig.js";
import {
  doc,
  updateDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const category_btn_menu = document.querySelector(".category_btn");
const category_nav_list = document.querySelector(".category_nav_list");
const cart = document.querySelector(".cart");
const nav_menu = document.querySelector(".nav_links");
const open_menu = document.querySelector(".open_menu");
const close_menu = document.querySelector(".close_menu");
const checkCart = document.querySelector(".items_in_cart1");
export const btn_cart_check = document.querySelector('.btn_cart_check');
const iconOpenCart = document.querySelector(".header_icons .iconOpen");
const iconCloseCart = document.querySelector(".top_cart .close_cart");

// ! Scroll to top Btn
const scrollBtn = document.getElementById("scrollTopBtn");

window.onscroll = function() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
};

scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// ! Some Open and Close 
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

export let products_cart = [];
const cart_items = document.getElementById("cart_items");
//  ! get user Data from users Collection
async function getUserData(uid) {
  const useRef = doc(db, "users", uid);
  const snap = await getDoc(useRef);
  if (snap.exists()) {
    return snap.data();
  } else {
    return null;
  }
}
// ! make an Authenticate for each User
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userData = await getUserData(user.uid);
    console.log("user data:, ", userData);
    products_cart = userData?.products_cart ?? [];

    displayItem();
    getTotalPrice();
    getCount();
    updateAddButtons();
    attachAddCartEvents();
  } else {
    products_cart = JSON.parse(localStorage.getItem("cart")) || [];
    console.log("Cart from localStorage:", products_cart);
    displayItem();
    getTotalPrice();
    getCount();
    updateAddButtons();
  }
});


window.addEventListener("load", async () => {
  await getData();
  displayItem();
  getTotalPrice();
  getCount();
  updateAddButtons();
  initaAuthUi();
});

export function updateAddButtons() {
  // const addButtons = document.querySelectorAll(".btns_add_cart");
  document.querySelectorAll(".btns_add_cart").forEach((btn) => {
    const productId = btn.dataset.id;
    const productInCart = products_cart.find(
      (product) => product.id == productId
    );
    if (productInCart) {
      btn.classList.add("active");
      btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>
                              Item In Cart`;
      console.log("add");
    } else {
      btn.classList.remove("active");
      btn.innerHTML = ` <i class="fa-solid fa-cart-shopping"></i>
                              Add To Cart`;
    }
  });
}

async function persistCart() {
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { products_cart });
  } else {
    localStorage.setItem("cart", JSON.stringify(products_cart));
  }
}

// ! Add To cart
export async function addToCart(id, btn) {
  const product = allData.find((p) => p.id == id);
  if (!product) {
    console.error("Product not found with ID:", id);
    return;
  }

  const existingIndex = products_cart.findIndex((p) => p.id == id);
  if (existingIndex === -1) {
    products_cart.push({ ...product, quantity: 1});

    
   await persistCart()
    if (btn) {
      btn.classList.add("active");
      btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item In Cart`;
    }
    displayItem();
    getTotalPrice();
    getCount();
  } else {
    console.log("product already in cart");
  }
}

// ! Display cards
export function displayItem() {
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

// ! remove card
async function removeFromCart(id) {
  const index = products_cart.findIndex((p) => p.id == id);
  if(index === -1) return;
    const removedProduct = products_cart[index];
    products_cart.splice(index, 1);
    await persistCart()

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

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete_item")) {
    const id = e.target.dataset.id;
    removeFromCart(id);
  }
});



// ! Increase Quantity
async function increaseItem(id, delta) {
  const item = products_cart.find((p) => p.id == id);
  if (!item) return;  
  if (item) {
    item.quantity += delta;
    await persistCart()
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
async function decreaseItem(id, delta = -1) {
  const item = products_cart.find((p) => p.id == id);
 if (!item) return;

  if (item.quantity > 1) {
    item.quantity += delta;
    await persistCart()
    displayItem();
    getTotalPrice();
    getCount();
  } else if (item.quantity === 1) {
    await removeFromCart(id);
    return;
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
export function getTotalPrice() {
  let total = 0;
  for (let i = 0; i < products_cart.length; i++) {
    total += products_cart[i].price * products_cart[i].quantity;
  }
  price_cart_total.textContent = `$${total.toFixed(2)}`;
}

// ! Get Count
const count_item_header = document.querySelector(".count_item_header");
const Count_item_cart = document.querySelector(".Count_item_cart");
export function getCount() {
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

function initaAuthUi() {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const signupBtn = document.getElementById("signupBtn");
  loginBtn.style.display = "none";
  logoutBtn.style.display = "none";
  signupBtn.style.display = "none";
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
    }
  });

  logoutBtn.addEventListener("click", () => {
    signOut(auth)
      .then(() => {
        console.log("user signed out");
        products_cart = [];
        localStorage.removeItem("cart");
        displayItem();
        getTotalPrice();
        getCount();
        updateAddButtons();
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

// ! Search
let searchInput = document.querySelector('[name="search"]');
let submitSearch = document.querySelector('[type="submit"]');

export function makeSearch() {
  if (submitSearch && searchInput) {
    submitSearch.addEventListener('click', (e) => {
      e.preventDefault();
  
      const inputValue = searchInput.value.trim();
      if (!inputValue) return;
  
      const theProductSearch = allData.filter((product) =>
        product.title.toLowerCase().includes(inputValue.toLowerCase())
      );
  
      localStorage.setItem("searchResults", JSON.stringify(theProductSearch));
      localStorage.setItem('searchQuery', inputValue);
      window.location.href = "products.html";
    });
  }
}
makeSearch();

// ! Start CheckOut Operation 
//btn_cart_check
export async function checkoutCart(btn_cart_check, price_cart_total, displayItem, getTotalPrice, getCount, updateAddButtons) {
  if (!btn_cart_check) return;
  btn_cart_check.addEventListener('click', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      Swal.fire({ icon: 'info', title: 'Please login first', confirmButtonText: 'OK' });
      return;
    }

    const userId = user.uid;
    const userRef = doc(db, 'users', userId);

    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        Swal.fire({ icon: 'error', title: 'User data not found!', confirmButtonText: 'OK' });
        return;
      }

      const userData = userSnap.data();
      const cartItems = userData.products_cart || [];
      if (cartItems.length === 0) {
        Swal.fire({ icon: 'info', title: 'Your cart is empty!', confirmButtonText: 'OK' });
        return;
      }

      const totalPrice = Number(price_cart_total.textContent.replace("$", ""));

      await addDoc(collection(db, "orders"), {
        userId,
        products: cartItems,
        total: totalPrice,
        status: "pending",
        createdAt: serverTimestamp()
      });

      await updateDoc(userRef, { products_cart: [] });
      displayItem();
      getTotalPrice();
      getCount();
      updateAddButtons();

      Swal.fire({ icon: 'success', title: 'Order placed successfully!', confirmButtonText: 'OK' });
      setTimeout(() => window.location.reload(), 1000);

    } catch (err) {
      console.error("Error at checkout:", err);
      Swal.fire({ icon: 'error', title: 'Failed to place order.', text: err.message, confirmButtonText: 'OK' });
    }
  });
}
checkoutCart(btn_cart_check, price_cart_total, displayItem, getTotalPrice, getCount, updateAddButtons)