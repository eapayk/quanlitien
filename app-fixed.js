// ========== GLOBAL VARIABLES ==========
let currentUser = null;
let users = JSON.parse(localStorage.getItem('expenseManagerUsers') || '{}');
let currentTheme = JSON.parse(localStorage.getItem('expenseManagerTheme') || '{}');
let monthlyLimit = 0;
let expenses = [];
let categories = [];
let selectedIcon = 'fa-tag';

// ========== CONSTANTS ==========
const AVAILABLE_ICONS = [
    'fa-utensils', 'fa-shopping-cart', 'fa-car', 'fa-home', 'fa-wifi',
    'fa-mobile-alt', 'fa-gamepad', 'fa-film', 'fa-music', 'fa-book',
    'fa-graduation-cap', 'fa-heartbeat', 'fa-pills', 'fa-dumbbell', 'fa-t-shirt',
    'fa-gift', 'fa-coffee', 'fa-beer', 'fa-pizza-slice', 'fa-hamburger',
    'fa-plane', 'fa-train', 'fa-bus', 'fa-taxi', 'fa-bicycle',
    'fa-child', 'fa-baby', 'fa-dog', 'fa-cat', 'fa-paw',
    'fa-tools', 'fa-couch', 'fa-lightbulb', 'fa-money-bill-wave', 'fa-credit-card',
    'fa-wallet', 'fa-piggy-bank', 'fa-chart-line', 'fa-briefcase', 'fa-laptop',
    'fa-camera', 'fa-basketball-ball', 'fa-futbol', 'fa-swimming-pool', 'fa-hiking',
    'fa-phone', 'fa-envelope', 'fa-tag', 'fa-star', 'fa-heart',
    'fa-flag', 'fa-bell', 'fa-calendar', 'fa-clock', 'fa-map-marker',
    'fa-globe', 'fa-user'
];

const COLOR_PALETTE = [
    { name: 'Xanh dương', color: '#3498db', primary: '#3498db', secondary: '#2ecc71', danger: '#e74c3c' },
    { name: 'Xanh lá', color: '#2ecc71', primary: '#2ecc71', secondary: '#3498db', danger: '#e74c3c' },
    { name: 'Đỏ', color: '#e74c3c', primary: '#e74c3c', secondary: '#3498db', danger: '#2ecc71' },
    { name: 'Cam', color: '#f39c12', primary: '#f39c12', secondary: '#3498db', danger: '#e74c3c' },
    { name: 'Tím', color: '#9b59b6', primary: '#9b59b6', secondary: '#3498db', danger: '#e74c3c' },
    { name: 'Hồng', color: '#e84393', primary: '#e84393', secondary: '#3498db', danger: '#e74c3c' },
    { name: 'Xám', color: '#7f8c8d', primary: '#7f8c8d', secondary: '#3498db', danger: '#e74c3c' },
    { name: 'Đen', color: '#2c3e50', primary: '#2c3e50', secondary: '#3498db', danger: '#e74c3c' }
];

// ========== UTILITY FUNCTIONS ==========
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) {
        console.log('Notification:', message);
        return;
    }
    
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
}

function parseMoneyFormat(input) {
    if (!input || input.trim() === '') return 0;
    
    let str = input.trim().toLowerCase().replace(/\s+/g, '');
    let multiplier = 1;
    
    if (str.includes('m')) {
        multiplier = 1000000;
        str = str.replace('m', '');
    } else if (str.includes('k')) {
        multiplier = 1000;
        str = str.replace('k', '');
    } else if (str.includes('tr')) {
        multiplier = 1000000;
        str = str.replace('tr', '');
    }
    
    str = str.replace(/\./g, '').replace(/,/g, '');
    const number = parseFloat(str);
    
    return isNaN(number) ? 0 : Math.round(number * multiplier);
}

// ========== THEME FUNCTIONS ==========
function loadTheme() {
    if (Object.keys(currentTheme).length === 0) {
        currentTheme = {
            primaryColor: '#3498db',
            secondaryColor: '#2ecc71',
            dangerColor: '#e74c3c',
            warningColor: '#f39c12',
            darkColor: '#2c3e50',
            lightColor: '#ecf0f1',
            cardOpacity: 0.95,
            backgroundImage: 'none',
            backgroundBlur: 0,
            backgroundOverlay: 'rgba(255, 255, 255, 0.1)',
            selectedColorIndex: 0
        };
        localStorage.setItem('expenseManagerTheme', JSON.stringify(currentTheme));
    }
    
    applyTheme();
    renderThemeControls();
}

