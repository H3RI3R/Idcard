
  //  ------------------------------table api of status ------------------------------------------
  document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail'); // Fetch session storage userEmail
    const transactionTableBody = document.getElementById('transactionTableBody');
    const searchInput = document.getElementById('searchTransactionId');
    const refreshButton = document.getElementById('refreshButton');
    const tokenPlanMap = {
      22: 10,
      55: 25,
      110: 50,
      220: 100,
      385: 175,
      550: 250,
      1100: 500
    };

    function fetchAndDisplayTransactions() {
      fetch(`http://localhost:8080/api/admin/distributor/getTransactionRequests?creatorEmail=${userEmail}&userEmail=${userEmail}`)
        .then(response => response.json())
        .then(data => {
        transactionTableBody.innerHTML = ''; // Clear the table body

        // Filter the data if search input is provided
        const filteredData = data.filter(transaction =>
        !searchInput.value || transaction.transactionId.includes(searchInput.value)
        );

        filteredData.forEach((transaction, index) => {
          // Determine the type based on session storage userEmail
          let type = '';
          if (transaction.userEmail === userEmail) {
            type = 'Request Sent';
          } else if (transaction.creatorEmail === userEmail) {
            type = 'Request Received';
          }

          // Format the date (removing time)
          const date = new Date(transaction.timestamp).toLocaleDateString();

          // Determine the status image
          let statusImage = '';
          switch (transaction.status) {
            case 'Pending':
              statusImage = 'assets/img/pending.png';
              break;
            case 'Rejected':
              statusImage = 'assets/img/rejected.png';
              break;
            case 'Accepted':
              statusImage = 'assets/img/success.png';
              break;
            default:
              statusImage = 'assets/img/default.png'; // Fallback image
          }

          // Create table row with buttons for 'Request Received' and 'Pending'
          const row = `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${date}</td>
                            <td>${Math.round(transaction.amount)}</td>
                            <td><img src="${statusImage}" alt="${transaction.status}" style="height: 20px;"></td>
                            <td>${transaction.transactionId}</td>
                            <td>${type}</td>
                            <td>
                                ${transaction.status === 'Pending' && type === 'Request Received' ? `
                                    <button class="btn btn-sm btn-success me-2" onclick="updateStatusAndSendToken('${transaction.transactionId}', 'Accepted', ${transaction.amount}, '${transaction.userEmail}')">Accept</button>
                                    <button class="btn btn-sm btn-danger" onclick="updateStatus('${transaction.transactionId}', 'Rejected')">Reject</button>
                                ` : ''}
                            </td>
                        </tr>
                    `;
          transactionTableBody.innerHTML += row;
        });
      })
        .catch(error => console.error('Error fetching transaction requests:', error));
    }

    // Function to update transaction status
    window.updateStatus = function(transactionId, status) {
      fetch(`http://localhost:8080/api/admin/distributor/updateTransactionStatus?transactionId=${transactionId}&status=${status}`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(data => {
        if (data.message) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message,
            confirmButtonText: 'OK'
          }).then(() => {
            fetchAndDisplayTransactions(); // Refresh the table
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error || 'An error occurred',
            confirmButtonText: 'OK'
          });
        }
      })
        .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating the status',
          confirmButtonText: 'OK'
        });
        console.error('Error:', error);
      });
    }

    // Function to update transaction status and send token
    window.updateStatusAndSendToken = function(transactionId, status, amount, recipientEmail) {
      // First update the status
      updateStatus(transactionId, status);

      // Get the token amount for the selected plan
      const tokenAmount = tokenPlanMap[amount];

      // Then send the token to the recipient
      fetch(`http://localhost:8080/api/admin/token/send?senderIdentifier=${userEmail}&amount=${tokenAmount}&recipient=${recipientEmail}`, {
        method: 'POST'
      })
        .then(response => response.json())
        .then(data => {
        if (data.message) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Token sent successfully!',
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error || 'An error occurred while sending the token',
            confirmButtonText: 'OK'
          });
        }
      })
        .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while sending the token',
          confirmButtonText: 'OK'
        });
        console.error('Error:', error);
      });
    }

    // Fetch transactions on page load
    fetchAndDisplayTransactions();

    // Refresh button event listener
    refreshButton.addEventListener('click', fetchAndDisplayTransactions);

    // Search input event listener
    searchInput.addEventListener('input', fetchAndDisplayTransactions);
  });
  //  ------------------------------Create transection request api------------------------------------------

   document.addEventListener("DOMContentLoaded", function() {
      const doneButton = document.getElementById("bankDoneButton1");
      const doneButton1 = document.getElementById("upiDoneButton1");


      doneButton.addEventListener("click", function() {
        const transactionID = document.getElementById("transactionID").value;
        const amount = document.getElementById("selectPlan").value;
        const email = sessionStorage.getItem('userEmail'); // Replace with the actual session email value

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
          } else {
            showAlert("Error: " + (data.error || "Unknown error"));
          }
        })
          .catch(error => {
          showAlert("Error: " + error.message);
        });
      });


      doneButton1.addEventListener("click", function() {
        const transactionID = document.getElementById("transactionID").value;
        const amount = document.getElementById("selectPlan").value;
        const email = sessionStorage.getItem('userEmail'); // Replace with the actual session email value

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
          } else {
            showAlert("Error: " + (data.error || "Unknown error"));
          }
        })
          .catch(error => {
          showAlert("Error: " + error.message);
        });
      });

      function showAlert(message) {
        const alert = document.getElementById("paymentAlert");
        const alertMessage = document.getElementById("alertMessage");
        alertMessage.textContent = message;
        alert.classList.remove("d-none");
      }
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
          if (paymentMethod === 'BankTransfer') {
            // Filter for bank accounts
            const bankAccounts = data.filter(account => /^[0-9]+$/.test(account.identifier));

            // Clear previous content
            document.getElementById("bankAccountsContainer").innerHTML = "";

            if (bankAccounts.length > 0) {
              // Display all bank accounts
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
              // Show message when no bank accounts are available
              document.getElementById("bankAccountsContainer").innerHTML = "<p>No Account Available. Please Select Another Option.</p>";
              openModal('bankTransferModal1');
            }
          } else if (paymentMethod === 'UPI') {
            // Filter for UPI accounts
            const upiAccounts = data.filter(account => account.identifier.includes('@'));

            // Clear previous content
            document.getElementById("upiAccountsContainer").innerHTML = "";

            if (upiAccounts.length > 0) {
              // Display all UPI accounts
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
              // Show message when no UPI accounts are available
              document.getElementById("upiAccountsContainer").innerHTML = "<p>No Account Available. Please Select Another Option.</p>";
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

//--------------------------------------Account APi -0-------------------------------------------
 const userEmail = sessionStorage.getItem('userEmail');
 let selectedAccountId = null; // Variable to hold the currently selected account ID
 let currentIdentifier = ''; // To store the current identifier
 let currentName = ''; // To store the current name
 let selectedIdentifier = ''; // To store the identifier for activation/deactivation

 // Function to fetch API data and populate the table
 function fetchAndDisplayAccounts() {
     fetch(`http://localhost:8080/api/admin/bank/view?email=${userEmail}`)
         .then(response => response.json())
         .then(data => {
             const tableBody = document.getElementById('accountTableBody');
             tableBody.innerHTML = ''; // Clear existing rows

             data.forEach(account => {
                 const row = document.createElement('tr');

                 // Determine account type and status
                 let accountType = account.identifier
                     ? account.identifier.includes('@') ? 'UPI Account' : 'Bank Account'
                     : 'Unknown';

                 const identifier = account.identifier || 'N/A';
                 const name = account.name || 'N/A';
                 const status = account.status || 'N/A';

                 // Determine status button based on the account status
                 const statusButton = status === 'ACTIVE'
                     ? `<button class="btn btn-success btn-sm" onclick="openDeactivateModal('${identifier}')">Active</button>`
                     : `<button class="btn btn-dark btn-sm" onclick="openActivateModal('${identifier}')">Deactivate</button>`;

                 row.innerHTML = `
                     <td>${account.id}</td>
                     <td>${accountType}</td>
                     <td>${identifier}</td>
                     <td>${name}</td>
                     <td>
                       <button class="btn btn-warning btn-sm" onclick="openEditModal(${account.id}, '${identifier}', '${name}')">Edit</button>
                       <button class="btn btn-danger btn-sm" onclick="deleteAccount('${account.id}', '${identifier}')">Delete</button>
                       ${statusButton}
                     </td>
                 `;

                 tableBody.appendChild(row);
             });
         })
         .catch(error => {
             console.error('Error fetching accounts:', error);
         });
 }

 // Function to open the edit modal and populate fields
 function openEditModal(id, identifier, name) {
     selectedAccountId = id; // Store the current account ID for reference
     currentIdentifier = identifier;
     currentName = name;

     // Set modal input fields with current values
     document.getElementById('editIdentifier').value = identifier;
     document.getElementById('editName').value = name;

     const editModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
     editModal.show();
 }

 // Function to save changes and call the API
 function saveChanges() {
     const newIdentifier = document.getElementById('editIdentifier').value;
     const newName = document.getElementById('editName').value;

     let changeIdentifier = '';
     let changeName = '';

     let isIdentifierChanged = false;
     let isNameChanged = false;

     // Check if the identifier was changed
     if (newIdentifier !== currentIdentifier) {
         changeIdentifier = newIdentifier; // Send new identifier to API
         isIdentifierChanged = true;
     }

     // Check if the name was changed
     if (newName !== currentName) {
         changeName = newName; // Send new name to API
         isNameChanged = true;
     }

     // If neither identifier nor name was changed, exit the function
     if (!isIdentifierChanged && !isNameChanged) {
         showAlert('warning', 'No changes were made.');
         return;
     }

     // Prepare the API URL with the parameters for both changes
     let apiUrl = `http://localhost:8080/api/admin/bank/modify?email=${userEmail}&identifier=${currentIdentifier}`;

     // Append parameters conditionally based on what was changed
     if (isIdentifierChanged) {
         apiUrl += `&changeIdentifier=${encodeURIComponent(changeIdentifier)}`;
     }
     if (isNameChanged) {
         apiUrl += `&changeName=${encodeURIComponent(changeName)}`;
     }

     fetch(apiUrl, {
         method: 'PUT',
         headers: {
             'Content-Type': 'application/json'
         }
     })
         .then(response => response.json())
         .then(data => {
             if (data.status === 'success') {
                 // Show success message based on what was changed
                 let successMessage = '';
                 if (isIdentifierChanged && isNameChanged) {
                     successMessage = 'Identifier and Name have been successfully changed.';
                 } else if (isIdentifierChanged) {
                     successMessage = 'Identifier has been successfully changed.';
                 } else if (isNameChanged) {
                     successMessage = 'Name has been successfully changed.';
                 }

                 showAlert('success', successMessage);
                 fetchAndDisplayAccounts(); // Refresh the account table

                 const editModal = bootstrap.Modal.getInstance(document.getElementById('editAccountModal'));
                 editModal.hide(); // Close the modal
             } else {
                 showAlert('danger', 'Failed to modify the account.');
             }
         })
         .catch(error => {
             console.error('Error modifying account:', error);
             showAlert('danger', 'An error occurred while modifying the account.');
         });
 }

 // Function to open the deactivate confirmation modal
 function openDeactivateModal(identifier) {
     selectedIdentifier = identifier; // Store the identifier of the account
     const deactivateModal = new bootstrap.Modal(document.getElementById('deactivateModal'));
     deactivateModal.show();
 }

 // Function to deactivate the account after confirmation
 function deactivateAccount() {
     fetch(`http://localhost:8080/api/admin/bank/updateStatus?email=${userEmail}&identifier=${selectedIdentifier}&status=DEACTIVE`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         }
     })
     .then(response => response.text()) // Handle plain text response
     .then(text => {
         if (text === 'Bank status updated successfully') {
             showAlert('success', 'Account has been deactivated.');
             fetchAndDisplayAccounts(); // Refresh the account table

             const deactivateModal = bootstrap.Modal.getInstance(document.getElementById('deactivateModal'));
             deactivateModal.hide(); // Close the modal
         } else {
             showAlert('danger', 'Failed to deactivate the account.');
         }
     })
     .catch(error => {
         console.error('Error deactivating account:', error);
         showAlert('danger', 'An error occurred while deactivating the account.');
     });
 }

 // Function to open the activate confirmation modal
 function openActivateModal(identifier) {
     selectedIdentifier = identifier; // Store the identifier of the account
     const activateModal = new bootstrap.Modal(document.getElementById('activateAccountModal'));
     activateModal.show();
 }

 // Function to activate the account after confirmation
 function activateAccount() {
     fetch(`http://localhost:8080/api/admin/bank/updateStatus?email=${userEmail}&identifier=${selectedIdentifier}&status=ACTIVE`, {
         method: 'POST',
         headers: {
             'Content-Type': 'application/json'
         }
     })
     .then(response => response.text()) // Handle plain text response
     .then(text => {
         if (text === 'Bank status updated successfully') {
             showAlert('success', 'Account has been activated.');
             fetchAndDisplayAccounts(); // Refresh the account table

             const activateModal = bootstrap.Modal.getInstance(document.getElementById('activateAccountModal'));
             activateModal.hide(); // Close the modal
         } else {
             showAlert('danger', 'Failed to activate the account.');
         }
     })
     .catch(error => {
         console.error('Error activating account:', error);
         showAlert('danger', 'An error occurred while activating the account.');
     });
 }

 // Function to show alerts using SweetAlert
 function showAlert(type, message) {
     Swal.fire({
         icon: type,
         title: message,
         showConfirmButton: true,
         timer: 3000
     });
 }

  // ---------------------------- Delete API -------------------------------
  // Variable to hold the account details for deletion
  let currentDeleteAccountIdentifier = null;

  // Function to trigger the delete confirmation modal
  function deleteAccount(id, identifier) {
    currentDeleteAccountIdentifier = identifier;

    // Set the account to delete in the confirmation modal
    document.getElementById('accountToDelete').innerText = identifier;

    // Show the delete confirmation modal
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'));
    deleteModal.show();
  }

  // Function to handle the actual deletion
  function handleDelete() {
    const userEmail = sessionStorage.getItem('userEmail');
    const apiUrl = `http://localhost:8080/api/admin/bank/delete?email=${userEmail}&identifier=${currentDeleteAccountIdentifier}`;

    fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.text())
      .then(data => {
      if (data.includes('Bank deleted successfully')) {
        // Show success alert
        showAlert('success', 'Bank deleted successfully');
        fetchAndDisplayAccounts(); // Refresh the account table
      } else {
        // Show error alert
        showAlert('danger', 'Failed to delete the account');
      }

      // Hide the delete confirmation modal
      const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmationModal'));
      deleteModal.hide();
    })
      .catch(error => {
      console.error('Error deleting account:', error);
      showAlert('danger', 'An error occurred while deleting the account');
    });
  }

  // Function to setup the delete button listener
  function setupDeleteButtonListener() {
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    if (confirmDeleteButton) {
      confirmDeleteButton.addEventListener('click', handleDelete);
      console.log('Delete button listener set up successfully.');
    } else {
      console.error('Confirm Delete Button not found.');
    }
  }

  // Ensure event listeners are added once the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    setupDeleteButtonListener();
    fetchAndDisplayAccounts(); // Load the table when the page loads
  });

  // Function to display Bootstrap alerts
  function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.className = `alert alert-${type}`;
    alertContainer.textContent = message;
    alertContainer.classList.remove('d-none'); // Show the alert

    // Automatically hide the alert after 5 seconds
    setTimeout(() => {
      alertContainer.classList.add('d-none');
    }, 5000);
  }
