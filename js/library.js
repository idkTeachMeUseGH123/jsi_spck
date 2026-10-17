// const url = "https://6a1160413e35d0f37ee33624.mockapi.io/music_album"

// fetch(url)
//     // Chuyển từ json qua object
//     .then(res => res.json())
//     .then(songs => {
//         const list = songs.splice(0, 3);
//         const songGrid = document.querySelector('.song-list');
//         let i = 1;
//         list.forEach(product => {
//             const productCard = `
//                 <div class="song-item" onclick="getProductById('${product.id}')">
//                     <span class="song-rank">${i}</span>
//                     <img src="${product.image}">
//                     <div class="song-info">
//                         <p class="song-name">${product.title}</p>
//                         <p class="song-artist">${product.artist}</p>
//                     </div>
//                     <span class="song-album">${product.album}</span>
//                     <span class="song-time">${product.duration}</span>
//                 </div>         
//             `;
//             i++;
//             songGrid.innerHTML += productCard;
//         });

//         const songsHome = songs.splice(0, 6);
//         const productGrid = document.querySelector('#recommend');
//         songsHome.forEach(product => {
//             const productCard = `
//                 <div class="album-card" onclick="getProductById('${product.id}')">
//                     <img src="${product.image}">
//                     <p class="album-title">${product.title}</p>
//                     <p class="album-artist">${product.artist}</p>
//                 </div>          
//             `;
//             productGrid.innerHTML += productCard;
//         });

//         const liked = songs.splice(0, 6);
//         const likedGrid = document.querySelector('#liked');
//         liked.forEach(product => {
//             const productCard = `
//                 <div class="album-card" onclick="getProductById('${product.id}')">
//                     <img src="${product.image}">
//                     <p class="album-title">${product.title}</p>
//                     <p class="album-artist">${product.artist}</p>
//                 </div>          
//             `;
//             likedGrid.innerHTML += productCard;
//         });

//     })
//     .catch(error => console.error('Error fetching songs:', error));

// function getProductById(id) {
//     fetch(`${url}/${id}`)
//         .then(res => res.json())
//         .then(product => {
//             console.log(product);
//             localStorage.setItem("choosedProduct", JSON.stringify(product));
//             location.href = "./detail.html";
//         })
//         .catch(error => console.error(error));

//     }

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

                const songs = data.filter(x => x.type === "song");

                const list = songs.splice(0, 3);
                const songGrid = document.querySelector('.song-list');
                let i = 1;
                list.forEach(product => {
                    const productCard = `
                <div class="song-item" onclick="getProductById('${product.id}')">
                    <span class="song-rank">${i}</span>
                    <img src="${product.image}">
                    <div class="song-info">
                        <p class="song-name">${product.title}</p>
                        <p class="song-artist">${product.artist}</p>
                    </div>
                    <span class="song-album">${product.album}</span>
                    <span class="song-time">${product.duration}</span>
                </div>        
            `;
                    i++;
                    songGrid.innerHTML += productCard;
                });

                const recommendHome = songs.splice(0, 6);
                const productGrid = document.querySelector('#recommend');
                recommendHome.forEach(product => {
                    const productCard = `
                <div class="album-card" onclick="getProductById('${product.id}')">
                    <img src="${product.image}">
                    <p class="album-title">${product.title}</p>
                    <p class="album-artist">${product.artist}</p>
                </div>          
            `;
                    productGrid.innerHTML += productCard;
                });

                const liked = songs.splice(0, 6);
                const likedGrid = document.querySelector('#liked');
                liked.forEach(product => {
                    const productCard = `
                <div class="album-card" onclick="getProductById('${product.id}')">
                    <img src="${product.image}">
                    <p class="album-title">${product.title}</p>
                    <p class="album-artist">${product.artist}</p>
                </div>          
            `;
                    likedGrid.innerHTML += productCard;
                });
            })
            .catch(error => console.error('Lỗi khi lấy dữ liệu:', error));

    })

// function getProductById(id) {
//     db.collection("songs").doc(id).get()
//         .then(doc => {
//             if (doc.exists) {
//                 const product = { id: doc.id, ...doc.data() };
//                 console.log(product);
//                 localStorage.setItem("choosedProduct", JSON.stringify(product));
//                 location.href = "./detail.html";
//             } else {
//                 console.error("Không tìm thấy dữ liệu!");
//             }
//         })
//         .catch(error => console.error("Lỗi:", error));
// }
function getProductById(id) {
    location.href = `./detail.html?id=${id}`;
}