function applyTheme() {
    const root = document.documentElement;
    
    root.style.setProperty('--primary-color', currentTheme.primaryColor);
    root.style.setProperty('--secondary-color', currentTheme.secondaryColor);
    root.style.setProperty('--danger-color', currentTheme.dangerColor);
    root.style.setProperty('--warning-color', currentTheme.warningColor);
    root.style.setProperty('--dark-color', currentTheme.darkColor);
    root.style.setProperty('--light-color', currentTheme.lightColor);
    root.style.setProperty('--card-opacity', currentTheme.cardOpacity);
    root.style.setProperty('--background-image', currentTheme.backgroundImage);
    root.style.setProperty('--background-blur', currentTheme.backgroundBlur + 'px');
    root.style.setProperty('--background-overlay', currentTheme.backgroundOverlay);
    
    document.querySelector('meta[name="theme-color"]').setAttribute('content', currentTheme.primaryColor);
}

function renderThemeControls() {
    console.log('Rendering theme controls...');
    const colorPaletteContainer = document.getElementById('colorPalette');
    
    if (!colorPaletteContainer) {
        console.error('Color palette container not found!');
        return;
    }
    
    colorPaletteContainer.innerHTML = '';
    
    COLOR_PALETTE.forEach((colorOption, index) => {
        const colorElement = document.createElement('div');
        colorElement.className = `color-option ${index === currentTheme.selectedColorIndex ? 'selected' : ''}`;
        colorElement.style.backgroundColor = colorOption.color;
        colorElement.title = colorOption.name;
        colorElement.dataset.index = index;
        
        colorElement.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
            colorElement.classList.add('selected');
            
            currentTheme.primaryColor = colorOption.primary;
            currentTheme.secondaryColor = colorOption.secondary;
            currentTheme.dangerColor = colorOption.danger;
            currentTheme.selectedColorIndex = index;
            
            updateBackgroundPreview();
            applyTheme();
        });
        
        colorPaletteContainer.appendChild(colorElement);
    });
    
    // Update opacity slider
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');
    if (opacitySlider && opacityValue) {
        opacitySlider.value = currentTheme.cardOpacity;
        opacityValue.textContent = Math.round(currentTheme.cardOpacity * 100) + '%';
    }
    
    // Update blur slider
    const blurSlider = document.getElementById('blurSlider');
    const blurValue = document.getElementById('blurValue');
    if (blurSlider && blurValue) {
        blurSlider.value = currentTheme.backgroundBlur;
        blurValue.textContent = currentTheme.backgroundBlur + 'px';
    }
    
    updateBackgroundPreview();
}

function updateBackgroundPreview() {
    const preview = document.getElementById('backgroundPreview');
    if (preview) {
        if (currentTheme.backgroundImage && currentTheme.backgroundImage !== 'none') {
            if (currentTheme.backgroundImage.startsWith('url(')) {
                preview.style.backgroundImage = currentTheme.backgroundImage;
            } else {
                preview.style.backgroundImage = currentTheme.backgroundImage;
            }
        } else {
            preview.style.backgroundImage = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
        }
    }
}

// ========== ICON FUNCTIONS ==========
function renderIconOptions() {
    console.log('Rendering icon options...');
    const iconOptionsContainer = document.getElementById('iconOptions');
    
    if (!iconOptionsContainer) {
        console.error('Icon options container not found!');
        return;
    }
    
    iconOptionsContainer.innerHTML = '';
    
    AVAILABLE_ICONS.forEach(iconName => {
        const iconElement = document.createElement('div');
        iconElement.className = `icon-option ${iconName === selectedIcon ? 'selected' : ''}`;
        iconElement.innerHTML = `<i class="fas ${iconName}"></i>`;
        iconElement.title = iconName;
        iconElement.dataset.icon = iconName;
        
        iconElement.addEventListener('click', () => {
            selectedIcon = iconName;
            updateSelectedIconPreview();
            document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
            iconElement.classList.add('selected');
        });
        
        iconOptionsContainer.appendChild(iconElement);
    });
    
    updateSelectedIconPreview();
}

function updateSelectedIconPreview() {
    const selectedIconPreview = document.getElementById('selectedIconPreview');
    const selectedIconName = document.getElementById('selectedIconName');
    
    if (selectedIconPreview) {
        selectedIconPreview.className = `fas ${selectedIcon}`;
    }
    
    if (selectedIconName) {
        selectedIconName.textContent = selectedIcon;
    }
}

