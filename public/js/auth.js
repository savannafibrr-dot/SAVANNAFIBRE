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

// Navbar grouping: move less-frequent items into a "More" dropdown and keep Logout at the far right
// This runs on all admin pages that include this shared script
(function setupNavbarGrouping() {
    const CANONICAL_ITEMS = [
        { href: '/admin/dashboard', iconHTML: '<i class="bi bi-speedometer2"></i>', label: 'Dash', match: ['dashboard'] },
        { href: '/admin/plans', iconHTML: '<i class="bi bi-wifi"></i>', label: 'Internet Plans', match: ['plans'] },
        { href: '/admin/shop', iconHTML: '<i class="bi bi-shop"></i>', label: 'Shop Locations', match: ['shop'] },
        { href: '/admin/coverage', iconHTML: '<i class="bi bi-broadcast-pin"></i>', label: 'Coverage Areas', match: ['coverage','coverages'] },
        { href: '/admin/accessories', iconHTML: '<i class="bi bi-headphones"></i>', label: 'Accessories', match: ['accessories'] },
        { href: '/banners', iconHTML: '<i class="bi bi-images"></i>', label: 'Banner Management', match: ['banners'] },
        { href: '/about-admin.html', iconHTML: '<i class="bi bi-info-circle"></i>', label: 'About Admin', match: ['about-admin'] },
        { href: '/payments-admin.html', iconHTML: '<i class="fa fa-money-bill"></i>', label: 'Payments Admin', match: ['payments-admin'] },
        { href: '/faq-admin.html', iconHTML: '<i class="bi bi-question-circle"></i>', label: 'FAQ Admin', match: ['faq-admin'] }
    ];

    const ADMIN_ONLY_ITEMS = [
        { href: '/admin/users', iconHTML: '<i class="bi bi-people"></i>', label: 'Users', match: ['users'] }
    ];

    function computeIsActive(pathname, item) {
        const p = pathname.toLowerCase();
        const href = (item.href || '').toLowerCase();
        if (p === href || p.startsWith(href)) return true;
        return (item.match || []).some(m => p.includes(m));
    }

    function buildCanonicalNavbar(includeAdminItems = false) {
        const mainNav = document.querySelector('.navbar .navbar-nav.me-auto');
        const collapse = document.querySelector('.navbar .navbar-collapse');
        if (!mainNav || !collapse) return;

        // Rebuild main nav to the canonical set
        mainNav.innerHTML = '';
        const pathname = window.location.pathname || '';
        const items = CANONICAL_ITEMS.concat(includeAdminItems ? ADMIN_ONLY_ITEMS : []);
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            const a = document.createElement('a');
            a.className = 'nav-link';
            a.href = item.href;
            a.innerHTML = `${item.iconHTML} ${item.label}`;
            if (computeIsActive(pathname, item)) a.classList.add('active');
            li.appendChild(a);
            mainNav.appendChild(li);
        });

        // Ensure Logout group exists and is right aligned
        let rightGroup = collapse.querySelector(':scope > ul.navbar-nav:last-child');
        if (!rightGroup || rightGroup === mainNav) {
            rightGroup = document.createElement('ul');
            rightGroup.className = 'navbar-nav';
            collapse.appendChild(rightGroup);
        }
        if (!rightGroup.querySelector('#logout-btn')) {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                <a class="nav-link" href="#" id="logout-btn">
                    <i class="bi bi-box-arrow-right"></i>
                    Logout
                </a>`;
            rightGroup.appendChild(li);
        }
    }

    function groupNavbarItemsIntoDropdown() {
        try {
            const mainNav = document.querySelector('.navbar .navbar-nav.me-auto');
            if (!mainNav) return;

            // Ensure a single dropdown holder exists
            let dropdownLi = mainNav.querySelector('#nav-more-dropdown');
            if (!dropdownLi) {
                dropdownLi = document.createElement('li');
                dropdownLi.className = 'nav-item dropdown';
                dropdownLi.id = 'nav-more-dropdown';
                dropdownLi.innerHTML = `
                    <a class="nav-link dropdown-toggle" href="#" id="moreDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        More
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="moreDropdown"></ul>
                `;
                mainNav.appendChild(dropdownLi);
            }

            const dropdownMenu = dropdownLi.querySelector('.dropdown-menu');
            const toMoveHrefs = ['/banners','/about-admin','/payments-admin','/faq-admin','/admin/users'];

            // Move target items into dropdown
            const items = Array.from(mainNav.children).filter(li => li.matches('.nav-item') && li.id !== 'nav-more-dropdown');
            items.forEach(li => {
                const a = li.querySelector('a.nav-link');
                if (!a) return;
                const href = (a.getAttribute('href') || '').toLowerCase();
                const shouldMove = toMoveHrefs.some(key => href.includes(key));
                if (shouldMove) {
                    // Avoid duplicates
                    if (!dropdownMenu.querySelector(`a[href="${a.getAttribute('href')}"]`)) {
                        const item = document.createElement('li');
                        const link = a.cloneNode(true);
                        link.classList.remove('active');
                        link.classList.add('dropdown-item');
                        link.classList.remove('nav-link');
                        item.appendChild(link);
                        dropdownMenu.appendChild(item);
                    }
                    li.remove();
                }
            });

            // Hide dropdown if empty
            if (!dropdownMenu.children.length) {
                dropdownLi.remove();
            }

            // Keep main navigation on one line
            mainNav.style.flexWrap = 'nowrap';
        } catch (e) {
            console.error('Navbar grouping error:', e);
        }
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            buildCanonicalNavbar(false);
            groupNavbarItemsIntoDropdown();
            // Try enable admin items after role check
            checkAdmin().then(isAdmin => {
                if (isAdmin) {
                    buildCanonicalNavbar(true);
                    groupNavbarItemsIntoDropdown();
                } else {
                    // regroup just in case
                    setTimeout(groupNavbarItemsIntoDropdown, 800);
                }
            }).catch(() => {});
        });
    } else {
        buildCanonicalNavbar(false);
        groupNavbarItemsIntoDropdown();
        checkAdmin().then(isAdmin => {
            if (isAdmin) {
                buildCanonicalNavbar(true);
                groupNavbarItemsIntoDropdown();
            } else {
                setTimeout(groupNavbarItemsIntoDropdown, 800);
            }
        }).catch(() => {});
    }
})();