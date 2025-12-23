let photos = [];
let currentIndex = 0;
let slideInterval;

// Load photos from server
async function loadPhotos() {
    try {
        const response = await fetch('/api/photos');
        const data = await response.json();
        photos = data.photos;

        if (photos.length > 0) {
            startSlideshow();
        } else {
            console.log('No photos found in static/photos folder');
        }
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

// Start the slideshow
function startSlideshow() {
    if (photos.length === 0) return;

    // Set first image
    const slide1 = document.getElementById('slide1');
    slide1.style.backgroundImage = `url('${photos[0]}')`;

    // Start cycling through photos
    slideInterval = setInterval(() => {
        transitionToNextPhoto();
    }, 10000);
}

// Transition to next photo with fade effect
function transitionToNextPhoto() {
    if (photos.length <= 1) return;

    const slide1 = document.getElementById('slide1');
    const slide2 = document.getElementById('slide2');

    // Move to next photo
    currentIndex = (currentIndex + 1) % photos.length;

    // Determine which slide is currently active
    const activeSlide = slide1.classList.contains('active') ? slide1 : slide2;
    const inactiveSlide = slide1.classList.contains('active') ? slide2 : slide1;

    // Set the new image on the inactive slide
    inactiveSlide.style.backgroundImage = `url('${photos[currentIndex]}')`;

    // Swap active classes for fade transition
    activeSlide.classList.remove('active');
    inactiveSlide.classList.add('active');
}

// Update clock
function updateClock() {
    const now = new Date();

    // Format time
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('currentTime').textContent = `${hours}:${minutes}`;

    // Format date
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    document.getElementById('currentDate').textContent =
        now.toLocaleDateString('en-US', options);
}

// Initialize everything
loadPhotos();
updateClock();
setInterval(updateClock, 1000); // Update clock every second