// ========== CATEGORY FUNCTIONS ==========
function renderCategories() {
    console.log('Rendering categories...');
    const categoriesList = document.getElementById('categoriesList');
    const expenseCategory = document.getElementById('expenseCategory');
    
    if (!categoriesList || !expenseCategory) {
        console.error('Category containers not found!');
        return;
    }
    
    // Clear existing content
    categoriesList.innerHTML = '';
    expenseCategory.innerHTML = '';
    
    // Check if no categories
    if (!categories || categories.length === 0) {
        categoriesList.innerHTML = '<p class="no-categories">Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!</p>';
        
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Chưa có danh mục';
        option.disabled = true;
        option.selected = true;
        expenseCategory.appendChild(option);
        return;
    }
    
    // Render category tags
    let html = '';
    categories.forEach(category => {
        html += `
            <div class="category-tag">
                <div class="category-icon-preview">
                    <i class="fas ${category.icon || 'fa-tag'}"></i>
                </div>
                <span>${category.name}</span>
                <i class="fas fa-times" data-category-id="${category.id}"></i>
            </div>
        `;
        
        // Add to dropdown
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        expenseCategory.appendChild(option);
    });
    
    categoriesList.innerHTML = html;
    
    // Add event listeners for delete buttons
    categoriesList.querySelectorAll('.fa-times').forEach(icon => {
        icon.addEventListener('click', function() {
            const categoryId = this.getAttribute('data-category-id');
            deleteCategory(categoryId);
        });
    });
}

function deleteCategory(id) {
    const isUsed = expenses.some(expense => expense.category === id);
    
    if (isUsed) {
        showNotification("Không thể xóa vì có chi tiêu thuộc danh mục này!", "error");
        return;
    }
    
    if (confirm("Bạn có chắc muốn xóa danh mục này?")) {
        categories = categories.filter(cat => cat.id !== id);
        renderCategories();
        saveUserData();
        showNotification("Đã xóa danh mục!", "success");
    }
}

// ========== EXPENSE FUNCTIONS ==========
function renderExpensesTable() {
    console.log('Rendering expenses table...');
    const tbody = document.getElementById('expensesTableBody');
    const expensesCount = document.getElementById('expensesCount');
    
    if (!tbody || !expensesCount) {
        console.error('Expenses table containers not found!');
        return;
    }
    
    // Update count
    expensesCount.textContent = `${expenses.length} khoản chi`;
    
    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-expenses">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Chưa có khoản chi tiêu nào. Hãy thêm chi tiêu đầu tiên của bạn!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    expenses.forEach((expense, index) => {
        const category = categories.find(cat => cat.id === expense.category);
        const categoryName = category ? category.name : 'Không xác định';
        const categoryIcon = category ? `fas ${category.icon}` : 'fas fa-tag';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <div class="category-cell">
                        <div class="category-icon">
                            <i class="${categoryIcon}"></i>
                        </div>
                        <span>${categoryName}</span>
                    </div>
                </td>
                <td class="amount-cell">${formatCurrency(expense.amount)}</td>
                <td class="date-cell">${formatDate(expense.date)}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" data-expense-id="${expense.id}">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn-delete" data-expense-id="${expense.id}">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Add event listeners for action buttons
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseId = parseInt(this.getAttribute('data-expense-id'));
            editExpense(expenseId);
        });
    });
    
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const expenseId = parseInt(this.getAttribute('data-expense-id'));
            deleteExpense(expenseId);
        });
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function deleteExpense(id) {
    if (confirm("Bạn có chắc chắn muốn xóa khoản chi tiêu này?")) {
        expenses = expenses.filter(expense => expense.id !== id);
        renderExpensesTable();
        updateSummary();
        saveUserData();
        showNotification("Đã xóa khoản chi tiêu!", "success");
    }
}

function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    
    const newAmount = prompt(`Sửa số tiền cho khoản chi tiêu này:`, expense.amount);
    if (newAmount) {
        const parsedAmount = parseMoneyFormat(newAmount);
        if (parsedAmount > 0) {
            expense.amount = parsedAmount;
            renderExpensesTable();
            updateSummary();
            saveUserData();
            showNotification("Đã cập nhật khoản chi tiêu!", "success");
        } else {
            showNotification("Số tiền không hợp lệ!", "error");
        }
    }
}

