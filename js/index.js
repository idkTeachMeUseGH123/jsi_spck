db.collection("songs").get()
    .then(snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const songs = data.filter(x => x.type === "song");

        const find = (type, field, value) =>
            data.find(x => x.type === type && (x[field] || "").toLowerCase() === value.toLowerCase());

        const slides = [
            {
                item: find("artist", "artist", "Charlie Puth"),
                tag: "Artist of the Day",
                title: "Charlie Puth:<br>Perfect Pitch Pop Sensation",
                desc: "Grammy-nominated singer, songwriter and producer known for his perfect pitch.",
                detail: "View Profile"
            },
            {
                item: find("song", "title", "We Don't Talk Anymore"),
                tag: "Best Song",
                title: "We Don't Talk Anymore",
                desc: "The smash hit featuring Selena Gomez.",
                color: "#00bfff",
                detail: "View Song"
            },
            {
                item: find("artist", "artist", "Taylor Swift"),
                tag: "Artist of the Year",
                title: "Taylor Swift:<br>The Eras Tour Icon",
                desc: "Record-breaking tours and a cultural phenomenon.",
                color: "#FFD700",
                detail: "View Profile"
            }
        ].filter(s => s.item);

        const carouselInner = document.querySelector(".carousel-inner");
        if (carouselInner) {
            carouselInner.innerHTML = slides.map((s, i) => `
                <div class="carousel-item ${i === 0 ? "active" : ""}">
                    <div class="hero-slide">
                        <img src="${s.item.image || ""}" alt="${s.item.title || s.item.artist || ""}">
                        <div class="hero-overlay"></div>
                        <div class="hero-content">
                            <p class="hero-tag" style="color:${s.color || "#1DB954"}">${s.tag}</p>
                            <h2 class="hero-title">${s.title}</h2>
                            <p class="hero-desc">${s.desc}</p>
                            <div class="hero-buttons">
                                <button class="btn-primary-custom"
                                        style="${s.color ? `background:${s.color};color:#000` : ""}"
                                        onclick="getProductById('${s.item.id}')">Play Now</button>
                                <button class="btn-secondary-custom"
                                        onclick="getProductById('${s.item.id}')">${s.detail}</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join("");

            const carousel = carouselInner.closest(".carousel");
            const indicators = carousel?.querySelector(".carousel-indicators");
            if (indicators && carousel.id) {
                indicators.innerHTML = slides.map((_, i) => `
                    <button type="button"
                            data-bs-target="#${carousel.id}"
                            data-bs-slide-to="${i}"
                            class="${i === 0 ? "active" : ""}"
                            aria-label="Slide ${i + 1}"></button>
                `).join("");
            }
        }

        const songList = document.querySelector(".song-list");
        if (songList) {
            songList.innerHTML = songs.splice(0, 3).map((x, i) => `
                <div class="song-item" onclick="getProductById('${x.id}')">
                    <span class="song-rank">${i + 1}</span>
                    <img src="${x.image || ""}" alt="${x.title}">
                    <div class="song-info">
                        <p class="song-name">${x.title}</p>
                        <p class="song-artist">${x.artist || ""}</p>
                    </div>
                    <span class="song-album">${x.album || ""}</span>
                    <span class="song-time">${x.duration || ""}</span>
                </div>
            `).join("");
        }

        const albumGrid = document.querySelector(".album-grid");
        if (albumGrid) {
            albumGrid.innerHTML = songs.splice(0, 6).map(x => `
                <div class="album-card" onclick="getProductById('${x.id}')">
                    <img src="${x.image || ""}" alt="${x.title}">
                    <p class="album-title">${x.title}</p>
                    <p class="album-artist">${x.artist || ""}</p>
                </div>
            `).join("");
        }
    })
    .catch(error => console.error("Error getting data:", error));

function getProductById(id) {
    location.href = `./detail.html?id=${id}`;
}