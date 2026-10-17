const form = document.querySelector("#forgot-form");
const db = firebase.firestore();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (password.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }
  if (!/[a-z]/.test(password)) {
    alert("Password must contain a lowercase letter");
    return;
  }
  if (!/[A-Z]/.test(password)) {
    alert("Password must contain an uppercase letter");
    return;
  }
  if (!/[0-9]/.test(password)) {
    alert("Password must contain a number");
    return;
  }
  if (password !== confirmPassword) {
    alert("Password and confirm password do not match");
    return;
  }

  try {
    // Tìm user theo email trong collection
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      alert("Email does not exist");
      return;
    }

    await snapshot.docs[0].ref.update({ password });

    alert("Reset password successfully, please login");
    window.location.href = "./login.html";
  } catch (error) {
    alert(error.message);
  }
});