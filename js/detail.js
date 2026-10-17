// Lấy id từ URL: detail.html?id=xxxx
const params = new URLSearchParams(location.search);
const productId = params.get("id");
let product = null;
let isPlaying = false;

if (!productId) {
    console.log("Không có sản phẩm nào được chọn!");
} else {
    db.collection("songs")
        .doc(productId)
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.log("Không tìm thấy sản phẩm!");
                return;
            }
            product = {
                id: doc.id,
                ...doc.data()
            };
            renderDetail();
        })
        .catch(error => {
            console.error("Firebase error:", error);
        });
}

function renderDetail() {
    if (product.type === "song") {
        const productGrid = document.querySelector(".detail-hero-inner");
        const image = `
            <img id="detail-cover" class="detail-cover" src="${product.image}" alt="Cover">
            <div class="detail-meta">
                <span id="detail-type-badge" class="detail-type-badge">
                    ${product.artist}
                </span>
                <h2 id="detail-title" class="detail-title">
                    ${product.title}
                </h2>
                <p id="detail-subtitle" class="detail-subtitle">
                    ${product.duration}
                </p>
            </div>
        `;
        productGrid.innerHTML = image;

        const detailGrid = document.querySelector(".detail-info-grid");
        const detail = `
            <div class="detail-info-card">
                <p class="info-label">Album</p>
                <p id="detail-album" class="info-value">
                    ${product.album || "—"}
                </p>
            </div>
            <div class="detail-info-card">
                <p class="info-label">Release Date</p>
                <p id="detail-release-date" class="info-value">
                    ${product.date}
                </p>
            </div>
        `;
        detailGrid.innerHTML = detail;

        const descriptionGrid =
            document.querySelector(".detail-description-block");
        const description = `
            <h4>Description</h4>
            <p id="detail-description">
                ${product.description}
            </p>
        `;
        descriptionGrid.innerHTML = description;
        document.querySelector(".section-header").innerHTML += `
            <h3>Related to this song</h3>
        `;

        renderRelated();


    } else if (product.type === "artist") {
        const productGrid = document.querySelector(".detail-hero-inner");
        const image = `
            <img id="detail-cover" class="detail-cover" src="${product.image}" alt="Cover">
            <div class="detail-meta">
                <h2 id="detail-title" class="detail-title">
                    ${product.artist}
                </h2>
                <p id="detail-subtitle" class="detail-subtitle">
                    ${product.date}
                </p>
            </div>
        `;

        productGrid.innerHTML = image;

        const descriptionGrid =
            document.querySelector(".detail-description-block");

        const description = `
            <h4>Description</h4>
            <p id="detail-description">
                ${product.description}
            </p>
        `;
        descriptionGrid.innerHTML = description;
        document.querySelector(".section-header").innerHTML += `
            <h3>Related to this artist</h3>
        `;
        renderRelated();


    } else if (product.type === "album") {
        const productGrid = document.querySelector(".detail-hero-inner");
        const image = `
            <img id="detail-cover" class="detail-cover" src="${product.image}" alt="Cover">
            <div class="detail-meta">
                <span id="detail-type-badge" class="detail-type-badge">
                    ${product.artist}
                </span>

                <h2 id="detail-title" class="detail-title">
                    ${product.title}
                </h2>

                <p id="detail-subtitle" class="detail-subtitle">
                    ${product.duration}
                </p>
            </div>
        `;

        productGrid.innerHTML = image;

        const detailGrid = document.querySelector(".detail-info-grid");
        const detail = `
            <div class="detail-info-card">
                <p class="info-label">Release Date</p>
                <p id="detail-release-date" class="info-value">
                    ${product.date}
                </p>
            </div>
        `;
        detailGrid.innerHTML = detail;

        const descriptionGrid =
            document.querySelector(".detail-description-block");
        const description = `
            <h4>Description</h4>
            <p id="detail-description">
                ${product.description}
            </p>
        `;
        descriptionGrid.innerHTML = description;
        document.querySelector(".section-header").innerHTML += `
            <h3>Related to this album</h3>
        `;

        renderRelated();
    }
}

