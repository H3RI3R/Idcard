document.addEventListener('DOMContentLoaded', function() {
    const userEmail = sessionStorage.getItem('userEmail');
    document.getElementById('userEmail').innerText = userEmail;
    document.getElementById('userEmail1').innerText = userEmail;});


//------------------------------------ ID card creation APi  ---------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    function loadIDCardCreationTable() {
        const userEmail = sessionStorage.getItem('userEmail');

        if (!userEmail) {
            console.error('User email not found in session storage');
            return;
        }

        const apiUrl = `http://localhost:8080/api/admin/retailer/recent-activities?userEmail=${encodeURIComponent(userEmail)}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(activities => {
            const retailerTableBody = document.getElementById('retailerTableBody');
            retailerTableBody.innerHTML = '';

            activities
                .filter(activity => activity.type === 'ID_CARD_CREATION')
                .forEach(activity => {
                const row = document.createElement('tr');

                // Extracting ID Card Name from details
                const idCardName = activity.details.split('ID card created for ')[1] || 'Unknown';

                // Custom date parsing function
                function parseCustomDate(dateString) {
                    const parts = dateString.split(' ');
                    const [day, month, date, time, timeZone, year] = parts;

                    // Month map for converting month names to numbers
                    const monthMap = {
                        Jan: '01', Feb: '02', Mar: '03', Apr: '04',
                        May: '05', Jun: '06', Jul: '07', Aug: '08',
                        Sep: '09', Oct: '10', Nov: '11', Dec: '12'
                    };

                    return `${year}-${monthMap[month]}-${date} ${time}`;
                }

                // Parse the timestamp
                let formattedDate;
                try {
                    const dateString = parseCustomDate(activity.timestamp);
                    const date = new Date(dateString);
                    if (isNaN(date.getTime())) {
                        formattedDate = 'Invalid Date';
                    } else {
                        formattedDate = date.toLocaleString();
                    }
                } catch (error) {
                    console.error('Error parsing date:', error);
                    formattedDate = 'Invalid Date';
                }

                row.innerHTML = `
                            <td>${idCardName}</td>
                            <td>Success</td>
                            <td>${activity.id}</td>
                            <td>${formattedDate}</td>
                        `;

                retailerTableBody.appendChild(row);
            });
        })
            .catch(error => {
            console.error('Error fetching activities:', error);
        });
    }

    loadIDCardCreationTable();
});
//------------------------------------ Active page fucntion ---------------------------------------
/**
* Template Name: NiceAdmin
* Template URL: https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/
* Updated: Apr 20 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
    "use strict";

    /**
     * Easy selector helper function
     */
    const select = (el, all = false) => {
        el = el.trim()
        if (all) {
            return [...document.querySelectorAll(el)]
        } else {
            return document.querySelector(el)
        }
    }

    /**
     * Easy event listener function
     */
    const on = (type, el, listener, all = false) => {
        if (all) {
            select(el, all).forEach(e => e.addEventListener(type, listener))
        } else {
            select(el, all).addEventListener(type, listener)
        }
    }

    /**
     * Easy on scroll event listener
     */
    const onscroll = (el, listener) => {
        el.addEventListener('scroll', listener)
    }

    /**
     * Sidebar toggle
     */
    if (select('.toggle-sidebar-btn')) {
        on('click', '.toggle-sidebar-btn', function(e) {
            select('body').classList.toggle('toggle-sidebar')
        })
    }

    /**
     * Search bar toggle
     */
    if (select('.search-bar-toggle')) {
        on('click', '.search-bar-toggle', function(e) {
            select('.search-bar').classList.toggle('search-bar-show')
        })
    }

    /**
     * Navbar links active state on scroll
     */
    let navbarlinks = select('#navbar .scrollto', true)
    const navbarlinksActive = () => {
        let position = window.scrollY + 200
        navbarlinks.forEach(navbarlink => {
            if (!navbarlink.hash) return
            let section = select(navbarlink.hash)
            if (!section) return
            if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
                navbarlink.classList.add('active')
            } else {
                navbarlink.classList.remove('active')
            }
        })
    }
    window.addEventListener('load', navbarlinksActive)
    onscroll(document, navbarlinksActive)

    /**
     * Toggle .header-scrolled class to #header when page is scrolled
     */
    let selectHeader = select('#header')
    if (selectHeader) {
        const headerScrolled = () => {
            if (window.scrollY > 100) {
                selectHeader.classList.add('header-scrolled')
            } else {
                selectHeader.classList.remove('header-scrolled')
            }
        }
        window.addEventListener('load', headerScrolled)
        onscroll(document, headerScrolled)
    }

    /**
     * Back to top button
     */
    let backtotop = select('.back-to-top')
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active')
            } else {
                backtotop.classList.remove('active')
            }
        }
        window.addEventListener('load', toggleBacktotop)
        onscroll(document, toggleBacktotop)
    }

    /**
     * Initiate tooltips
     */
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    /**
     * Initiate quill editors
     */
    if (select('.quill-editor-default')) {
        new Quill('.quill-editor-default', {
            theme: 'snow'
        });
    }

    if (select('.quill-editor-bubble')) {
        new Quill('.quill-editor-bubble', {
            theme: 'bubble'
        });
    }

    if (select('.quill-editor-full')) {
        new Quill(".quill-editor-full", {
            modules: {
                toolbar: [
                    [{
                        font: []
                    }, {
                        size: []
                    }],
                    ["bold", "italic", "underline", "strike"],
                    [{
                        color: []
                    },
                        {
                            background: []
                        }
                    ],
                    [{
                        script: "super"
                    },
                        {
                            script: "sub"
                        }
                    ],
                    [{
                        list: "ordered"
                    },
                        {
                            list: "bullet"
                        },
                        {
                            indent: "-1"
                        },
                        {
                            indent: "+1"
                        }
                    ],
                    ["direction", {
                        align: []
                    }],
                    ["link", "image", "video"],
                    ["clean"]
                ]
            },
            theme: "snow"
        });
    }

    /**
     * Initiate TinyMCE Editor
     */

    const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches;

    tinymce.init({
        selector: 'textarea.tinymce-editor',
        plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
        editimage_cors_hosts: ['picsum.photos'],
        menubar: 'file edit view insert format tools table help',
        toolbar: "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        image_advtab: true,
        link_list: [{
            title: 'My page 1',
            value: 'https://www.tiny.cloud'
        },
            {
                title: 'My page 2',
                value: 'http://www.moxiecode.com'
            }
        ],
        image_list: [{
            title: 'My page 1',
            value: 'https://www.tiny.cloud'
        },
            {
                title: 'My page 2',
                value: 'http://www.moxiecode.com'
            }
        ],
        image_class_list: [{
            title: 'None',
            value: ''
        },
            {
                title: 'Some class',
                value: 'class-name'
            }
        ],
        importcss_append: true,
        file_picker_callback: (callback, value, meta) => {
            /* Provide file and text for the link dialog */
            if (meta.filetype === 'file') {
                callback('https://www.google.com/logos/google.jpg', {
                    text: 'My text'
                });
            }

            /* Provide image and alt text for the image dialog */
            if (meta.filetype === 'image') {
                callback('https://www.google.com/logos/google.jpg', {
                    alt: 'My alt text'
                });
            }

            /* Provide alternative source and posted for the media dialog */
            if (meta.filetype === 'media') {
                callback('movie.mp4', {
                    source2: 'alt.ogg',
                    poster: 'https://www.google.com/logos/google.jpg'
                });
            }
        },
        height: 600,
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: useDarkMode ? 'oxide-dark' : 'oxide',
        content_css: useDarkMode ? 'dark' : 'default',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
    });

    /**
     * Initiate Bootstrap validation check
     */
    var needsValidation = document.querySelectorAll('.needs-validation')

    Array.prototype.slice.call(needsValidation)
        .forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })

    /**
     * Initiate Datatables
     */
    const datatables = select('.datatable', true)
    datatables.forEach(datatable => {
        new simpleDatatables.DataTable(datatable, {
            perPageSelect: [5, 10, 15, ["All", -1]],
            columns: [{
                select: 2,
                sortSequence: ["desc", "asc"]
            },
                {
                    select: 3,
                    sortSequence: ["desc"]
                },
                {
                    select: 4,
                    cellClass: "green",
                    headerClass: "red"
                }
            ]
        });
    })

    /**
     * Autoresize echart charts
     */
    const mainContainer = select('#main');
    if (mainContainer) {
        setTimeout(() => {
            new ResizeObserver(function() {
                select('.echart', true).forEach(getEchart => {
                    echarts.getInstanceByDom(getEchart).resize();
                })
            }).observe(mainContainer);
        }, 200);
    }

})();
//-------------------------------------------------------

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

//---------------------------------- Table  Api -----------------------------------
document.addEventListener("DOMContentLoaded", function() {
    const retailerTableBody = document.getElementById("retailerTableBody");

    // Fetch ID Card history using the session data (userEmail)
    function fetchIdCardHistory() {
        const userEmail = sessionStorage.getItem('userEmail');

        if (!userEmail) {
            alert("User email not found in session.");
            return;
        }

        fetch(`http://localhost:8080/api/admin/retailer/idcard-history?retailerEmail=${encodeURIComponent(userEmail)}`)
            .then(response => response.json())
            .then(data => {
            if (data.error) {
                alert(`Error: ${data.error}`);
                return;
            }

            if (data.idCardHistory && data.idCardHistory.length > 0) {
                // Clear existing table data
                retailerTableBody.innerHTML = "";

                // Populate table with the fetched ID card history details
                data.idCardHistory.forEach(idCard => {
                    const row = document.createElement("tr");

                    // Mask phone number, showing only the last 4 digits
                    const maskedPhoneNumber = idCard.phoneNumber.slice(-4).padStart(idCard.phoneNumber.length, '*');

                    row.innerHTML = `
                            <td>${idCard.name}</td>
                            <td>${maskedPhoneNumber}</td>
                            <td>${idCard.businessName}</td>
                            <td>Success</td>
                            <td>${idCard.id}</td>
                        `;
                    retailerTableBody.appendChild(row);
                });
            } else {
                retailerTableBody.innerHTML = `<tr><td colspan="5">No ID cards found.</td></tr>`;
            }
        })
            .catch(error => {
            console.error("Error fetching ID Card history:", error);
            alert("An error occurred while fetching the ID Card history.");
        });
    }

    // Call the fetch function on page load
    fetchIdCardHistory();
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