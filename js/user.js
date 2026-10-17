const logoutButton = document.querySelector(".logoutButton");
const editButton = document.querySelector(".editButton");
const saveButton = document.querySelector(".saveButton");
const cancelButton = document.querySelector(".cancelButton");
const saveCancelLink = document.getElementById("saveCancelLink");

const currentPasswordField = document.getElementById("currentPasswordField");
const newPasswordField = document.getElementById("newPasswordField");
const currentPasswordInput = document.getElementById("currentPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");

const userRecentlyH1 = document.getElementById("userRecentlyH1");
const userRecently = document.getElementById("userRecently");
const emailRecently = document.getElementById("emailRecently");
const passwordRecently = document.getElementById("passwordRecently");

const feedbackComment = document.getElementById("feedbackComment");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");

let currentUserDocId = null;
let originalUsername = "";
let originalEmail = "";
let isGoogleUser = false;

function admin() {
    location.href = "./admin.html";
}

function validatePassword(password) {
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
    if (!/[a-z]/.test(password)) return "Mật khẩu phải có chữ thường.";
    if (!/[A-Z]/.test(password)) return "Mật khẩu phải có chữ hoa.";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải có chữ số.";
    return "";
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Mật khẩu hiện tại không đúng.";
        case "auth/requires-recent-login":
            return "Phiên đăng nhập đã cũ, vui lòng đăng xuất rồi đăng nhập lại.";
        case "auth/email-already-in-use":
            return "Email này đã được sử dụng bởi tài khoản khác.";
        case "auth/invalid-email":
            return "Email không hợp lệ.";
        case "auth/weak-password":
            return "Mật khẩu mới quá yếu.";
        case "auth/too-many-requests":
            return "Thao tác quá nhiều lần, vui lòng thử lại sau.";
        default:
            return error.message;
    }
}

logoutButton.addEventListener("click", () => {
    firebase
        .auth()
        .signOut()
        .then(() => {
            localStorage.removeItem("user");
            localStorage.setItem("isLoggedIn", "false");
            alert("Đăng xuất thành công!");
            window.location.href = "login.html";
        })
        .catch((error) => {
            alert("Lỗi khi đăng xuất: " + error.message);
        });
});

function enterEditMode() {
    userRecently.readOnly = false;

    emailRecently.readOnly = true;

    if (!isGoogleUser) {
        currentPasswordField.style.display = "block";
        newPasswordField.style.display = "block";
    }

    saveCancelLink.style.display = "flex";
    editButton.style.display = "none";
}

function exitEditMode() {
    userRecently.readOnly = true;
    emailRecently.readOnly = true;
    currentPasswordField.style.display = "none";
    newPasswordField.style.display = "none";
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    saveCancelLink.style.display = "none";
    editButton.style.display = "inline-block";
}

editButton.addEventListener("click", enterEditMode);

cancelButton.addEventListener("click", () => {
    userRecently.value = originalUsername;
    emailRecently.value = originalEmail;
    exitEditMode();
});

saveButton.addEventListener("click", async () => {
    const user = firebase.auth().currentUser;
    if (!user || !currentUserDocId) return;

    const newUsername = userRecently.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const currentPassword = currentPasswordInput.value;

    if (!newUsername) {
        alert("Username không được để trống.");
        return;
    }

    const passwordChanged = !isGoogleUser && newPassword !== "";

    if (passwordChanged) {
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            alert(passwordError);
            return;
        }
    }

    if (!passwordChanged) {
        await saveUsernameOnly(newUsername);
        return;
    }

    if (!currentPassword) {
        alert("Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi.");
        return;
    }

    saveButton.disabled = true;

    try {

        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        await user.reauthenticateWithCredential(credential);

        await user.updatePassword(newPassword);

        await db.collection("users").doc(currentUserDocId).update({ username: newUsername });

        originalUsername = newUsername;
        userRecentlyH1.textContent = newUsername;

        alert("Cập nhật thông tin thành công!");
        exitEditMode();
    } catch (error) {
        console.error(error);
        alert(getAuthErrorMessage(error));
    } finally {
        saveButton.disabled = false;
    }
});

async function saveUsernameOnly(newUsername) {
    saveButton.disabled = true;
    try {
        await db.collection("users").doc(currentUserDocId).update({ username: newUsername });
        originalUsername = newUsername;
        userRecentlyH1.textContent = newUsername;
        alert("Cập nhật username thành công!");
        exitEditMode();
    } catch (error) {
        console.error(error);
        alert("Cập nhật thất bại: " + error.message);
    } finally {
        saveButton.disabled = false;
    }
}

submitFeedbackBtn.addEventListener("click", () => {
    if (!currentUserDocId) return;

    const feedbackText = feedbackComment.value.trim();
    if (!feedbackText) {
        alert("Please enter your feedback before submitting.");
        return;
    }

    submitFeedbackBtn.disabled = true;

    db.collection("users")
        .doc(currentUserDocId)
        .update({ feedback: feedbackText })
        .then(() => alert("Thank you for your feedback!"))
        .catch((error) => {
            console.error(error);
            alert("Failed to submit feedback. Please try again.");
        })
        .finally(() => {
            submitFeedbackBtn.disabled = false;
        });
});

async function findUserDoc(user) {
    let snap = await db.collection("users").where("uid", "==", user.uid).limit(1).get();
    if (snap.empty && user.email) {
        snap = await db.collection("users").where("email", "==", user.email).limit(1).get();
    }
    return snap.empty ? null : snap.docs[0];
}

function applyUserDataToUI(userData) {
    originalUsername = userData.username || "";
    originalEmail = userData.email || "";

    userRecentlyH1.textContent = originalUsername;
    userRecently.value = originalUsername;
    emailRecently.value = originalEmail;

    if (isGoogleUser) {
        passwordRecently.value = "";
        passwordRecently.placeholder = "Đăng nhập bằng Google";
    } else {
        passwordRecently.value = "********";
    }

    if (userData.feedback) {
        feedbackComment.value = userData.feedback;
    }

    if (userData.role === "admin" && !document.querySelector(".admin-link-btn")) {
        document.querySelector(".link").insertAdjacentHTML("beforeend", `
            <button class="button button-secondary admin-link-btn" onclick="admin()">
                Admin
            </button>
        `);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        isGoogleUser = user.providerData.some((p) => p.providerId === "google.com");

        try {
            const doc = await findUserDoc(user);

            if (!doc) {
                if (isGoogleUser) {

                    const newUserData = {
                        uid: user.uid,
                        username: user.displayName || user.email.split("@")[0],
                        email: user.email,
                        role: "user",
                    };
                    await db.collection("users").doc(user.uid).set(newUserData);
                    currentUserDocId = user.uid;
                    applyUserDataToUI(newUserData);
                    return;
                }

                alert("Không tìm thấy dữ liệu người dùng.");
                window.location.href = "login.html";
                return;
            }

            currentUserDocId = doc.id;
            const data = doc.data();

            const sync = {};
            if (data.uid !== user.uid) sync.uid = user.uid;
            if (user.email && data.email !== user.email) sync.email = user.email;
            if (Object.keys(sync).length > 0) {
                await doc.ref.update(sync);
                Object.assign(data, sync);
            }

            applyUserDataToUI(data);
        } catch (error) {
            console.error(error);
            window.location.href = "login.html";
        }
    });
});