// ========== SUMMARY FUNCTIONS ==========
function updateSummary() {
    const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
    const remaining = monthlyLimit - totalSpent;
    const remainingElement = document.getElementById('remainingAmount');
    
    document.getElementById('limitAmount').textContent = formatCurrency(monthlyLimit);
    document.getElementById('spentAmount').textContent = formatCurrency(totalSpent);
    if (remainingElement) {
        remainingElement.textContent = formatCurrency(remaining);
        remainingElement.style.color = remaining < 0 ? 'var(--danger-color)' : 'var(--secondary-color)';
    }
    
    document.getElementById('expensesCount').textContent = `${expenses.length} khoản chi`;
}

// ========== USER FUNCTIONS ==========
function showAuthForm() {
    document.getElementById('authContainer').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('accountManagementPage').style.display = 'none';
    document.getElementById('backToAppButton').style.display = 'none';
    document.getElementById('themeCustomizer').style.display = 'none';
    
    showLoginForm();
}

function showMainApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('accountManagementPage').style.display = 'none';
    document.getElementById('backToAppButton').style.display = 'none';
    document.getElementById('themeCustomizer').style.display = 'flex';
    
    updateUserUI();
    loadUserData();
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (changePasswordForm) changePasswordForm.style.display = 'none';
}

function updateUserUI() {
    if (currentUser) {
        const userName = document.getElementById('userName');
        const welcomeName = document.getElementById('welcomeName');
        const dropdownName = document.getElementById('dropdownName');
        const dropdownEmail = document.getElementById('dropdownEmail');
        
        if (userName) userName.textContent = currentUser.name;
        if (welcomeName) welcomeName.textContent = currentUser.name;
        if (dropdownName) dropdownName.textContent = currentUser.name;
        if (dropdownEmail) dropdownEmail.textContent = currentUser.email;
        
        updateUserAvatar();
    }
}

function updateUserAvatar() {
    const userAvatar = document.getElementById('userAvatar');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    
    if (currentUser) {
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        
        if (currentUser.avatar) {
            const avatarHTML = `<img src="${currentUser.avatar}" class="user-avatar-img" alt="${currentUser.name}">`;
            if (userAvatar) userAvatar.innerHTML = avatarHTML;
            if (dropdownAvatar) dropdownAvatar.innerHTML = avatarHTML;
        } else {
            if (userAvatar) userAvatar.textContent = initials;
            if (dropdownAvatar) dropdownAvatar.textContent = initials;
        }
    }
}

function loadUserData() {
    if (currentUser) {
        monthlyLimit = currentUser.monthlyLimit || 0;
        expenses = currentUser.expenses || [];
        categories = currentUser.categories || [];
        
        // Initialize default categories if empty
        if (!categories || categories.length === 0) {
            categories = [
                { id: 'an_uong', name: 'Ăn uống', icon: 'fa-utensils' },
                { id: 'mua_sam', name: 'Mua sắm', icon: 'fa-shopping-cart' },
                { id: 'di_chuyen', name: 'Di chuyển', icon: 'fa-car' },
                { id: 'hoa_don', name: 'Hóa đơn', icon: 'fa-file-invoice' },
                { id: 'giai_tri', name: 'Giải trí', icon: 'fa-gamepad' },
                { id: 'suc_khoe', name: 'Sức khỏe', icon: 'fa-heartbeat' },
                { id: 'hoc_tap', name: 'Học tập', icon: 'fa-graduation-cap' },
                { id: 'khac', name: 'Khác', icon: 'fa-tag' }
            ];
            currentUser.categories = categories;
            saveUserData();
        }
        
        updateSummary();
        renderExpensesTable();
        renderCategories();
    }
}

