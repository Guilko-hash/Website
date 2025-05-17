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
        // Render computer table if Computer Management tab is shown
        if (sections[index].id === 'computer-section') {
            renderTable(roomSelect.value);
        }
        // Render user table if User Management tab is shown
        if (sections[index].id === 'users-section') {
            renderUserTable();
        }
        // Update stats & chart in case you switched to dashboard
        if (sections[index].id === 'dashboard-section') {
            updateStatsAndChart();
            updateTotalRegistered();
        }
    });
});

//-------------------------------Logout Confirmation / Profile Button -------------------------------------->
const userProfile = document.getElementById('userProfile');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutBtn = document.getElementById('logoutBtn');
userProfile.addEventListener('click', () => {
    const isVisible = dropdownMenu.style.display === 'flex';
    dropdownMenu.style.display = isVisible ? 'none' : 'flex';
});
document.addEventListener('click', (e) => {
    if (!userProfile.contains(e.target)) {
        dropdownMenu.style.display = 'none';
    }
});
logoutBtn.addEventListener('click', () => {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = 'Index.html'; // Replace with the actual login page URL
    }
});

// ------------------------------------Usage Statistics Chart--------------------------->
const computerStatusChart = new Chart(document.getElementById('computerStatusChart'), {
    type: 'doughnut',
    data: {
        labels: ['Available', 'In Use', 'Under Maintenance', 'Out of Order'],
        datasets: [{
            data: [32, 10, 4, 2],
            backgroundColor: ['#22c55e', '#2563eb', '#f59e0b', '#e53e3e'],
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    }
                }
            }
        }
    }
});

// -------------------Daily Active Computers Chart
const dailyUsageChart = new Chart(document.getElementById('dailyUsageChart'), {
    type: 'line',
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Active Computers',
            data: [14, 16, 20, 18, 24, 28, 30],
            fill: true,
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            borderColor: '#2563eb',
            tension: 0.4,
            pointBackgroundColor: '#2563eb',
            pointBorderWidth: 2,
            pointRadius: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function(context) {
                        const day = context.label || '';
                        const value = context.raw || 0;
                        return `${day}: ${value} active computers`;
                    }
                }
            }
        },
        scales: {
            x: { ticks: { display: false }, grid: { display: false } },
            y: { ticks: { display: false }, grid: { display: false } }
        }
    }
});

// -------------------Monthly Registrations Chart
const registrationLineChart = new Chart(document.getElementById('registrationLineChart'), {
    type: 'line',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        datasets: [{
            label: 'Registrations',
            data: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
            fill: true,
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            borderColor: '#2563eb',
            tension: 0.4,
            pointBackgroundColor: '#2563eb',
            pointBorderWidth: 2,
            pointRadius: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function(context) {
                        const month = context.label || '';
                        const value = context.raw || 0;
                        return `${month}: ${value} registrations`;
                    }
                }
            }
        },
        scales: {
            x: { ticks: { display: false }, grid: { display: false } },
            y: { ticks: { display: false }, grid: { display: false } }
        }
    }
});

//-------------------------------------Recent Activities and Computer Request------------------------------------>
document.querySelector('.btn i.fa-sync-alt').parentElement.addEventListener('click', () => {
    alert('Refreshing the data...');
    location.reload();
});
document.querySelectorAll('.approve').forEach(button => {
    button.addEventListener('click', () => {
        alert('Request Approved!');
    });
});
document.querySelectorAll('.deny').forEach(button => {
    button.addEventListener('click', () => {
        alert('Request Denied!');
    });
});

//-------------------------------------Computer Management Section-------------------------------------->
// Admin.js -- Always initializes localStorage if empty, works for "A"/"B" rooms

