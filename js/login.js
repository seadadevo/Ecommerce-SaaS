var emailSelect = document.getElementById("email");
var passwordSelect = document.getElementById("password");
var inputs = document.querySelectorAll("input");
var errorMessages = document.querySelectorAll(".errorMessage");

var emailError = document.querySelector(".emailError");
var passwordError = document.querySelector(".passwordError");

var submit = document.querySelector('[type = "submit"]');

let users = JSON.parse(localStorage.getItem("users")) || [];

submit.addEventListener("click", (e) => {
  e.preventDefault();

  errorMessages.forEach((msg) => {
    msg.style.cssText = "display: none;";
  });
  let emailValue = emailSelect.value;
  let passwordValue = passwordSelect.value;

  let hasError = false;

  if (emailValue.trim() === "") {
    showError(emailError, "email is Empty");
    hasError = true;
  }
  if (passwordValue.trim() === "") {
    showError(passwordError, "password is Empty");
    hasError = true;
  }

  if (hasError) return;

  let foundUser = users.find((user) => {
    return (
      emailValue.trim() === user.email && passwordValue.trim() === user.password
    );
  });

  if (foundUser) {
    localStorage.setItem("isLoggedIn", foundUser.email);
    Swal.fire({
      icon: "success",
      title: "Welcome Back!",
      text: `Hello ${foundUser.name}, you have logged in successfully.`,
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      window.location.assign("index.html");
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Email or password is incorrect. Please try again.",
    });
  }
});

function showError(element, message) {
  element.textContent = message;
  element.style.display = "block";
}
