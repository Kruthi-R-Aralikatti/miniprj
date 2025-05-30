
// Simple authentication and validation logic

function showAboutApp() {
    document.getElementById('aboutModal').style.display = 'block';
}

function showFraudInfo() {
    document.getElementById('fraudModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Form validation and submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cardNumber = document.getElementById('cardNumber').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;
    const cvv = document.getElementById('cvv').value;
    const expiry = document.getElementById('expiry').value;
    
    // Simple validation
    if (!validateCardNumber(cardNumber)) {
        alert('Please enter a valid 16-digit card number!');
        return;
    }
    
    if (!validateMobile(mobile)) {
        alert('Please enter a valid 10-digit mobile number!');
        return;
    }
    
    if (!validateCVV(cvv)) {
        alert('Please enter a valid 3-digit CVV!');
        return;
    }
    
    if (!validateExpiry(expiry)) {
        alert('Please select a valid expiry date!');
        return;
    }
    
    // Store user data in localStorage (simple approach for student project)
    const userData = {
        cardNumber: cardNumber,
        mobile: mobile,
        email: email,
        cvv: cvv,
        expiry: expiry,
        loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('accountBalance', '50000');
    
    // Initialize transaction history if not exists
    if (!localStorage.getItem('transactionHistory')) {
        const initialTransactions = [
            {
                id: 1,
                amount: 500,
                location: 'Mumbai, India',
                card: 'main',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                status: 'safe'
            },
            {
                id: 2,
                amount: 1200,
                location: 'Delhi, India',
                card: 'main',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                status: 'safe'
            },
            {
                id: 3,
                amount: 300,
                location: 'Bangalore, India',
                card: 'secondary',
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                status: 'safe'
            }
        ];
        localStorage.setItem('transactionHistory', JSON.stringify(initialTransactions));
    }
    
    // Show success message
    alert('Login Successful! Redirecting to dashboard...');
    
    // Redirect to dashboard
    window.location.href = 'src/pages/dashboard.html';
});

function validateCardNumber(cardNumber) {
    return /^\d{16}$/.test(cardNumber);
}

function validateMobile(mobile) {
    return /^\d{10}$/.test(mobile);
}

function validateCVV(cvv) {
    return /^\d{3}$/.test(cvv);
}

function validateExpiry(expiry) {
    if (!expiry) return false;
    const selected = new Date(expiry);
    const today = new Date();
    return selected > today;
}

// Auto-format inputs
document.getElementById('cardNumber').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

document.getElementById('mobile').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

document.getElementById('cvv').addEventListener('input', function(e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});
