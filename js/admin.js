const collection = db.collection("songs");
const usersCollection = db.collection("users");

let allData = [];
let usersData = [];
let currentType = "song";
let searchTerm = "";

const COLUMNS = {
    song: [
        { key: "image", label: "", isImage: true },
        { key: "title", label: "Title" },
        { key: "artist", label: "Artist" },
        { key: "album", label: "Album" },
        { key: "duration", label: "Duration" },
        { key: "date", label: "Release date" },
    ],
    artist: [
        { key: "image", label: "", isImage: true },
        { key: "artist", label: "Name" },
        { key: "description", label: "Description" },
        { key: "date", label: "Born" },
    ],
    album: [
        { key: "image", label: "", isImage: true },
        { key: "title", label: "Title" },
        { key: "artist", label: "Artist" },
        { key: "duration", label: "Duration" },
        { key: "date", label: "Release date" },
    ],
    manage: [
        { key: "avatar", label: "", isImage: true },
        { key: "name", label: "Username" },
        { key: "email", label: "Email" },
        { key: "provider", label: "Provider" },
        { key: "role", label: "Role" },
        { key: "feedback", label: "Feedback" },
    ],
};

const PANEL_META = {
    song: { title: "Songs", subtitle: "Manage every track on the platform", addLabel: "Add song" },
    artist: { title: "Artists", subtitle: "Manage the artists featured on the platform", addLabel: "Add artist" },
    album: { title: "Albums", subtitle: "Manage every album on the platform", addLabel: "Add album" },
    manage: { title: "Users", subtitle: "Manage user accounts", addLabel: "none" },
};

const tableHead = document.getElementById("table-head");
const tableBody = document.getElementById("table-body");
const emptyState = document.getElementById("empty-state");
const panelTitle = document.getElementById("panel-title");
const panelSubtitle = document.getElementById("panel-subtitle");
const searchInput = document.getElementById("search-input");
const addBtn = document.getElementById("add-btn");

const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.getElementById("modal-title");
const itemForm = document.getElementById("item-form");
const modalClose = document.getElementById("modal-close");
const cancelBtn = document.getElementById("cancel-btn");

const rowTitle = document.getElementById("row-title");
const rowAlbum = document.getElementById("row-album");
const rowDuration = document.getElementById("row-duration");

const fieldId = document.getElementById("field-id");
const fieldType = document.getElementById("field-type");
const fieldTitle = document.getElementById("field-title");
const fieldArtist = document.getElementById("field-artist");
const fieldAlbum = document.getElementById("field-album");
const fieldImage = document.getElementById("field-image");
const fieldDate = document.getElementById("field-date");
const fieldDuration = document.getElementById("field-duration");
const fieldDescription = document.getElementById("field-description");
const fieldUrl = document.getElementById("field-url");

document.querySelectorAll(".admin-nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".admin-nav-link").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentType = btn.dataset.type;
        searchInput.value = "";
        searchTerm = "";
        updatePanelHeader();
        renderTable();
    });
});

searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderTable();
});

addBtn.addEventListener("click", () => openForm());
modalClose.addEventListener("click", closeForm);
cancelBtn.addEventListener("click", closeForm);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeForm(); });

itemForm.addEventListener("submit", handleSubmit);

updatePanelHeader();
listenToData();
listenToUsers();

function listenToData() {
    tableBody.innerHTML = `<tr><td colspan="6" class="table-loading">Loading data...</td></tr>`;

    collection.onSnapshot(
        (snapshot) => {
            allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTable();
        },
        (err) => {
            console.error(err);
            tableBody.innerHTML = `<tr><td colspan="6" class="table-loading">Failed to load data.</td></tr>`;
        }
    );
}

function listenToUsers() {
    usersCollection.onSnapshot(
        (snapshot) => {
            usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderTable();
        },
        (err) => {
            console.error(err);
            if (currentType === "manage") {
                tableBody.innerHTML = `<tr><td colspan="7" class="table-loading">Failed to load users.</td></tr>`;
            }
        }
    );
}

function updatePanelHeader() {
    const meta = PANEL_META[currentType];
    panelTitle.textContent = meta.title;
    panelSubtitle.textContent = meta.subtitle;

    if (meta.addLabel === "none") {
        addBtn.style.display = "none";
    } else {
        addBtn.style.display = "flex";
        addBtn.innerHTML = `<i class="fa-solid fa-plus"></i> ${meta.addLabel}`;
    }
}

function getUsername(user) {
    return (
        user.name ||
        user.username ||
        user.displayName ||
        (user.email ? user.email.split("@")[0] : "") ||
        "—"
    );
}

function getAvatar(user) {
    return user.avatar || user.photoURL || "";
}

function getProvider(user) {
    if (user.provider) {
        if (user.provider === "google.com") return "Google";
        if (user.provider === "password") return "Email";
        return user.provider.charAt(0).toUpperCase() + user.provider.slice(1);
    }
    if (user.photoURL && user.photoURL.includes("googleusercontent")) return "Google";
    if (user.avatar && user.avatar.includes("googleusercontent")) return "Google";
    return "Email";
}

