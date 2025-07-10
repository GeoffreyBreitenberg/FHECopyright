// Contract configuration
const CONTRACT_ADDRESS = "0xe2851b2B971E3F95f325764c25ffd52E9c8bf80a";
const CONTRACT_ABI = [
    "function registerAuthor(uint64 _authorId) external",
    "function registerWork(uint32 _contentHash, string calldata _title, string calldata _category) external returns (uint256)",
    "function requestVerifyWork(uint256 _workId, uint32 _contentHashToVerify) external",
    "function fileDispute(uint256 _workId, uint32 _challengerContentHash) external",
    "function resolveDispute(uint256 _workId, uint256 _disputeId) external",
    "function getWorkInfo(uint256 _workId) external view returns (address registrant, uint256 timestamp, bool verified, bool disputed, uint256 disputeCount, string memory title, string memory category)",
    "function getAuthorStats(address _author) external view returns (bool registered, uint256 workCount, uint256 totalDisputes, uint256 wonDisputes)",
    "function getAuthorWorks(address _author) external view returns (uint256[] memory)",
    "function getTotalWorks() external view returns (uint256)",
    "function isRegisteredAuthor(address _author) external view returns (bool)",
    "function markWorkAsVerified(uint256 _workId) external",
    "function getDisputeCount(uint256 _workId) external view returns (uint256)",
    "function getDisputeInfo(uint256 _workId, uint256 _disputeId) external view returns (address challenger, uint256 timestamp, bool resolved, address winner)",
    "event WorkRegistered(uint256 indexed workId, address indexed registrant, string title, uint256 timestamp)",
    "event DisputeFiled(uint256 indexed workId, address indexed challenger, uint256 disputeId)",
    "event AuthorRegistered(address indexed author, uint256 timestamp)",
    "event VerificationResult(uint256 indexed requestId, bool isMatch)",
    "event WorkVerified(uint256 indexed workId, address indexed verifier)",
    "event DisputeResolved(uint256 indexed workId, uint256 disputeId, address winner)"
];

// Global variables
let provider;
let signer;
let contract;
let userAddress;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkWalletConnection();
});

// Setup all event listeners
function setupEventListeners() {
    document.getElementById('connectBtn').addEventListener('click', connectWallet);
    document.getElementById('registerForm').addEventListener('submit', handleRegisterAuthor);
    document.getElementById('submitWorkForm').addEventListener('submit', handleSubmitWork);
    document.getElementById('verifyForm').addEventListener('submit', handleVerifyWork);
    document.getElementById('disputeForm').addEventListener('submit', handleFileDispute);
    document.getElementById('resolveForm').addEventListener('submit', handleResolveDispute);
    document.getElementById('loadWorkBtn').addEventListener('click', handleLoadWork);

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
}

// Check if wallet is already connected
async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await connectWallet();
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }
}

// Connect wallet
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showNotification('Please install MetaMask!', 'error');
            return;
        }

        showTxStatus('Connecting to wallet...');

        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const network = await provider.getNetwork();

        // Update UI
        document.getElementById('accountAddress').textContent =
            userAddress.substring(0, 6) + '...' + userAddress.substring(38);
        document.getElementById('connectBtn').style.display = 'none';
        document.getElementById('accountInfo').style.display = 'flex';

        hideTxStatus();
        showNotification('Wallet connected successfully!', 'success');

        // Load initial data
        await loadStats();

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());

    } catch (error) {
        console.error('Error connecting wallet:', error);
        hideTxStatus();
        showNotification('Failed to connect wallet: ' + error.message, 'error');
    }
}

// Handle account changes
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        document.getElementById('connectBtn').style.display = 'block';
        document.getElementById('accountInfo').style.display = 'none';
        userAddress = null;
    } else {
        await connectWallet();
    }
}

// Register author
async function handleRegisterAuthor(e) {
    e.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const authorId = document.getElementById('authorId').value;

    if (!authorId) {
        showNotification('Please enter an author ID', 'error');
        return;
    }

    try {
        showTxStatus('Registering author...');
        const tx = await contract.registerAuthor(authorId);
        await tx.wait();

        hideTxStatus();
        showNotification('Author registered successfully!', 'success');
        document.getElementById('registerForm').reset();
        await loadStats();
    } catch (error) {
        console.error('Error registering author:', error);
        hideTxStatus();
        showNotification('Failed to register author: ' + error.message, 'error');
    }
}

// Submit work
async function handleSubmitWork(e) {
    e.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const title = document.getElementById('workTitle').value;
    const category = document.getElementById('workCategory').value;
    const contentHash = document.getElementById('contentHash').value;

    if (!title || !category || !contentHash) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    try {
        showTxStatus('Registering work...');
        const tx = await contract.registerWork(contentHash, title, category);
        const receipt = await tx.wait();

        // Find WorkRegistered event
        const event = receipt.events.find(e => e.event === 'WorkRegistered');
        const workId = event ? event.args.workId.toString() : 'Unknown';

        hideTxStatus();
        showNotification(`Work registered successfully! Work ID: ${workId}`, 'success');
        document.getElementById('submitWorkForm').reset();
        await loadStats();
    } catch (error) {
        console.error('Error registering work:', error);
        hideTxStatus();
        showNotification('Failed to register work: ' + error.message, 'error');
    }
}

