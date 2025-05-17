
//------------------- Dark Mode Toggle------------------------------------------------>
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    });

//----------------------- Sidebar Toggle for Small Screens------------------------->
    const sidebar = document.getElementById('sidebar');
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
    const sections = document.querySelectorAll('.content-section');

    menuItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(section => section.style.display = 'none');
            sections[index].style.display = 'block';
        });
    });

// --- Utilities: Get/Save computers from localStorage ---
function getComputersFromStorage() {
    return JSON.parse(localStorage.getItem('computers')) || {
        A: Array.from({ length: 12 }, (_, i) => ({
            id: `PC-${String(i + 1).padStart(3, '0')}`,
            room: 'A',
            status: 'Available',
            user: '------',
            lastActivity: '------',
        })),
        B: Array.from({ length: 12 }, (_, i) => ({
            id: `PC-${String(i + 1).padStart(3, '0')}`,
            room: 'B',
            status: 'Available',
            user: '------',
            lastActivity: '------',
        })),
    };
}
function saveComputersToStorage(computers) {
    localStorage.setItem('computers', JSON.stringify(computers));
}

// --- Render the computer status grid for Room A and Room B ---
function renderComputerStatusGrid() {
    const computers = getComputersFromStorage();
    // Find status grids for Room A and B by selector (adjust if your HTML differs)
    const grids = {
        A: document.querySelector('.room .status-grid:nth-of-type(1)'),
        B: document.querySelector('.room .status-grid:nth-of-type(2)'),
    };
    // If you use data-room attributes:
    // const grids = {
    //     A: document.querySelector('.room[data-room="Room A"] .status-grid'),
    //     B: document.querySelector('.room[data-room="Room B"] .status-grid'),
    // };
    if (!grids.A || !grids.B) return;

    grids.A.innerHTML = '';
    grids.B.innerHTML = '';

    // Render Room A
    computers.A.forEach(comp => {
        const item = document.createElement('div');
        item.className = 'status-item';
        item.setAttribute('data-room', 'Room A');
        item.innerHTML = `
            <i class="fas fa-desktop computer-icon ${comp.status.toLowerCase().replace(/ /g, '-')}"></i>
            <span class="computer-name">${comp.id}</span>
            <span class="computer-status ${comp.status.toLowerCase().replace(/ /g, '-')}">${comp.status}</span>
        `;
        grids.A.appendChild(item);
    });
    // Render Room B
    computers.B.forEach(comp => {
        const item = document.createElement('div');
        item.className = 'status-item';
        item.setAttribute('data-room', 'Room B');
        item.innerHTML = `
            <i class="fas fa-desktop computer-icon ${comp.status.toLowerCase().replace(/ /g, '-')}"></i>
            <span class="computer-name">${comp.id}</span>
            <span class="computer-status ${comp.status.toLowerCase().replace(/ /g, '-')}">${comp.status}</span>
        `;
        grids.B.appendChild(item);
    });
    updateStats();
}

// --- Update stats using localStorage not just the DOM! ---
function updateStats() {
    // Get ALL computers from localStorage
    const computers = getComputersFromStorage();
    const allComputers = [...computers.A, ...computers.B];
    const total = allComputers.length;

    // Count by status
    let available = 0, inUse = 0;
    allComputers.forEach(c => {
        if (c.status === 'Available') available++;
        if (c.status === 'In Use') inUse++;
    });

    // Current Status (Active/Inactive)
    const currentStatusIcon = document.getElementById('current-status-icon');
    const currentStatusText = document.getElementById('current-status-text');
    if (typeof currentSession !== 'undefined' && currentSession) {
        currentStatusText.textContent = 'Active';
        currentStatusIcon.style.color = 'green';
    } else {
        currentStatusText.textContent = 'Inactive';
        currentStatusIcon.style.color = 'gray';
    }

    // Your Usage (duration ng current session)
    let yourUsage = '0 hrs';
    if (typeof currentSession !== 'undefined' && currentSession) {
        const mins = Math.round((currentSession.end - currentSession.start) / 60000);
        yourUsage = mins >= 60 ? `${(mins / 60).toFixed(1)} hrs` : `${mins} mins`;
    }

    // Update DOM
    document.getElementById('total-computers').textContent = total;
    document.getElementById('available-computers').textContent = available;
    document.getElementById('your-usage').textContent = yourUsage;
}

