let usernameSelect = document.getElementById("name");
let emailSelect = document.getElementById("email");
let passwordSelect = document.getElementById("password");
let positionSelect = document.getElementById("position");
let phoneSelect = document.getElementById("phone");

let inputs = document.querySelectorAll("input");
let errorMessages = document.querySelectorAll(".errorMessage");
let nameError = document.querySelector(".nameError");
let emailError = document.querySelector(".emailError");
let passwordError = document.querySelector(".passwordError");
let positionError = document.querySelector(".positionError");
let phoneError = document.querySelector(".phoneError");
let submitBtn = document.querySelector('[type = "submit"]');

let regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPassword =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

let users = JSON.parse(localStorage.getItem("users")) || [];


// ! for phone input
const phoneInputField = document.querySelector("#phone");

const phoneInput = window.intlTelInput(phoneInputField, {
  utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  initialCountry: "eg",
  preferredCountries: ["eg", "sa", "ae", "us"],
  separateDialCode: true,
});
// const countryCode = phoneInput.getSelectedCountryData().dialCode;

submitBtn.addEventListener("click", handleSubmit);

function handleSubmit(e) {
  e.preventDefault();
  clearErrors();
  let username = usernameSelect.value.trim();
  let posisionName = positionSelect.value.trim();
  let email = emailSelect.value.trim();
  let password = passwordSelect.value.trim();
  const fullNumber = phoneInput.getNumber();

  const errors = validateForm(username, email, password, posisionName, fullNumber);

  if (errors.length > 0) {
    showError(errors);
    return;
  }

  createUser(username, email, password, posisionName, fullNumber);
  resetForm();

  Swal.fire({
    title: "Account Created",
    text: "You can now log in.",
    icon: "success",
    timer: 2000,
    showConfirmButton: false,
  }).then(() => window.location.assign("login.html"));
}

function validateForm(name, email, password, posisionName, fullNumber) {
  const errors = [];
  if (!name) errors.push({ element: nameError, message: "Name is Empty" });
  if (!posisionName) errors.push({ element: positionError, message: "posisiton is Empty" });
  if (!fullNumber) errors.push({ element: phoneError, message: "phone is Empty" });
  if (!email) {
    errors.push({ element: emailError, message: "Email is Empty" });
  } else if (!regexEmail.test(email)) {
    errors.push({ element: emailError, message: "Invalid email format" });
  }
  if (!password) {
    errors.push({ element: passwordError, message: "Password is empty" });
  } else if (!regexPassword.test(password)) {
    errors.push({
      element: passwordError,
      message: "Password must include letters, numbers, and symbols",
    });
  }


  if (users.some((user) => user.email === email)) {
    errors.push({
      element: emailError,
      message: "Email has already been used",
    });
  }
  return errors;
}

function showError(errors) {
  errors.forEach((err) => {
    err.element.textContent = err.message;
    err.element.style.display = "block";
  });
}

function clearErrors() {
  errorMessages.forEach((msg) => (msg.style.cssText = "display: none;"));
}

function createUser(name, email, password, posisionName, fullNumber) {
  const newUser = {
    id: Date.now(),
    name,
    email,
    posisionName,
    fullNumber,
    password,
    img: "",
    tasks: [],
  };

  users.push(newUser);
  saveUsers();
}

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function resetForm() {
  inputs.forEach((input) => (input.value = ""));
}


