// Get the input fields, canvas element, and photo input
var schoolNameInput = document.querySelector('input[name="school_name"]');
var schoolSubTitleInput = document.querySelector('input[name="school_sub_title"]');
var photoInput = document.getElementById('photoInput');
var photoPreview = document.getElementById('photoPreview');
var canvas = document.getElementById('cardCanvas');
var ctx = canvas.getContext('2d');

// Function to clear and redraw the canvas
function drawCanvas() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw the background image
    var img = new Image();
    img.src = document.getElementById('template').value;
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw the text
        ctx.font = "bold 40px Arial"; // Bigger and bold font for School Name
        ctx.fillStyle = "black"; // Text color
        ctx.textAlign = "center"; // Center text horizontally
        ctx.textBaseline = "middle"; // Center text vertically
        ctx.fillText(schoolNameInput.value, canvas.width / 2, canvas.height / 4); // Positioned at the top

        ctx.font = "30px Arial"; // Smaller font for School Sub Title
        ctx.fillText(schoolSubTitleInput.value, canvas.width / 2, canvas.height / 3); // Positioned below School Name

        // Draw the photo
        if (photoInput.files.length > 0) {
            var photo = new Image();
            var reader = new FileReader();
            reader.onload = function(e) {
                photo.src = e.target.result;
                photo.onload = function() {
                    var x = canvas.width / 10; // Position from the left
                    var y = canvas.height / 2; // Position from the top
                    var size = 100; // Photo size

                    // Draw photo
                    ctx.drawImage(photo, x, y, size, size);

                    // Display the uploaded photo in the preview container
                    var img = document.createElement('img');
                    img.src = URL.createObjectURL(photoInput.files[0]);
                    photoPreview.innerHTML = ''; // Clear previous preview
                    photoPreview.appendChild(img);
                };
            };
            reader.readAsDataURL(photoInput.files[0]);
        }
    };
}

// Update canvas on input change
schoolNameInput.onkeyup = drawCanvas;
schoolSubTitleInput.onkeyup = drawCanvas;
photoInput.addEventListener('change', drawCanvas);
document.getElementById('template').addEventListener('change', drawCanvas);

// Initial load
window.onload = function() {
    var template = document.getElementById('template');
    var event = new Event('change');
    template.dispatchEvent(event);
};