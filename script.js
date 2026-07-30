/* ============================================================
   script.js - Ponno Main JavaScript
   ============================================================ */

// ============================================================
// 1. DOM REFS & UTILITY HELPERS
// ============================================================

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// ============================================================
// 2. TOAST NOTIFICATION SYSTEM
// ============================================================

const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toastContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 4000) {
    this.init();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, duration);

    return toast;
  },

  success(msg) { return this.show(msg, 'success'); },
  error(msg) { return this.show(msg, 'error'); },
  warning(msg) { return this.show(msg, 'warning'); },
  info(msg) { return this.show(msg, 'info'); }
};

// ============================================================
// 3. NAVBAR FUNCTIONALITY
// ============================================================

const Navbar = {
  init() {
    this.navbar = document.getElementById('navbar');
    this.mobileToggle = document.getElementById('mobileToggle');
    this.menu = document.getElementById('navbarMenu');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    });

    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => {
        this.mobileToggle.classList.toggle('active');
        this.menu.classList.toggle('mobile-open');
        const expanded = this.mobileToggle.classList.contains('active');
        this.mobileToggle.setAttribute('aria-expanded', expanded);
        document.body.style.overflow = expanded ? 'hidden' : '';
      });
    }

    $$('.navbar-menu a').forEach(link => {
      link.addEventListener('click', () => {
        this.menu.classList.remove('mobile-open');
        this.mobileToggle?.classList.remove('active');
        this.mobileToggle?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
};

// ============================================================
// 4. FAQ ACCORDION
// ============================================================

const FAQ = {
  init() {
    const questions = $$('.faq-question');
    questions.forEach(btn => {
      btn.addEventListener('click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        const answer = document.getElementById(btn.getAttribute('aria-controls'));

        questions.forEach(q => {
          if (q !== btn) {
            q.setAttribute('aria-expanded', 'false');
            const otherAnswer = document.getElementById(q.getAttribute('aria-controls'));
            if (otherAnswer) otherAnswer.classList.remove('open');
          }
        });

        btn.setAttribute('aria-expanded', !isExpanded);
        if (answer) {
          answer.classList.toggle('open');
        }
      });
    });
  }
};

// ============================================================
// 5. ANIMATED COUNTERS
// ============================================================

const Counters = {
  inited: false,

  init() {
    if (this.inited) return;
    this.inited = true;
    const numbers = $$('.stat-number');
    if (!numbers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    numbers.forEach(el => observer.observe(el));
  },

  animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    if (!target) return;
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(update);
  }
};

// ============================================================
// 6. AUTH MODAL SYSTEM
// ============================================================

const AuthModal = {
  modal: null,
  body: null,
  currentView: 'login',

  init() {
    this.modal = document.getElementById('authModal');
    this.body = document.getElementById('authModalBody');

    document.getElementById('authModalClose')?.addEventListener('click', () => this.close());
    this.modal?.querySelector('.auth-modal-overlay')?.addEventListener('click', () => this.close());

    document.getElementById('loginOpenBtn')?.addEventListener('click', () => this.open('login'));
    document.getElementById('signupOpenBtn')?.addEventListener('click', () => this.open('signup'));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  },

  open(view = 'login') {
    this.currentView = view;
    this.modal?.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.render(view);
  },

  close() {
    this.modal?.classList.remove('active');
    document.body.style.overflow = '';
  },

  isOpen() {
    return this.modal?.classList.contains('active') || false;
  },

  render(view) {
    if (!this.body) return;

    let html = '';
    switch (view) {
      case 'login':
        html = this.loginForm();
        break;
      case 'signup':
        html = this.signupForm();
        break;
      case 'forgot':
        html = this.forgotForm();
        break;
      case 'reset':
        html = this.resetForm();
        break;
      case 'verify-email':
        html = this.verifyEmailForm();
        break;
      case 'verify-otp':
        html = this.otpForm();
        break;
      default:
        html = this.loginForm();
    }

    this.body.innerHTML = html;
    this.bindFormEvents(view);
  },

  loginForm() {
    return `
      <h2>Welcome Back</h2>
      <p>Log in to your Ponno account</p>
      <form class="auth-form" id="authForm" novalidate>
        <div class="form-group">
          <label for="loginEmail">Email or Username</label>
          <input type="text" id="loginEmail" placeholder="Enter your email or username" required />
        </div>
        <div class="form-group">
          <label for="loginPassword">Password</label>
          <input type="password" id="loginPassword" placeholder="Enter your password" required />
          <button type="button" class="password-toggle" data-target="loginPassword" aria-label="Toggle password visibility" style="float:right;font-size:0.8rem;color:var(--color-primary);margin-top:4px;">Show</button>
        </div>
        <div class="form-group" style="display:flex;justify-content:space-between;align-items:center;">
          <label class="checkbox-group" style="margin:0;">
            <input type="checkbox" /> Remember Me
          </label>
          <a class="forgot-link" data-auth-view="forgot">Forgot Password?</a>
        </div>
        <button type="submit" class="btn btn-primary" id="authSubmitBtn">Log In</button>
        <div class="auth-switch">
          Don't have an account? <a data-auth-view="signup">Sign Up</a>
        </div>
      </form>
    `;
  },

  signupForm() {
    return `
      <h2>Create Account</h2>
      <p>Join Ponno today</p>
      <form class="auth-form" id="authForm" novalidate>
        <div class="form-group">
          <label for="signupFullName">Full Name</label>
          <input type="text" id="signupFullName" placeholder="John Doe" required />
        </div>
        <div class="form-group">
          <label for="signupUsername">Username</label>
          <input type="text" id="signupUsername" placeholder="johndoe" required />
        </div>
        <div class="form-group">
          <label for="signupEmail">Email</label>
          <input type="email" id="signupEmail" placeholder="john@example.com" required />
        </div>
        <div class="form-group">
          <label for="signupPhone">Phone Number</label>
          <input type="tel" id="signupPhone" placeholder="+880 1234 567890" required />
        </div>
        <div class="form-group">
          <label for="signupPassword">Password</label>
          <input type="password" id="signupPassword" placeholder="Create a strong password" required />
          <div class="password-strength"><div class="password-strength-bar" id="passwordStrengthBar"></div></div>
          <button type="button" class="password-toggle" data-target="signupPassword" aria-label="Toggle password visibility" style="font-size:0.8rem;color:var(--color-primary);margin-top:4px;">Show</button>
        </div>
        <div class="form-group">
          <label for="signupConfirmPassword">Confirm Password</label>
          <input type="password" id="signupConfirmPassword" placeholder="Confirm your password" required />
          <div class="password-match-error" id="passwordMatchError"></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="signupDob">Date of Birth</label>
            <input type="date" id="signupDob" required />
          </div>
          <div class="form-group">
            <label for="signupDivision">Division</label>
            <select id="signupDivision" required>
              <option value="">Select</option>
              <option value="dhaka">Dhaka</option>
              <option value="chittagong">Chittagong</option>
              <option value="khulna">Khulna</option>
              <option value="rajshahi">Rajshahi</option>
              <option value="sylhet">Sylhet</option>
              <option value="barisal">Barisal</option>
              <option value="rangpur">Rangpur</option>
              <option value="mymensingh">Mymensingh</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="signupDistrict">District</label>
          <input type="text" id="signupDistrict" placeholder="Your district" required />
        </div>
        <div class="form-group">
          <label for="signupProfilePic">Profile Picture (Optional)</label>
          <input type="file" id="signupProfilePic" accept="image/*" />
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="signupTerms" required />
          <label for="signupTerms">I agree to the Terms &amp; Conditions</label>
        </div>
        <button type="submit" class="btn btn-primary" id="authSubmitBtn">Create Account</button>
        <div class="auth-switch">
          Already have an account? <a data-auth-view="login">Log In</a>
        </div>
      </form>
    `;
  },

  forgotForm() {
    return `
      <h2>Reset Password</h2>
      <p>Enter your email to receive a reset link</p>
      <form class="auth-form" id="authForm" novalidate>
        <div class="form-group">
          <label for="forgotEmail">Email</label>
          <input type="email" id="forgotEmail" placeholder="your@email.com" required />
        </div>
        <button type="submit" class="btn btn-primary" id="authSubmitBtn">Send Reset Link</button>
        <div class="auth-switch">
          <a data-auth-view="login">Back to Login</a>
        </div>
      </form>
    `;
  },

  resetForm() {
    return `
      <h2>Set New Password</h2>
      <p>Create a new password for your account</p>
      <form class="auth-form" id="authForm" novalidate>
        <div class="form-group">
          <label for="resetPassword">New Password</label>
          <input type="password" id="resetPassword" placeholder="Enter new password" required />
        </div>
        <div class="form-group">
          <label for="resetConfirmPassword">Confirm Password</label>
          <input type="password" id="resetConfirmPassword" placeholder="Confirm new password" required />
        </div>
        <button type="submit" class="btn btn-primary" id="authSubmitBtn">Reset Password</button>
        <div class="auth-switch">
          <a data-auth-view="login">Back to Login</a>
        </div>
      </form>
    `;
  },

  verifyEmailForm() {
    return `
      <h2>Verify Email</h2>
      <p>We've sent a verification link to your email</p>
      <form class="auth-form" id="authForm" novalidate>
        <p style="color:var(--color-text-light);font-size:0.95rem;text-align:center;">Please check your inbox and click the verification link.</p>
        <button type="submit" class="btn btn-primary" id="authSubmitBtn">Resend Verification</button>
        <div class="auth-switch">
          <a data-auth-view="login">Back to Login</a>
        </div>
      </form>
    `;
  },

  otpForm() {
    return `
      <h2>OTP Verification</h2>
      <p>Enter the 6-digit code sent to your phone</p>
      <form class="auth-form" id="authForm" novalidate>
        <div class="form-group">
          <label for="otpCode">OTP Code</label>
          <input type="text" id="otpCode" placeholder="123456" maxlength="6" required pattern="\\d{6}" />
        </div>
        <button type="submit" class="btn btn-primary" id="authSubmitBtn">Verify OTP</button>
        <div class="auth-switch">
          <a data-auth-view="login">Back to Login</a>
        </div>
      </form>
    `;
  },

  bindFormEvents(view) {
    const form = document.getElementById('authForm');
    if (!form) return;

    form.querySelectorAll('[data-auth-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = el.getAttribute('data-auth-view');
        if (targetView) this.render(targetView);
      });
    });

    form.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          const isPassword = input.type === 'password';
          input.type = isPassword ? 'text' : 'password';
          btn.textContent = isPassword ? 'Hide' : 'Show';
        }
      });
    });

    const pwdInput = document.getElementById('signupPassword');
    const strengthBar = document.getElementById('passwordStrengthBar');
    if (pwdInput && strengthBar) {
      pwdInput.addEventListener('input', () => {
        const val = pwdInput.value;
        let score = 0;
        if (val.length >= 8) score++;
        if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[^a-zA-Z0-9]/.test(val)) score++;
        const pct = (score / 4) * 100;
        strengthBar.style.width = pct + '%';
        if (pct <= 25) {
          strengthBar.style.background = '#e74c3c';
        } else if (pct <= 50) {
          strengthBar.style.background = '#f39c12';
        } else if (pct <= 75) {
          strengthBar.style.background = '#3498db';
        } else {
          strengthBar.style.background = '#2ecc71';
        }
      });
    }

    const confirmPwd = document.getElementById('signupConfirmPassword');
    const matchError = document.getElementById('passwordMatchError');
    if (confirmPwd && matchError && pwdInput) {
      const checkMatch = () => {
        if (confirmPwd.value && pwdInput.value !== confirmPwd.value) {
          matchError.textContent = 'Passwords do not match';
          confirmPwd.style.borderColor = '#e74c3c';
        } else {
          matchError.textContent = '';
          confirmPwd.style.borderColor = '';
        }
      };
      pwdInput.addEventListener('input', checkMatch);
      confirmPwd.addEventListener('input', checkMatch);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(form, view);
    });
  },

  handleFormSubmit(form, view) {
    const btn = document.getElementById('authSubmitBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Processing...';
    }

    setTimeout(() => {
      const inputs = form.querySelectorAll('input[required], select[required]');
      let valid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = '#e74c3c';
          Toast.error(`Please fill in ${input.previousElementSibling?.textContent || 'all fields'}`);
          input.focus();
        } else {
          input.style.borderColor = '';
        }
      });

      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
          valid = false;
          emailInput.style.borderColor = '#e74c3c';
          Toast.error('Please enter a valid email address');
        }
      }

      const phoneInput = form.querySelector('input[type="tel"]');
      if (phoneInput && phoneInput.value) {
        const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
        if (!phoneRegex.test(phoneInput.value)) {
          valid = false;
          phoneInput.style.borderColor = '#e74c3c';
          Toast.error('Please enter a valid phone number');
        }
      }

      const otpInput = document.getElementById('otpCode');
      if (otpInput && otpInput.value) {
        if (!/^\d{6}$/.test(otpInput.value)) {
          valid = false;
          otpInput.style.borderColor = '#e74c3c';
          Toast.error('OTP must be 6 digits');
        }
      }

      const termsCheck = document.getElementById('signupTerms');
      if (termsCheck && !termsCheck.checked) {
        valid = false;
        Toast.error('Please accept the Terms & Conditions');
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = view === 'login' ? 'Log In' : view === 'signup' ? 'Create Account' : 'Submit';
      }

      if (!valid) return;

      // Backend API placeholder
      // API: /api/auth/${view === 'login' ? 'login' : view === 'signup' ? 'register' : view}
      // JWT token handling, CSRF token, etc.

      Toast.success(view === 'login' ? 'Login successful! Welcome back.' : view === 'signup' ? 'Account created successfully!' : 'Done!');

      if (view === 'login' || view === 'signup') {
        setTimeout(() => {
          this.close();
          Dashboard.open();
        }, 800);
      }
    }, 600);
  }
};

