import { auth, db } from "./firebaseConfig.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const submitBtn = document.querySelector('[type="submit"]');
const usernameSelect = document.getElementById("name");
const emailSelect = document.getElementById("email");
const passwordSelect = document.getElementById("password");
const positionSelect = document.getElementById("position");
const phoneSelect = document.getElementById("phone");
let errorMessages = document.querySelectorAll(".errorMessage");

let nameError = document.querySelector(".nameError");
let emailError = document.querySelector(".emailError");
let passwordError = document.querySelector(".passwordError");
let positionError = document.querySelector(".positionError");
let phoneError = document.querySelector(".phoneError");

const phoneInputField = document.querySelector("#phone");
const phoneInput = window.intlTelInput(phoneInputField, {
  utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  initialCountry: "eg",
  preferredCountries: ["eg", "sa", "ae", "us"],
  separateDialCode: true,
});

submitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  clearErrors();

  const username = usernameSelect.value.trim();
  const email = emailSelect.value.trim();
  const password = passwordSelect.value.trim();
  const position = positionSelect.value.trim();
  const fullNumber = phoneInput.getNumber();

  

let regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  
  const errors = [];
  if (!username) errors.push({ element: nameError, message: "Name is required" });
  if (!position) errors.push({ element: positionError, message: "Position is required" });
  if (!email) errors.push({ element: emailError, message: "Email is required" });
  else if (!regexEmail.test(email)) errors.push({ element: emailError, message: "Invalid Email" });
  if (!password) errors.push({ element: passwordError, message: "Password is required" });
  else if (!regexPassword.test(password)) errors.push({ element: passwordError, message: "Weak Password" });
  if (!fullNumber) errors.push({ element: phoneError, message: "phone is Empty" });
  if (errors.length > 0) {
    showError(errors);
    return; 
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      username,
      email,
      position,
      fullNumber,
      img: "",
      tasks: []
    });

    Swal.fire({
      title: "Account Created",
      text: "You can now log in.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => window.location.assign("login.html"));

  } catch (error) {
    console.error(error.message);
    Swal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
    });
  }
});

function clearErrors() {
  errorMessages.forEach((msg) => (msg.style.cssText = "display: none;"));
}

function showError(errors) {
  errors.forEach((err) => {
    err.element.textContent = err.message;
    err.element.style.display = "block";
  });
}