function saveUserData() {
    if (currentUser) {
        currentUser.monthlyLimit = monthlyLimit;
        currentUser.expenses = expenses;
        currentUser.categories = categories;
        users[currentUser.id] = currentUser;
        localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

function login(emailOrUsername, password) {
    // Find user
    let user = null;
    for (const userId in users) {
        const u = users[userId];
        if ((u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password) {
            user = u;
            break;
        }
    }
    
    // Demo login (for testing)
    if (!user && (emailOrUsername === 'demo' || emailOrUsername === 'test' || emailOrUsername === '')) {
        const demoUser = {
            id: 'demo123',
            name: 'Người dùng Demo',
            email: 'demo@example.com',
            username: 'demo',
            password: '123456',
            avatar: null,
            monthlyLimit: 5000000,
            expenses: [
                { id: 1, category: 'an_uong', amount: 150000, date: new Date().toISOString().split('T')[0] },
                { id: 2, category: 'mua_sam', amount: 300000, date: new Date().toISOString().split('T')[0] }
            ],
            categories: [
                { id: 'an_uong', name: 'Ăn uống', icon: 'fa-utensils' },
                { id: 'mua_sam', name: 'Mua sắm', icon: 'fa-shopping-cart' },
                { id: 'di_chuyen', name: 'Di chuyển', icon: 'fa-car' }
            ]
        };
        users[demoUser.id] = demoUser;
        localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
        user = demoUser;
    }
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainApp();
        showNotification(`Chào mừng ${user.name} trở lại!`, 'success');
        return true;
    }
    
    showNotification('Email/username hoặc mật khẩu không đúng!', 'error');
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    monthlyLimit = 0;
    expenses = [];
    categories = [];
    showAuthForm();
    showNotification('Đã đăng xuất thành công!', 'success');
}

// ========== ACCOUNT MANAGEMENT FUNCTIONS ==========
function showAccountManagement() {
    console.log('Showing account management...');
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('accountManagementPage').style.display = 'block';
    document.getElementById('backToAppButton').style.display = 'flex';
    document.getElementById('themeCustomizer').style.display = 'none';
    
    loadAccountManagementData();
}

function loadAccountManagementData() {
    console.log('Loading account management data...');
    
    if (!currentUser) {
        console.error('No current user found!');
        return;
    }
    
    // Load personal info
    const accountName = document.getElementById('accountName');
    const accountUsername = document.getElementById('accountUsername');
    const accountEmail = document.getElementById('accountEmail');
    
    if (accountName && accountUsername && accountEmail) {
        accountName.value = currentUser.name || '';
        accountUsername.value = currentUser.username || '';
        accountEmail.value = currentUser.email || '';
    } else {
        console.error('Account input fields not found!');
    }
    
    // Load avatar
    updateAccountAvatar();
    
    // Clear password fields
    const accountCurrentPassword = document.getElementById('accountCurrentPassword');
    const accountNewPassword = document.getElementById('accountNewPassword');
    const accountConfirmPassword = document.getElementById('accountConfirmPassword');
    
    if (accountCurrentPassword && accountNewPassword && accountConfirmPassword) {
        accountCurrentPassword.value = '';
        accountNewPassword.value = '';
        accountConfirmPassword.value = '';
    }
    
    // Clear messages
    clearAccountMessages();
    
    console.log('Account data loaded:', {
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email
    });
}

function clearAccountMessages() {
    const messages = [
        'personalInfoMessage',
        'passwordChangeMessage'
    ];
    
    messages.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.className = 'auth-message';
            element.textContent = '';
        }
    });
}

function updateAccountAvatar() {
    const profilePicture = document.getElementById('profilePicture');
    if (!profilePicture) {
        console.error('Profile picture element not found!');
        return;
    }
    
    if (currentUser && currentUser.avatar) {
        // Show image avatar
        profilePicture.innerHTML = `<img src="${currentUser.avatar}" class="profile-picture-img" alt="${currentUser.name}">`;
    } else if (currentUser) {
        // Show placeholder with initials
        const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        profilePicture.innerHTML = `<div class="profile-picture-placeholder">${initials}</div>`;
    } else {
        profilePicture.innerHTML = '<div class="profile-picture-placeholder">?</div>';
    }
}

function updatePersonalInfo(name, username, email) {
    // Check if email is being changed and if it's already used
    if (email !== currentUser.email) {
        for (const userId in users) {
            const user = users[userId];
            if (user.id !== currentUser.id && user.email === email) {
                return { success: false, message: 'Email đã được sử dụng bởi tài khoản khác!' };
            }
        }
    }
    
    // Check if username is being changed and if it's already used
    if (username !== currentUser.username) {
        for (const userId in users) {
            const user = users[userId];
            if (user.id !== currentUser.id && user.username === username) {
                return { success: false, message: 'Tên đăng nhập đã được sử dụng!' };
            }
        }
    }
    
    // Update user info
    currentUser.name = name;
    currentUser.username = username;
    currentUser.email = email;
    
    // Save changes
    users[currentUser.id] = currentUser;
    localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateUserUI();
    updateAccountAvatar();
    
    return { success: true, message: 'Cập nhật thông tin thành công!' };
}