// ============================================================
// 7. DASHBOARD
// ============================================================

const Dashboard = {
  isOpen: false,

  init() {
    this.dashboard = document.getElementById('dashboard');
    this.overlay = document.getElementById('dashboardOverlay');

    document.getElementById('dashboardClose')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());

    $$('.dashboard-menu a[data-dashboard]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-dashboard');
        this.switchView(view);
        $$('.dashboard-menu a[data-dashboard]').forEach(a => a.classList.remove('active'));
        item.classList.add('active');
        Toast.info(`Viewing: ${view}`);
      });
    });

    document.getElementById('dashboardLogout')?.addEventListener('click', (e) => {
      e.preventDefault();
      Toast.success('Logged out successfully');
      this.close();
    });
  },

  open() {
    this.isOpen = true;
    this.dashboard?.classList.add('open');
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.isOpen = false;
    this.dashboard?.classList.remove('open');
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  },

  switchView(view) {
    // Backend API: /api/dashboard/${view}
  }
};

// ============================================================
// 8. SEARCH OVERLAY
// ============================================================

const Search = {
  init() {
    this.overlay = document.getElementById('searchOverlay');
    this.input = document.getElementById('searchInput');
    this.results = document.getElementById('searchResults');

    document.getElementById('searchToggle')?.addEventListener('click', () => this.open());
    document.getElementById('searchClose')?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.input?.addEventListener('input', () => this.performSearch());

    ['searchCategory', 'searchCondition', 'searchPriceMin', 'searchPriceMax', 'searchLocation'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => this.performSearch());
      document.getElementById(id)?.addEventListener('input', () => this.performSearch());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  },

  open() {
    this.overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.input?.focus(), 200);
  },

  close() {
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  },

  isOpen() {
    return this.overlay?.classList.contains('active') || false;
  },

  performSearch() {
    const query = this.input?.value || '';
    const category = document.getElementById('searchCategory')?.value || '';
    const condition = document.getElementById('searchCondition')?.value || '';
    const priceMin = document.getElementById('searchPriceMin')?.value || '';
    const priceMax = document.getElementById('searchPriceMax')?.value || '';
    const location = document.getElementById('searchLocation')?.value || '';

    // Backend API: /api/search?q=${query}&category=${category}&condition=${condition}&priceMin=${priceMin}&priceMax=${priceMax}&location=${location}

    const mockProducts = [
      { name: 'iPhone 15 Pro', category: 'Mobile Phones', price: '$999', location: 'Dhaka' },
      { name: 'MacBook Air M2', category: 'Computers', price: '$1,199', location: 'Chittagong' },
      { name: 'Samsung Galaxy S24', category: 'Mobile Phones', price: '$899', location: 'Sylhet' },
      { name: 'Sony Headphones', category: 'Electronics', price: '$199', location: 'Khulna' },
      { name: 'IKEA Desk', category: 'Furniture', price: '$249', location: 'Dhaka' },
    ];

    const filtered = mockProducts.filter(p => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (category && !p.category.toLowerCase().includes(category.toLowerCase())) return false;
      if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;
      return true;
    });

    this.renderResults(filtered);
  },

  renderResults(products) {
    if (!this.results) return;
    if (!products.length) {
      this.results.innerHTML = `<p style="text-align:center;color:var(--color-text-muted);padding:var(--space-4);">No products found. Try adjusting your filters.</p>`;
      return;
    }

    this.results.innerHTML = products.map(p => `
      <div class="search-result-item">
        <div style="width:60px;height:60px;border-radius:var(--radius-sm);background:var(--color-border);flex-shrink:0;"></div>
        <div class="info">
          <h4>${p.name}</h4>
          <p>${p.category} • ${p.location} • ${p.price}</p>
        </div>
      </div>
    `).join('');
  }
};

