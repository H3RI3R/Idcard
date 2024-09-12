
//  ------------------------------table api of status ------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const transactionTableBody = document.getElementById("transactionTableBody");
  const searchTransactionId = document.getElementById("searchTransactionId");
  const refreshButton = document.getElementById("refreshButton");
  const userEmail = sessionStorage.getItem('userEmail');

  function fetchTransactionRequests() {
    fetch(`http://localhost:8080/api/admin/distributor/getTransactionRequests?creatorEmail=${userEmail}`)
      .then(response => response.json())
      .then(data => {
      displayTransactions(data);
    })
      .catch(error => {
      console.error('Error fetching transaction requests:', error);
    });
  }

  function displayTransactions(transactions) {
    transactionTableBody.innerHTML = ''; // Clear the table body

    transactions.forEach((transaction, index) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      const amount = Math.round(transaction.amount);
      const statusImage = getStatusImage(transaction.status);
      const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${date}</td>
                <td>${amount}</td>
                <td><img src="${statusImage}" alt="${transaction.status}" width="60" height="30"></td> <!-- Adjusted size -->
                <td>${transaction.transactionId}</td>
            </tr>
        `;
      transactionTableBody.insertAdjacentHTML('beforeend', row);
    });
  }

  function getStatusImage(status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'assets/img/pending.png';
      case 'rejected':
        return 'assets/img/rejected.png';
      case 'accepted':
        return 'assets/img/success.png';
      default:
        return '';
    }
  }

  // Search functionality
  searchTransactionId.addEventListener("input", function() {
    const filter = searchTransactionId.value.toLowerCase();
    const rows = transactionTableBody.getElementsByTagName("tr");

    Array.from(rows).forEach(row => {
      const transactionId = row.cells[4].textContent.toLowerCase();
      if (transactionId.includes(filter)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  // Refresh button functionality
  refreshButton.addEventListener("click", function() {
    fetchTransactionRequests();
  });

  // Initial fetch
  fetchTransactionRequests();
});
//  ------------------------------Create transection request api------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  const doneButton = document.getElementById("bankDoneButton1");
  const doneButton1 = document.getElementById("upiDoneButton1");
  const transactionTableBody = document.getElementById("transactionTableBody");

  doneButton.addEventListener("click", handleTransactionRequest);
  doneButton1.addEventListener("click", handleTransactionRequest);

  function handleTransactionRequest() {
    const transactionID = document.getElementById(this.id === 'bankDoneButton1' ? "bankTransactionID1" : "upiTransactionID1").value;
    const amount = document.getElementById("selectPlan").value;
    const email = sessionStorage.getItem('userEmail');

    if (!transactionID) {
      alert("Please enter the transaction ID.");
      return;
    }

    fetch(`http://localhost:8080/api/admin/distributor/createTransactionRequest?email=${email}&amount=${amount}&transactionId=${transactionID}`, {
      method: 'POST'
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          showAlert("Payment request submitted successfully.");
          closeModal(this.id === 'bankDoneButton1' ? 'bankTransferModal1' : 'upiModal1');
          fetchTransactionRequests(); // Refresh the transaction table
        } else {
          showAlert("Error: " + (data.error || "Unknown error"));
        }
      })
      .catch(error => {
        showAlert("Error: " + error.message);
      });
  }

  function showAlert(message) {
    const alert = document.getElementById("paymentAlert");
    const alertMessage = document.getElementById("alertMessage");
    alertMessage.textContent = message;
    alert.classList.remove("d-none");
  }

  function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }

  // Fetch and display transaction requests
  function fetchTransactionRequests() {
    const userEmail = sessionStorage.getItem('userEmail');

    fetch(`http://localhost:8080/api/admin/distributor/getTransactionRequests?creatorEmail=${userEmail}`)
      .then(response => response.json())
      .then(data => {
        displayTransactions(data); // Call the displayTransactions function to update the table
      })
      .catch(error => {
        console.error('Error fetching transaction requests:', error);
      });
  }

  function displayTransactions(transactions) {
    transactionTableBody.innerHTML = ''; // Clear the table body

    transactions.forEach((transaction, index) => {
      const date = new Date(transaction.timestamp).toLocaleDateString();
      const amount = Math.round(transaction.amount);
      const statusImage = getStatusImage(transaction.status);
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${date}</td>
          <td>${amount}</td>
          <td><img src="${statusImage}" alt="${transaction.status}" width="60" height="30"></td> <!-- Adjusted size -->
          <td>${transaction.transactionId}</td>
        </tr>
      `;
      transactionTableBody.insertAdjacentHTML('beforeend', row);
    });
  }

  function getStatusImage(status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'assets/img/pending.png';
      case 'rejected':
        return 'assets/img/rejected.png';
      case 'accepted':
        return 'assets/img/success.png';
      default:
        return '';
    }
  }

  // Initial fetch
  fetchTransactionRequests();
});
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

  //---------------------------------- Alert & gneerate QR code Function  ----------------------------------
  function handlePayment() {
    const selectedPlan = document.getElementById("selectPlan").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const userEmail = sessionStorage.getItem("userEmail");

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    // Define the number of tokens for each plan
    const planTokens = {
      "1": 0,
      "22": 10,
      "55": 25,
      "110": 50,
      "220": 100,
      "385": 175,
      "550": 250,
      "1100": 500
    };

    // Get the number of tokens for the selected plan
    const tokens = planTokens[selectedPlan] || 0;

    // Fetch the distributor user information to get the creator's email
    fetch(`http://localhost:8080/api/admin/distributor/userInfo?email=${userEmail}`)
      .then(response => response.json())
      .then(userInfo => {
        const creatorEmail = userInfo.creatorEmail;

        // Fetch the bank/UPI accounts using the creator's email
        fetch(`http://localhost:8080/api/admin/bank/view?email=${creatorEmail}`)
          .then(response => response.json())
          .then(data => {
            // Filter accounts based on selected payment method and active status
            const activeAccounts = data.filter(account => account.status.toUpperCase() === 'ACTIVE');

            if (paymentMethod === 'BankTransfer') {
              // Filter for active bank accounts
              const bankAccounts = activeAccounts.filter(account => /^[0-9]+$/.test(account.identifier) && account.type === 'Bank Account');

              // Clear previous content
              document.getElementById("bankAccountsContainer").innerHTML = "";

              if (bankAccounts.length > 0) {
                // Display all active bank accounts
                bankAccounts.forEach(account => {
                  const accountHtml = `
                    <div class="account-details mb-4">
                      <p class="fw-bold">Name: ${account.name}</p>
                      <p class="fw-bold">Account Number: ${account.identifier}</p>
                      <p class="fw-bold">IFSC Code: ${account.ifscCode || 'N/A'}</p>
                    </div>
                  `;
                  document.getElementById("bankAccountsContainer").innerHTML += accountHtml;
                });
                // Show Bank Transfer Modal
                openModal('bankTransferModal1');
              } else {
                // Show message when no active bank accounts are available
                document.getElementById("bankAccountsContainer").innerHTML = "<p>No Active Bank Account Available. Please Select Another Option.</p>";
                openModal('bankTransferModal1');
              }
            } else if (paymentMethod === 'UPI') {
              // Filter for active UPI accounts
              const upiAccounts = activeAccounts.filter(account => account.identifier.includes('@') && account.type === 'UPI Account');

              // Clear previous content
              document.getElementById("upiAccountsContainer").innerHTML = "";

              if (upiAccounts.length > 0) {
                // Display all active UPI accounts
                upiAccounts.forEach(account => {
                  const { identifier } = account;

                  // Generate UPI payment link
                  const upiLink = `upi://pay?pa=${encodeURIComponent(identifier)}&am=${selectedPlan}&cu=INR`;

                  // Create QR Code
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiLink)}&size=150x150`;
                  const accountHtml = `
                    <div class="account-details mb-4">
                      <p class="fw-bold">Please Pay ₹${selectedPlan} for ${tokens} Tokens Request on this Account</p>
                      <p class="fw-bold">Name: ${account.name}</p>
                      <p class="fw-bold">UPI ID: ${identifier}</p>
                      <div class="d-flex justify-content-center mb-4">
                        <img src="${qrCodeUrl}" alt="QR Code for ${identifier}">
                      </div>
                    </div>
                  `;
                  document.getElementById("upiAccountsContainer").innerHTML += accountHtml;
                });
                // Show UPI Modal
                openModal('upiModal1');
              } else {
                // Show message when no active UPI accounts are available
                document.getElementById("upiAccountsContainer").innerHTML = "<p>No Active UPI Account Available. Please Select Another Option.</p>";
                openModal('upiModal1');
              }
            }
          })
          .catch(error => {
            console.error('Error fetching accounts:', error);
            alert('Failed to fetch payment accounts.');
          });
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
        alert('Failed to fetch distributor user info.');
      });
  }

  // Function to open a modal
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Disable scroll when modal is open
  }

  // Function to close a modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "none";
    document.body.style.overflow = ""; // Re-enable scroll when modal is closed
  }