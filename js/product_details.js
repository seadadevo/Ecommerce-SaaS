import { db } from "./firebaseConfig.js";
import { collection, query, where, getDocs } 
  from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

    document.getElementById("productTitle").textContent = product.title;
    document.getElementById("productDescription").textContent = product.description;
    document.getElementById("productPrice").textContent = "$" + product.price;
    document.getElementById("productOldPrice").textContent = "$" + (product.old_price ?? "");
    document.getElementById("productImage").src = product.images[0];
  } else {
    console.log("No such product!");
  }
}

loadProductDetails();
