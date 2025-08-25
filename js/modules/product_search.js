import { makeSearch } from "../main.js";
import { apiUrl, renderCardContent } from "./products.js";
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
let productsPerPage = 6;
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




let categoryBox = document.querySelector('.categoryBox')
let brandBox = document.querySelector('.brandBox')

// let allCheck = document.querySelectorAll('[type="checkbox"]')
//   console.log(allCheck)
async function getCategoriesOrBrands(type) {
  try {
    let res = await fetch(apiUrl);
    let data = await res.json();
    
    if (type === "categories") {
      return [...new Set(data.products.map((product) => product.category))];
    }
    if (type === "brands") {
      return [...new Set(data.products
        .filter((product) => product.brand)
        .map((product) => product.brand))];
    }
  } catch (error) {
    console.error("Error fetching categories/brands:", error);
    return [];
  }
}

function renderCheckBoxes(type, container) {
  if (!container) return;
  
  getCategoriesOrBrands(type).then((items) => {
    let ul = document.createElement('ul');
    items.forEach((item) => {
      if (!item) return; 
      let li = document.createElement('li');
      li.innerHTML = `
      <label for="${type}_${item.replace(/\s+/g, '_')}">${item}</label>
         <input id="${type}_${item.replace(/\s+/g, '_')}" 
               data-type="${type}"
               data-value="${item}" 
               type="checkbox" />
      `;
      ul.appendChild(li);
    });
    
    container.appendChild(ul);
  });
}


function clearThePage(){ 
  if(paginationContainer) {
    paginationContainer.style.display = "none";
  }
  if(other_product_swiper3) {
    other_product_swiper3.innerHTML = ''
  }
}

function filteredByCategory(category) {
  return firebaseProducts.filter((product) => product.category === category  )
}
function filteredByBrand(brand) {
  return firebaseProducts.filter((product) => product.brand === brand  )
}

function filterByMoreChecked() {
  let checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
  
  if (checkedBoxes.length === 0) {
    return firebaseProducts;
  }
  
  let filteredProducts = firebaseProducts.filter(product => {
    
    return Array.from(checkedBoxes).some(box => {
      const boxType = box.dataset.type;
      const boxValue = box.dataset.value;
      
      if (boxType === 'categories') {
        return product.category === boxValue;
      } else if (boxType === 'brands') {
        return product.brand === boxValue;
      }
      return false;
    });
  });
  
  return filteredProducts;
}

function displayProductsByFiltered(filteredProducts) {
  if(!other_product_swiper3) return;

  other_product_swiper3.innerHTML = ""
  filteredProducts.forEach((product) => {
    renderCardContent(other_product_swiper3, product);
  })
  attachAddCartEvents();
  attachProductLinksEvents();
  updateAddButtons()
}

function setupFilteredEvents() {
    function handleFilterChange() {
      const filtered = filterByMoreChecked()
      if(filtered.length === firebaseProducts.length) {
        displayProducts(currentIndex)
        if(paginationContainer){
          paginationContainer.style.display = 'flex';
        }
      } else {
        clearThePage()
        displayProductsByFiltered(filtered)
      }
    }

     document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' && 
        (e.target.closest('.categoryBox') || e.target.closest('.brandBox'))) {
      handleFilterChange();
    }
  });
}
setTimeout(() => {
  renderCheckBoxes('categories', categoryBox)
  renderCheckBoxes('brands', brandBox)
  setupFilteredEvents()
}, 100)