// --- Session State ---
let currentSession = null;
let sessionTimer = null;
let sessionInterval = null;

// --- DOM Elements ---
const useComputerBtn = document.getElementById('use-computer-btn');
const useComputerModal = document.getElementById('use-computer-modal');
const closeModal = document.getElementById('close-modal');
const useComputerForm = document.getElementById('use-computer-form');
const extendSessionBtn = document.getElementById('extend-session-btn');
const endSessionBtn = document.getElementById('end-session-btn');
const currentPCElement = document.getElementById('current-pc');
const currentRoomElement = document.getElementById('current-room');
const durationElement = document.getElementById('session-duration');

// --- Modal Logic ---
useComputerBtn.addEventListener('click', () => {
    useComputerModal.style.display = 'flex';
});
closeModal.addEventListener('click', () => {
    useComputerModal.style.display = 'none';
});

// --- Start Session ---
useComputerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Rule: Only one monitor per user/session
    if (currentSession) {
        alert('You can only use one computer at a time. Please end your current session first.');
        useComputerModal.style.display = 'none';
        return;
    }

    const room = document.getElementById('room').value;
    const pc = document.getElementById('pc').value;
    const durationValue = document.getElementById('duration').value;
    const durationMinutes = parseInt(durationValue);

    // VALIDATION: Ensure duration is valid
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
        alert('Please enter a valid duration in minutes (greater than 0).');
        return;
    }

    // Check if selected PC is already in use (from localStorage)
    const computers = getComputersFromStorage();
    const roomKey = room === 'Room A' ? 'A' : 'B';
    const foundPC = computers[roomKey].find(c => c.id === pc);
    if (foundPC && foundPC.status === 'In Use') {
        alert('This computer is already in use. Please select another.');
        return;
    }

    // Set session state
    const now = new Date();
    const end = new Date(now.getTime() + durationMinutes * 60000);

    currentSession = {
        room,
        pc,
        start: now,
        end,
        durationMinutes
    };

    // Update Current Session UI
    currentPCElement.textContent = pc;
    currentRoomElement.textContent = room;
    durationElement.textContent = formatDuration(durationMinutes);

    // Update Computer Status in localStorage!
    updateComputerStatusInStorage(pc, 'In Use', room);

    // Enable session buttons
    endSessionBtn.disabled = false;
    extendSessionBtn.disabled = false;

    // Start timer to auto-end session
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        endSession();
        alert('Session time is up! Computer is now available.');
    }, durationMinutes * 60000);

    // Start countdown interval
    if (sessionInterval) clearInterval(sessionInterval);
    sessionInterval = setInterval(updateSessionCountdown, 1000);

    useComputerModal.style.display = 'none';
    alert(`Session started for ${pc} in ${room} for ${durationMinutes} minutes.`);
    renderComputerStatusGrid();
});

// --- Extend Session ---
extendSessionBtn.addEventListener('click', () => {
    if (!currentSession) return;
    const additionalMinutes = parseInt(prompt('Enter additional time in minutes:'));
    if (isNaN(additionalMinutes) || additionalMinutes <= 0) {
        alert('Invalid input. Please enter a valid number.');
        return;
    }
    // Extend session
    currentSession.durationMinutes += additionalMinutes;
    currentSession.end = new Date(currentSession.end.getTime() + additionalMinutes * 60000);

    // Update UI
    durationElement.textContent = formatDuration(
        Math.round((currentSession.end - currentSession.start) / 60000)
    );

    // Reset timer
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
        endSession();
        alert('Session time is up! Computer is now available.');
    }, (currentSession.end - new Date()));

    // Reset countdown interval
    if (sessionInterval) clearInterval(sessionInterval);
    sessionInterval = setInterval(updateSessionCountdown, 1000);

    alert(`Session extended by ${additionalMinutes} minutes!`);
    updateStats();
});