// ============================================================
// 9. FEATURED PRODUCTS (RENDER)
// ============================================================

const Products = {
  data: [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      category: 'Mobile Phones',
      condition: 'New',
      price: '$1,299',
      seller: 'TechWorld BD',
      rating: 4.9,
      location: 'Dhaka',
      image: ''
    },
    {
      id: 2,
      name: 'MacBook Pro 16"',
      category: 'Computers',
      condition: 'Used',
      price: '$1,899',
      seller: 'Apple Hub',
      rating: 4.7,
      location: 'Chittagong',
      image: ''
    },
    {
      id: 3,
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Mobile Phones',
      condition: 'New',
      price: '$1,199',
      seller: 'Gadget Point',
      rating: 4.8,
      location: 'Sylhet',
      image: ''
    },
    {
      id: 4,
      name: 'Sony WH-1000XM5',
      category: 'Electronics',
      condition: 'New',
      price: '$349',
      seller: 'AudioStore',
      rating: 4.6,
      location: 'Khulna',
      image: ''
    },
    {
      id: 5,
      name: 'IKEA Malm Desk',
      category: 'Furniture',
      condition: 'Used',
      price: '$120',
      seller: 'HomeLiving',
      rating: 4.5,
      location: 'Dhaka',
      image: ''
    },
    {
      id: 6,
      name: 'Toyota Corolla 2023',
      category: 'Vehicles',
      condition: 'Used',
      price: '$22,500',
      seller: 'AutoMart',
      rating: 4.9,
      location: 'Dhaka',
      image: ''
    }
  ],

  init() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = this.data.map(p => this.cardHTML(p)).join('');

    grid.querySelectorAll('.product-card-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const icon = btn.querySelector('svg');
        if (icon) {
          const isFilled = icon.getAttribute('fill') === 'currentColor';
          icon.setAttribute('fill', isFilled ? 'none' : 'currentColor');
          icon.style.color = isFilled ? '' : '#e74c3c';
          Toast[isFilled ? 'info' : 'success'](isFilled ? 'Removed from wishlist' : 'Added to wishlist');
        }
      });
    });

    grid.querySelectorAll('.product-view-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Toast.info(`Viewing product #${id}`);
        // Backend API: /api/products/${id}
      });
    });
  },

  cardHTML(p) {
    const badgeClass = p.condition.toLowerCase() === 'new' ? '' : 'used';
    const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '★' : '');
    return `
      <div class="product-card">
        <div class="product-card-image">
          <div>${p.name}</div>
          <button class="product-card-wishlist" aria-label="Add to wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${p.category}</span>
          <h3 class="product-card-name">${p.name}</h3>
          <span class="product-card-badge ${badgeClass}">${p.condition}</span>
          <span class="product-card-price">${p.price}</span>
          <div class="product-card-seller">
            <span>${p.seller}</span>
            <span class="seller-rating">${stars} ${p.rating}</span>
          </div>
          <span style="font-size:0.8rem;color:var(--color-text-muted);">📍 ${p.location}</span>
        </div>
        <div class="product-card-footer">
          <button class="btn btn-primary btn-sm product-view-details" data-id="${p.id}">View Details</button>
        </div>
      </div>
    `;
  }
};

