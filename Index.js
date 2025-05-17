const modals = {
    register: document.getElementById('registerModal'),
    login: document.getElementById('loginModal'),
};
const triggers = {
    openRegister: document.getElementById('openRegisterModal'),
    closeRegister: document.getElementById('closeRegisterModal'),
    openLogin: document.getElementById('openLoginModal'),
    closeLogin: document.getElementById('closeLoginModal'),
    showRegister: document.getElementById('show-register'),
};

// Forms
const forms = {
    admin: document.getElementById('admin-form'),
    user: document.getElementById('user-form'),
    register: document.getElementById('register-form'),
};

// ------------------Switch Buttons
const switches = {
    toUser: document.getElementById('switch-to-user'),
    toAdmin: document.getElementById('switch-to-admin'),
};
const openModal = (modal) => {
    modal.style.display = 'flex';
};
const closeModal = (modal) => {
    modal.style.display = 'none';
};
const switchForm = (fromForm, toForm, fromSwitch, toSwitch) => {
    fromForm.classList.remove('active');
    toForm.classList.add('active');
    fromSwitch.style.display = 'none';
    toSwitch.style.display = 'inline-block';
};
triggers.openRegister.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(modals.register);
});
triggers.openLogin.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(modals.login);
});
triggers.closeRegister.addEventListener('click', () => closeModal(modals.register));
triggers.closeLogin.addEventListener('click', () => closeModal(modals.login));
triggers.showRegister.addEventListener('click', () => {
    closeModal(modals.login);
    openModal(modals.register);
});
switches.toUser.addEventListener('click', () => {
    switchForm(forms.admin, forms.user, switches.toUser, switches.toAdmin);
});
switches.toAdmin.addEventListener('click', () => {
    switchForm(forms.user, forms.admin, switches.toAdmin, switches.toUser);
});
window.addEventListener('click', (e) => {
    if (e.target === modals.login) closeModal(modals.login);
    if (e.target === modals.register) closeModal(modals.register);
});
const backToLoginButton = document.getElementById('back-to-login');
backToLoginButton.addEventListener('click', () => {
    closeModal(modals.register);
    openModal(modals.login);
});
// -------------------------------------Registration Functionality
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Collect values
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const course = document.getElementById('course').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(u => u.email === email)) {
        alert('Email already registered!');
        return;
    }

    const newUser = {
        id: `U-${1000 + users.length + 1}`,
        firstName,
        lastName,
        course,
        email,
        password,
        lastLogin: 'Just now',
        status: 'Active',
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Your account is registered successfully!');
    document.getElementById('register-form').reset();
    closeModal(modals.register); 
    openModal(modals.login);     
});

// -------------------Login Functionality-----for admin
const defaultAdmin = {
    adminId: 'admin',
    adminPassword: 'admin123',
};

// Admin Login Functionality
forms.admin.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminId = document.getElementById('admin-id').value.trim();
    const adminPassword = document.getElementById('admin-password').value;
    if (adminId === defaultAdmin.adminId && adminPassword === defaultAdmin.adminPassword) {
        alert('Admin login successful!');
        forms.admin.reset();
        window.location.href = 'Admin.html';
    } else {
        alert('Invalid Admin ID or Password!');
    }
});

// User Login Functionality
forms.user.addEventListener('submit', (e) => {
    e.preventDefault();
    const userId = document.getElementById('user-id').value.trim();
    const userPassword = document.getElementById('user-password').value;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex((u) => u.email === userId && u.password === userPassword);

    if (userIndex !== -1) {
        users[userIndex].status = 'Active';
        users[userIndex].lastLogin = new Date().toLocaleString();
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('loggedInEmail', users[userIndex].email);
        alert(`Welcome, ${users[userIndex].firstName}!`);
        forms.user.reset();
        window.location.href = 'Userform.html';
    } else {
        alert('Invalid User ID or Password!');
    }
});