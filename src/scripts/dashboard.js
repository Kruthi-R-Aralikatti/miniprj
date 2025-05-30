
// Dashboard functionality

let userData = {};
let accountBalance = 50000;
let transactionHistory = [];

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    displayBalance();
    loadTransactionHistory();
    createCharts();
    displayRecentTransactions();
});

function loadUserData() {
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
        alert('Please login first!');
        window.location.href = '../../index.html';
        return;
    }
    
    userData = JSON.parse(storedData);
    document.getElementById('userEmail').textContent = userData.email;
    
    const storedBalance = localStorage.getItem('accountBalance');
    if (storedBalance) {
        accountBalance = parseInt(storedBalance);
    }
    
    const storedTransactions = localStorage.getItem('transactionHistory');
    if (storedTransactions) {
        transactionHistory = JSON.parse(storedTransactions);
    }
}

function displayBalance() {
    document.getElementById('accountBalance').textContent = `₹ ${accountBalance.toLocaleString()}`;
}

function loadTransactionHistory() {
    const stored = localStorage.getItem('transactionHistory');
    if (stored) {
        transactionHistory = JSON.parse(stored);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userData');
        window.location.href = '../../index.html';
    }
}

function showTransactionForm() {
    document.getElementById('transactionForm').style.display = 'block';
}

function hideTransactionForm() {
    document.getElementById('transactionForm').style.display = 'none';
    document.getElementById('newTransactionForm').reset();
}

// Handle new transaction
document.getElementById('newTransactionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const cardUsed = document.getElementById('cardUsed').value;
    const amount = parseInt(document.getElementById('amount').value);
    const location = document.getElementById('location').value;
    
    if (amount > accountBalance) {
        alert('Insufficient balance!');
        return;
    }
    
    // Create new transaction
    const newTransaction = {
        id: Date.now(),
        amount: amount,
        location: location,
        card: cardUsed,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Run fraud detection
    const fraudCheck = detectFraud(newTransaction);
    
    if (fraudCheck.isFraud) {
        showFraudAlert(fraudCheck.reason, newTransaction);
    } else {
        processTransaction(newTransaction);
    }
});

function processTransaction(transaction) {
    transaction.status = 'safe';
    
    // Update balance
    accountBalance -= transaction.amount;
    localStorage.setItem('accountBalance', accountBalance.toString());
    
    // Add to transaction history
    transactionHistory.unshift(transaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    
    // Update UI
    displayBalance();
    displayRecentTransactions();
    updateCharts();
    hideTransactionForm();
    
    alert(`Transaction of ₹${transaction.amount} completed successfully!`);
}

function createCharts() {
    createSafetyChart();
    createTransactionChart();
}

function createSafetyChart() {
    const ctx = document.getElementById('safetyChart').getContext('2d');
    
    const safeCount = transactionHistory.filter(t => t.status === 'safe').length;
    const fraudCount = transactionHistory.filter(t => t.status === 'fraud').length;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Safe Transactions', 'Fraud Detected'],
            datasets: [{
                data: [safeCount, fraudCount],
                backgroundColor: ['#50c878', '#ff6b6b'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createTransactionChart() {
    const ctx = document.getElementById('transactionChart').getContext('2d');
    
    // Get last 7 days of transactions
    const last7Days = [];
    const amounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        last7Days.push(dateStr);
        
        // Calculate total amount for this day
        const dayTransactions = transactionHistory.filter(t => {
            const tDate = new Date(t.timestamp);
            return tDate.toLocaleDateString() === dateStr;
        });
        
        const totalAmount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
        amounts.push(totalAmount);
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Transaction Amount (₹)',
                data: amounts,
                backgroundColor: '#4a90e2',
                borderColor: '#2c5aa0',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateCharts() {
    // Simple approach: reload the page to update charts
    // In a real application, you would update the chart data dynamically
    setTimeout(() => {
        location.reload();
    }, 1000);
}

function displayRecentTransactions() {
    const container = document.getElementById('transactionHistory');
    
    if (transactionHistory.length === 0) {
        container.innerHTML = '<p>No transactions yet.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    // Show last 10 transactions
    const recentTransactions = transactionHistory.slice(0, 10);
    
    recentTransactions.forEach(transaction => {
        const div = document.createElement('div');
        div.className = `transaction-item ${transaction.status}`;
        
        const date = new Date(transaction.timestamp).toLocaleDateString();
        const time = new Date(transaction.timestamp).toLocaleTimeString();
        
        div.innerHTML = `
            <div>
                <strong>₹${transaction.amount}</strong><br>
                <small>${transaction.location}</small><br>
                <small>${date} ${time}</small>
            </div>
            <div>
                <span class="status ${transaction.status}">
                    ${transaction.status === 'safe' ? '✅ Safe' : 
                      transaction.status === 'fraud' ? '⚠️ Fraud' : '⏳ Pending'}
                </span>
            </div>
        `;
        
        container.appendChild(div);
    });
}
