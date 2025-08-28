import { db } from "../../js/firebaseConfig.js";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

let tbodyCont = document.querySelector("tbody");
let showMoreBtn = document.querySelector(".showMoreBtn");
let titleModal = document.querySelector(".titleModal");
let searchInput = document.querySelector('[type="search"]');
let addProductBtn = document.querySelector(".addProductBtn");
let closeAddModelBtn = document.querySelector(".closeBtn");
let closeEditModelBtn = document.querySelector(".closeEditBtn");
let overlay = document.querySelector(".overlay");
let AddModal = document.getElementById("profileModal");
let editModal = document.getElementById("profileModalEdit");
let AddModelBtn = document.querySelector(".SaveBtn");
let addProductForm = document.querySelector(".addProductForm");
let editProfileModeal = document.querySelector(".editProductModal");
let allInputAddProduct = document.querySelectorAll(".addProductForm input");
console.log(editProfileModeal);
console.log(allInputAddProduct);
export const apiUrl = "https://dummyjson.com/products";

export let theAllData = [];

export async function getAllData(Api = apiUrl) {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const productLists = snapshot.docs.map((docSnap) => ({
      firebaseId: docSnap.id,
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
        <td class="product_category">${product.category || "####"}</td>
        <td class="product_brand">${product.brand || "####"}</td>
        <td  class="product_stock">${
          product.stock || "it's empty"
        } <span style = display:${
      product.stock < 10 ? "block" : "none"
    }>product_${product.title.split(" ").slice(0, 1)} is less than 10</span></td>
        <td class="product_Edit" data-id = '${
          product.firebaseId
        }'><a href="#" class="edit">Edit</a></td>
        <td class="product_Delete" data-id = '${
          product.firebaseId
        }'><a href="#" class="delete">Delete</a></td>
    `;
    tbodyCont.appendChild(tr);

    // ! Start Functionality of Delete Button
    tr.querySelector(".delete").addEventListener("click", (e) => {
      e.preventDefault();

      Swal.fire({
        title: "Are you sure you want to delete this product?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteDoc(doc(db, "products", product.firebaseId));
            firebasData = firebasData.filter(
              (p) => p.firebaseId  !== product.firebaseId
            );
            tr.remove();

            Swal.fire("Deleted!", "The product has been removed.", "success");
          } catch (error) {
            console.error("Error deleting: ", error);
            Swal.fire("Error", "Failed to delete product.", "error");
          }
        } else {
          Swal.fire("Cancelled", "The product is safe.", "info");
        }
      });
    });

    // ! Start Functionality of Edit Button
    tr.querySelector(".edit").addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.add("active");
      editModal.classList.add("active");

      editProfileModeal.querySelector("#name").value = product.title;
      editProfileModeal.querySelector("#price").value = product.price;
      editProfileModeal.querySelector("#image").value = Array.isArray(
        product.images
      )
        ? product.images[0]
        : product.images;
      editProfileModeal.querySelector("#category").value = product.category;
      editProfileModeal.querySelector("#brand").value = product.brand;
      editProfileModeal.querySelector("#stock").value = product.stock;

      editProfileModeal.onsubmit = async (event) => {
        event.preventDefault();

        const updatedProduct = {
          title: editProfileModeal.querySelector("#name").value,
          price: Number(editProfileModeal.querySelector("#price").value),
          image: editProfileModeal.querySelector("#image").value,
          category: editProfileModeal.querySelector("#category").value,
          brand: editProfileModeal.querySelector("#brand").value,
          stock: Number(editProfileModeal.querySelector("#stock").value),
        };

        tr.querySelector(".product_name").textContent = updatedProduct.title;
        tr.querySelector(".product_price").textContent =
          updatedProduct.price + "$";
        tr.querySelector(".product_image img").src = updatedProduct.image;
        tr.querySelector(".product_category").textContent =
          updatedProduct.category;
        tr.querySelector(".product_brand").textContent = updatedProduct.brand;
        tr.querySelector(".product_stock").textContent = updatedProduct.stock;

        try {
          const productRef = doc(db, "products", product.firebaseId);
          await updateDoc(productRef, updatedProduct);
          Swal.fire("Updated!", "The product has been updated.", "success");
          closeEditProductModel();
        } catch (error) {
          console.error("Error Updating Products:", error);
          Swal.fire("Error", "Failed to update product.", "error");
        }
      };
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
closeAddModelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  closeAddProductModel();
});
closeEditModelBtn.addEventListener("click", (e) => {
  e.preventDefault();
  closeEditProductModel();
});

function closeAddProductModel() {
  addProductForm.reset();
  overlay.classList.remove("active");
  AddModal.classList.remove("active");
}
function closeEditProductModel() {
  addProductForm.reset();
  overlay.classList.remove("active");
  editModal.classList.remove("active");
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
    firebasData.push({ ...newProduct, firebaseId: docRef.id });
    tbodyCont.innerHTML = "";
    renderTheData(firebasData.slice(0, end));
    closeAddProductModel();
  } catch (error) {
    console.error("Error adding document: ", error);
  }
});
