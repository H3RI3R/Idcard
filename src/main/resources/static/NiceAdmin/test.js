// Get the input fields, photo input, and the canvas element
var schoolNameInput = document.querySelector('input[name="school_name"]');
var schoolSubTitleInput = document.querySelector('input[name="school_sub_title"]');
var photoInput = document.getElementById('photoInput');
var canvas = document.getElementById('cardCanvas');
var ctx = canvas.getContext('2d');
var img = new Image();
var photo = new Image(); // For the uploaded photo
var photoLoaded = false;

// Function to draw the image, photo, and text on the canvas
function drawCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the template image on the canvas
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw the uploaded photo if it has been loaded
    if (photoLoaded) {
        // Calculate photo size and position
        var photoSize = 250; // Example size
        var photoX = 40; // Distance from the left edge
        var photoY = (canvas.height - photoSize) / 2; // Center vertically

        // Draw the photo
        ctx.drawImage(photo, photoX, photoY, photoSize, photoSize);
    }

    // Set text properties for the school name
    ctx.font = "bold 50px Arial"; // Bold font, adjust size as needed
    ctx.fillStyle = "black"; // Text color
    ctx.textAlign = "center"; // Center text horizontally
    ctx.textBaseline = "top"; // Align text at the top

    // Draw the school name at the top center of the canvas
    ctx.fillText(schoolNameInput.value, canvas.width / 2, 50);

    // Set text properties for the school sub-title
    ctx.font = "30px Arial"; // Adjust the font size as needed
    ctx.textBaseline = "top"; // Align text at the top

    // Draw the school sub-title just below the school name
    ctx.fillText(schoolSubTitleInput.value, canvas.width / 2, 100);
}

// Handle the photo input change event
photoInput.addEventListener('change', function(event) {
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            photo.src = e.target.result;
            photo.onload = function() {
                photoLoaded = true;
                drawCanvas(); // Redraw canvas with the photo
            };
        };
        reader.readAsDataURL(file);
    }
});

// Update the canvas when the template changes
document.getElementById('template').addEventListener('change', function() {
    img.src = this.value;

    img.onload = function() {
        drawCanvas(); // Draw the image and text on the canvas
    };
});

// Update the canvas when the user types in either input field
schoolNameInput.onkeyup = schoolSubTitleInput.onkeyup = drawCanvas;

// Initial load
window.onload = function() {
    var template = document.getElementById('template');
    var event = new Event('change');
    template.dispatchEvent(event);
};