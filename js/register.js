console.log(firebase.app().name);

const form = document.querySelector('#register-form');

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = form.querySelector('#username').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#cfpassword').value;

    console.log(username, email, password, confirmPassword);
    
    if (!email || !username || !password || !confirmPassword) {
        alert("vui long nhap day du thong tin")
    }
    if (password != confirmPassword) {
        alert("mat khau khong khop")
    }

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      let userData = {
                username,
                email,
                password,
                role: "user",
                image: "./images/user.jpg"
            }
        db.collection("users").add(userData)
                .then((docRef) => {
                    alert("Đăng ký thành công");
                    window.location.href = "./login.html";
                    console.log("Document written with ID: ", docRef.id);
                })
                .catch((error) => {
                    alert("Đăng ký thất bại");
                    console.error("Error adding document: ", error);
                });
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage)
    });


});