function renderTable() {
    if (currentType === "manage") {
        renderUsersTable();
        return;
    }

    const cols = COLUMNS[currentType];

    tableHead.innerHTML = `<tr>${cols.map(c => `<th>${c.label}</th>`).join("")}<th style="text-align:right">Actions</th></tr>`;

    let items = allData.filter(item => item.type === currentType);

    if (searchTerm) {
        items = items.filter(item =>
            (item.title || "").toLowerCase().includes(searchTerm) ||
            (item.artist || "").toLowerCase().includes(searchTerm) ||
            (item.album || "").toLowerCase().includes(searchTerm)
        );
    }

    if (items.length === 0) {
        tableBody.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    tableBody.innerHTML = items.map(item => {
        const cells = cols.map(c => {
            if (c.isImage) {
                return `<td><img class="row-thumb" src="${escapeHtml(item.image || '')}" alt="" onerror="this.style.visibility='hidden'"></td>`;
            }
            const val = item[c.key] || "—";
            const cls = (c.key === "title" || c.key === "artist") ? "row-title" : "row-sub";
            return `<td class="${cls}">${escapeHtml(val)}</td>`;
        }).join("");

        return `
            <tr>
                ${cells}
                <td>
                    <div class="row-actions">
                        <button class="icon-btn" onclick="openForm('${item.id}')" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="icon-btn danger" onclick="deleteItem('${item.id}')" title="Delete">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function renderUsersTable() {
    const cols = COLUMNS.manage;

    tableHead.innerHTML = `<tr>${cols.map(c => `<th>${c.label}</th>`).join("")}<th style="text-align:right">Actions</th></tr>`;

    let users = usersData;

    if (searchTerm) {
        users = users.filter(user =>
            getUsername(user).toLowerCase().includes(searchTerm) ||
            (user.email || "").toLowerCase().includes(searchTerm)
        );
    }

    if (users.length === 0) {
        tableBody.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }
    emptyState.style.display = "none";

    tableBody.innerHTML = users.map(user => {
        const feedbackText = user.feedback ? escapeHtml(user.feedback) : "—";

        return `
            <tr>
                <td><img class="row-thumb" src="${escapeHtml(getAvatar(user))}" alt="" onerror="this.style.visibility='hidden'"></td>
                <td class="row-title">${escapeHtml(getUsername(user))}</td>
                <td class="row-sub">${escapeHtml(user.email || "—")}</td>
                <td class="row-sub">${escapeHtml(getProvider(user))}</td>
                <td>
                    <select class="role-select" onchange="updateRole('${user.id}', this.value)">
                        <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
                        <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                    </select>
                </td>
                <td class="row-sub feedback-cell" title="${user.feedback ? escapeHtml(user.feedback) : ''}">${feedbackText}</td>
                <td>
                    <div class="row-actions">
                        <button class="icon-btn danger" onclick="deleteItem('${user.id}')" title="Delete account">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function updateRole(id, role) {
    usersCollection.doc(id).update({ role })
        .catch(err => {
            console.error(err);
            alert("Failed to update role.");
        });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function openForm(id) {
    if (currentType === "manage") return;

    itemForm.reset();
    fieldType.value = currentType;

    const isArtist = currentType === "artist";
    rowTitle.style.display = isArtist ? "none" : "flex";
    rowAlbum.style.display = currentType === "song" ? "flex" : "none";
    rowDuration.style.display = isArtist ? "none" : "flex";
    fieldTitle.required = !isArtist;

    if (id) {
        const item = allData.find(i => i.id === id);
        if (!item) return;
        modalTitle.textContent = `Edit ${currentType}`;
        fieldId.value = item.id;
        fieldTitle.value = item.title || "";
        fieldArtist.value = item.artist || "";
        fieldAlbum.value = item.album || "";
        fieldImage.value = item.image || "";
        fieldDate.value = item.date || "";
        fieldDuration.value = item.duration || "";
        fieldDescription.value = item.description || "";
        fieldUrl.value = item.url || "";
    } else {
        modalTitle.textContent = `Add ${currentType}`;
        fieldId.value = "";
    }

    modalOverlay.classList.add("show");
}

function closeForm() {
    modalOverlay.classList.remove("show");
}

function handleSubmit(e) {
    e.preventDefault();

    if (!fieldArtist.value.trim()) {
        alert("Artist is required.");
        return;
    }
    if (fieldTitle.required && !fieldTitle.value.trim()) {
        alert("Title is required.");
        return;
    }

    const payload = {
        type: currentType,
        title: currentType === "artist" ? "" : fieldTitle.value.trim(),
        artist: fieldArtist.value.trim(),
        album: currentType === "song" ? fieldAlbum.value.trim() : "",
        image: fieldImage.value.trim(),
        date: fieldDate.value.trim(),
        duration: currentType === "artist" ? "" : fieldDuration.value.trim(),
        description: fieldDescription.value.trim(),
        url: fieldUrl.value.trim(),
    };

    const id = fieldId.value;

    const request = id
        ? collection.doc(id).update(payload)
        : collection.add(payload);

    request
        .then(() => {
            closeForm();
        })
        .catch(err => {
            console.error(err);
            alert("Something went wrong. Please try again.");
        });
}

function deleteItem(id) {
    if (!confirm("Bạn có chắc muốn xoá mục này?")) return;

    const ref = currentType === "manage" ? usersCollection : collection;

    ref.doc(id).delete()
        .catch(err => {
            console.error(err);
            alert("Failed to delete item.");
        });
}