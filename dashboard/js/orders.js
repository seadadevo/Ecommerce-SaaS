import { db } from "../../js/firebaseConfig.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log('object')
let tbodyCont = document.querySelector("tbody");
async function fetchOrders() {
  try {
    const ordersSnap = await getDocs(collection(db, "orders"));
    const orders = ordersSnap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    displayOrders(orders);
    } catch (error) {
        console.error("Error fetching orders:", err);
    }
}


fetchOrders();

function displayOrders(orders) {
  tbodyCont.innerHTML = ""; 
  orders.forEach(order => {
    const tr = document.createElement("tr");

    const productsList = order.products.map(p => `${p.title} (${p.quantity})`).join(", ");

    tr.innerHTML = `
      <td>${order.userId}</td>
      <td>${productsList}</td>
      <td>$${order.total}</td>
      <td class="status">${order.status}</td>
      <td>
        <select class="changeStatus" data-id="${order.id}">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
    `;

    tbodyCont.appendChild(tr);
  });

 
  document.querySelectorAll(".changeStatus").forEach(select => {
    select.addEventListener("change", async (e) => {
      const orderId = e.target.dataset.id;
      const newStatus = e.target.value;

      try {
        await updateDoc(doc(db, "orders", orderId), { status: newStatus });
        e.target.closest("tr").querySelector(".status").textContent = newStatus;
      } catch (err) {
        console.error("Error updating status:", err);
      }
    });
  });
}

