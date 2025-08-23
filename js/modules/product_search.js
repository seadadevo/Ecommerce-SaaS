import { renderCardContent } from "./products.js";
import { getProductsFromFirebase } from "./products.js";
import { attachProductLinksEvents, attachAddCartEvents } from "./products.js";
let other_product_swiper3 = document.querySelector(".other_product_swiper3");
let paginationCounters = document.querySelector(".paginationPage .numbers");
let backwardPagination = document.querySelector(".fa-backward-step");
let forwardPagination = document.querySelector(".fa-forward-step");
let btns_add_cart = document.querySelectorAll(".btns_add_cart");
console.log(btns_add_cart);
let firebaseProdcuts = await getProductsFromFirebase();

let productsCount = firebaseProdcuts.length;
let currentIndex = 1;
let productsPerPage = 9;
let totalPages = Math.ceil(productsCount / productsPerPage);

function displayProducts(page) {
  let start = (page - 1) * productsPerPage;
  let end = start + productsPerPage;
  other_product_swiper3.innerHTML = "";
  firebaseProdcuts.slice(start, end).forEach((product) => {
    renderCardContent(other_product_swiper3, product);
  });
  document.querySelectorAll(".paginationPage .numbers p").forEach((el, idx) => {
    el.classList.toggle("active", idx + 1 === page);
    console.log(page);
  });

  attachProductLinksEvents();
  attachAddCartEvents();
}
displayProducts(currentIndex);

for (let i = 1; i <= totalPages; i++) {
  paginationCounters.innerHTML += `<p>${i}</p>`;
  if (i === 1)
    document
      .querySelectorAll(".paginationPage .numbers p")[0]
      .classList.add("active");
}

document.querySelectorAll(".paginationPage .numbers p").forEach((el, idx) => {
  el.addEventListener("click", () => {
    currentIndex = idx + 1;
    displayProducts(currentIndex);
  });
});

backwardPagination.addEventListener("click", () => {
  currentIndex = currentIndex === 1 ? totalPages : currentIndex - 1;
  displayProducts(currentIndex);
});

forwardPagination.addEventListener("click", () => {
  currentIndex = currentIndex === totalPages ? 1 : currentIndex + 1;
  displayProducts(currentIndex);
});
