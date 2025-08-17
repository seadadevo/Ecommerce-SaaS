import { auth, db } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const emailSelect = document.getElementById("email");
const passwordSelect = document.getElementById("password");
const submit = document.querySelector('[type="submit"]');

const emailError = document.querySelector(".emailError");
const passwordError = document.querySelector(".passwordError");
const errorMessages = document.querySelectorAll(".errorMessage");

submit.addEventListener("click", async (e) => {
  e.preventDefault();

  clearErrors();

  const emailValue = emailSelect.value.trim();
  const passwordValue = passwordSelect.value.trim();

  let hasError = false;

  if (!emailValue) {
    showError(emailError, "Email is required");
    hasError = true;
  }
  if (!passwordValue) {
    showError(passwordError, "Password is required");
    hasError = true;
  }

  if (hasError) return;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem("isLoggedIn", user.uid);

      Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: `Hello ${userData.username}, you have logged in successfully.`,
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        window.location.assign("index.html");
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "User data not found in database.",
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: error.message,
    });
  }
});

function clearErrors() {
  errorMessages.forEach((msg) => (msg.style.display = "none"));
}

function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
}
