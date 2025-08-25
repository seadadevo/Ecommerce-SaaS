import { makeSearch } from "../main.js";
import { renderCardContent } from "./products.js";
import { getProductsFromFirebase } from "./products.js";
import { attachProductLinksEvents, attachAddCartEvents } from "./products.js";
import { updateAddButtons } from "../main.js";
let other_product_swiper3 = document.querySelector(".other_product_swiper3");
let paginationCounters = document.querySelector(".paginationPage .numbers");
let backwardPagination = document.querySelector(".fa-backward-step");
let forwardPagination = document.querySelector(".fa-forward-step");
let paginationContainer = document.querySelector(".paginationPage");

let firebaseProducts = await getProductsFromFirebase();
let searchResults = JSON.parse(localStorage.getItem("searchResults")) || [];
let searchInputValue = localStorage.getItem('searchQuery') || "";

if (searchResults.length > 0) {
    localStorage.removeItem("searchResults");
    localStorage.removeItem("searchQuery");
}

let productsToDisplay = searchResults.length > 0 ? searchResults : firebaseProducts;
let productsCount = productsToDisplay.length;
let currentIndex = 1;
let productsPerPage = 9;
let totalPages = Math.ceil(productsCount / productsPerPage);

if (searchResults.length > 0) {
    if (paginationContainer) {
        paginationContainer.style.display = "none";
    }
} else {
    if (paginationContainer) {
        paginationContainer.style.display = "flex";
    }
}

function displayProducts(page) {
    if (!other_product_swiper3) return;
    
    let start = (page - 1) * productsPerPage;
    let end = start + productsPerPage;
    other_product_swiper3.innerHTML = "";
    
    productsToDisplay.slice(start, end).forEach((product) => {
        renderCardContent(other_product_swiper3, product);
    });
    
    if (paginationCounters && searchResults.length === 0) {
        document.querySelectorAll(".paginationPage .numbers p").forEach((el, idx) => {
            el.classList.toggle("active", idx + 1 === page);
        });
    }
    updateAddButtons()
    attachProductLinksEvents();
    attachAddCartEvents();
}

if (searchResults.length === 0) {
    paginationCounters.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        paginationCounters.innerHTML += `<p>${i}</p>`;
    }

    if (paginationCounters.children.length > 0) {
        paginationCounters.children[0].classList.add("active");
    }

    document.querySelectorAll(".paginationPage .numbers p").forEach((el, idx) => {
        el.addEventListener("click", () => {
            currentIndex = idx + 1;
            displayProducts(currentIndex);
        });
    });

    if (backwardPagination) {
        backwardPagination.addEventListener("click", () => {
            currentIndex = currentIndex === 1 ? totalPages : currentIndex - 1;
            displayProducts(currentIndex);
        });
    }

    if (forwardPagination) {
        forwardPagination.addEventListener("click", () => {
            currentIndex = currentIndex === totalPages ? 1 : currentIndex + 1;
            displayProducts(currentIndex);
        });
    }
}


displayProducts(currentIndex);

let searchInput = document.querySelector('[name="search"]');

if (searchInput) {
    searchInput.value = searchInputValue;
}

makeSearch();