// Chuyển mọi dạng link YouTube sang link embed
function toYoutubeEmbed(link) {
    if (!link) return "";
    try {
        const u = new URL(link);
        let id = "";
        if (u.hostname.includes("youtu.be")) {
            id = u.pathname.slice(1);
        } else if (u.pathname.startsWith("/embed/") || u.pathname.startsWith("/shorts/")) {
            id = u.pathname.split("/")[2];
        } else if (u.hostname.includes("youtube.com")) {
            id = u.searchParams.get("v");
        }
        return id ? `https://www.youtube.com/embed/${id}` : "";
    } catch (error) {
        return "";
    }
}

// Đổi icon play <-> pause
function updatePlayIcon() {
    const icon = document.getElementById("play-icon");
    if (!icon) return;

    icon.classList.toggle("fa-play", !isPlaying);
    icon.classList.toggle("fa-pause", isPlaying);
}

// Mở popup video YouTube
function openVideoPopup(embed) {
    closeVideoPopup();

    const popup = document.createElement("div");
    popup.id = "video-popup";
    popup.style.cssText =
        "position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.8);";
    popup.innerHTML = `
        <div style="position:relative; width:90%; max-width:900px; aspect-ratio:16/9;">
            <button id="video-popup-close"
                    style="position:absolute; top:-44px; right:0; background:none; border:none; color:#fff; font-size:32px; line-height:1; cursor:pointer;">
                &times;
            </button>
            <iframe src="${embed}?autoplay=1"
                    title="${product.title}"
                    style="width:100%; height:100%; border:0; border-radius:12px;"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
            </iframe>
            <a href="${embed.replace("/embed/", "/watch?v=")}" target="_blank"
               style="position:absolute; bottom:-36px; left:0; color:#fff; font-size:14px;">
                Không xem được? Mở trên YouTube
            </a>
        </div>
    `;

    // Click ra ngoài video hoặc nút X để đóng
    popup.addEventListener("click", e => {
        if (e.target === popup || e.target.id === "video-popup-close") {
            closeVideoPopup();
        }
    });

    document.body.appendChild(popup);
    document.addEventListener("keydown", onPopupKeydown);

    isPlaying = true;
    updatePlayIcon();
}

// Đóng popup (xóa iframe để dừng video)
function closeVideoPopup() {
    const popup = document.getElementById("video-popup");
    if (popup) popup.remove();

    document.removeEventListener("keydown", onPopupKeydown);

    isPlaying = false;
    updatePlayIcon();
}

function onPopupKeydown(e) {
    if (e.key === "Escape") closeVideoPopup();
}

function playBtn() {
    if (!product) return;
    const embed = product.type === "song" ? toYoutubeEmbed(product.url) : "";
    if (embed) {
        openVideoPopup(embed);
        return;
    }
    if (product.url) {
        window.open(product.url, "_blank");
    } else {
        console.log("Document này chưa có field url!");
    }
}

function getMainArtist(artistString) {

    if (!artistString) return "";

    return artistString
        .split(/ft\.|feat\.|featuring|,|&|\sx\s/i)[0]
        .trim()
        .toLowerCase();
}

function renderRelated() {

    db.collection("songs")
        .get()
        .then(snapshot => {
            let data = [];
            snapshot.forEach(doc => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });

            });
            const mainArtist = getMainArtist(product.artist);
            const related = data.filter(item => {
                return getMainArtist(item.artist) === mainArtist &&
                    item.id !== product.id &&
                    (
                        item.type === "song" ||
                        item.type === "album" ||
                        item.type === "artist"
                    );

            });

            const typeOrder = {
                song: 1,
                album: 2,
                artist: 3
            };
            related.sort(
                (a, b) => typeOrder[a.type] - typeOrder[b.type]
            );
            const relatedGrid =
                document.querySelector(".album-grid");
            relatedGrid.innerHTML = "";
            related.forEach(item => {
                if (item.type === "artist") {
                    relatedGrid.innerHTML += `
                        <div class="album-card"
                             onclick="getProductById('${item.id}')">

                            <img src="${item.image}">

                            <p class="album-title">
                                ${item.artist}
                            </p>

                        </div>
                    `;
                } else {
                    relatedGrid.innerHTML += `
                        <div class="album-card"
                             onclick="getProductById('${item.id}')">

                            <img src="${item.image}"
                                 alt="${item.title}">

                            <p class="album-title">
                                ${item.title}
                            </p>

                            <p class="album-artist">
                                ${item.artist}
                            </p>

                        </div>
                    `;
                }
            });
        })
        .catch(error => {
            console.error("Firebase error:", error);
        });
}

function getProductById(id) {
    location.href = `./detail.html?id=${id}`;
}