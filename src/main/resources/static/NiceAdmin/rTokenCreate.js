

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

//----------------------------------Fetch count creators retailer  Api ----------------------------------
function fetchDistributorName() {
    // Step 1: Get the userEmail from session storage
    const userEmail = sessionStorage.getItem('userEmail');

    if (userEmail) {
        // Step 2: First API call to get the creatorEmail
        fetch(`http://localhost:8080/api/admin/distributor/userInfo?email=${userEmail}`)
            .then(response => response.json())
            .then(data => {
                const creatorEmail = data.creatorEmail;

                // Step 3: Second API call to get the distributor's name using the creatorEmail
                return fetch(`http://localhost:8080/api/admin/distributor/userInfo?email=${creatorEmail}`);
            })
            .then(response => response.json())
            .then(data => {
                // Step 4: Set the distributor's name in the HTML
                const distributorNameElement = document.getElementById('distributorName');
                distributorNameElement.textContent = data.name;
            })
            .catch(error => {
                console.error('Error fetching distributor name:', error);
                document.getElementById('distributorName').textContent = 'Error';
            });
    } else {
        document.getElementById('distributorName').textContent = 'Email not found';
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchDistributorName);
//----------------------------------total Token  sales api  ----------------------------------
document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');

    if (userEmail) {
        function updateTokenSalesCount() {
            fetch(`http://localhost:8080/api/admin/retailer/recent-activities?userEmail=${encodeURIComponent(userEmail)}`)
                .then(response => response.json())
                .then(data => {
                // Check if the response contains ID_CARD_CREATION activities
                const idCardCreationActivities = data.filter(activity => activity.type === 'ID_CARD_CREATION');

                // Update the tokens sales count based on the number of ID_CARD_CREATION activities
                const tokensUsed = idCardCreationActivities.length;
                const tokensSalesElement = document.getElementById('Tokensales');

                if (tokensSalesElement) {
                    tokensSalesElement.textContent = tokensUsed;
                } else {
                    console.error('Element with ID "Tokensales" not found.');
                }
            })
                .catch(error => {
                console.error('Error fetching recent activities:', error);
            });
        }

        // Initial fetch
        updateTokenSalesCount();

        // Optionally, set an interval to refresh the count periodically
        setInterval(updateTokenSalesCount, 60000); // Refresh every 60 seconds
    } else {
        console.error('User email is not found in session storage.');
    }
});

//----------------------------------total Token  Api ----------------------------------
document.addEventListener('DOMContentLoaded', function() {
    // Fetch the user email from session storage
    const userEmail = sessionStorage.getItem('userEmail');

    if (userEmail) {
        // Define the API endpoint to get wallet address and phone number
        const getWalletAddressUrl = `http://localhost:8080/api/admin/token/getWalletAddress?email=${encodeURIComponent(userEmail)}`;

        // Fetch wallet address and phone number
        fetch(getWalletAddressUrl)
            .then(response => response.json())
            .then(data => {
            if (data.error) {
                console.error('Error fetching wallet address and phone number:', data.error);
            } else {
                // Extract phone number and wallet address directly from the JSON response
                const phoneNumber = data.phoneNumber;
                const walletAddress = data.walletAddress;

                if (phoneNumber && walletAddress) {
                    // Fetch token count using the phone number
                    const getTokenCountUrl = `http://localhost:8080/api/admin/token/count?identifier=${encodeURIComponent(phoneNumber)}`;

                    return fetch(getTokenCountUrl);
                } else {
                    console.error('Phone number or wallet address not found in the response.');
                    throw new Error('Phone number or wallet address not found');
                }
            }
        })
            .then(response => response.json())
            .then(data => {
            if (data.tokenCount !== undefined) {
                // Update the token amount in the HTML
                document.getElementById("tokenCount").textContent = data.tokenCount;
            } else {
                console.error('Error fetching token count:', data.error);
            }
        })
            .catch(error => console.error('Error:', error));
    } else {
        console.error('User email is not found in session storage.');
    }
});

//----------------------------------count token Api ----------------------------------
//----------------------------------Logout Api ----------------------------------

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = '/login.html'; // Redirect to login page or any other page
    });
});

//-------------------------------Go to PaymentPortalPage---------------------------------------------------------------------------
function navigateToPaymentPortal(event) {
    event.preventDefault(); // Prevent form submission behavior
    window.location.href = 'rPaymentPortal.html'; // Navigate to the payment portal
}