// ============================================================
// 10. NEWSLETTER
// ============================================================

const Newsletter = {
  init() {
    const form = document.getElementById('newsletterForm');
    const input = document.getElementById('newsletterEmail');
    const message = document.getElementById('newsletterMessage');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!input.value) {
        message.textContent = 'Please enter your email';
        message.style.color = '#e74c3c';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        message.textContent = 'Please enter a valid email';
        message.style.color = '#e74c3c';
        return;
      }

      // Backend API: /api/newsletter/subscribe
      message.textContent = 'Subscribed successfully! 🎉';
      message.style.color = '#2ecc71';
      input.value = '';
      Toast.success('You\'re now subscribed to our newsletter!');

      setTimeout(() => {
        message.textContent = '';
      }, 4000);
    });
  }
};

// ============================================================
// 11. CONTACT FORM
// ============================================================

const ContactForm = {
  init() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('contactSubmitBtn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      const name = document.getElementById('contactName');
      const email = document.getElementById('contactEmail');
      const msg = document.getElementById('contactMessage');
      let valid = true;

      [name, email, msg].forEach(f => {
        if (f && !f.value.trim()) {
          f.style.borderColor = '#e74c3c';
          valid = false;
        } else if (f) {
          f.style.borderColor = '';
        }
      });

      if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
          email.style.borderColor = '#e74c3c';
          valid = false;
          Toast.error('Please enter a valid email');
        }
      }

      if (!valid) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Send Message';
        }
        return;
      }

      // Backend API: /api/contact
      setTimeout(() => {
        Toast.success('Message sent successfully! We\'ll get back to you soon.');
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Send Message';
        }
      }, 800);
    });
  }
};

