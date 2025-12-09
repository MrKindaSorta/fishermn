/**
 * Profile Page Dynamic Data Loader
 * Loads real user data from Auth and populates profile page
 */

function loadProfileData() {
  const user = Auth.getUser();

  if (!user) {
    console.warn('[Profile] No user data available');
    return;
  }

  console.log('[Profile] Loading data for user:', user.displayName);

  // Update profile header
  const displayNameEl = document.getElementById('profile-display-name');
  const emailEl = document.getElementById('profile-email');
  const rankBadgeEl = document.getElementById('profile-rank-badge');
  const initialsEl = document.getElementById('profile-initials');

  if (displayNameEl) displayNameEl.value = user.displayName;
  if (emailEl) emailEl.value = user.email;
  if (rankBadgeEl) rankBadgeEl.textContent = `${user.rankTier} ${user.rankBand}`;

  // Generate initials
  if (initialsEl && user.displayName) {
    const initials = user.displayName.substring(0, 2).toUpperCase();
    initialsEl.textContent = initials;
  }

  // Update rank info
  const levelEl = document.getElementById('profile-level');
  const xpEl = document.getElementById('profile-xp');

  if (levelEl) levelEl.textContent = `Level ${user.rankLevel}`;
  if (xpEl) xpEl.textContent = `${user.xp} / ${user.nextLevelXp || '?'} XP`;

  // Update stats
  const iceReportsEl = document.getElementById('profile-ice-reports');
  const catchReportsEl = document.getElementById('profile-catch-reports');
  const totalReportsEl = document.getElementById('profile-total-reports');
  const rankPositionEl = document.getElementById('profile-rank-position');

  if (iceReportsEl) iceReportsEl.textContent = user.iceReports || 0;
  if (catchReportsEl) catchReportsEl.textContent = user.catchReports || 0;
  if (totalReportsEl) totalReportsEl.textContent = (user.iceReports || 0) + (user.catchReports || 0);
  if (rankPositionEl) rankPositionEl.textContent = '-'; // TODO: Calculate from leaderboard

  console.log('[Profile] User data loaded successfully');
}

/**
 * Save profile changes to backend
 */
async function saveProfileChanges() {
  const displayNameEl = document.getElementById('profile-display-name');
  const displayName = displayNameEl?.value?.trim();

  if (!displayName) {
    UIController.showFeedback('Display name cannot be empty', 'error');
    return;
  }

  try {
    const token = Auth.getToken();

    if (!token) {
      UIController.showFeedback('Not authenticated', 'error');
      return;
    }

    const response = await fetch('/api/user/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ displayName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to update profile');
    }

    // Update localStorage with new user data
    const currentUser = Auth.getUser();
    const updatedUser = {
      ...currentUser,
      displayName: data.user.displayName
    };
    localStorage.setItem('fishermn_user_data', JSON.stringify(updatedUser));

    // Update initials
    const initialsEl = document.getElementById('profile-initials');
    if (initialsEl) {
      const initials = displayName.substring(0, 2).toUpperCase();
      initialsEl.textContent = initials;
    }

    // Show success feedback
    UIController.showFeedback('Profile updated successfully!', 'success');

    console.log('[Profile] Profile updated successfully');

  } catch (error) {
    console.error('[Profile] Save error:', error);
    UIController.showFeedback(error.message || 'Failed to save changes', 'error');
  }
}

// Load profile data when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (Auth.isAuthenticated()) {
      loadProfileData();
    }
  }, 200);

  // Add save button click handler
  const saveButton = document.querySelector('.card button.btn-primary');
  if (saveButton) {
    saveButton.addEventListener('click', saveProfileChanges);
  }
});