const roomSelect = document.getElementById('roomSelect');
const searchInput = document.getElementById('searchComputer');
const searchBtn = document.getElementById('searchBtn');
const computerTableBody = document.getElementById('computer-table-body');
const addComputerBtn = document.getElementById('addComputerBtn');
const addComputerModal = document.getElementById('addComputerModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const addComputerForm = document.getElementById('addComputerForm');

let editing = { room: null, id: null };

// --- Initialization: Set up default computers if not present
function initializeComputers() {
    if (!localStorage.getItem('computers')) {
        const initialComputers = {
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
        localStorage.setItem('computers', JSON.stringify(initialComputers));
    }
}
initializeComputers();

// --- LocalStorage-powered: Get/Save computers
function getComputersFromStorage() {
    return JSON.parse(localStorage.getItem('computers')) || {A:[],B:[]};
}
function saveComputersToStorage(computers) {
    localStorage.setItem('computers', JSON.stringify(computers));
}

// --- Update Stats Grid & Chart based on all computers data
function updateStatsAndChart() {
    const computers = getComputersFromStorage();
    const allComputers = [...computers.A, ...computers.B];
    const total = allComputers.length;
    const available = allComputers.filter(c => c.status === 'Available').length;
    const inUse = allComputers.filter(c => c.status === 'In Use').length;
    const maintenance = allComputers.filter(c => c.status === 'Maintenance').length;
    const outOfOrder = allComputers.filter(c => c.status === 'Out of Order').length;

    if (document.getElementById('total-computers')) document.getElementById('total-computers').textContent = total;
    if (document.getElementById('available-computers')) document.getElementById('available-computers').textContent = available;
    if (document.getElementById('under-maintenance')) document.getElementById('under-maintenance').textContent = maintenance;
    if (document.getElementById('out-of-order')) document.getElementById('out-of-order').textContent = outOfOrder;

    if (typeof computerStatusChart !== 'undefined') {
        computerStatusChart.data.datasets[0].data = [available, inUse, maintenance, outOfOrder];
        computerStatusChart.update();
    }
}

// --- Render computer table from storage
function renderTable(room, searchVal = "") {
    const computers = getComputersFromStorage();
    computerTableBody.innerHTML = '';
    let list = computers[room];
    if (!list) return;

    let displayList = [];
    for (let i = 1; i <= Math.max(12, list.length); i++) {
        const pcId = `PC-${String(i).padStart(3, '0')}`;
        let found = list.find(c => c.id === pcId);
        if (found) displayList.push(found);
        else displayList.push({
            id: pcId,
            room: room,
            status: 'Available',
            user: '------',
            lastActivity: '------'
        });
    }
    if (list.length > 12) {
        for (let i = 12; i < list.length; i++) {
            displayList.push(list[i]);
        }
    }
    if (searchVal) {
        displayList = displayList.filter(c => c.id.toLowerCase().includes(searchVal));
    }
    displayList.forEach((computer) => {
        const statusClass = `status-${computer.status.toLowerCase().replace(/ /g, '-')}`;
        let statusCell;
        if (editing.room === room && editing.id === computer.id) {
            statusCell = `
                <select class="edit-status-select" data-pcid="${computer.id}" data-room="${room}">
                    <option value="Available" ${computer.status==="Available"?"selected":""}>Available</option>
                    <option value="In Use" ${computer.status==="In Use"?"selected":""}>In Use</option>
                    <option value="Maintenance" ${computer.status==="Maintenance"?"selected":""}>Maintenance</option>
                    <option value="Out of Order" ${computer.status==="Out of Order"?"selected":""}>Out of Order</option>
                </select>
                <button class="edit-save-btn" data-pcid="${computer.id}" data-room="${room}">Save</button>
                <button class="edit-cancel-btn" data-pcid="${computer.id}" data-room="${room}">Cancel</button>
            `;
        } else {
            statusCell = `<span class="no-select ${statusClass}">${computer.status}</span>`;
        }
        const row = `
            <tr>
                <td>${computer.id}</td>
                <td>${computer.room}</td>
                <td>${statusCell}</td>
                <td>
                    <img src="https://via.placeholder.com/24" alt="User" style="border-radius: 50%; margin-right: 8px;">
                    ${computer.user}
                </td>
                <td>${computer.lastActivity}</td>
                <td>
                    <div class="action-dropdown">
                        <button class="btn" type="button">Action</button>
                        <div class="action-dropdown-content">
                            <button type="button" class="edit-btn" data-pcid="${computer.id}" data-room="${room}">Edit</button>
                            <button type="button" class="remove-btn" data-pcid="${computer.id}" data-room="${room}">Remove</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        computerTableBody.innerHTML += row;
    });
    addEditListeners();
    updateStatsAndChart();
}

// --- Add event listeners for edit/remove after each render
function addEditListeners() {
    // Edit button
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editing = { room: btn.getAttribute('data-room'), id: btn.getAttribute('data-pcid') };
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
    // Remove button
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const room = btn.getAttribute('data-room');
            const pcid = btn.getAttribute('data-pcid');
            let computers = getComputersFromStorage();
            let idx = computers[room].findIndex(c => c.id === pcid);
            if (idx > -1) {
                if (idx < 12) {
                    computers[room][idx] = {
                        id: pcid,
                        room: room,
                        status: 'Available',
                        user: '------',
                        lastActivity: '------'
                    };
                } else {
                    computers[room].splice(idx, 1);
                }
                saveComputersToStorage(computers);
            }
            editing = {room: null, id: null};
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
    // Save status
    document.querySelectorAll('.edit-save-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const room = btn.getAttribute('data-room');
            const pcid = btn.getAttribute('data-pcid');
            const sel = document.querySelector(`.edit-status-select[data-pcid="${pcid}"][data-room="${room}"]`);
            const newStatus = sel.value;
            let computers = getComputersFromStorage();
            let comp = computers[room].find(c => c.id === pcid);
            if (comp) comp.status = newStatus;
            saveComputersToStorage(computers);
            editing = {room: null, id: null};
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
    // Cancel edit
    document.querySelectorAll('.edit-cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editing = {room: null, id: null};
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
}

// --- Room selection
roomSelect.addEventListener('change', (e) => {
    searchInput.value = "";
    editing = {room: null, id: null};
    renderTable(e.target.value);
});

// --- Search functionality
searchBtn.addEventListener('click', () => {
    const searchValue = searchInput.value.toLowerCase();
    const selectedRoom = roomSelect.value;
    editing = {room: null, id: null};
    renderTable(selectedRoom, searchValue);
});
searchInput.addEventListener('keydown', function(e) {
    if (e.key === "Enter") searchBtn.click();
});

// --- Add Computer Button
addComputerBtn.addEventListener('click', () => {
    addComputerModal.style.display = 'flex';
});

// --- Close Modal Button
closeModalBtn.addEventListener('click', () => {
    addComputerModal.style.display = 'none';
});

// --- Add Computer Form Submission
addComputerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pcNumber = parseInt(document.getElementById('pcNumber').value, 10);
    const room = document.getElementById('room').value;
    const status = document.getElementById('status').value;
    const pcId = `PC-${String(pcNumber).padStart(3, '0')}`;
    let computers = getComputersFromStorage();
    let foundIdx = computers[room].findIndex(comp => comp.id === pcId);
    if (foundIdx > -1) {
        computers[room][foundIdx].status = status;
    } else {
        computers[room].push({
            id: pcId,
            room: room,
            status: status,
            user: '------',
            lastActivity: '------',
        });
    }
    saveComputersToStorage(computers);
    addComputerModal.style.display = 'none';
    addComputerForm.reset();
    editing = {room: null, id: null};
    renderTable(roomSelect.value, searchInput.value.toLowerCase());
});

// --- Initial render for selected room
renderTable(roomSelect.value);

// --- Auto-Refresh on Both Sides (Admin/User) ---
window.addEventListener('storage', function(e) {
    if (e.key === 'computers') {
        renderTable(roomSelect.value, searchInput.value ? searchInput.value.toLowerCase() : "");
        updateStatsAndChart();
    }
});

//------------------- Total Registered Stat Card for User Management ------------------>
function updateTotalRegistered() {
    const users = getUsersFromStorage();
    const totalRegElem = document.getElementById('total-registered');
    if (totalRegElem) {
        totalRegElem.textContent = users.length;
    }
}

function renderTable(room, searchVal = "") {
    computerTableBody.innerHTML = '';
    let list = computers[room];
    let displayList = [];
    for (let i = 1; i <= Math.max(12, list.length); i++) {
        const pcId = `PC-${String(i).padStart(3, '0')}`;
        let found = list.find(c => c.id === pcId);
        if (found) displayList.push(found);
        else displayList.push({
            id: pcId,
            room: room,
            status: 'Available',
            user: '------',
            lastActivity: '------'
        });
    }
    if (list.length > 12) {
        for (let i = 12; i < list.length; i++) {
            displayList.push(list[i]);
        }
    }
    if (searchVal) {
        displayList = displayList.filter(c => c.id.toLowerCase().includes(searchVal));
    }
    displayList.forEach((computer) => {
        const statusClass = `status-${computer.status.toLowerCase().replace(/ /g, '-')}`;
        let statusCell;
        if (editing.room === room && editing.id === computer.id) {
            statusCell = `
                <select class="edit-status-select" data-pcid="${computer.id}" data-room="${room}">
                    <option value="Available" ${computer.status==="Available"?"selected":""}>Available</option>
                    <option value="In Use" ${computer.status==="In Use"?"selected":""}>In Use</option>
                    <option value="Maintenance" ${computer.status==="Maintenance"?"selected":""}>Maintenance</option>
                    <option value="Out of Order" ${computer.status==="Out of Order"?"selected":""}>Out of Order</option>
                </select>
                <button class="edit-save-btn" data-pcid="${computer.id}" data-room="${room}">Save</button>
                <button class="edit-cancel-btn" data-pcid="${computer.id}" data-room="${room}">Cancel</button>
            `;
        } else {
            statusCell = `<span class="no-select ${statusClass}">${computer.status}</span>`;
        }
        const row = `
            <tr>
                <td>${computer.id}</td>
                <td>${computer.room}</td>
                <td>${statusCell}</td>
                <td>
                    <img src="https://via.placeholder.com/24" alt="User" style="border-radius: 50%; margin-right: 8px;">
                    ${computer.user}
                </td>
                <td>${computer.lastActivity}</td>
                <td>
                    <div class="action-dropdown">
                        <button class="btn" type="button">Action</button>
                        <div class="action-dropdown-content">
                            <button type="button" class="edit-btn" data-pcid="${computer.id}" data-room="${room}">Edit</button>
                            <button type="button" class="remove-btn" data-pcid="${computer.id}" data-room="${room}">Remove</button>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        computerTableBody.innerHTML += row;
    });
    addEditListeners();
    updateStatsAndChart();
}

function addEditListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editing = { room: btn.getAttribute('data-room'), id: btn.getAttribute('data-pcid') };
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const room = btn.getAttribute('data-room');
            const pcid = btn.getAttribute('data-pcid');
            let idx = computers[room].findIndex(c => c.id === pcid);
            if (idx > -1) {
                if (idx < 12) {
                    computers[room][idx] = {
                        id: pcid,
                        room: room,
                        status: 'Available',
                        user: '------',
                        lastActivity: '------'
                    };
                } else {
                    computers[room].splice(idx, 1);
                }
            }
            editing = {room: null, id: null};
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
    document.querySelectorAll('.edit-save-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const room = btn.getAttribute('data-room');
            const pcid = btn.getAttribute('data-pcid');
            const sel = document.querySelector(`.edit-status-select[data-pcid="${pcid}"][data-room="${room}"]`);
            const newStatus = sel.value;
            let comp = computers[room].find(c => c.id === pcid);
            if (comp) comp.status = newStatus;
            editing = {room: null, id: null};
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
    document.querySelectorAll('.edit-cancel-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editing = {room: null, id: null};
            renderTable(roomSelect.value, searchInput.value.toLowerCase());
        });
    });
}