// ============================================================
// 12. SMOOTH SCROLL
// ============================================================

const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }
};

// ============================================================
// 13. RIPPLE EFFECT (buttons)
// ============================================================

const Ripple = {
  init() {
    document.querySelectorAll('.btn-ripple').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--x', x + '%');
        btn.style.setProperty('--y', y + '%');
      });
    });
  }
};

// ============================================================
// 14. INITIALIZE ALL MODULES
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  Navbar.init();
  SmoothScroll.init();
  FAQ.init();
  Counters.init();
  AuthModal.init();
  Dashboard.init();
  Search.init();
  Products.init();
  Newsletter.init();
  ContactForm.init();
  Ripple.init();

  // Admin panel toggle (double click on logo)
  let logoClickCount = 0;
  document.querySelector('.navbar-logo')?.addEventListener('dblclick', () => {
    logoClickCount++;
    if (logoClickCount >= 2) {
      const panel = document.getElementById('adminPanel');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        if (panel.style.display === 'flex') {
          Toast.warning('Admin Panel (UI Placeholder)');
        }
      }
      logoClickCount = 0;
    }
    setTimeout(() => { logoClickCount = 0; }, 1000);
  });

  console.log('🚀 Ponno initialized successfully');
  console.log('📦 Built with vanilla JS, no frameworks');
  console.log('🔒 Auth, Dashboard, Search, Products, FAQ, Counters all ready');
});

// ============================================================
// 15. RESIZE HANDLING
// ============================================================

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    const menu = document.getElementById('navbarMenu');
    const toggle = document.getElementById('mobileToggle');
    if (menu) menu.classList.remove('mobile-open');
    if (toggle) toggle.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ============================================================
// 16. PREVENT MULTIPLE SUBMISSION
// ============================================================

document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.dataset.submitting === 'true') {
    e.preventDefault();
    return;
  }
  form.dataset.submitting = 'true';
  setTimeout(() => {
    form.dataset.submitting = 'false';
  }, 3000);
});

// ============================================================
// END OF SCRIPT
// ============================================================