function changeAccountPassword(currentPassword, newPassword) {
    if (currentUser.password !== currentPassword) {
        return { success: false, message: 'Mật khẩu hiện tại không đúng!' };
    }
    
    if (newPassword.length < 6) {
        return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }
    
    currentUser.password = newPassword;
    users[currentUser.id] = currentUser;
    localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return { success: true, message: 'Đổi mật khẩu thành công!' };
}

function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to data URL with compression
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            
            img.onerror = reject;
        };
        
        reader.onerror = reject;
    });
}

function updateProfilePicture(imageDataUrl) {
    currentUser.avatar = imageDataUrl;
    users[currentUser.id] = currentUser;
    localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateAccountAvatar();
    updateUserUI();
    
    return { success: true, message: 'Cập nhật ảnh đại diện thành công!' };
}

function removeProfilePicture() {
    currentUser.avatar = null;
    users[currentUser.id] = currentUser;
    localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateAccountAvatar();
    updateUserUI();
    
    return { success: true, message: 'Đã xóa ảnh đại diện!' };
}

function deleteUserAccount() {
    if (confirm("Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục!")) {
        const password = prompt("Vui lòng nhập mật khẩu để xác nhận xóa tài khoản:");
        
        if (password === currentUser.password) {
            // Delete user data
            delete users[currentUser.id];
            localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
            localStorage.removeItem('currentUser');
            
            // Clear user data
            currentUser = null;
            monthlyLimit = 0;
            expenses = [];
            categories = [];
            
            // Show auth form
            showAuthForm();
            showNotification('Tài khoản đã được xóa thành công!', 'success');
            return { success: true, message: 'Tài khoản đã được xóa!' };
        } else {
            return { success: false, message: 'Mật khẩu không đúng!' };
        }
    }
    return { success: false, message: 'Hủy xóa tài khoản!' };
}

function showAccountMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `auth-message ${type}`;
    }
}

