import { db } from "./firebaseConfig.js";
import { collection, query, where, getDocs } 
  from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const productTitle = document.getElementById("productTitle")
const productDescription = document.getElementById("productDescription")
const productPrice = document.getElementById("productPrice")
const productOldPrice = document.getElementById("productOldPrice")
const productImage = document.getElementById("productImage")

async function loadProductDetails() {
  const productId = localStorage.getItem("selectedProductId");
  console.log("Selected ID:", productId);
  if (!productId) return;

  const productsRef = collection(db, "products");
  const q = query(productsRef, where("id", "==", Number(productId))); 
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const product = snapshot.docs[0].data();
    console.log("Product found:", product);

    productTitle.textContent = product.title;
    productDescription.textContent = product.description;
    productPrice.textContent = "$" + product.price;
    productOldPrice.textContent = "$" + (product.old_price ?? "");
    productImage.src = product.images[0];
    
  } else {
    console.log("No such product!");
  }
}

loadProductDetails();