import { db } from "../../js/firebaseConfig.js";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let tbodyCont = document.querySelector("tbody");
let showMoreBtn = document.querySelector(".showMoreBtn");
let searchInput = document.querySelector('[type="search"]');
let addProductBtn = document.querySelector(".addProductBtn");
let closeModelBtn = document.querySelector(".closeBtn");
let overlay = document.querySelector(".overlay");
let AddModal = document.getElementById("profileModal");
let AddModelBtn = document.querySelector(".SaveBtn");
let addProductForm = document.querySelector(".addProductForm");
let allInputAddProduct = document.querySelectorAll(".addProductForm input");
console.log(allInputAddProduct);
export const apiUrl = "https://dummyjson.com/products";

export let theAllData = [];

export async function getAllData(Api = apiUrl) {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const productLists = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    return productLists;
  } catch (error) {
    console.error("Cannot fetching cards", error);
  }
}
let firebasData = await getAllData();

let end = 10;
let shrinkedData = firebasData.slice(0, end);

function renderTheData(thedata) {
  console.log(2);
  thedata.forEach((product) => {
    let tr = document.createElement("tr");
    let imageUrl = Array.isArray(product.images)
      ? product.images[0]
      : product.images;
    tr.innerHTML = `
        <td class="product_name">${product.title}</td>
        <td class="product_price">${product.price}$</td>
        <td class="product_image"><img width="100" src="${
          imageUrl || ".../img/ahmedlogo.webp"
        }" alt="#"></td>
        <td class="product_category">${product.category}</td>
        <td class="product_brand">${product.brand}</td>
        <td class="product_stock">${product.stock}</td>
        <td class="product_Edit" data-id = '${
          product.id
        }'><a href="#" class="edit">Edit</a></td>
        <td class="product_Delete" data-id = '${
          product.id
        }'><a href="#" class="delete">Delete</a></td>
    `;
    tbodyCont.appendChild(tr);

    tr.querySelector(".delete").addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await deleteDoc(doc(db, "products", product.id));
        firebasData = firebasData.filter((p) => p.id !== product.id);
        tr.remove();
      } catch (error) {
        console.error("Error deleting: ", error);
      }
    });
  });
}

renderTheData(shrinkedData);

showMoreBtn.addEventListener("click", () => {
  end += 5;
  shrinkedData = firebasData.slice(0, end);
  tbodyCont.innerHTML = "";
  renderTheData(shrinkedData);
});

searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  const filterdData = firebasData.filter((product) =>
    product.title.toLowerCase().includes(value)
  );
  tbodyCont.innerHTML = "";
  renderTheData(filterdData);
});

addProductBtn.addEventListener("click", () => {
  overlay.classList.add("active");
  AddModal.classList.add("active");
});
closeModelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  closeAddProductModel();
});

function closeAddProductModel() {
  addProductForm.reset();
  overlay.classList.remove("active");
  AddModal.classList.remove("active");
}

addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameInput = addProductForm.querySelector("#name");
  const priceInput = addProductForm.querySelector("#price");
  const imageInput = addProductForm.querySelector("#image");

  if (!nameInput.value || !priceInput.value || !imageInput.value) {
    alert("Please fill in all required fields");
    return;
  }
  let newProduct = {
    title: nameInput.value,
    price: Number(priceInput.value),
    images: imageInput.value,
    brand: addProductForm.querySelector("#brand").value,
    category: addProductForm.querySelector("#category").value,
    stock: Number(addProductForm.querySelector("#stock").value),
  };

  try {
    const docRef = await addDoc(collection(db, "products"), newProduct);
    firebasData.push({ ...newProduct, id: docRef.id });
    tbodyCont.innerHTML = "";
    renderTheData(firebasData.slice(0, end));
    closeAddProductModel();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});