// Verify work
async function handleVerifyWork(e) {
    e.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const workId = document.getElementById('verifyWorkId').value;
    const hash = document.getElementById('verifyHash').value;

    if (!workId || !hash) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    try {
        showTxStatus('Requesting verification...');
        const tx = await contract.requestVerifyWork(workId, hash);
        await tx.wait();

        hideTxStatus();
        showNotification('Verification request submitted! Check events for result.', 'success');
        document.getElementById('verifyForm').reset();
    } catch (error) {
        console.error('Error verifying work:', error);
        hideTxStatus();
        showNotification('Failed to verify work: ' + error.message, 'error');
    }
}

// File dispute
async function handleFileDispute(e) {
    e.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const workId = document.getElementById('disputeWorkId').value;
    const hash = document.getElementById('disputeHash').value;

    if (!workId || !hash) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    try {
        showTxStatus('Filing dispute...');
        const tx = await contract.fileDispute(workId, hash);
        await tx.wait();

        hideTxStatus();
        showNotification('Dispute filed successfully!', 'success');
        document.getElementById('disputeForm').reset();
        await loadStats();
    } catch (error) {
        console.error('Error filing dispute:', error);
        hideTxStatus();
        showNotification('Failed to file dispute: ' + error.message, 'error');
    }
}

// Resolve dispute
async function handleResolveDispute(e) {
    e.preventDefault();

    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const workId = document.getElementById('resolveWorkId').value;
    const disputeId = document.getElementById('resolveDisputeId').value;

    if (!workId || !disputeId) {
        showNotification('Please fill all fields', 'error');
        return;
    }

    try {
        showTxStatus('Resolving dispute...');
        const tx = await contract.resolveDispute(workId, disputeId);
        await tx.wait();

        hideTxStatus();
        showNotification('Dispute resolution initiated!', 'success');
        document.getElementById('resolveForm').reset();
    } catch (error) {
        console.error('Error resolving dispute:', error);
        hideTxStatus();
        showNotification('Failed to resolve dispute: ' + error.message, 'error');
    }
}

// Load work details
async function handleLoadWork() {
    if (!contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }

    const workId = document.getElementById('browseWorkId').value;

    if (!workId) {
        showNotification('Please enter a work ID', 'error');
        return;
    }

    try {
        showTxStatus('Loading work details...');
        const work = await contract.getWorkInfo(workId);

        const workDetailsDiv = document.getElementById('workDetails');
        workDetailsDiv.innerHTML = `
            <div class="work-detail-card">
                <h3>${work.title}</h3>
                <div class="detail-row">
                    <span class="label">Work ID:</span>
                    <span class="value">${workId}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Category:</span>
                    <span class="value">${work.category}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Registrant:</span>
                    <span class="value">${work.registrant}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Registered:</span>
                    <span class="value">${new Date(work.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value">
                        ${work.verified ? '<span class="badge badge-verified">Verified</span>' : '<span class="badge badge-pending">Pending</span>'}
                        ${work.disputed ? '<span class="badge badge-disputed">Disputed</span>' : ''}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="label">Dispute Count:</span>
                    <span class="value">${work.disputeCount.toString()}</span>
                </div>
            </div>
        `;

        hideTxStatus();
    } catch (error) {
        console.error('Error loading work:', error);
        hideTxStatus();
        showNotification('Failed to load work: ' + error.message, 'error');
    }
}

// Load statistics
async function loadStats() {
    if (!contract || !userAddress) return;

    try {
        // Load total works
        const totalWorks = await contract.getTotalWorks();
        document.getElementById('totalWorks').textContent = totalWorks.toString();

        // Load author stats
        const stats = await contract.getAuthorStats(userAddress);
        const authorStatsDiv = document.getElementById('authorStats');

        authorStatsDiv.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.registered ? 'Yes' : 'No'}</div>
                <div class="stat-label">Author Registered</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.workCount.toString()}</div>
                <div class="stat-label">Works Registered</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalDisputes.toString()}</div>
                <div class="stat-label">Total Disputes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.wonDisputes.toString()}</div>
                <div class="stat-label">Won Disputes</div>
            </div>
        `;

        // Load my works
        if (stats.registered) {
            const workIds = await contract.getAuthorWorks(userAddress);
            const myWorksDiv = document.getElementById('myWorks');

            if (workIds.length === 0) {
                myWorksDiv.innerHTML = '<p class="no-data">No works registered yet</p>';
            } else {
                myWorksDiv.innerHTML = '';
                for (let workId of workIds) {
                    const work = await contract.getWorkInfo(workId);
                    const workCard = createWorkCard(workId.toString(), work);
                    myWorksDiv.appendChild(workCard);
                }
            }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Create work card element
function createWorkCard(workId, work) {
    const card = document.createElement('div');
    card.className = 'work-card';

    card.innerHTML = `
        <h3>${work.title}</h3>
        <div class="work-info">
            <p><strong>ID:</strong> ${workId}</p>
            <p><strong>Category:</strong> ${work.category}</p>
            <p><strong>Registered:</strong> ${new Date(work.timestamp * 1000).toLocaleDateString()}</p>
            <p><strong>Disputes:</strong> ${work.disputeCount.toString()}</p>
        </div>
        <div class="work-badges">
            ${work.verified ? '<span class="badge badge-verified">Verified</span>' : '<span class="badge badge-pending">Pending</span>'}
            ${work.disputed ? '<span class="badge badge-disputed">Disputed</span>' : ''}
        </div>
    `;

    return card;
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Load data for specific tabs
    if (tabName === 'profile' && contract && userAddress) {
        loadStats();
    }
}

// Show transaction status
function showTxStatus(message) {
    document.getElementById('txMessage').textContent = message;
    document.getElementById('txStatus').style.display = 'flex';
}

// Hide transaction status
function hideTxStatus() {
    document.getElementById('txStatus').style.display = 'none';
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
