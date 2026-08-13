(function () {
    'use strict';

    // --- DOM refs ---
    var hamburger = document.getElementById('hamburger');
    var sidebar = document.getElementById('sidebar');
    var sidebarToggle = document.getElementById('sidebarToggle');
    var navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    var header = document.getElementById('header');
    var scrollProgress = document.getElementById('scrollProgress');
    var fab = document.getElementById('fab');
    var fabMenu = document.getElementById('fabMenu');
    var themeBtn = document.getElementById('themeBtn');
    var themePanel = document.getElementById('themePanel');
    var closeThemePanel = document.getElementById('closeThemePanel');
    var themeOptions = document.querySelectorAll('.theme-option');
    var darkToggle = document.getElementById('darkToggle');
    var backToTop = document.getElementById('backToTop');
    var authBtn = document.getElementById('authBtn');
    var modalOverlay = document.getElementById('modalOverlay');
    var modalClose = document.getElementById('modalClose');
    var modalTabs = document.querySelectorAll('.modal-tab');
    var loginForm = document.getElementById('loginForm');
    var signupForm = document.getElementById('signupForm');
    var switchToSignup = document.getElementById('switchToSignup');
    var switchToLogin = document.getElementById('switchToLogin');
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var toastContainer = document.getElementById('toastContainer');
    var breadcrumb = document.getElementById('breadcrumb');
    var headerSearch = document.getElementById('headerSearch');
    var searchResults = document.getElementById('searchResults');
    var customColorPicker = document.getElementById('customColorPicker');
    var customColorHex = document.getElementById('customColorHex');
    var applyCustomColor = document.getElementById('applyCustomColor');

    // --- Theme state ---
    var currentTheme = localStorage.getItem('ayaanroyale-theme') || 'gold';
    var isDark = localStorage.getItem('ayaanroyale-dark') === 'true';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem('ayaanroyale-theme', theme);
        themeOptions.forEach(function (opt) {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });
        if (customColorPicker) customColorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#D4AF37';
    }

    function applyDarkMode(dark) {
        document.documentElement.setAttribute('data-dark', dark.toString());
        isDark = dark;
        localStorage.setItem('ayaanroyale-dark', dark.toString());
        if (darkToggle) darkToggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    applyTheme(currentTheme);
    applyDarkMode(isDark);

    // --- Sidebar toggle ---
    var layoutWrapper = document.querySelector('.layout-wrapper');

    function updateSidebarState() {
        var isOpen = sidebar.classList.contains('open');
        layoutWrapper.classList.toggle('sidebar-open', isOpen);
        if (hamburger) hamburger.classList.toggle('active', isOpen);
        var overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.toggle('show', isOpen && window.innerWidth <= 1100);
    }

    function ensureOverlay() {
        var overlay = document.querySelector('.sidebar-overlay');
        if (!overlay && window.innerWidth <= 1100) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                updateSidebarState();
            });
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function toggleSidebar() {
        sidebar.classList.toggle('open');
        updateSidebarState();
        if (sidebar.classList.contains('open')) ensureOverlay();
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        updateSidebarState();
        var overlay = document.querySelector('.sidebar-overlay');
        if (overlay) overlay.classList.remove('show');
    }

    // Open sidebar on desktop by default, closed on mobile
    if (window.innerWidth > 1100) {
        sidebar.classList.add('open');
    }
    updateSidebarState();

    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
    if (hamburger) hamburger.addEventListener('click', toggleSidebar);

    var sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) sidebarClose.addEventListener('click', closeSidebar);

    navLinks.forEach(function (link) {
        link.addEventListener('click', closeSidebar);
    });

    // --- Avatar change ---
    var avatarInput = document.getElementById('avatarInput');
    var avatarImgs = document.querySelectorAll('.avatar-img');

    function updateAvatars(src) {
        avatarImgs.forEach(function (img) { img.src = src; });
        localStorage.setItem('ayaan-avatar', src);
    }

    var savedAvatar = localStorage.getItem('ayaan-avatar');
    if (savedAvatar) updateAvatars(savedAvatar);

    // Camera overlay triggers file upload
    document.querySelectorAll('.avatar-camera').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            avatarInput.click();
        });
    });

    avatarInput.addEventListener('change', function () {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) { updateAvatars(e.target.result); };
        reader.readAsDataURL(file);
        this.value = '';
    });

    // --- Logout ---
    var defaultAvatar = 'https://i.pravatar.cc/150?img=68';
    var sidebarAvatarWrap = document.getElementById('sidebarAvatarWrap');
    var sidebarAvatarDropdown = document.getElementById('sidebarAvatarDropdown');

    // Avatar image toggles logout dropdown
    sidebarAvatarWrap.querySelector('.avatar-img').addEventListener('click', function (e) {
        e.stopPropagation();
        sidebarAvatarDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function () {
        sidebarAvatarDropdown.classList.remove('open');
        headerAvatarDropdown.classList.remove('open');
    });

    function updateAuthUI() {
        var userData = localStorage.getItem('ayaan-user');
        var nameEl = document.querySelector('.sidebar-user .user-name');
        var roleEl = document.querySelector('.sidebar-user .user-role');
        if (userData) {
            var user = JSON.parse(userData);
            if (nameEl) nameEl.textContent = user.name || user.email;
            if (roleEl) roleEl.textContent = 'Logged in';
            authBtn.innerHTML = '<i class="fas fa-user-check"></i>';
            authBtn.title = 'Logged in as ' + (user.name || user.email);
        } else {
            if (nameEl) nameEl.textContent = 'Mr. Ayaan';
            if (roleEl) roleEl.textContent = 'Hotel Manager';
            authBtn.innerHTML = '<i class="fas fa-user"></i>';
            authBtn.title = 'Login / Sign Up';
        }
    }

    function handleLogout() {
        localStorage.removeItem('ayaan-avatar');
        localStorage.removeItem('ayaan-user');
        updateAvatars(defaultAvatar);
        sidebarAvatarDropdown.classList.remove('open');
        headerAvatarDropdown.classList.remove('open');
        updateAuthUI();
        if (typeof showToast === 'function') {
            showToast('Logged out successfully!', 'info');
        }
    }

    document.getElementById('sidebarLogout').addEventListener('click', handleLogout);

    // --- Header avatar logout dropdown ---
    var headerAvatarWrap = document.getElementById('headerAvatarWrap');
    var headerAvatarDropdown = document.getElementById('headerAvatarDropdown');

    headerAvatarWrap.querySelector('.avatar-img').addEventListener('click', function (e) {
        e.stopPropagation();
        headerAvatarDropdown.classList.toggle('open');
    });

    document.getElementById('headerLogout').addEventListener('click', handleLogout);

    // --- Active link ---
    var sections = document.querySelectorAll('section[id]');
    function updateActiveLink(id) {
        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) link.classList.add('active');
        });
        var bc = breadcrumb;
        if (bc) {
            var ol = bc.querySelector('ol');
            if (ol) {
                var current = ol.querySelector('.breadcrumb-current');
                if (!current) {
                    current = document.createElement('li');
                    current.className = 'breadcrumb-current';
                    ol.appendChild(current);
                }
                var name = id.charAt(0).toUpperCase() + id.slice(1);
                if (id === 'home') name = 'Home';
                else if (id === 'page404') name = '404';
                current.textContent = name;
            }
        }
    }

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    if (id && id !== 'page404') updateActiveLink(id);
                }
            });
        }, { rootMargin: '-80px 0px -60% 0px' });
        sections.forEach(function (s) { observer.observe(s); });
    } else {
        window.addEventListener('scroll', function () {
            var current = '';
            sections.forEach(function (section) {
                var rect = section.getBoundingClientRect();
                if (rect.top <= 150) current = section.getAttribute('id');
            });
            if (current) updateActiveLink(current);
        });
    }

    // --- 404 nav link ---
    var nav404Link = document.getElementById('nav404Link');
    if (nav404Link) {
        nav404Link.addEventListener('click', function (e) {
            e.preventDefault();
            var el = document.getElementById('page404');
            if (el) { el.scrollIntoView({ behavior: 'smooth' }); updateActiveLink('page404'); }
        });
    }

    // --- Scroll ---
    function updateScrollProgress() {
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = progress + '%';
    }
    function updateHeader() { if (header) header.classList.toggle('scrolled', window.scrollY > 50); }
    function updateBackToTop() { if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400); }

    window.addEventListener('scroll', function () {
        updateScrollProgress();
        updateHeader();
        updateBackToTop();
    });

    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- FAB ---
    if (fab) {
        fab.addEventListener('click', function () {
            this.classList.toggle('active');
            if (fabMenu) fabMenu.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (!fab.contains(e.target) && fabMenu && !fabMenu.contains(e.target)) {
                fab.classList.remove('active');
                fabMenu.classList.remove('open');
            }
        });
    }

    // --- Theme panel ---
    if (themeBtn) {
        themeBtn.addEventListener('click', function () { themePanel.classList.toggle('open'); });
    }
    if (closeThemePanel) {
        closeThemePanel.addEventListener('click', function () { themePanel.classList.remove('open'); });
    }
    themeOptions.forEach(function (option) {
        option.addEventListener('click', function () { applyTheme(this.dataset.theme); });
    });
    if (darkToggle) {
        darkToggle.addEventListener('click', function () { applyDarkMode(!isDark); });
    }

    // Custom color
    if (customColorPicker && customColorHex) {
        customColorPicker.addEventListener('input', function () {
            customColorHex.value = this.value;
        });
        customColorHex.addEventListener('input', function () {
            if (/^#[0-9a-f]{6}$/i.test(this.value)) customColorPicker.value = this.value;
        });
    }
    if (applyCustomColor) {
        applyCustomColor.addEventListener('click', function () {
            var color = customColorHex ? customColorHex.value : '#D4AF37';
            if (/^#[0-9a-f]{6}$/i.test(color)) {
                var r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
                var light = 'rgba(' + r + ',' + g + ',' + b + ',0.12)';
                document.documentElement.style.setProperty('--primary', color);
                document.documentElement.style.setProperty('--primary-dark', color);
                document.documentElement.style.setProperty('--primary-light', light);
                localStorage.setItem('ayaanroyale-custom-color', color);
                localStorage.setItem('ayaanroyale-theme', 'custom');
                themeOptions.forEach(function (o) { o.classList.remove('active'); });
            }
        });
    }
    // Load custom color
    var savedCustom = localStorage.getItem('ayaanroyale-custom-color');
    if (savedCustom) {
        document.documentElement.style.setProperty('--primary', savedCustom);
        document.documentElement.style.setProperty('--primary-dark', savedCustom);
    }

    // --- Escape ---
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            themePanel.classList.remove('open');
            if (fab) fab.classList.remove('active');
            if (fabMenu) fabMenu.classList.remove('open');
            closeModal();
            closeQuickBook();
            lightbox.classList.remove('open');
            if (searchResults) searchResults.classList.remove('open');
        }
    });

    // ============================================================
    // DIALOG
    // ============================================================
    var dialogOverlay = document.getElementById('dialogOverlay');
    var dialogBox = document.getElementById('dialogBox');
    var dialogTitle = document.getElementById('dialogTitle');
    var dialogMessage = document.getElementById('dialogMessage');
    var dialogIcon = document.getElementById('dialogIcon');
    var dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
    var dialogCancelBtn = document.getElementById('dialogCancelBtn');
    var dialogCloseBtn = document.getElementById('dialogClose');

    window.openDialog = function (type, title, message, onConfirm) {
        if (!dialogOverlay || !dialogBox) return;
        dialogTitle.textContent = title || 'Dialog';
        dialogMessage.textContent = message || '';
        dialogIcon.className = 'dialog-icon ' + (type === 'info' ? 'info' : type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'confirm' ? 'confirm' : 'info');
        var icons = { info: 'fa-info-circle', success: 'fa-check-circle', error: 'fa-times-circle', confirm: 'fa-question-circle' };
        dialogIcon.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i>';
        if (type === 'confirm' || type === 'info') {
            dialogCancelBtn.style.display = type === 'confirm' ? '' : 'none';
            dialogConfirmBtn.style.display = '';
            dialogConfirmBtn.textContent = type === 'confirm' ? 'Confirm' : 'OK';
        } else {
            dialogCancelBtn.style.display = 'none';
            dialogConfirmBtn.style.display = '';
            dialogConfirmBtn.textContent = 'OK';
        }
        dialogOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        dialogConfirmBtn.onclick = function () {
            closeDialog();
            if (typeof onConfirm === 'function') onConfirm();
        };
        dialogCancelBtn.onclick = closeDialog;
    };

    function closeDialog() {
        if (!dialogOverlay) return;
        dialogOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (dialogOverlay) {
        dialogOverlay.addEventListener('click', function (e) { if (e.target === this) closeDialog(); });
    }
    if (dialogCloseBtn) dialogCloseBtn.addEventListener('click', closeDialog);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (dialogOverlay && dialogOverlay.classList.contains('open')) closeDialog();
        }
    });

    // ============================================================
    // MODAL
    // ============================================================
    function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        var userData = localStorage.getItem('ayaan-user');
        if (userData) {
            var user = JSON.parse(userData);
            var loginEmail = document.getElementById('loginEmail');
            var loginPassword = document.getElementById('loginPassword');
            if (loginEmail) loginEmail.value = user.email || '';
            if (loginPassword) loginPassword.value = user.password || '';
        }
    }
    function closeModal() { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; }
    function switchAuthTab(tab) {
        modalTabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === tab); });
        loginForm.classList.toggle('hidden', tab !== 'login');
        signupForm.classList.toggle('hidden', tab !== 'signup');
        document.getElementById('modalTitle').textContent = tab === 'login' ? 'Welcome Back' : 'Create Account';
        if (tab === 'login') {
            document.getElementById('loginFields').classList.remove('hidden');
            document.getElementById('loginOtpSection').classList.add('hidden');
            clearOtpBoxes('loginOtpInputs');
        } else {
            document.getElementById('signupFields').classList.remove('hidden');
            document.getElementById('signupOtpSection').classList.add('hidden');
            clearOtpBoxes('signupOtpInputs');
        }
    }

    if (authBtn) authBtn.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', function (e) { if (e.target === this) closeModal(); });

    modalTabs.forEach(function (tab) {
        tab.addEventListener('click', function () { switchAuthTab(this.dataset.tab); });
    });
    if (switchToSignup) switchToSignup.addEventListener('click', function (e) { e.preventDefault(); switchAuthTab('signup'); });
    if (switchToLogin) switchToLogin.addEventListener('click', function (e) { e.preventDefault(); switchAuthTab('login'); });

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            var email = document.getElementById('loginEmail').value;
            var password = document.getElementById('loginPassword').value;
            var btn = document.getElementById('loginSubmitBtn');
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
            btn.disabled = true;
            try {
                var res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, password: password })
                });
                var data = await res.json();
                if (data.success) {
                    document.getElementById('loginFields').classList.add('hidden');
                    document.getElementById('loginOtpSection').classList.remove('hidden');
                    document.getElementById('loginOtpInfo').textContent = 'Enter the 6-digit code sent to ' + email;
                    btn.innerHTML = orig; btn.disabled = false;
                    showToast('OTP sent to your email!', 'success');
                    initOtpInputs('loginOtpInputs');
                    document.querySelector('#loginOtpInputs .otp-box').focus();
                } else {
                    btn.innerHTML = '<i class="fas fa-times-circle"></i> ' + (data.message || 'Failed');
                    btn.style.background = '#dc2626';
                    showToast(data.message || 'Login failed', 'error');
                    setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
                }
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-times-circle"></i> Error!';
                btn.style.background = '#dc2626';
                showToast('Connection error', 'error');
                setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
            }
        });
    }

    var loginVerifyBtn = document.getElementById('loginVerifyBtn');
    if (loginVerifyBtn) {
        loginVerifyBtn.addEventListener('click', async function () {
            var email = document.getElementById('loginEmail').value;
            var password = document.getElementById('loginPassword').value;
            var otp = getOtpValue('loginOtpInputs');
            var btn = this;
            var orig = btn.innerHTML;
            if (otp.length !== 6) { showToast('Please enter 6-digit code', 'error'); return; }
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            btn.disabled = true;
            try {
                var res = await fetch('/api/verify-login-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, otp: otp })
                });
                var data = await res.json();
                if (data.success) {
                    localStorage.setItem('ayaan-user', JSON.stringify({ email: data.email, password: password, name: data.name, token: data.token }));
                    updateAuthUI();
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> Verified!';
                    btn.style.background = '#059669';
                    showToast('Welcome back to Ayaan Royale!', 'success');
                    setTimeout(function () {
                        closeModal(); btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false;
                        loginForm.reset(); clearOtpBoxes('loginOtpInputs');
                        document.getElementById('loginFields').classList.remove('hidden');
                        document.getElementById('loginOtpSection').classList.add('hidden');
                    }, 1200);
                } else {
                    btn.innerHTML = '<i class="fas fa-times-circle"></i> ' + (data.message || 'Failed');
                    btn.style.background = '#dc2626';
                    showToast(data.message || 'Invalid OTP', 'error');
                    setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
                }
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-times-circle"></i> Error!';
                btn.style.background = '#dc2626';
                showToast('Connection error', 'error');
                setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
            }
        });
    }

    var loginResendOtp = document.getElementById('loginResendOtp');
    if (loginResendOtp) {
        loginResendOtp.addEventListener('click', function (e) {
            e.preventDefault();
            clearOtpBoxes('loginOtpInputs');
            document.getElementById('loginFields').classList.remove('hidden');
            document.getElementById('loginOtpSection').classList.add('hidden');
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            var email = document.getElementById('signupEmail').value;
            var password = document.getElementById('signupPassword').value;
            var name = (document.getElementById('signupName').value || email.split('@')[0]);
            var btn = document.getElementById('signupSubmitBtn');
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending OTP...';
            btn.disabled = true;
            try {
                var res = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, email: email, password: password })
                });
                var data = await res.json();
                if (data.success) {
                    document.getElementById('signupFields').classList.add('hidden');
                    document.getElementById('signupOtpSection').classList.remove('hidden');
                    document.getElementById('signupOtpInfo').textContent = 'Enter the 6-digit code sent to ' + email;
                    btn.innerHTML = orig; btn.disabled = false;
                    showToast('OTP sent to your email!', 'success');
                    initOtpInputs('signupOtpInputs');
                    document.querySelector('#signupOtpInputs .otp-box').focus();
                } else {
                    btn.innerHTML = '<i class="fas fa-times-circle"></i> ' + (data.message || 'Failed');
                    btn.style.background = '#dc2626';
                    showToast(data.message || 'Signup failed', 'error');
                    setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
                }
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-times-circle"></i> Error!';
                btn.style.background = '#dc2626';
                showToast('Connection error', 'error');
                setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
            }
        });
    }

    var signupVerifyBtn = document.getElementById('signupVerifyBtn');
    if (signupVerifyBtn) {
        signupVerifyBtn.addEventListener('click', async function () {
            var email = document.getElementById('signupEmail').value;
            var password = document.getElementById('signupPassword').value;
            var name = (document.getElementById('signupName').value || email.split('@')[0]);
            var otp = getOtpValue('signupOtpInputs');
            var btn = this;
            var orig = btn.innerHTML;
            if (otp.length !== 6) { showToast('Please enter 6-digit code', 'error'); return; }
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            btn.disabled = true;
            try {
                var res = await fetch('/api/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, otp: otp })
                });
                var data = await res.json();
                if (data.success) {
                    localStorage.setItem('ayaan-user', JSON.stringify({ email: data.email, password: password, name: data.name, token: data.token }));
                    updateAuthUI();
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> Verified!';
                    btn.style.background = '#059669';
                    showToast('Account created successfully!', 'success');
                    setTimeout(function () {
                        closeModal(); btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false;
                        signupForm.reset(); clearOtpBoxes('signupOtpInputs');
                        document.getElementById('signupFields').classList.remove('hidden');
                        document.getElementById('signupOtpSection').classList.add('hidden');
                    }, 1200);
                } else {
                    btn.innerHTML = '<i class="fas fa-times-circle"></i> ' + (data.message || 'Failed');
                    btn.style.background = '#dc2626';
                    showToast(data.message || 'Invalid OTP', 'error');
                    setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
                }
            } catch (err) {
                btn.innerHTML = '<i class="fas fa-times-circle"></i> Error!';
                btn.style.background = '#dc2626';
                showToast('Connection error', 'error');
                setTimeout(function () { btn.innerHTML = orig; btn.style.background = ''; btn.disabled = false; }, 3000);
            }
        });
    }

    var signupResendOtp = document.getElementById('signupResendOtp');
    if (signupResendOtp) {
        signupResendOtp.addEventListener('click', function (e) {
            e.preventDefault();
            clearOtpBoxes('signupOtpInputs');
            document.getElementById('signupFields').classList.remove('hidden');
            document.getElementById('signupOtpSection').classList.add('hidden');
            document.getElementById('signupForm').dispatchEvent(new Event('submit'));
        });
    }

    function getOtpValue(containerId) {
        var boxes = document.querySelectorAll('#' + containerId + ' .otp-box');
        var otp = '';
        boxes.forEach(function (box) { otp += box.value; });
        return otp;
    }

    function clearOtpBoxes(containerId) {
        var boxes = document.querySelectorAll('#' + containerId + ' .otp-box');
        boxes.forEach(function (box) { box.value = ''; box.classList.remove('filled'); });
    }

    function initOtpInputs(containerId) {
        var boxes = document.querySelectorAll('#' + containerId + ' .otp-box');
        boxes.forEach(function (box, idx) {
            box.value = '';
            box.classList.remove('filled');
            box.addEventListener('input', function () {
                if (this.value.length >= 1) {
                    this.value = this.value.slice(-1);
                    this.classList.add('filled');
                    if (idx < boxes.length - 1) boxes[idx + 1].focus();
                }
            });
            box.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !this.value && idx > 0) {
                    boxes[idx - 1].focus();
                    boxes[idx - 1].value = '';
                    boxes[idx - 1].classList.remove('filled');
                }
            });
            box.addEventListener('paste', function (e) {
                e.preventDefault();
                var data = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, boxes.length);
                data.split('').forEach(function (char, i) {
                    if (boxes[i]) { boxes[i].value = char; boxes[i].classList.add('filled'); }
                });
                var next = Math.min(data.length, boxes.length - 1);
                boxes[next].focus();
            });
        });
    }

    // Restore login state on page load
    updateAuthUI();

    // ============================================================
    // TOAST
    // ============================================================
    function showToast(msg, type) {
        if (!toastContainer) return;
        type = type || 'info';
        var icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
        var t = document.createElement('div');
        t.className = 'toast toast-' + type;
        t.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + msg + '</span><button class="toast-close"><i class="fas fa-times"></i></button>';
        t.querySelector('.toast-close').addEventListener('click', function () { removeToast(t); });
        toastContainer.appendChild(t);
        setTimeout(function () { removeToast(t); }, 4000);
    }
    function removeToast(t) {
        if (!t) return;
        t.classList.add('removing');
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }

    // Demo toast
    setTimeout(function () { showToast('Welcome to Hotel Ayaan Royale!', 'info'); }, 1500);

    // ============================================================
    // HERO CAROUSEL
    // ============================================================
    (function () {
        var container = document.getElementById('heroCarousel');
        if (!container) return;
        var slides = container.querySelectorAll('.hero-slide');
        var dotsContainer = document.querySelector('.hero-dots');
        var prevBtn = document.querySelector('.hero-prev');
        var nextBtn = document.querySelector('.hero-next');
        if (!slides.length) return;
        var current = 0;

        slides.forEach(function (_, i) {
            var dot = document.createElement('button');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', function () { go(i); });
            if (dotsContainer) dotsContainer.appendChild(dot);
        });

        function go(idx) {
            slides.forEach(function (s) { s.classList.remove('active'); });
            slides[idx].classList.add('active');
            current = idx;
            var dots = dotsContainer ? dotsContainer.querySelectorAll('button') : [];
            dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
        }

        if (prevBtn) prevBtn.addEventListener('click', function () { go((current - 1 + slides.length) % slides.length); });
        if (nextBtn) nextBtn.addEventListener('click', function () { go((current + 1) % slides.length); });

        var timer = setInterval(function () { go((current + 1) % slides.length); }, 5000);
        container.addEventListener('mouseenter', function () { clearInterval(timer); });
        container.addEventListener('mouseleave', function () { timer = setInterval(function () { go((current + 1) % slides.length); }, 5000); });

        // Swipe
        var startX = 0;
        container.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
        container.addEventListener('touchend', function (e) {
            var diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) go((current - 1 + slides.length) % slides.length);
                else go((current + 1) % slides.length);
            }
        }, { passive: true });
    })();

    // ============================================================
    // CARD CAROUSEL (auto-slide every 3s)
    // ============================================================
    (function () {
        function initCarousel(container) {
            if (!container) return;
            var slides = Array.from(container.children);
            if (slides.length <= 1) return;
            var current = 0;
            var timer = null;
            container.classList.add('carousel-container');
            var wrapper = document.createElement('div');
            wrapper.className = 'carousel-track';
            slides.forEach(function (el) {
                var slide = document.createElement('div');
                slide.className = 'carousel-slide';
                el.replaceWith(slide);
                slide.appendChild(el);
                wrapper.appendChild(slide);
            });
            container.appendChild(wrapper);
            var dots = document.createElement('div');
            dots.className = 'carousel-dots';
            slides.forEach(function (_, i) {
                var dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.addEventListener('click', function () { go(i); });
                dots.appendChild(dot);
            });
            container.appendChild(dots);
            function go(index) {
                current = index;
                wrapper.style.transform = 'translateX(-' + (current * 100) + '%)';
                var allDots = container.querySelectorAll('.carousel-dot');
                allDots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
                reset();
            }
            function next() { go((current + 1) % slides.length); }
            function reset() { if (timer) clearInterval(timer); timer = setInterval(next, 3000); }
            wrapper.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
            wrapper.addEventListener('mouseleave', reset);
            var startX = 0, isDragging = false;
            wrapper.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; isDragging = true; if (timer) clearInterval(timer); }, { passive: true });
            wrapper.addEventListener('touchend', function (e) {
                if (!isDragging) return;
                isDragging = false;
                var diff = e.changedTouches[0].clientX - startX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) go((current - 1 + slides.length) % slides.length);
                    else go((current + 1) % slides.length);
                }
                reset();
            }, { passive: true });
            timer = setInterval(next, 3000);
        }
        var carouselSelectors = [
            '.amenities-grid',
            '.restaurant-grid',
            '.components-grid',
            '.gallery-grid:not([data-infinite])',
            '.rooms-grid:not([data-pagination])',
        ];
        carouselSelectors.forEach(function (sel) {
            var els = document.querySelectorAll(sel);
            els.forEach(function (el) { initCarousel(el); });
        });
        // Re-run for tabs
        var tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var parent = this.closest('.tabs-container');
                if (!parent) return;
                setTimeout(function () {
                    parent.querySelectorAll('.rooms-grid:not([data-pagination])').forEach(function (g) {
                        if (!g.classList.contains('carousel-container')) initCarousel(g);
                    });
                }, 100);
            });
        });
    })();

    // ============================================================
    // COUNTER ANIMATION
    // ============================================================
    (function () {
        var counters = document.querySelectorAll('.counter');
        if (!counters.length) return;
        var animated = false;

        function animateCounters() {
            if (animated) return;
            animated = true;
            counters.forEach(function (el) {
                var target = parseInt(el.dataset.target, 10);
                var duration = 2000;
                var start = 0;
                var step = Math.ceil(target / (duration / 16));
                function update() {
                    start += step;
                    if (start >= target) { el.textContent = target.toLocaleString('en-US'); return; }
                    el.textContent = start.toLocaleString('en-US');
                    requestAnimationFrame(update);
                }
                update();
            });
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { animateCounters(); observer.disconnect(); }
            });
        }, { threshold: 0.3 });
        var aboutSection = document.getElementById('about');
        if (aboutSection) observer.observe(aboutSection);
    })();

    // ============================================================
    // TABS
    // ============================================================
    (function () {
        var tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var parent = this.closest('.tabs-container');
                if (!parent) return;
                parent.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
                var tabId = 'tab-' + this.dataset.tab;
                parent.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
                var panel = document.getElementById(tabId);
                if (panel) panel.classList.add('active');
            });
        });
    })();

    // ============================================================
    // PAGINATION (rooms)
    // ============================================================
    (function () {
        var grid = document.querySelector('.rooms-grid[data-pagination]');
        if (!grid) return;
        var perPage = parseInt(grid.dataset.pagination, 10) || 3;
        var cards = Array.from(grid.children);
        var totalPages = Math.ceil(cards.length / perPage);
        var pagination = document.getElementById('roomsPagination');
        if (!pagination) return;
        var prevBtn = pagination.querySelector('[data-page="prev"]');
        var nextBtn = pagination.querySelector('[data-page="next"]');
        var numbers = pagination.querySelector('.page-numbers');
        if (!numbers) return;
        var currentPage = 1;

        function showPage(page) {
            currentPage = page;
            cards.forEach(function (card, i) {
                card.style.display = (i >= (page - 1) * perPage && i < page * perPage) ? '' : 'none';
            });
            if (prevBtn) prevBtn.disabled = page === 1;
            if (nextBtn) nextBtn.disabled = page === totalPages;
            numbers.querySelectorAll('.page-num').forEach(function (btn) {
                btn.classList.toggle('active', parseInt(btn.dataset.page, 10) === page);
            });
        }

        numbers.innerHTML = '';
        for (var i = 1; i <= totalPages; i++) {
            var btn = document.createElement('button');
            btn.className = 'page-num' + (i === 1 ? ' active' : '');
            btn.textContent = i;
            btn.dataset.page = i;
            btn.addEventListener('click', function () { showPage(parseInt(this.dataset.page, 10)); });
            numbers.appendChild(btn);
        }
        if (prevBtn) prevBtn.addEventListener('click', function () { if (currentPage > 1) showPage(currentPage - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function () { if (currentPage < totalPages) showPage(currentPage + 1); });
        if (totalPages <= 1) { pagination.style.display = 'none'; return; }
        showPage(1);
    })();

    // ============================================================
    // ACCORDION
    // ============================================================
    (function () {
        var headers = document.querySelectorAll('.accordion-header');
        headers.forEach(function (header) {
            header.addEventListener('click', function () {
                var item = this.closest('.accordion-item');
                if (!item) return;
                // Close siblings
                var container = item.closest('.accordion');
                if (container) {
                    container.querySelectorAll('.accordion-item').forEach(function (other) {
                        if (other !== item) other.classList.remove('active');
                    });
                }
                item.classList.toggle('active');
            });
        });
    })();

    // ============================================================
    // LIGHTBOX
    // ============================================================
    (function () {
        var items = document.querySelectorAll('.gallery-item');
        var currentIdx = 0;
        var images = [];

        items.forEach(function (item, idx) {
            var img = item.querySelector('img');
            var caption = item.querySelector('.gallery-overlay span');
            if (img) {
                images.push({ src: img.src.replace('w=600', 'w=1200'), caption: caption ? caption.textContent : '' });
                item.addEventListener('click', function () {
                    currentIdx = idx;
                    openLightbox(idx);
                });
            }
        });

        function openLightbox(idx) {
            if (!lightbox || !images.length) return;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
            showImage(idx);
        }

        function showImage(idx) {
            currentIdx = idx;
            if (lightboxImg) lightboxImg.src = images[idx].src;
            if (lightboxCaption) lightboxCaption.textContent = images[idx].caption;
        }

        function closeLightbox() {
            if (lightbox) lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }

        if (lightbox) {
            lightbox.addEventListener('click', function (e) {
                if (e.target === this) closeLightbox();
            });
            var closeBtn = lightbox.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

            var prevBtn = lightbox.querySelector('.lightbox-prev');
            var nextBtn = lightbox.querySelector('.lightbox-next');
            if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); if (currentIdx > 0) showImage(currentIdx - 1); });
            if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); if (currentIdx < images.length - 1) showImage(currentIdx + 1); });

            // Keyboard
            document.addEventListener('keydown', function (e) {
                if (!lightbox.classList.contains('open')) return;
                if (e.key === 'ArrowLeft' && currentIdx > 0) showImage(currentIdx - 1);
                if (e.key === 'ArrowRight' && currentIdx < images.length - 1) showImage(currentIdx + 1);
            });
        }
    })();

    // ============================================================
    // SEARCH AUTOCOMPLETE
    // ============================================================
    (function () {
        if (!headerSearch || !searchResults) return;
        var pageData = [
            { label: 'Home', icon: 'fa-home', href: '#home' },
            { label: 'About Us', icon: 'fa-info-circle', href: '#about' },
            { label: 'Deluxe Rooms', icon: 'fa-bed', href: '#rooms' },
            { label: 'Executive Suites', icon: 'fa-bed', href: '#rooms' },
            { label: 'Presidential Suite', icon: 'fa-crown', href: '#rooms' },
            { label: 'Swimming Pool', icon: 'fa-swimmer', href: '#amenities' },
            { label: 'Spa & Wellness', icon: 'fa-spa', href: '#amenities' },
            { label: 'Fitness Center', icon: 'fa-dumbbell', href: '#amenities' },
            { label: 'Fine Dining', icon: 'fa-utensils', href: '#restaurant' },
            { label: 'Photo Gallery', icon: 'fa-images', href: '#gallery' },
            { label: 'Book a Room', icon: 'fa-calendar-check', href: '#booking' },
            { label: 'FAQ', icon: 'fa-question-circle', href: '#faq' },
            { label: 'Contact Us', icon: 'fa-envelope', href: '#contact' },
            { label: 'Mr. Ayaan - Manager', icon: 'fa-user-tie', href: '#about' },
        ];

        headerSearch.addEventListener('input', function () {
            var q = this.value.toLowerCase().trim();
            if (!q) { searchResults.classList.remove('open'); return; }
            var matches = pageData.filter(function (d) { return d.label.toLowerCase().indexOf(q) > -1; });
            if (!matches.length) { searchResults.classList.remove('open'); return; }
            searchResults.innerHTML = '';
            matches.forEach(function (m) {
                var div = document.createElement('div');
                div.className = 'search-result-item';
                div.innerHTML = '<i class="fas ' + m.icon + '"></i><span>' + m.label + '</span>';
                div.addEventListener('click', function () {
                    var el = document.querySelector(m.href);
                    if (el) { el.scrollIntoView({ behavior: 'smooth' }); }
                    searchResults.classList.remove('open');
                    headerSearch.value = m.label;
                });
                searchResults.appendChild(div);
            });
            searchResults.classList.add('open');
        });

        headerSearch.addEventListener('blur', function () {
            setTimeout(function () { searchResults.classList.remove('open'); }, 200);
        });
        headerSearch.addEventListener('focus', function () {
            if (this.value.trim()) this.dispatchEvent(new Event('input'));
        });
    })();

    // ============================================================
    // CUSTOM SELECT
    // ============================================================
    function initCustomSelect(container) {
        var selected = container.querySelector('.select-selected');
        var items = container.querySelector('.select-items');
        var options = container.querySelectorAll('.select-option');
        var hidden = container.querySelector('.select-hidden');
        if (!selected || !items) return;

        selected.addEventListener('click', function (e) {
            e.stopPropagation();
            var wasOpen = items.classList.contains('open');
            document.querySelectorAll('.select-items.open').forEach(function (el) { if (el !== items) el.classList.remove('open'); });
            document.querySelectorAll('.select-selected.open').forEach(function (el) { if (el !== selected) el.classList.remove('open'); });
            items.classList.toggle('open');
            selected.classList.toggle('open');
            selected.setAttribute('aria-expanded', items.classList.contains('open'));
        });

        options.forEach(function (opt) {
            opt.addEventListener('click', function () {
                options.forEach(function (o) { o.classList.remove('same-as-selected'); });
                this.classList.add('same-as-selected');
                var value = this.dataset.value;
                var text = this.textContent;
                selected.querySelector('span').textContent = text;
                if (hidden) { hidden.value = value; hidden.dispatchEvent(new Event('change', { bubbles: true })); }
                items.classList.remove('open');
                selected.classList.remove('open');
                selected.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function () {
            items.classList.remove('open');
            selected.classList.remove('open');
            selected.setAttribute('aria-expanded', 'false');
        });

        selected.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !items.classList.contains('open')) { e.preventDefault(); this.click(); }
        });
        options.forEach(function (opt) {
            opt.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') { e.preventDefault(); this.click(); }
                if (e.key === 'ArrowDown') { e.preventDefault(); var n = this.nextElementSibling; if (n && n.classList.contains('select-option')) n.focus(); }
                if (e.key === 'ArrowUp') { e.preventDefault(); var p = this.previousElementSibling; if (p && p.classList.contains('select-option')) p.focus(); }
            });
        });
    }
    document.querySelectorAll('.custom-select').forEach(initCustomSelect);

    // ============================================================
    // BOOKING STEPPER
    // ============================================================
    var currentStep = 1;
    window.nextStep = function (step) {
        // Validate
        var currentContent = document.querySelector('.step-content.active');
        if (currentContent) {
            var inputs = currentContent.querySelectorAll('[required]');
            var valid = true;
            inputs.forEach(function (inp) {
                if (!inp.value.trim()) { inp.classList.add('error'); valid = false; }
                else inp.classList.remove('error');
            });
            if (!valid) { showToast('Please fill all required fields', 'error'); return; }
        }
        goToStep(step);
    };
    window.prevStep = function (step) { goToStep(step); };

    function goToStep(step) {
        currentStep = step;
        document.querySelectorAll('.step-content').forEach(function (c) { c.classList.remove('active'); });
        document.querySelectorAll('.step').forEach(function (s) {
            s.classList.remove('active', 'completed');
            var num = parseInt(s.dataset.step, 10);
            if (num === step) s.classList.add('active');
            else if (num < step) s.classList.add('completed');
        });
        var target = document.querySelector('.step-content[data-step="' + step + '"]');
        if (target) target.classList.add('active');
        var stepperEl = document.querySelector('.stepper');
        if (stepperEl) stepperEl.setAttribute('data-step', step);

        // Update summary on step 4
        if (step === 4) updateSummary();
    }

    function updateSummary() {
        var getName = function (id) { var el = document.getElementById(id); return el ? el.value || '-' : '-'; };
        var setSpan = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
        setSpan('summaryName', getName('bkName'));
        setSpan('summaryEmail', getName('bkEmail'));
        var roomEl = document.getElementById('bkRoomType');
        var roomText = '-';
        if (roomEl) {
            var sel = document.querySelector('#bkRoomSelect .select-selected span');
            roomText = sel ? sel.textContent : (roomEl.value || '-');
        }
        setSpan('summaryRoom', roomText);
        setSpan('summaryCheckin', getName('bkCheckin'));
        setSpan('summaryCheckout', getName('bkCheckout'));
        setSpan('summaryGuests', getName('bkGuests') + ' Guest(s)');
        setSpan('summaryTotal', '$' + (Math.floor(Math.random() * 500) + 200) + '.00');
    }

    var bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var captchaInput = document.getElementById('captchaInput');
            var captchaError = document.getElementById('captchaError');
            if (captchaInput && captchaError) {
                var answer = parseInt(captchaInput.value, 10);
                var question = document.getElementById('captchaQuestion');
                var parts = question ? question.textContent.split(/[+=\s?]/) : [];
                var num1 = parseInt(parts[0], 10), num2 = parseInt(parts[2], 10);
                if (answer !== num1 + num2) {
                    captchaError.classList.add('show');
                    captchaInput.classList.add('error');
                    return;
                }
                captchaError.classList.remove('show');
                captchaInput.classList.remove('error');
            }

            var btn = this.querySelector('button[type="submit"]');
            var orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming...';
            btn.disabled = true;

            var fullName = document.getElementById('bkName').value;
            var email = document.getElementById('bkEmail').value;
            var phoneBtn = document.getElementById('bkPhoneBtn');
            var phoneCode = phoneBtn ? phoneBtn.querySelector('.phone-code').textContent : '';
            var phoneNum = document.getElementById('bkPhone').value;
            var fullPhone = phoneCode + phoneNum;
            var genderEl = document.querySelector('input[name="bkGender"]:checked');
            var gender = genderEl ? genderEl.value : '';
            var address = document.getElementById('bkAddress').value;
            var roomTypeEl = document.getElementById('bkRoomType');
            var roomType = roomTypeEl ? roomTypeEl.value : '';
            var guestsEl = document.getElementById('bkGuests');
            var guests = guestsEl ? guestsEl.value : '1';
            var checkinEl = document.getElementById('bkCheckin');
            var checkin = checkinEl ? checkinEl.value : '';
            var checkoutEl = document.getElementById('bkCheckout');
            var checkout = checkoutEl ? checkoutEl.value : '';
            var roomsEl = document.getElementById('bkRooms');
            var rooms = roomsEl ? roomsEl.value : '1';
            var bedPrefs = [];
            document.querySelectorAll('#bookingForm input[type="checkbox"][value]').forEach(function (cb) {
                if (cb.closest('.step-content[data-step="2"]') && cb.checked) bedPrefs.push(cb.value);
            });
            var extras = [];
            document.querySelectorAll('#bookingForm .step-content[data-step="3"] input[type="checkbox"]:checked').forEach(function (cb) {
                extras.push(cb.value);
            });
            var requestsEl = document.getElementById('bkRequests');
            var requests = requestsEl ? requestsEl.value : '';
            var contactMethodEl = document.querySelector('input[name="bkContact"]:checked');
            var contactMethod = contactMethodEl ? contactMethodEl.value : '';

            var data = {
                fullName: fullName, email: email, phone: fullPhone,
                gender: gender, address: address, roomType: roomType,
                guests: guests, checkin: checkin, checkout: checkout,
                rooms: rooms, bedPref: bedPrefs.join(', '),
                extras: extras.join(', '), requests: requests,
                contactMethod: contactMethod
            };

            fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(function (r) { return r.json(); }).then(function (d) {
                if (d.success) {
                    btn.innerHTML = '<i class="fas fa-check-circle"></i> Booking Confirmed!';
                    btn.style.background = '#059669';
                    showToast('Your booking at Ayaan Royale is confirmed! We will contact you soon.', 'success');
                    setTimeout(function () {
                        btn.innerHTML = orig;
                        btn.style.background = '';
                        btn.disabled = false;
                        bookingForm.reset();
                    }, 2000);
                } else {
                    btn.innerHTML = orig;
                    btn.style.background = '#dc2626';
                    btn.disabled = false;
                    showToast('Booking failed. Please try again.', 'error');
                    setTimeout(function () { btn.style.background = ''; }, 2000);
                }
            }).catch(function () {
                btn.innerHTML = orig;
                btn.style.background = '#dc2626';
                btn.disabled = false;
                showToast('Network error. Please try again.', 'error');
                setTimeout(function () { btn.style.background = ''; }, 2000);
            });
        });
    }

    // CAPTCHA refresh
    var captchaRefresh = document.getElementById('captchaRefresh');
    if (captchaRefresh) {
        captchaRefresh.addEventListener('click', function () {
            var a = Math.floor(Math.random() * 9) + 1;
            var b = Math.floor(Math.random() * 9) + 1;
            var q = document.getElementById('captchaQuestion');
            if (q) q.textContent = a + ' + ' + b + ' = ?';
            document.getElementById('captchaInput').value = '';
            var err = document.getElementById('captchaError');
            if (err) err.classList.remove('show');
        });
    }

    // Booking room range slider
    (function () {
        var slider = document.getElementById('bkRooms');
        var val = document.getElementById('bkRoomsVal');
        if (slider && val) {
            slider.addEventListener('input', function () { val.textContent = this.value + ' Room' + (this.value > 1 ? 's' : ''); });
        }
    })();

    // ============================================================
    // CONTACT FORM
    // ============================================================
    // --- Rich text editor ---
    var editorToolbar = document.getElementById('editorToolbar');
    var editorContent = document.getElementById('conMessage');
    if (editorToolbar && editorContent) {
        editorToolbar.querySelectorAll('button[data-cmd]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var cmd = this.dataset.cmd;
                if (cmd === 'createLink') {
                    var url = prompt('Enter link URL:', 'https://');
                    if (url) document.execCommand(cmd, false, url);
                } else {
                    document.execCommand(cmd, false, null);
                }
                editorContent.focus();
            });
        });

        // --- Color picker dropdowns ---
        editorToolbar.querySelectorAll('.editor-color-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var wrap = this.closest('.editor-color-wrap');
                var all = editorToolbar.querySelectorAll('.editor-color-wrap.open');
                all.forEach(function (w) { if (w !== wrap) w.classList.remove('open'); });
                wrap.classList.toggle('open');
            });
        });

        document.addEventListener('click', function () {
            editorToolbar.querySelectorAll('.editor-color-wrap.open').forEach(function (w) {
                w.classList.remove('open');
            });
        });

        // Preset color buttons
        editorToolbar.querySelectorAll('.editor-color-presets button').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var color = this.dataset.color;
                var type = this.closest('.editor-color-dropdown').dataset.colorType;
                var cmd = type === 'bg' ? 'backColor' : 'foreColor';
                document.execCommand(cmd, false, color);
                editorContent.focus();
                this.closest('.editor-color-wrap').classList.remove('open');
            });
        });

        // Custom color input
        editorToolbar.querySelectorAll('.editor-color-custom input[type="color"]').forEach(function (input) {
            input.addEventListener('input', function () {
                var color = this.value;
                var type = this.closest('.editor-color-dropdown').dataset.colorType;
                var cmd = type === 'bg' ? 'backColor' : 'foreColor';
                document.execCommand(cmd, false, color);
                editorContent.focus();
            });
            input.addEventListener('change', function () {
                this.closest('.editor-color-wrap').classList.remove('open');
            });
        });

        // Keep hidden textarea synced for form submission
        var hiddenTextarea = document.createElement('textarea');
        hiddenTextarea.style.display = 'none';
        hiddenTextarea.setAttribute('required', '');
        editorContent.parentNode.appendChild(hiddenTextarea);
    }

    // Contact form handled inline in index.html

    // ============================================================
    // PASSWORD TOGGLE
    // ============================================================
    (function () {
        document.addEventListener('click', function (e) {
            var toggle = e.target.closest('.password-toggle');
            if (!toggle) return;
            var targetId = toggle.dataset.target;
            var input = document.getElementById(targetId);
            if (!input) return;
            var isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggle.innerHTML = isPassword ? '<i class="far fa-eye-slash"></i>' : '<i class="far fa-eye"></i>';
        });
    })();

    // ============================================================
    // PASSWORD STRENGTH
    // ============================================================
    (function () {
        var input = document.getElementById('signupPassword');
        var fill = document.getElementById('signupStrengthFill');
        var text = document.getElementById('signupStrengthText');
        var reqList = document.getElementById('signupRequirements');
        if (!input || !fill) return;

        input.addEventListener('input', function () {
            var val = this.value;
            var score = 0;
            var checks = { length: val.length >= 8, upper: /[A-Z]/.test(val), lower: /[a-z]/.test(val), number: /[0-9]/.test(val), special: /[^A-Za-z0-9]/.test(val) };
            if (checks.length) score += 25;
            if (checks.upper) score += 20;
            if (checks.lower) score += 20;
            if (checks.number) score += 20;
            if (checks.special) score += 15;
            if (val.length === 0) score = 0;

            fill.style.width = score + '%';
            if (score < 30) { fill.style.background = '#dc2626'; if (text) text.textContent = 'Weak'; }
            else if (score < 50) { fill.style.background = '#ea580c'; if (text) text.textContent = 'Fair'; }
            else if (score < 70) { fill.style.background = '#d97706'; if (text) text.textContent = 'Good'; }
            else if (score < 90) { fill.style.background = '#059669'; if (text) text.textContent = 'Strong'; }
            else { fill.style.background = '#059669'; if (text) text.textContent = 'Very Strong'; }
            if (val.length === 0 && text) { text.textContent = 'Enter password'; fill.style.width = '0'; }

            if (reqList) {
                reqList.querySelectorAll('li').forEach(function (item) {
                    var req = item.dataset.req;
                    if (checks[req]) { item.classList.add('valid'); item.classList.remove('invalid'); item.querySelector('i').className = 'fas fa-check'; }
                    else if (val.length > 0) { item.classList.remove('valid'); item.classList.add('invalid'); item.querySelector('i').className = 'fas fa-times'; }
                    else { item.classList.remove('valid', 'invalid'); item.querySelector('i').className = 'fas fa-times'; }
                });
            }
        });
    })();

    // ============================================================
    // OTP INPUTS - handled per container via initOtpInputs()
    // ============================================================

    // ============================================================
    // TAG INPUT
    // ============================================================
    (function () {
        var container = document.querySelector('.tag-input-group');
        var list = document.getElementById('tagList');
        var input = document.getElementById('tagInput');
        if (!container || !list || !input) return;
        var tags = [];
        function render() {
            list.innerHTML = '';
            tags.forEach(function (t) {
                var chip = document.createElement('span');
                chip.className = 'tag-chip';
                chip.innerHTML = t + ' <i class="fas fa-times"></i>';
                chip.querySelector('i').addEventListener('click', function () {
                    var idx = tags.indexOf(t);
                    if (idx > -1) { tags.splice(idx, 1); render(); }
                });
                list.appendChild(chip);
            });
        }
        function add(v) {
            var t = v.trim().toLowerCase();
            if (!t || tags.indexOf(t) > -1 || tags.length >= 10) return;
            tags.push(t); render(); input.value = '';
        }
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(this.value); }
            if (e.key === 'Backspace' && !this.value && tags.length > 0) { tags.pop(); render(); }
        });
        input.addEventListener('blur', function () { if (this.value.trim()) add(this.value); });
        container.addEventListener('click', function () { input.focus(); });
    })();

    // ============================================================
    // FILE UPLOAD
    // ============================================================
    (function () {
        var zone = document.getElementById('fileUploadZone');
        var fileInput = document.getElementById('fileInput');
        var fileList = document.getElementById('fileList');
        if (!zone || !fileInput) return;
        var files = [];

        function formatSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / 1048576).toFixed(1) + ' MB';
        }
        function getIcon(type) {
            if (type.indexOf('image') > -1) return 'fas fa-file-image';
            if (type.indexOf('pdf') > -1) return 'fas fa-file-pdf';
            if (type.indexOf('word') > -1 || type.indexOf('document') > -1) return 'fas fa-file-word';
            return 'fas fa-file';
        }
        function renderFiles() {
            fileList.innerHTML = '';
            files.forEach(function (f, i) {
                var item = document.createElement('div');
                item.className = 'file-item';
                if (f.type.indexOf('image') > -1) {
                    var img = document.createElement('img');
                    img.src = f.data;
                    item.appendChild(img);
                } else {
                    var icon = document.createElement('i');
                    icon.className = getIcon(f.type);
                    item.appendChild(icon);
                }
                var name = document.createElement('span');
                name.textContent = f.name;
                item.appendChild(name);
                var size = document.createElement('span');
                size.className = 'file-size';
                size.textContent = formatSize(f.size);
                item.appendChild(size);
                var rm = document.createElement('i');
                rm.className = 'fas fa-times file-remove';
                rm.addEventListener('click', function () { files.splice(i, 1); renderFiles(); });
                item.appendChild(rm);
                fileList.appendChild(item);
            });
        }
        function addFiles(newFiles) {
            Array.from(newFiles).forEach(function (f) {
                if (files.length >= 5) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    files.push({ name: f.name, size: f.size, type: f.type, data: e.target.result });
                    renderFiles();
                };
                reader.readAsDataURL(f);
            });
        }
        zone.addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', function () { addFiles(this.files); this.value = ''; });
        zone.addEventListener('dragover', function (e) { e.preventDefault(); this.classList.add('dragover'); });
        zone.addEventListener('dragleave', function () { this.classList.remove('dragover'); });
        zone.addEventListener('drop', function (e) { e.preventDefault(); this.classList.remove('dragover'); addFiles(e.dataTransfer.files); });
    })();

    // ============================================================
    // KEYBOARD NAVIGATION
    // ============================================================
    document.addEventListener('keydown', function (e) {
        var tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        var sectionOrder = ['home', 'about', 'rooms', 'amenities', 'gallery', 'restaurant', 'booking', 'faq', 'contact', 'components'];
        var num = parseInt(e.key, 10);
        if (num >= 1 && num <= sectionOrder.length) {
            var el = document.getElementById(sectionOrder[num - 1]);
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
        }
        if (e.key === '/' && !e.ctrlKey) {
            e.preventDefault();
            var first = document.querySelector('input:not([type="hidden"])');
            if (first) first.focus();
        }
    });

    // ============================================================
    // PHONE INPUT
    // ============================================================
    var countriesData = [
        { name: 'Pakistan', code: '+92', flag: '\u{1F1F5}\u{1F1F0}' },
        { name: 'India', code: '+91', flag: '\u{1F1EE}\u{1F1F3}' },
        { name: 'United States', code: '+1', flag: '\u{1F1FA}\u{1F1F8}' },
        { name: 'United Kingdom', code: '+44', flag: '\u{1F1EC}\u{1F1E7}' },
        { name: 'Afghanistan', code: '+93', flag: '\u{1F1E6}\u{1F1EB}' },
        { name: 'Australia', code: '+61', flag: '\u{1F1E6}\u{1F1FA}' },
        { name: 'Bangladesh', code: '+880', flag: '\u{1F1E7}\u{1F1E9}' },
        { name: 'Canada', code: '+1', flag: '\u{1F1E8}\u{1F1E6}' },
        { name: 'China', code: '+86', flag: '\u{1F1E8}\u{1F1F3}' },
        { name: 'Egypt', code: '+20', flag: '\u{1F1EA}\u{1F1EC}' },
        { name: 'France', code: '+33', flag: '\u{1F1EB}\u{1F1F7}' },
        { name: 'Germany', code: '+49', flag: '\u{1F1E9}\u{1F1EA}' },
        { name: 'Indonesia', code: '+62', flag: '\u{1F1EE}\u{1F1E9}' },
        { name: 'Iran', code: '+98', flag: '\u{1F1EE}\u{1F1F7}' },
        { name: 'Iraq', code: '+964', flag: '\u{1F1EE}\u{1F1F6}' },
        { name: 'Italy', code: '+39', flag: '\u{1F1EE}\u{1F1F9}' },
        { name: 'Japan', code: '+81', flag: '\u{1F1EF}\u{1F1F5}' },
        { name: 'Saudi Arabia', code: '+966', flag: '\u{1F1F8}\u{1F1E6}' },
        { name: 'Turkey', code: '+90', flag: '\u{1F1F9}\u{1F1F7}' },
        { name: 'UAE', code: '+971', flag: '\u{1F1E6}\u{1F1EA}' },
    ];

    function initPhoneInput(btnId, dropdownId, listId) {
        var btn = document.getElementById(btnId);
        var dropdown = document.getElementById(dropdownId);
        var list = document.getElementById(listId);
        if (!btn || !dropdown || !list) return;
        var searchInput = dropdown.querySelector('.phone-search-input');
        var flagEl = btn.querySelector('.country-flag');
        var codeEl = btn.querySelector('.phone-code');

        function render(filter) {
            list.innerHTML = '';
            var filtered = filter ? countriesData.filter(function (c) { return c.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 || c.code.indexOf(filter) > -1; }) : countriesData;
            filtered.forEach(function (c) {
                var item = document.createElement('div');
                item.className = 'phone-country-item';
                item.innerHTML = '<span class="country-flag">' + c.flag + '</span><span class="country-name">' + c.name + '</span><span class="country-code">' + c.code + '</span>';
                item.addEventListener('click', function () { select(c); });
                list.appendChild(item);
            });
        }
        function select(c) {
            flagEl.textContent = c.flag;
            codeEl.textContent = c.code;
            dropdown.classList.remove('open');
            btn.classList.remove('open');
            list.querySelectorAll('.phone-country-item').forEach(function (el) { el.classList.remove('active'); });
            list.querySelectorAll('.phone-country-item').forEach(function (el) {
                if (el.querySelector('.country-name') && el.querySelector('.country-name').textContent === c.name) el.classList.add('active');
            });
        }
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('open');
            btn.classList.toggle('open');
            if (dropdown.classList.contains('open')) { render(''); if (searchInput) searchInput.focus(); }
        });
        if (searchInput) {
            searchInput.addEventListener('input', function () { render(this.value); });
            searchInput.addEventListener('click', function (e) { e.stopPropagation(); });
            searchInput.addEventListener('keydown', function (e) { if (e.key === 'Escape') { dropdown.classList.remove('open'); btn.classList.remove('open'); } });
        }
        document.addEventListener('click', function () { dropdown.classList.remove('open'); btn.classList.remove('open'); });
        // Default Pakistan
        var def = countriesData[0];
        for (var i = 0; i < countriesData.length; i++) { if (countriesData[i].name === 'Pakistan') { def = countriesData[i]; break; } }
        select(def);
    }
    initPhoneInput('bkPhoneBtn', 'bkPhoneDropdown', 'bkPhoneList');

    // ============================================================
    // LOADING SKELETON DEMO
    // ============================================================
    (function () {
        var skeleton = document.getElementById('loadingSkeleton');
        if (!skeleton) return;
        // Show briefly on load
        skeleton.classList.add('show');
        setTimeout(function () { skeleton.classList.remove('show'); }, 1200);
    })();

    // ============================================================
    // SPINNER DEMO
    // ============================================================
    var spinnerOverlay = document.getElementById('spinnerOverlay');
    // Show spinner briefly on page load
    if (spinnerOverlay) {
        setTimeout(function () {
            spinnerOverlay.classList.add('show');
            setTimeout(function () { spinnerOverlay.classList.remove('show'); }, 800);
        }, 200);
    }

    // ============================================================
    // FORM AUTO-SAVE (localStorage)
    // ============================================================
    (function () {
        var form = document.getElementById('bookingForm');
        if (!form) return;
        var fields = form.querySelectorAll('input, select, textarea');
        var saveKey = 'ayaanroyale-booking-draft';

        function saveDraft() {
            var data = {};
            fields.forEach(function (f) { if (f.id) data[f.id] = f.value; });
            try { localStorage.setItem(saveKey, JSON.stringify(data)); } catch (e) {}
        }

        function loadDraft() {
            try {
                var data = JSON.parse(localStorage.getItem(saveKey));
                if (!data) return;
                fields.forEach(function (f) { if (f.id && data[f.id]) f.value = data[f.id]; });
            } catch (e) {}
        }

        loadDraft();
        fields.forEach(function (f) {
            f.addEventListener('input', saveDraft);
            f.addEventListener('change', saveDraft);
        });
    })();

    // ============================================================
    // RICH TEXT EDITOR (simple WYSIWYG)
    // ============================================================
    (function () {
        var textarea = document.getElementById('bkRequests');
        if (!textarea) return;
        var wrapper = document.createElement('div');
        wrapper.className = 'rich-editor';
        var toolbar = document.createElement('div');
        toolbar.className = 'rich-toolbar';
        var btns = [
            { cmd: 'bold', icon: 'fa-bold' },
            { cmd: 'italic', icon: 'fa-italic' },
            { cmd: 'underline', icon: 'fa-underline' },
            { cmd: 'insertUnorderedList', icon: 'fa-list-ul' },
        ];
        btns.forEach(function (b) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.innerHTML = '<i class="fas ' + b.icon + '"></i>';
            btn.className = 'rich-btn';
            btn.addEventListener('click', function () {
                document.execCommand(b.cmd, false, null);
                textarea.value = editor.innerHTML;
            });
            toolbar.appendChild(btn);
        });
        var editor = document.createElement('div');
        editor.className = 'rich-editor-content';
        editor.contentEditable = true;
        editor.innerHTML = textarea.value || '';
        editor.style.cssText = 'border:1px solid var(--border);border-radius:0 0 8px 8px;padding:12px 16px;min-height:120px;background:var(--bg);color:var(--text);font-size:0.92rem;font-family:inherit;line-height:1.6;';
        toolbar.style.cssText = 'display:flex;gap:4px;padding:8px 12px;border:1px solid var(--border);border-bottom:none;border-radius:8px 8px 0 0;background:var(--bg-alt);';
        var style = document.createElement('style');
        style.textContent = '.rich-btn{width:34px;height:34px;border-radius:6px;border:1px solid var(--border);background:var(--card-bg);color:var(--text-light);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-size:0.85rem}.rich-btn:hover{border-color:var(--primary);color:var(--primary);background:var(--primary-light)}';
        document.head.appendChild(style);

        editor.addEventListener('input', function () { textarea.value = this.innerHTML; });
        textarea.style.display = 'none';
        textarea.parentNode.insertBefore(wrapper, textarea);
        wrapper.appendChild(toolbar);
        wrapper.appendChild(editor);
    })();

    // ============================================================
    // DATE PICKER (check-in/check-out min dates)
    // ============================================================
    (function () {
        var checkin = document.getElementById('bkCheckin');
        var checkout = document.getElementById('bkCheckout');
        if (checkin) {
            var today = new Date().toISOString().split('T')[0];
            checkin.setAttribute('min', today);
            checkin.addEventListener('change', function () {
                if (checkout) checkout.setAttribute('min', this.value || today);
            });
        }
        if (checkout) {
            checkout.addEventListener('change', function () {
                if (checkin && this.value < checkin.value) this.value = checkin.value;
            });
        }
    })();

    // ============================================================
    // STAR RATING (demo)
    // ============================================================
    (function () {
        var stars = document.querySelectorAll('#starRating .stars i');
        if (!stars.length) return;
        var current = 0;
        var label = document.getElementById('ratingText');
        var value = document.getElementById('ratingValue');
        function reset() {
            stars.forEach(function (s) {
                s.className = 'far fa-star';
                if (parseInt(s.dataset.rating, 10) <= current) s.className = 'fas fa-star active';
            });
        }
        stars.forEach(function (star) {
            star.addEventListener('mouseenter', function () {
                var v = parseInt(this.dataset.rating, 10);
                stars.forEach(function (s) {
                    s.classList.remove('hover');
                    if (parseInt(s.dataset.rating, 10) <= v) s.classList.add('hover');
                });
            });
            star.addEventListener('mouseleave', function () { stars.forEach(function (s) { s.classList.remove('hover'); }); });
            star.addEventListener('click', function () {
                current = parseInt(this.dataset.rating, 10);
                if (value) value.value = current;
                if (label) label.textContent = ['', 'Terrible', 'Poor', 'Average', 'Good', 'Excellent'][current] + ' (' + current + '/5)';
                reset();
            });
        });
    })();

    // ============================================================
    // COLOR PICKER (demo)
    // ============================================================
    (function () {
        var swatches = document.querySelectorAll('.color-swatch');
        var box = document.getElementById('colorBox');
        var hex = document.getElementById('colorHex');
        var val = document.getElementById('colorValue');
        if (!swatches.length) return;
        swatches.forEach(function (s) {
            s.addEventListener('click', function () {
                swatches.forEach(function (x) { x.classList.remove('active'); });
                this.classList.add('active');
                var color = this.dataset.color;
                if (box) box.style.background = color;
                if (hex) hex.textContent = color;
                if (val) val.value = color;
            });
        });
    })();

    // ============================================================
    // INFINITE SCROLL (gallery)
    // ============================================================
    (function () {
        var grid = document.getElementById('galleryGrid');
        var trigger = document.getElementById('galleryTrigger');
        if (!grid || !trigger) return;
        var chunk = parseInt(grid.dataset.infinite, 10) || 4;
        var allItems = Array.from(grid.children).filter(function (el) { return el.classList.contains('gallery-item'); });
        var visibleCount = chunk;
        allItems.forEach(function (item, i) { if (i >= chunk) item.style.display = 'none'; });
        if (allItems.length <= chunk) { trigger.style.display = 'none'; return; }

        function loadMore() {
            var next = Math.min(visibleCount + chunk, allItems.length);
            for (var i = visibleCount; i < next; i++) { allItems[i].style.display = ''; }
            visibleCount = next;
            if (visibleCount >= allItems.length) {
                trigger.classList.add('loaded');
                trigger.setAttribute('data-loaded', 'true');
                trigger.querySelector('span').textContent = 'All photos loaded';
            }
        }

        function onScroll() {
            if (visibleCount >= allItems.length) { window.removeEventListener('scroll', onScroll); return; }
            var rect = trigger.getBoundingClientRect();
            if (rect.top < window.innerHeight + 100) loadMore();
        }
        window.addEventListener('scroll', onScroll);
        trigger.addEventListener('click', function () { if (visibleCount < allItems.length) loadMore(); });
        trigger.style.cursor = 'pointer';
    })();

    // ============================================================
    // DUAL RANGE SLIDER
    // ============================================================
    (function () {
        var minEl = document.getElementById('rangeSliderMin');
        var maxEl = document.getElementById('rangeSliderMax');
        var fill = document.getElementById('rangeFill');
        var minLabel = document.getElementById('rangeMinLabel');
        var maxLabel = document.getElementById('rangeMaxLabel');
        var selected = document.getElementById('rangeSelected');
        if (!minEl || !maxEl) return;

        function update() {
            var minVal = parseInt(minEl.value, 10);
            var maxVal = parseInt(maxEl.value, 10);
            if (minVal > maxVal) {
                if (this === minEl) { minEl.value = maxVal; minVal = maxVal; }
                else { maxEl.value = minVal; maxVal = minVal; }
            }
            var min = parseInt(minEl.min, 10) || 0;
            var max = parseInt(maxEl.max, 10) || 100;
            var pMin = ((minVal - min) / (max - min)) * 100;
            var pMax = ((maxVal - min) / (max - min)) * 100;
            if (fill) { fill.style.left = pMin + '%'; fill.style.width = (pMax - pMin) + '%'; }
            if (minLabel) minLabel.textContent = minVal;
            if (maxLabel) maxLabel.textContent = maxVal;
            if (selected) selected.textContent = 'Selected: ' + minVal + ' \u2014 ' + maxVal;
        }
        minEl.addEventListener('input', update);
        maxEl.addEventListener('input', update);
        update();
    })();

    // ============================================================
    // DATE PICKER (demo calendar)
    // ============================================================
    (function () {
        var dateInput = document.getElementById('demoDateInput');
        var calendar = document.getElementById('demoCalendar');
        var calMonthYear = document.getElementById('calMonthYear');
        var calDays = document.getElementById('calendarDays');
        var calPrev = calendar ? calendar.querySelector('.cal-prev') : null;
        var calNext = calendar ? calendar.querySelector('.cal-next') : null;
        if (!dateInput || !calendar) return;

        var currentDate = new Date();
        var currentMonth = currentDate.getMonth();
        var currentYear = currentDate.getFullYear();
        var selectedDate = null;

        function renderCalendar(month, year) {
            calDays.innerHTML = '';
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            calMonthYear.textContent = months[month] + ' ' + year;
            var firstDay = new Date(year, month, 1).getDay();
            var daysInMonth = new Date(year, month + 1, 0).getDate();
            var daysInPrevMonth = new Date(year, month, 0).getDate();
            var today = new Date();
            var todayStr = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');

            for (var i = firstDay - 1; i >= 0; i--) {
                var d = document.createElement('button'); d.type = 'button'; d.className = 'cal-day other-month';
                d.textContent = daysInPrevMonth - i;
                d.addEventListener('click', function () { var pm = month === 0 ? 11 : month - 1; var py = month === 0 ? year - 1 : year; selectDate(py, pm, parseInt(this.textContent,10)); });
                calDays.appendChild(d);
            }
            for (var day = 1; day <= daysInMonth; day++) {
                var el = document.createElement('button'); el.type = 'button'; el.className = 'cal-day'; el.textContent = day;
                var ds = year + '-' + String(month+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
                if (ds === todayStr) el.classList.add('today');
                if (selectedDate && selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day) el.classList.add('selected');
                (function (d) { el.addEventListener('click', function () { selectDate(year, month, d); }); })(day);
                calDays.appendChild(el);
            }
            var totalCells = firstDay + daysInMonth;
            var remaining = 7 - (totalCells % 7);
            if (remaining < 7) {
                for (var n = 1; n <= remaining; n++) {
                    var nd = document.createElement('button'); nd.type = 'button'; nd.className = 'cal-day other-month'; nd.textContent = n;
                    (function (ndVal) { nd.addEventListener('click', function () { var nm = month === 11 ? 0 : month + 1; var ny = month === 11 ? year + 1 : year; selectDate(ny, nm, ndVal); }); })(n);
                    calDays.appendChild(nd);
                }
            }
        }

        function selectDate(year, month, day) {
            selectedDate = new Date(year, month, day);
            var dd = String(day).padStart(2,'0'); var mm = String(month+1).padStart(2,'0'); var yyyy = year;
            dateInput.value = dd + '/' + mm + '/' + yyyy;
            currentMonth = month; currentYear = year;
            renderCalendar(currentMonth, currentYear);
            calendar.classList.remove('open');
        }

        dateInput.addEventListener('click', function () { calendar.classList.toggle('open'); renderCalendar(currentMonth, currentYear); });
        if (calPrev) calPrev.addEventListener('click', function (e) { e.stopPropagation(); currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(currentMonth, currentYear); });
        if (calNext) calNext.addEventListener('click', function (e) { e.stopPropagation(); currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(currentMonth, currentYear); });
        document.addEventListener('click', function (e) { if (!calendar.contains(e.target) && !dateInput.contains(e.target)) calendar.classList.remove('open'); });
        renderCalendar(currentMonth, currentYear);
    })();

    // ============================================================
    // DEMO ACTIONS (global)
    // ============================================================
    window.showSkeleton = function () {
        var sk = document.getElementById('loadingSkeleton');
        if (sk) { sk.classList.add('show'); setTimeout(function () { sk.classList.remove('show'); }, 2000); }
    };
    window.showSpinner = function () {
        var sp = document.getElementById('spinnerOverlay');
        if (sp) { sp.classList.add('show'); setTimeout(function () { sp.classList.remove('show'); }, 1500); }
    };

    // ============================================================
    // FORM AUTO-SAVE STATUS
    // ============================================================
    (function () {
        var status = document.getElementById('autoSaveStatus');
        var lastSaved = document.getElementById('lastSaved');
        if (status) { status.textContent = 'Auto-save active'; }
        var saveIndicator = function () {
            if (lastSaved) { var d = new Date(); lastSaved.textContent = 'Last saved: ' + d.toLocaleTimeString(); }
        };
        document.addEventListener('input', function (e) {
            if (e.target.closest('.booking-form')) saveIndicator();
        });
        var clearBtn = document.getElementById('clearSavedData');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                try { localStorage.removeItem('ayaanroyale-booking-draft'); showToast('Saved data cleared!', 'success'); } catch(e) {}
                if (lastSaved) lastSaved.textContent = 'No saved data';
            });
        }
    })();

    // ============================================================
    // QUICK BOOKING MODAL
    // ============================================================
    window.openQuickBook = function (room) {
        var overlay = document.getElementById('quickbookOverlay');
        var roomInput = document.getElementById('qbRoom');
        var desc = document.getElementById('quickbookDesc');
        if (!overlay) return;
        if (room && roomInput) {
            roomInput.value = room;
            desc.textContent = 'Book your stay at ' + room + '. Fill in your details and we\'ll confirm your reservation.';
        } else {
            if (roomInput) roomInput.value = 'Not specified';
            desc.textContent = 'Fill in your details and we\'ll confirm your reservation.';
        }
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        document.getElementById('qbName').focus();
    };

    function closeQuickBook() {
        var overlay = document.getElementById('quickbookOverlay');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.getElementById('quickbookClose').addEventListener('click', closeQuickBook);
    document.getElementById('quickbookOverlay').addEventListener('click', function (e) {
        if (e.target === this) closeQuickBook();
    });

    document.getElementById('quickbookForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var btn = this.querySelector('button[type="submit"]');
        var orig = btn.innerHTML;
        var name = document.getElementById('qbName').value.trim();
        var phone = document.getElementById('qbPhone').value.trim();
        var room = document.getElementById('qbRoom').value.trim();

        if (!name || !phone) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        try {
            var res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: name,
                    phone: phone,
                    email: '',
                    roomType: room,
                    checkin: '',
                    checkout: '',
                    guests: '1',
                    requests: 'Quick booking from website'
                })
            });
            var data = await res.json();
            if (data.success) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Booking Request Sent!';
                btn.style.background = '#059669';
                showToast('Booking request sent! We will contact you soon.', 'success');
                setTimeout(function () {
                    closeQuickBook();
                    btn.innerHTML = orig;
                    btn.style.background = '';
                    btn.disabled = false;
                    document.getElementById('quickbookForm').reset();
                }, 2000);
            } else {
                btn.innerHTML = orig;
                btn.style.background = '#dc2626';
                btn.disabled = false;
                showToast('Failed to send. Please try again.', 'error');
                setTimeout(function () { btn.style.background = ''; }, 2000);
            }
        } catch (err) {
            btn.innerHTML = orig;
            btn.style.background = '#dc2626';
            btn.disabled = false;
            showToast('Network error. Please try again.', 'error');
            setTimeout(function () { btn.style.background = ''; }, 2000);
        }
    });

    console.log('%c Hotel Ayaan Royale %c Luxury Redefined ', 'background:#D4AF37;color:#fff;font-size:1.2rem;padding:8px 12px;border-radius:4px 0 0 4px;font-weight:700;', 'background:#1A1A2E;color:#fff;font-size:1.2rem;padding:8px 12px;border-radius:0 4px 4px 0;');
    console.log('%c Managed by Mr. Ayaan ', 'background:#D4AF37;color:#1A1A2E;font-size:0.9rem;padding:6px 10px;border-radius:4px;');
})();
