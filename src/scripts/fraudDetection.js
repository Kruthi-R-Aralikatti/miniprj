
// Simple AI-based fraud detection logic

function detectFraud(transaction) {
    const fraudFactors = [];
    let riskScore = 0;
    
    // Check amount patterns
    const avgAmount = calculateAverageAmount();
    if (transaction.amount > avgAmount * 3) {
        fraudFactors.push('Unusually large amount');
        riskScore += 30;
    }
    
    // Check location patterns
    const recentLocations = getRecentLocations();
    if (!recentLocations.includes(transaction.location) && recentLocations.length > 0) {
        fraudFactors.push('New location detected');
        riskScore += 25;
    }
    
    // Check time patterns
    const recentTransactions = getRecentTransactions(60); // Last 60 minutes
    if (recentTransactions.length >= 3) {
        fraudFactors.push('Multiple transactions in short time');
        riskScore += 35;
    }
    
    // Check for rapid high-value transactions
    const last24Hours = getRecentTransactions(1440); // Last 24 hours
    const total24Hours = last24Hours.reduce((sum, t) => sum + t.amount, 0);
    if (total24Hours + transaction.amount > accountBalance * 0.8) {
        fraudFactors.push('High spending in 24 hours');
        riskScore += 20;
    }
    
    // Simple rule: if risk score > 50, flag as fraud
    const isFraud = riskScore >= 50;
    
    return {
        isFraud: isFraud,
        riskScore: riskScore,
        factors: fraudFactors,
        reason: fraudFactors.join(', ')
    };
}

function calculateAverageAmount() {
    if (transactionHistory.length === 0) return 1000; // Default for new users
    
    const total = transactionHistory.reduce((sum, t) => sum + t.amount, 0);
    return total / transactionHistory.length;
}

function getRecentLocations() {
    // Get locations from last 10 transactions
    return transactionHistory
        .slice(0, 10)
        .map(t => t.location)
        .filter((location, index, arr) => arr.indexOf(location) === index);
}

function getRecentTransactions(minutes) {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    
    return transactionHistory.filter(t => {
        const tTime = new Date(t.timestamp);
        return tTime >= cutoffTime;
    });
}

function showFraudAlert(reason, transaction) {
    document.getElementById('fraudMessage').textContent = 
        `Suspicious activity detected: ${reason}. Amount: ₹${transaction.amount} at ${transaction.location}`;
    
    document.getElementById('fraudAlert').style.display = 'block';
    
    // Store pending transaction for later processing
    window.pendingTransaction = transaction;
}

function callBank() {
    alert('🏦 Calling Bank Security...\n\n"Hello, this is Bank Security. We have flagged this transaction for review. Your account is secure. Please visit our nearest branch with valid ID for verification."');
    
    // Mark transaction as fraud and don't process
    window.pendingTransaction.status = 'fraud';
    transactionHistory.unshift(window.pendingTransaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    
    closeAllModals();
    hideTransactionForm();
    displayRecentTransactions();
    updateCharts();
}

function blockCard() {
    alert('🔒 Card Blocked Successfully!\n\nYour card has been temporarily blocked for security reasons. Please contact your bank to unblock it.');
    
    // Mark transaction as fraud
    window.pendingTransaction.status = 'fraud';
    transactionHistory.unshift(window.pendingTransaction);
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    
    closeAllModals();
    hideTransactionForm();
    displayRecentTransactions();
    updateCharts();
}

function continueTransaction() {
    if (confirm('Are you sure you want to continue with this transaction?')) {
        // Process the transaction despite fraud warning
        processTransaction(window.pendingTransaction);
        closeAllModals();
    }
}

function closeAllModals() {
    document.getElementById('fraudAlert').style.display = 'none';
}

// Advanced fraud patterns (for educational purposes)
function detectAdvancedPatterns(transaction) {
    const patterns = {
        velocityCheck: checkTransactionVelocity(),
        locationJump: checkLocationJump(transaction),
        amountPattern: checkAmountPattern(transaction),
        timePattern: checkTimePattern(transaction)
    };
    
    return patterns;
}

function checkTransactionVelocity() {
    const last10Minutes = getRecentTransactions(10);
    return last10Minutes.length > 2; // More than 2 transactions in 10 minutes
}

function checkLocationJump(transaction) {
    const lastTransaction = transactionHistory[0];
    if (!lastTransaction) return false;
    
    // Simple check: if last transaction was less than 1 hour ago
    // and location is different, flag as suspicious
    const timeDiff = Date.now() - new Date(lastTransaction.timestamp).getTime();
    const isRecent = timeDiff < 3600000; // 1 hour
    const isDifferentLocation = lastTransaction.location !== transaction.location;
    
    return isRecent && isDifferentLocation;
}

function checkAmountPattern(transaction) {
    // Check for round number patterns (common in fraud)
    return transaction.amount % 1000 === 0 && transaction.amount >= 5000;
}

function checkTimePattern(transaction) {
    const hour = new Date().getHours();
    // Transactions between 2 AM and 6 AM are suspicious
    return hour >= 2 && hour <= 6;
}
