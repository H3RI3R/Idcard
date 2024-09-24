
  //----------------------------------Submit button Api -----------------------------------
document.getElementById('idCardForm').addEventListener('submit', generateIdCard);

async function generateIdCard(event) {
    event.preventDefault(); // Prevent the default form submission

    // Collect form data
    const form = document.getElementById('idCardForm');
    const formData = new FormData(form);

    // Fetch retailerEmail from session storage
    const retailerEmail = sessionStorage.getItem('userEmail'); // Assuming 'userEmail' is stored in session storage

    // Add retailerEmail and correct emailAddress field to form data
    if (retailerEmail) {
        formData.append('retailerEmail', retailerEmail);
    } else {
        console.error("retailerEmail is not available in session storage.");
        return; // Stop the process if retailerEmail is not found
    }

    // Check if you should append 'emailAddress' instead of 'email'
    const email = formData.get('email');
    formData.append('emailAddress', email); // Append it with the correct name

    try {
        // Send a POST request to the createIdCard API to generate the HTML content
        const response = await fetch('http://localhost:8080/api/admin/retailer/createIdCard', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const htmlContent = await response.text();

            // Display the content in an iframe
            const iframe = document.getElementById('previewFrame');
            iframe.style.display = 'none'; // Show the iframe
            iframe.srcdoc = htmlContent;    // Insert the HTML into the iframe

            // Wait for the iframe to load, then trigger print
            iframe.onload = function () {
                iframe.contentWindow.focus();    // Focus on the iframe content
                iframe.contentWindow.print();    // Open the print dialog
            };
        } else {
            console.error("Failed to generate ID card:", response.statusText);
        }
    } catch (error) {
        console.error("Error generating ID card:", error);
    }
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
    //--------------------------------Toggle side abr anv  ----------------------

(function() {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el) => {
        return document.querySelector(el.trim());
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener) => {
        const element = select(el);
        if (element) {
            element.addEventListener(type, listener);
        }
    }

    /**
     * Sidebar toggle
     */
    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', function() {
            select('body').classList.toggle('toggle-sidebar');
        });
    }
})();
//-------------------------------------------------------