// --- End Session ---
endSessionBtn.addEventListener('click', () => {
    if (!currentSession) return;
    const confirmEnd = confirm('Are you sure you want to end the session?');
    if (confirmEnd) {
        endSession();
        alert('Session ended successfully!');
        renderComputerStatusGrid();
    }
});

// --- Helper Functions ---
function endSession() {
    if (!currentSession) return;
    // Reset Current Session UI
    currentPCElement.textContent = '------';
    currentRoomElement.textContent = '------';
    durationElement.textContent = '------';

    // Update Computer Status in localStorage!
    updateComputerStatusInStorage(currentSession.pc, 'Available', currentSession.room);

    // Disable session buttons
    endSessionBtn.disabled = true;
    extendSessionBtn.disabled = true;

    // Clear session state/timer
    currentSession = null;
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = null;
    if (sessionInterval) clearInterval(sessionInterval);
    sessionInterval = null;
    updateStats();
}

function updateSessionCountdown() {
    if (!currentSession) return;
    const now = new Date();
    const remainingMs = currentSession.end - now;
    if (remainingMs <= 0) {
        durationElement.textContent = '0 minutes';
        endSession();
        alert('Session time is up! Computer is now available.');
        return;
    }
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    durationElement.textContent = formatDuration(remainingMinutes);
    updateStats();
}

// --- Update computer status in localStorage! ---
function updateComputerStatusInStorage(pc, status, room) {
    const computers = getComputersFromStorage();
    const key = room === 'Room A' ? 'A' : 'B';
    let comp = computers[key].find(c => c.id === pc);
    if (comp) {
        comp.status = status;
        saveComputersToStorage(computers);
        renderComputerStatusGrid();
    }
}

// Format duration as "1 hour 30 minutes"
function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let str = '';
    if (h > 0) str += `${h} hour${h > 1 ? 's' : ''} `;
    str += `${m} minute${m !== 1 ? 's' : ''}`;
    return str;
}

// --- Optional: Refresh Button Logic ---
const refreshBtn = document.getElementById('refresh-btn');
refreshBtn.addEventListener('click', () => {
    // Set all computers to "Available" in localStorage!
    const computers = getComputersFromStorage();
    ['A', 'B'].forEach(roomKey => {
        computers[roomKey].forEach(comp => comp.status = 'Available');
    });
    saveComputersToStorage(computers);
    // End any current session
    endSession();
    alert('Computer statuses refreshed!');
    renderComputerStatusGrid();
});

// --- Auto-Refresh: Listen for admin/user changes in localStorage ---
window.addEventListener('storage', function(e) {
    if (e.key === 'computers') {
        renderComputerStatusGrid();
    }
});

// --- On page load, render status grid ---
document.addEventListener('DOMContentLoaded', renderComputerStatusGrid);
//----------------------------- Calendar Initialization--------------------------------->

    const monthYearElement = document.getElementById("monthYear");
    const daysContainer = document.getElementById("daysContainer");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    let currentDate = new Date();
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
        monthYearElement.textContent = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });
        daysContainer.innerHTML = "";
        for (let i = 0; i < firstDayOfMonth; i++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add("calendar-day");
            daysContainer.appendChild(dayElement);
        }
        for (let day = 1; day <= lastDateOfMonth; day++) {
            const dayElement = document.createElement("div");
            dayElement.textContent = day;
            dayElement.classList.add("calendar-day");
            if (
                date.getFullYear() === currentDate.getFullYear() &&
                date.getMonth() === currentDate.getMonth() &&
                day === currentDate.getDate()
            ) {
                dayElement.classList.add("today");
            }
            daysContainer.appendChild(dayElement);
        }
            }
            prevMonthBtn.addEventListener("click", () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar(currentDate);
            });
            nextMonthBtn.addEventListener("click", () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar(currentDate);
            })
            renderCalendar(currentDate);