roomSelect.addEventListener('change', (e) => {
    searchInput.value = "";
    editing = {room: null, id: null};
    renderTable(e.target.value);
});

searchBtn.addEventListener('click', () => {
    const searchValue = searchInput.value.toLowerCase();
    const selectedRoom = roomSelect.value;
    editing = {room: null, id: null};
    renderTable(selectedRoom, searchValue);
});
searchInput.addEventListener('keydown', function(e) {
    if (e.key === "Enter") searchBtn.click();
});

addComputerBtn.addEventListener('click', () => {
    addComputerModal.style.display = 'flex';
});
closeModalBtn.addEventListener('click', () => {
    addComputerModal.style.display = 'none';
});
addComputerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pcNumber = parseInt(document.getElementById('pcNumber').value, 10);
    const room = document.getElementById('room').value;
    const status = document.getElementById('status').value;
    const pcId = `PC-${String(pcNumber).padStart(3, '0')}`;
    let foundIdx = computers[room].findIndex(comp => comp.id === pcId);
    if (foundIdx > -1) {
        computers[room][foundIdx].status = status;
    } else {
        computers[room].push({
            id: pcId,
            room: room,
            status: status,
            user: '------',
            lastActivity: '------',
        });
    }
    addComputerModal.style.display = 'none';
    addComputerForm.reset();
    editing = {room: null, id: null};
    renderTable(roomSelect.value, searchInput.value.toLowerCase());
});
renderTable(roomSelect.value);

