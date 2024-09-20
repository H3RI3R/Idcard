
  //----------------------------------Submit button Api -----------------------------------
async function generateIdCard() {
    // Fetch the HTML content from the API (no CORS issues as same domain is used)
    const response = await fetch('http://localhost:8080/api/admin/retailer/view-id-card');
    const htmlContent = await response.text();

    // Display the content in an iframe
    const iframe = document.getElementById('previewFrame');
    iframe.style.display = 'block'; // Show the iframe
    iframe.srcdoc = htmlContent;    // Insert the HTML into the iframe

    // Wait for the iframe to load, then trigger print
    iframe.onload = function() {
      iframe.contentWindow.focus();    // Focus on the iframe content
      iframe.contentWindow.print();    // Open the print dialog
    };
  }
  //----------------------------------User name Api -----------------------------------

    document.addEventListener("DOMContentLoaded", function() {
      // Function to fetch the user's name from the API
      function fetchUserName() {
        // Get the email from session data
        const email = sessionStorage.getItem('userEmail'); // Ensure this is how you fetch email from the session

        if (email) {
          fetch(`http://localhost:8080/api/admin/distributor/name?email=${encodeURIComponent(email)}`)
            .then(response => response.json())
            .then(data => {
            const userName = data.name || 'Guest'; // Use 'Guest' if no name is found
            // Update the HTML elements with the fetched name
            document.querySelector('.nav-profile .dropdown-toggle').textContent = userName;
            document.querySelector('.dropdown-header h6').textContent = userName;
          })
            .catch(error => {
            console.error('Error fetching name:', error);
            // Fallback to 'Guest' in case of an error
            document.querySelector('.nav-profile .dropdown-toggle').textContent = 'Guest';
            document.querySelector('.dropdown-header h6').textContent = 'Guest';
          });
        } else {
          console.error('No email found in session.');
          // Fallback to 'Guest' if email is missing
          document.querySelector('.nav-profile .dropdown-toggle').textContent = 'Guest';
          document.querySelector('.dropdown-header h6').textContent = 'Guest';
        }
      }

      // Call the function on page load
      fetchUserName();
    });
    //--------------------------------Logout api ----------------------
    document.addEventListener("DOMContentLoaded", function() {
      // Add event listener to the logout button
      document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = '/login.html'; // Redirect to login page or any other page
      });
    });