let isFilterActive = false;

function filterActiveAccounts() {
    // Get all table rows
    const rows = document.querySelectorAll('#accountTableBody tr');
    const button = document.getElementById('toggleActiveFilter');

    rows.forEach(row => {
        // Check if the Actions column contains an "Active" button
        const actionsCell = row.querySelector('td:last-child');
        if (actionsCell) {
            const buttons = actionsCell.querySelectorAll('button');
            let showRow = false;

            // Check if there is an "Active" button
            buttons.forEach(button => {
                if (button.textContent.trim() === 'Active') {
                    showRow = true;
                }
            });

            // Show or hide the row based on the presence of the "Active" button
            if (isFilterActive) {
                row.style.display = ''; // Show the row
            } else {
                if (showRow) {
                    row.style.display = ''; // Show the row
                } else {
                    row.style.display = 'none'; // Hide the row
                }
            }
        }
    });

    // Toggle filter state and update button text
    isFilterActive = !isFilterActive;
    button.innerHTML = isFilterActive ?
        '<span class="fs-6 me-2" id="buttonText">Show All <i class="bi bi-arrow-up"></i></span>' :
        '<span class="fs-6 me-2" id="buttonText">Show Active <i class="bi bi-arrow-down"></i></span>';
}

  //---------------------------------------------Add Bank Account ---------------------------
  document.addEventListener('DOMContentLoaded', function () {
    const addBankForm = document.getElementById('addBankForm');
    const addBankBtn = document.getElementById('addBankBtn');

    if (addBankForm && addBankBtn) {
      // Listen for the button click
      addBankBtn.addEventListener('click', function () {
        console.log('Button clicked!'); // Check if the button click is registered

        // Retrieve email from session storage
        const email = sessionStorage.getItem('userEmail');
        if (!email) {
          console.error('Email not found in session storage.');
          showErrorModal("User email not found.");
          return;
        }

        // Gather form data
        const accountNumber = document.getElementById('accountNumber').value.trim();
        const reAccountNumber = document.getElementById('reAccountNumber').value.trim();
        const accountOwnerFullName = document.getElementById('accountOwner').value.trim();
        const fathersName = document.getElementById('fathersName').value.trim();
        const mothersName = document.getElementById('mothersName').value.trim();
        const address = document.getElementById('address').value.trim();
        const ifscCode = document.getElementById('ifscCode').value.trim();

        // Validate account number match
        if (accountNumber !== reAccountNumber) {
          console.error('Account numbers do not match.');
          showErrorModal("Account numbers do not match.");
          return;
        }

        // Validate required fields
        if (!accountNumber || !accountOwnerFullName || !fathersName || !mothersName || !address || !ifscCode) {
          console.error('All fields are required.');
          showErrorModal("All fields are required.");
          return;
        }

        // Create the request body
        const requestBody = new URLSearchParams({
          email: email,
          accountNumber: accountNumber,
          reEnterAccountNumber: reAccountNumber,
          accountOwnerFullName: accountOwnerFullName,
          fathersName: fathersName,
          mothersName: mothersName,
          address: address,
          ifscCode: ifscCode
        });

        console.log('Request body:', requestBody.toString()); // Debugging log

        // Send the POST request to the API
        fetch('http://localhost:8080/api/admin/bank/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: requestBody
        })
          .then(response => response.text()) // Convert to text to match the response format
          .then(data => {
          console.log('Response data:', data); // Debugging log
          if (data === "Bank saved successfully") {
            showSuccessModal();
            addBankForm.reset(); // Optionally reset the form after successful submission
          } else {
            showErrorModal("Error: " + data);
          }
        })
          .catch(error => {
          console.error('Error:', error); // Debugging log
          showErrorModal("An error occurred while saving the bank.");
        });
      });
    } else {
      console.error('addBankForm or addBankBtn element not found.');
    }

    // Show success modal
    function showSuccessModal() {
      const successModal = new bootstrap.Modal(document.getElementById('successModal'));
      successModal.show();

      // Optionally, refresh the page or reload the table after closing the modal
      successModal._element.addEventListener('hidden.bs.modal', function () {
        location.reload(); // Refresh the page after closing
      });
    }

    // Show error modal
    function showErrorModal(errorMessage) {
      const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
      document.getElementById('errorModalBody').innerText = errorMessage;
      errorModal.show();
    }
  });
  //---------------------------------Add Upi account apis--------------------------------------
  document.getElementById('addUpiForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData();
    const email = sessionStorage.getItem('userEmail');
    formData.append('email', email);
    formData.append('upiId', document.getElementById('upiId').value);
    formData.append('upiName', document.getElementById('upiAccountName').value);
    formData.append('upiFathersName', document.getElementById('upiFathersName').value);
    formData.append('upiMothersName', document.getElementById('upiMothersName').value);
    formData.append('upiProvider', 'Some UPI Provider'); // Example provider
    formData.append('address', document.getElementById('upiAddress').value);

    // Append the QR Code file
    const qrCodeFile = document.getElementById('upiQrCode').files[0];
    if (qrCodeFile) {
      formData.append('qrCodeFile', qrCodeFile);
    }

    fetch('http://localhost:8080/api/admin/bank/save', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      if (data.includes('Bank saved successfully')) {
        // Show success alert and close modal
        showAlert('success', 'Bank saved successfully');
        const addUpiModal = bootstrap.Modal.getInstance(document.getElementById('addUpiModal'));
        addUpiModal.hide();
        fetchAndDisplayAccounts(); // Refresh the table
      } else {
        showAlert('danger', 'Failed to save bank details');
      }
    })
    .catch(error => {
      console.error('Error saving bank details:', error);
      showAlert('danger', 'An error occurred while saving bank details');
    });
  });

  function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.className = `alert alert-${type}`;
    alertContainer.textContent = message;
    alertContainer.classList.remove('d-none');
    setTimeout(() => {
      alertContainer.classList.add('d-none');
    }, 5000);
  }