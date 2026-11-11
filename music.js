// music.js - Local .ogg Audio Player starting at 30 seconds
document.addEventListener("DOMContentLoaded", () => {
    const startOffset = 0; // Start at 30-second mark
    // 1. Point to your copied local audio file
    const audio = new Audio("Love Me Thoda Aur.ogg");
    audio.loop = true;
    audio.preload = "auto";

    // 2. Fetch volume and timeline memory from sessionStorage
    const savedTime = sessionStorage.getItem("bdayMusicTime");
    const savedVolume = sessionStorage.getItem("bdayMusicVolume");
    const isMuted = sessionStorage.getItem("bdayMusicMuted") === "true";

    audio.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.7;
    audio.muted = isMuted;

    // Set timeline starting point
    if (savedTime && parseFloat(savedTime) > 0) {
        audio.currentTime = parseFloat(savedTime);
    } else {
        audio.currentTime = startOffset;
    }

    // 3. Create the simplified text control bar
    const musicBar = document.createElement("div");
    musicBar.className = "music-bar";
    musicBar.style.gap = "8px";
    musicBar.innerHTML = `
        <button class="music-bar-btn" id="volumeDownBtn" style="font-family:'Quicksand',sans-serif; font-weight:700; font-size:0.85rem; width:auto; height:36px; padding:0 12px; border-radius:15px;" title="Decrease Volume">- Vol</button>
        <button class="music-bar-btn" id="volumeUpBtn" style="font-family:'Quicksand',sans-serif; font-weight:700; font-size:0.85rem; width:auto; height:36px; padding:0 12px; border-radius:15px;" title="Increase Volume">+ Vol</button>
        <button class="music-bar-btn" id="muteBtn" style="font-family:'Quicksand',sans-serif; font-weight:700; font-size:0.85rem; width:auto; height:36px; padding:0 12px; border-radius:15px;" title="Mute/Unmute">${isMuted ? "Unmute" : "Mute"}</button>
    `;
    document.body.appendChild(musicBar);

    const muteBtn = document.getElementById("muteBtn");
    const volumeUpBtn = document.getElementById("volumeUpBtn");
    const volumeDownBtn = document.getElementById("volumeDownBtn");

    function updateMuteButton() {
        if (audio.muted || audio.volume === 0) {
            muteBtn.textContent = "Unmute";
            muteBtn.style.background = "#6c5b7b";
        } else {
            muteBtn.textContent = "Mute";
            muteBtn.style.background = "linear-gradient(135deg, #FFB6C1, #FF69B4)";
        }
    }
    updateMuteButton();

    // 4. Playback starter function
    function playAudio() {
        if (audio.paused && !audio.muted) {
            if (audio.currentTime < startOffset && (!savedTime || parseFloat(savedTime) < startOffset)) {
                audio.currentTime = startOffset;
            }
            audio.play().then(() => {
                updateMuteButton();
            }).catch((err) => {
                console.log("Audio waiting for first interaction: ", err);
            });
        }
    }

    // Try playing immediately
    playAudio();

    // Unlock playback on the very first touch/click (e.g. typing passcode '3')
    const unlockAudio = () => {
        playAudio();
        document.removeEventListener("click", unlockAudio);
        document.removeEventListener("touchstart", unlockAudio);
        document.removeEventListener("keydown", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    // 5. Button controls
    muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        audio.muted = !audio.muted;
        sessionStorage.setItem("bdayMusicMuted", audio.muted ? "true" : "false");
        if (!audio.muted && audio.paused) {
            playAudio();
        }
        updateMuteButton();
    });

    volumeUpBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        audio.muted = false;
        audio.volume = Math.min(1.0, audio.volume + 0.15);
        sessionStorage.setItem("bdayMusicMuted", "false");
        sessionStorage.setItem("bdayMusicVolume", audio.volume.toString());
        if (audio.paused) {
            playAudio();
        }
        updateMuteButton();
    });

    volumeDownBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        audio.volume = Math.max(0.0, audio.volume - 0.15);
        sessionStorage.setItem("bdayMusicVolume", audio.volume.toString());
        if (audio.volume === 0) {
            audio.muted = true;
            sessionStorage.setItem("bdayMusicMuted", "true");
        }
        updateMuteButton();
    });

    // 6. Save timestamp before page unloading
    setInterval(() => {
        if (!audio.paused) {
            sessionStorage.setItem("bdayMusicTime", audio.currentTime.toString());
        }
    }, 250);

    window.addEventListener("beforeunload", () => {
        sessionStorage.setItem("bdayMusicTime", audio.currentTime.toString());
    });
});