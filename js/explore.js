db.collection("songs")
    .get()
    .then(item => {
        let data = [];
        item.forEach(doc => {
            data.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Lọc dữ liệu
        let songs = data.filter(x => x.type === "song");
        let albums = data.filter(x => x.type === "album");
        let artists = data.filter(x => x.type === "artist");


        const artistGrid = document.querySelector("#artist");
        artists.forEach(product => {
            const productCard = `
                <div class="album-card" onclick="getProductById('${product.id}')">
                    <img src="${product.image}">
                    <p class="album-title">${product.artist}</p>
                </div>
            `;
            artistGrid.innerHTML += productCard;
        });

        const songGrid = document.querySelector("#song");
        songs.forEach(product => {

            const productCard = `
                <div class="album-card" onclick="getProductById('${product.id}')">
                    <img src="${product.image}">
                    <p class="album-title">${product.title}</p>
                    <p class="album-artist">${product.artist}</p>
                </div>
            `;
            songGrid.innerHTML += productCard;
        });

        const albumGrid = document.querySelector("#album");
        albums.forEach(product => {

            const productCard = `
                <div class="album-card">
                    <img src="${product.image}" 
                         onclick="getProductById('${product.id}')">

                    <p class="album-title">${product.title}</p>
                    <p class="album-artist">${product.artist}</p>
                </div>
            `;
            albumGrid.innerHTML += productCard;
        });
    })
    .catch(error => {
        console.error("Error getting data:", error);
    });


function getProductById(id) {
    location.href = `./detail.html?id=${id}`;
}