//-------------------------------------------------Profile Section-------------------------------->
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const closeEditProfile = document.getElementById('close-edit-profile');
    const cancelEditProfile = document.getElementById('cancel-edit-profile');
    const editProfileForm = document.getElementById('edit-profile-form');
    const profilePicture = document.querySelector('.profile-sidebar img');
    const profileName = document.querySelector('.profile-sidebar h2');
    const profileRole = document.querySelector('.profile-sidebar p');

    editProfileBtn.addEventListener('click', () => {
        editProfileModal.style.display = 'flex';
    });
    closeEditProfile.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });
    cancelEditProfile.addEventListener('click', () => {
        editProfileModal.style.display = 'none';
    });
    editProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('edit-first-name').value;
        const lastName = document.getElementById('edit-last-name').value;
        const middleName = document.getElementById('edit-middle-name').value;

        profileName.textContent = `${firstName} ${lastName}`;
        profileRole.textContent = 'BSIT Student'; 

        // Update profile picture if a new one is uploaded
        const fileInput = document.getElementById('edit-profile-picture');
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicture.src = e.target.result;
            };
            reader.readAsDataURL(fileInput.files[0]);
        }

        alert('Profile updated successfully!');
        editProfileModal.style.display = 'none';
    });

    // Change Password Modal Functionality
    const changePasswordBtn = document.getElementById('change-password-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const closeChangePassword = document.getElementById('close-change-password');
    const cancelChangePassword = document.getElementById('cancel-change-password');
    const changePasswordForm = document.getElementById('change-password-form');

    // Open the Change Password Modal
    changePasswordBtn.addEventListener('click', () => {
        changePasswordModal.style.display = 'flex';
    });

    // Close the Change Password Modal
    closeChangePassword.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
    });

    cancelChangePassword.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
    });

    // Handle Change Password Form Submission
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword === confirmPassword) {
            alert('Password changed successfully!');
            changePasswordModal.style.display = 'none';
        } else {
            alert('Passwords do not match!');
        }
    });

//------------------------------------------------Usage History--------------------------------->

        function filterTable() {
            const input = document.getElementById("searchInput").value.toLowerCase();
            const table = document.getElementById("usageTable");
            const rows = table.getElementsByTagName("tr");
            let visibleRows = 0;
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName("td");
                let match = false;
                for (let j = 0; j < cells.length; j++) {
                    if (cells[j].textContent.toLowerCase().includes(input)) {
                        match = true;
                        break;
                    }
                }
                rows[i].style.display = match ? "" : "none";
                if (match) visibleRows++;
            }
            document.getElementById("noHistoryMessage").style.display = visibleRows > 0 ? "none" : "block";
        }

//--------------------------------------------Contact Support--------------------------------->

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const urgent = document.getElementById('urgent').checked;

    alert(`Message Sent!\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nUrgent: ${urgent ? 'Yes' : 'No'}\nMessage: ${message}`);
    contactForm.reset();
});        

//-------------------------------Logout Confirmation / Profile Button -------------------------------------->
// Dropdown Menu Functionality
const userProfile = document.getElementById('userProfile');
const dropdownMenu = document.getElementById('dropdownMenu');
const myProfileBtn = document.getElementById('myProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle dropdown menu on click
userProfile.addEventListener('click', () => {
    const isVisible = dropdownMenu.style.display === 'flex';
    dropdownMenu.style.display = isVisible ? 'none' : 'flex';
});

// Close dropdown menu when clicking outside
document.addEventListener('click', (e) => {
    if (!userProfile.contains(e.target)) {
        dropdownMenu.style.display = 'none';
    }
});

// My Profile button functionality
myProfileBtn.addEventListener('click', () => {
    // Hide the dropdown menu
    dropdownMenu.style.display = 'none';

    // Show the My Profile section and hide other sections
    const profileSection = document.getElementById('profile-section');
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => section.style.display = 'none'); // Hide all sections
    profileSection.style.display = 'block'; // Show the My Profile section

    // Scroll to the My Profile section
    profileSection.scrollIntoView({ behavior: 'smooth' });
});

// Logout button functionality
logoutBtn.addEventListener('click', () => {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
        const loggedInEmail = sessionStorage.getItem('loggedInEmail');
        if (loggedInEmail) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.email === loggedInEmail);
            if (userIndex !== -1) {
                users[userIndex].status = 'Inactive';
                localStorage.setItem('users', JSON.stringify(users));
            }
        }
        sessionStorage.clear();
        window.location.href = 'Index.html';
    }
});

//--------------------------------User 