// ========== SETUP EVENT LISTENERS ==========
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // 1. Login form
    const loginForm = document.getElementById('loginFormElement');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            login(email, password);
        });
    }
    
    // 2. Register form
    const registerForm = document.getElementById('registerFormElement');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const username = document.getElementById('registerUsername').value.trim();
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'error');
                return;
            }
            
            // Simple registration
            const newUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                username: username,
                password: password,
                avatar: null,
                monthlyLimit: 0,
                expenses: [],
                categories: [
                    { id: 'an_uong', name: 'Ăn uống', icon: 'fa-utensils' },
                    { id: 'mua_sam', name: 'Mua sắm', icon: 'fa-shopping-cart' }
                ]
            };
            
            users[newUser.id] = newUser;
            localStorage.setItem('expenseManagerUsers', JSON.stringify(users));
            
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMainApp();
            showNotification('Đăng ký thành công!', 'success');
        });
    }
    
    // 3. Navigation links
    document.getElementById('showRegister')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });
    
    document.getElementById('showLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
    
    // 4. User menu
    document.getElementById('userButton')?.addEventListener('click', function() {
        document.getElementById('userDropdown').classList.toggle('show');
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // 5. Manage account button
    document.getElementById('manageAccountBtn')?.addEventListener('click', showAccountManagement);
    
    // 6. Back to app button
    document.getElementById('backToAppButton')?.addEventListener('click', showMainApp);
    
    // 7. Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown && userDropdown.classList.contains('show') && 
            !event.target.closest('.user-menu')) {
            userDropdown.classList.remove('show');
        }
        
        const themePanel = document.getElementById('themePanel');
        if (themePanel && themePanel.classList.contains('show') && 
            !event.target.closest('.theme-customizer')) {
            themePanel.classList.remove('show');
        }
    });
    
    // 8. Theme customizer
    document.getElementById('themeButton')?.addEventListener('click', function() {
        document.getElementById('themePanel').classList.toggle('show');
    });
    
    document.getElementById('opacitySlider')?.addEventListener('input', function() {
        currentTheme.cardOpacity = parseFloat(this.value);
        document.getElementById('opacityValue').textContent = Math.round(currentTheme.cardOpacity * 100) + '%';
        applyTheme();
    });
    
    document.getElementById('blurSlider')?.addEventListener('input', function() {
        currentTheme.backgroundBlur = parseInt(this.value);
        document.getElementById('blurValue').textContent = currentTheme.backgroundBlur + 'px';
        applyTheme();
    });
    
    document.getElementById('uploadBackgroundBtn')?.addEventListener('click', function() {
        document.getElementById('backgroundInput').click();
    });
    
    document.getElementById('backgroundInput')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentTheme.backgroundImage = `url(${event.target.result})`;
                updateBackgroundPreview();
                applyTheme();
                showNotification('Đã cập nhật ảnh nền!', 'success');
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    });
    
    document.getElementById('removeBackgroundBtn')?.addEventListener('click', function() {
        currentTheme.backgroundImage = 'none';
        updateBackgroundPreview();
        applyTheme();
        showNotification('Đã xóa ảnh nền!', 'success');
    });
    
    document.getElementById('saveThemeBtn')?.addEventListener('click', function() {
        localStorage.setItem('expenseManagerTheme', JSON.stringify(currentTheme));
        showNotification('Đã lưu cài đặt giao diện!', 'success');
        document.getElementById('themePanel').classList.remove('show');
    });
    
    document.getElementById('resetThemeBtn')?.addEventListener('click', function() {
        currentTheme = {
            primaryColor: '#3498db',
            secondaryColor: '#2ecc71',
            dangerColor: '#e74c3c',
            warningColor: '#f39c12',
            darkColor: '#2c3e50',
            lightColor: '#ecf0f1',
            cardOpacity: 0.95,
            backgroundImage: 'none',
            backgroundBlur: 0,
            backgroundOverlay: 'rgba(255, 255, 255, 0.1)',
            selectedColorIndex: 0
        };
        applyTheme();
        renderThemeControls();
        showNotification('Đã đặt lại giao diện mặc định!', 'success');
    });
    
    // 9. Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 10. Update limit
    document.getElementById('updateLimitBtn')?.addEventListener('click', function() {
        const limitInput = document.getElementById('newLimit').value.trim();
        
        if (limitInput === '') {
            monthlyLimit = 0;
            updateSummary();
            saveUserData();
            showNotification("Đã đặt giới hạn về 0!", "success");
            return;
        }
        
        const newLimit = parseMoneyFormat(limitInput);
        
        if (newLimit >= 0) {
            monthlyLimit = newLimit;
            updateSummary();
            saveUserData();
            document.getElementById('newLimit').value = '';
            showNotification("Cập nhật giới hạn thành công!", "success");
        } else {
            showNotification("Vui lòng nhập số tiền hợp lệ!", "error");
        }
    });
    
    // 11. Add expense
    document.getElementById('addExpenseBtn')?.addEventListener('click', function() {
        const category = document.getElementById('expenseCategory').value;
        const amountInput = document.getElementById('expenseAmount').value.trim();
        const date = document.getElementById('expenseDate').value;
        
        if (!category || !amountInput || !date) {
            showNotification("Vui lòng điền đầy đủ thông tin!", "error");
            return;
        }
        
        const amount = parseMoneyFormat(amountInput);
        
        if (amount <= 0) {
            showNotification("Số tiền phải lớn hơn 0!", "error");
            return;
        }
        
        const categoryObj = categories.find(cat => cat.id === category);
        const categoryName = categoryObj ? categoryObj.name : category;
        const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
        
        const newExpense = {
            id: newId,
            category: category,
            categoryName: categoryName,
            amount: amount,
            date: date
        };
        
        expenses.push(newExpense);
        renderExpensesTable();
        updateSummary();
        saveUserData();
        showNotification("Đã thêm chi tiêu mới!", "success");
        document.getElementById('expenseAmount').value = '';
    });
    
    // 12. Add category
    document.getElementById('addCategoryBtn')?.addEventListener('click', function() {
        const newCategoryName = document.getElementById('newCategory').value.trim();
        
        if (!newCategoryName) {
            showNotification("Vui lòng nhập tên danh mục!", "error");
            return;
        }
        
        const newCategoryId = newCategoryName.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
        
        if (categories.find(cat => cat.id === newCategoryId || cat.name === newCategoryName)) {
            showNotification("Danh mục đã tồn tại!", "error");
            return;
        }
        
        categories.push({
            id: newCategoryId,
            name: newCategoryName,
            icon: selectedIcon
        });
        
        renderCategories();
        saveUserData();
        showNotification("Đã thêm danh mục mới!", "success");
        document.getElementById('newCategory').value = '';
        
        // Reset icon selection
        selectedIcon = 'fa-tag';
        updateSelectedIconPreview();
        document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
        const defaultIcon = document.querySelector('.icon-option[data-icon="fa-tag"]');
        if (defaultIcon) defaultIcon.classList.add('selected');
    });
    
    // 13. Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
    
    // 14. Account management forms
    // Personal info form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('accountName').value.trim();
            const username = document.getElementById('accountUsername').value.trim();
            const email = document.getElementById('accountEmail').value.trim();
            
            const result = updatePersonalInfo(name, username, email);
            showAccountMessage('personalInfoMessage', result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                setTimeout(() => {
                    showMainApp();
                }, 1500);
            }
        });
    }
    
    // Cancel personal info changes
    const cancelPersonalInfoBtn = document.getElementById('cancelPersonalInfo');
    if (cancelPersonalInfoBtn) {
        cancelPersonalInfoBtn.addEventListener('click', function() {
            loadAccountManagementData();
            showAccountMessage('personalInfoMessage', 'Đã hủy thay đổi!', 'info');
        });
    }
    
    // Password change form
    const accountPasswordForm = document.getElementById('accountPasswordForm');
    if (accountPasswordForm) {
        accountPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentPassword = document.getElementById('accountCurrentPassword').value;
            const newPassword = document.getElementById('accountNewPassword').value;
            const confirmPassword = document.getElementById('accountConfirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showAccountMessage('passwordChangeMessage', 'Mật khẩu xác nhận không khớp!', 'error');
                return;
            }
            
            const result = changeAccountPassword(currentPassword, newPassword);
            showAccountMessage('passwordChangeMessage', result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                // Clear password fields
                document.getElementById('accountCurrentPassword').value = '';
                document.getElementById('accountNewPassword').value = '';
                document.getElementById('accountConfirmPassword').value = '';
                
                setTimeout(() => {
                    loadAccountManagementData();
                }, 1500);
            }
        });
    }
    
    // Cancel password change
    const cancelPasswordChangeBtn = document.getElementById('cancelPasswordChange');
    if (cancelPasswordChangeBtn) {
        cancelPasswordChangeBtn.addEventListener('click', function() {
            loadAccountManagementData();
            showAccountMessage('passwordChangeMessage', 'Đã hủy thay đổi!', 'info');
        });
    }
    
    // Change profile picture
    const changePictureBtn = document.getElementById('changePictureBtn');
    if (changePictureBtn) {
        changePictureBtn.addEventListener('click', function() {
            document.getElementById('pictureInput').click();
        });
    }
    
    // Profile picture input
    const pictureInput = document.getElementById('pictureInput');
    if (pictureInput) {
        pictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.startsWith('image/')) {
                    showNotification('Vui lòng chọn file hình ảnh!', 'error');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('Kích thước file quá lớn (tối đa 5MB)!', 'error');
                    return;
                }
                
                // Compress and update avatar
                compressImage(file)
                    .then(compressedImage => {
                        const result = updateProfilePicture(compressedImage);
                        showNotification(result.message, 'success');
                    })
                    .catch(error => {
                        console.error('Image processing error:', error);
                        showNotification('Có lỗi xảy ra khi xử lý ảnh!', 'error');
                    });
                
                // Reset file input
                e.target.value = '';
            }
        });
    }
    
    // Remove profile picture
    const removePictureBtn = document.getElementById('removePictureBtn');
    if (removePictureBtn) {
        removePictureBtn.addEventListener('click', function() {
            const result = removeProfilePicture();
            showNotification(result.message, 'success');
        });
    }
    
    // Delete account
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            const result = deleteUserAccount();
            if (!result.success && result.message !== 'Hủy xóa tài khoản!') {
                showNotification(result.message, 'error');
            }
        });
    }
    
    // 15. Set default date
    const expenseDate = document.getElementById('expenseDate');
    if (expenseDate) {
        const today = new Date();
        expenseDate.value = today.toISOString().split('T')[0];
    }
    
    console.log('✅ All event listeners setup complete');
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM Content Loaded');
    
    try {
        // Setup all event listeners
        setupEventListeners();
        
        // Load theme
        loadTheme();
        
        // Render icon options
        renderIconOptions();
        
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                if (users[currentUser.id]) {
                    currentUser = users[currentUser.id];
                    showMainApp();
                } else {
                    showAuthForm();
                }
            } catch (error) {
                console.error('Error parsing saved user:', error);
                showAuthForm();
            }
        } else {
            showAuthForm();
        }
        
        showNotification("Ứng dụng đã sẵn sàng!", "success");
        
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Có lỗi khởi tạo ứng dụng: ' + error.message);
    }
});

// Handle global errors
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});