document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;});


//------------------------------------ ID card creation APi  ---------------------------------------

//---------------------------------- Activity  Api -----------------------------------
document.addEventListener("DOMContentLoaded", function() {
    function maskPhoneNumber(details) {
        const phoneRegex = /\d{10,}/;
        return details.replace(phoneRegex, (match) => {
            return match.slice(0, -4).replace(/./g, 'x') + match.slice(-4);
        });
    }

    function loadRecentActivities() {
        const userEmail = sessionStorage.getItem('userEmail');

        if (!userEmail) {
            console.error('User email not found in session storage');
            return;
        }

        const apiUrl = `http://localhost:8080/api/admin/retailer/recent-activities?userEmail=${encodeURIComponent(userEmail)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(activities => {
            const activityList = document.getElementById('activity-list');
            activityList.innerHTML = '';

            if (activities.length > 0) {
                const filteredActivities = activities.filter(activity => activity.type === 'ID_CARD_CREATION');

                if (filteredActivities.length > 0) {
                    filteredActivities.forEach(activity => {
                        const activityItem = document.createElement('div');
                        activityItem.classList.add('activity-item', 'd-flex', 'align-items-center', 'mb-3');

                        let formattedDate;
                        try {
                            const date = new Date(activity.timestamp);
                            formattedDate = isNaN(date.getTime()) ? activity.timestamp : date.toLocaleString();
                        } catch (error) {
                            formattedDate = activity.timestamp;
                        }

                        const maskedDetails = maskPhoneNumber(activity.details);

                        activityItem.innerHTML = `
                                <div class="d-flex align-items-center">
                                    <div class="activity-icon bg-success text-light me-3">
                                        <i class="bi bi-check-circle"></i>
                                    </div>
                                    <div>
                                        <p class="mb-1"><strong>${activity.type}</strong> - ${maskedDetails}</p>
                                        <small class="text-muted">${formattedDate}</small>
                                    </div>
                                </div>
                            `;

                        activityList.appendChild(activityItem);
                    });
                } else {
                    activityList.innerHTML = '<p>No recent ID Card Creation activities.</p>';
                }
            } else {
                activityList.innerHTML = '<p>No recent activities.</p>';
            }
        })
            .catch(error => {
            console.error('Error fetching activities:', error);
        });
    }

    loadRecentActivities();
});

//----------------------------------USerName Api ----------------------------------
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
//----------------------------------Logout Api ----------------------------------


document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default link behavior
        sessionStorage.clear(); // Clear session storage
        window.location.href = '/login.html'; // Redirect to login page or any other page
    });
});