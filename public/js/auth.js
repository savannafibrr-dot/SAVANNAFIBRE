// Shared authentication functions
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Auth check failed');
        }
        
        const data = await response.json();
        if (!data.isAuthenticated) {
            window.location.href = '/login.html';
            return false;
        }

        // Check user role
        const userResponse = await fetch('/api/auth/user', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('User check failed');
        }

        const userData = await userResponse.json();
        
        // If user is not on blank page and has role 'user', redirect to blank page
        if (userData.role === 'user' && !window.location.pathname.includes('blank.html')) {
            window.location.href = '/blank.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login.html';
        return false;
    }
}

// Check if user is admin
async function checkAdmin() {
    try {
        const response = await fetch('/api/auth/user', {
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Not authenticated
                return false;
            }
            throw new Error('User check failed');
        }
        
        const userData = await response.json();
        // Only return true if role is exactly 'admin'
        return userData.role === 'admin';
    } catch (error) {
        console.error('Admin check error:', error);
        return false;
    }
} 