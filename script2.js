let songs = [];
let songsUrl = [];
async function getAlbums() {
    let a = await fetch("https://music-player-backend-fdip.onrender.com/api/artists");
    let albums = await a.json();
    console.log(albums);
    let cardContainer = document.querySelector(".cardContainer");
    console.log(cardContainer.innerHTML);
    for (const album of albums) {
        let info = await fetch(album.info);
        info = await info.json();
        cardContainer.innerHTML += `<div class="card rounded-10">
                        <div class="image">
                            <img class="rounded-15" src="${album.cover_url}" alt="You haunt me">
                            <div class="playbtn">
                                <img id="play" src="svgs/play.svg" alt="playbtn">
                            </div>
                        </div>
                        <div class="details">
                            <h4>${info.title}</h4>
                            <p>${info.description}</p>
                        </div>
                    </div>`
    }
}

function formatTime(seconds) {
    seconds = Math.floor(seconds); // remove decimal part
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const paddedMinutes = minutes.toString().padStart(2, "0");
    const paddedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${paddedMinutes}:${paddedSeconds}`;
}

function dotPos(current, duration) {
    let Dot = document.querySelector(".seekbar #dot");
    let position = current / duration * 100;
    Dot.style.left = position + "%";
}

let currentSong = new Audio();
const playMusic = (url, index) => {
    // console.log(`/songs/${track}.mp3`);
    // var audio = new Audio(`/songs/${track}.mp3`);
    currentSong.src = url;
    console.log(currentSong.src);
    currentSong.play();
    playbtn.src = `svgs/pause.svg`;
    document.querySelector(".songInfo").innerHTML = `${songs[index]}`;
    setInterval(() => {
        if (!currentSong.paused) {
            const current = isNaN(currentSong.currentTime) ? 0 : currentSong.currentTime;
            const duration = isNaN(currentSong.duration) ? 0 : currentSong.duration;
            document.querySelector(".duration").innerHTML = `${formatTime(current)}/${formatTime(duration)}`;


            dotPos(current, duration);
        }
    }, 300);
}
async function getSongs(artist) {
    let a = await fetch(`https://music-player-backend-fdip.onrender.com/api/songs/${artist}`);
    let songsJson = await a.json();
    console.log(songsJson);
    return songsJson;
}
async function main() {
    let songsJson;
    let artist = 'Atif Aslam';
    songsJson = await getSongs(artist);
    await getAlbums().then(() => {
        // add event listener to every album
        let albums = document.getElementsByClassName("card");
        // console.log("albums:",albums);
        Array.from(albums).forEach(album => {
            album.addEventListener("click", async (e) => {
                console.log(album.innerHTML);
                artist = album.querySelector("h4").innerText;
                songsJson = await getSongs(artist);
                songs = [];
                songsUrl = [];
                for (const song of songsJson) {
                    songs.push(song.title);
                    songsUrl.push(song.url)
                }
                console.log(songs);
                // var audio = new Audio(songs[0]);
                // audio.play();

                let songsUL = document.querySelector(".songsList").getElementsByTagName("ul")[0];
                songsUL.innerHTML="";
                for (let song of songs) {
                    songsUL.innerHTML += `<li>${song}<img class="invert logo" src="svgs/play2.svg"></li>`;
                }
                Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach((e, index) => {
                    e.addEventListener("click", () => {
                        console.log(e.innerHTML.split("<")[0]);
                        playMusic(songsUrl[index], index);
                    })
                })
            })
        });


    })




    // add playbar buttons logic
    playbtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playbtn.src = `svgs/pause.svg`;
        } else {
            currentSong.pause();
            playbtn.src = `svgs/play.svg`;

        }
    })

    // listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime);
    })

    let seekbar = document.querySelector(".seekbar")
    seekbar.addEventListener("click", (e) => {
        // console.log(e.target.getBoundingClientRect().width, e.offsetX);
        // const percentage=e.offsetX/e.target.getBoundingClientRect().width;
        const rect = seekbar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;

        currentSong.currentTime = percentage * currentSong.duration;
        dotPos(currentSong.currentTime,currentSong.duration);
    })

}
main();
