const form = document.querySelector('#login-form');

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = form.querySelector("#email").value;
  const password = form.querySelector("#password").value;

  // console.log(email, password);

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      const userSession = {
        uid: user.uid,
        email: user.email,
        username: user.displayName || "",
        photoURL: user.photoURL || "",
      };

      // Lưu phiên vào localStorage
      localStorage.setItem("user", JSON.stringify(userSession));
      localStorage.setItem("isLoggedIn", "true");
      
      alert("Đăng nhập thành công");
      window.location.href = "./index.html"
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
    });
});


const btnGoogle = document.querySelector("#google");
var provider = new firebase.auth.GoogleAuthProvider();

btnGoogle.addEventListener("click", (event) => {
  event.preventDefault();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log(user)
      const userData = {
        uid: user.uid,
        email: user.email,
        username: user.displayName,
        image: user.photoURL,
        provider: "google",
      };

      return firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set(
          {
            uid: user.uid,
            email: user.email,
            username: user.displayName || "",
            image: user.photoURL || "",
            provider: "google",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          },
          {
            merge: true,
          }
        )
        .then(() => {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("isLoggedIn", "true");

          alert("Xin chào " + user.displayName);
          window.location.href = "index.html";
        });
    })
    .catch((error) => {
      // Handle Errors here.
      var errorCode = error.code  ;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      var credential = error.credential;
      alert(errorMessage)
    });
});