//-------------------------------------User Management Section--------------------------------------->
function getUsersFromStorage() {
    return JSON.parse(localStorage.getItem('users')) || [];
}
function saveUsersToStorage(users) {
    localStorage.setItem('users', JSON.stringify(users));
}
function renderUserTable(filteredUsers = null) {
    const users = filteredUsers || getUsersFromStorage();
    const tableBody = document.getElementById("user-table-body");
    tableBody.innerHTML = "";
    users.forEach((user, index) => {
        const courseDisplay = user.course ? user.course : '<span style="color:#aaa;">N/A</span>';
        const nameDisplay = user.firstName ? `${user.firstName} ${user.lastName || ''}` : (user.name || '');
        row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id || ''}</td>
            <td>
                <img src="${user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="User" style="width: 24px; height: 24px; border-radius: 50%; margin-right: 8px; vertical-align: middle;">
                ${nameDisplay}
            </td>
            <td>${courseDisplay}</td>
            <td>${user.email || ''}</td>
            <td>${user.lastLogin || ''}</td>
            <td><span class="status">${user.status || 'Active'}</span></td>
            <td class="actions">
                <button class="edit-btn" onclick="editUser(${index})"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" onclick="deleteUser(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    updateTotalRegistered();
}
window.editUser = function(index) {
    const users = getUsersFromStorage();
    const user = users[index];
    const newFirstName = prompt("Edit First Name:", user.firstName || '');
    const newLastName = prompt("Edit Last Name:", user.lastName || '');
    const newCourse = prompt("Edit Course (BSIT/BSED/BEED/THEOLOGY):", user.course || '');
    const newEmail = prompt("Edit Email:", user.email || '');
    if (newFirstName && newLastName && newCourse && newEmail) {
        users[index].firstName = newFirstName;
        users[index].lastName = newLastName;
        users[index].course = newCourse;
        users[index].email = newEmail;
        saveUsersToStorage(users);
        renderUserTable();
        alert("User updated successfully!");
    }
}
window.deleteUser = function(index) {
    const users = getUsersFromStorage();
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
        users.splice(index, 1);
        saveUsersToStorage(users);
        renderUserTable();
        alert("User deleted successfully!");
    }
}
document.getElementById('searchUser').addEventListener('input', (e) => {
    const searchValue = e.target.value.toLowerCase();
    const users = getUsersFromStorage();
    const filtered = users.filter(user =>
        ((user.firstName && user.firstName.toLowerCase().includes(searchValue)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchValue)) ||
        (user.name && user.name.toLowerCase().includes(searchValue)) ||
        (user.course && user.course.toLowerCase().includes(searchValue)))
    );
    renderUserTable(filtered);
});
renderUserTable();
updateTotalRegistered();