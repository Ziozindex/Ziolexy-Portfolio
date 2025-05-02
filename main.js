// Enhanced Music Player with Local Storage Persistence
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const music = document.getElementById('background-music');
    const musicPlayer = document.getElementById('music-player');
    const musicControls = document.getElementById('music-controls');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('music-progress');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const closeMusic = document.getElementById('close-music');
    const musicConsent = document.getElementById('music-consent');
    const acceptMusic = document.getElementById('accept-music');
    const declineMusic = document.getElementById('decline-music');
    const themeToggle = document.getElementById('theme-toggle');

    // State
    let isMusicPlaying = false;
    let musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    let currentTrack = 0;
    const tracks = [
        'https://audio.jukehost.co.uk/HrjNZpNkUPrr24VKgqqwzgtAhQ9fKVWE',
        // Add more tracks here if you want a playlist
    ];

    // Theme Toggle
    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        
        if (isDark) {
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-sun text-white"></i>';
        } else {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-moon text-white"></i>';
        }
    }

    // Initialize theme
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.innerHTML = savedTheme === 'dark' 
            ? '<i class="fas fa-moon text-white"></i>' 
            : '<i class="fas fa-sun text-white"></i>';
    }

    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update progress bar
    function updateProgress() {
        progressBar.value = (music.currentTime / music.duration) * 100 || 0;
        currentTimeEl.textContent = formatTime(music.currentTime);
    }

    // Update duration display
    function updateDuration() {
        durationEl.textContent = formatTime(music.duration);
    }

    // Set progress when user seeks
    function setProgress() {
        music.currentTime = (progressBar.value / 100) * music.duration;
    }

    // Play/pause toggle
    function togglePlay() {
        if (isMusicPlaying) {
            music.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            music.play()
                .then(() => {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    isMusicPlaying = true;
                    updateDuration();
                })
                .catch(error => {
                    console.error("Playback failed:", error);
                });
        }
        isMusicPlaying = !isMusicPlaying;
    }

    // Change track
    function changeTrack(direction) {
        currentTrack = (currentTrack + direction + tracks.length) % tracks.length;
        music.src = tracks[currentTrack];
        if (isMusicPlaying) {
            music.play().catch(error => console.error("Playback failed:", error));
        }
    }

    // Show music controls
    function showMusicControls() {
        musicControls.classList.remove('hidden');
        musicPlayer.classList.add('hidden');
    }

    // Hide music controls
    function hideMusicControls() {
        musicControls.classList.add('hidden');
        musicPlayer.classList.remove('hidden');
    }

    // Initialize music player
    function initMusicPlayer() {
        if (musicEnabled === null) {
            // First visit - show consent modal
            musicConsent.classList.remove('hidden');
        } else if (musicEnabled) {
            // Music was previously enabled
            musicPlayer.classList.remove('hidden');
        }
    }

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', () => changeTrack(-1));
    nextBtn.addEventListener('click', () => changeTrack(1));
    progressBar.addEventListener('input', setProgress);
    music.addEventListener('timeupdate', updateProgress);
    music.addEventListener('ended', () => changeTrack(1));
    music.addEventListener('loadedmetadata', updateDuration);
    musicPlayer.addEventListener('click', showMusicControls);
    closeMusic.addEventListener('click', hideMusicControls);
    themeToggle.addEventListener('click', toggleTheme);

    // Music consent handlers
    acceptMusic.addEventListener('click', () => {
        musicEnabled = true;
        localStorage.setItem('musicEnabled', 'true');
        musicConsent.classList.add('hidden');
        musicPlayer.classList.remove('hidden');
    });

    declineMusic.addEventListener('click', () => {
        musicEnabled = false;
        localStorage.setItem('musicEnabled', 'false');
        musicConsent.classList.add('hidden');
    });

    // Initialize
    initTheme();
    initMusicPlayer();

    // Service Worker for offline functionality
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
});
