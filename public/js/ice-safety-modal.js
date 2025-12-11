/**
 * Ice Safety Modal Controller
 * Displays ice safety guidelines and disclaimers
 */

const IceSafetyModal = {
  /**
   * Open modal
   */
  open() {
    const modal = document.getElementById('ice-safety-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  /**
   * Close modal
   */
  close() {
    const modal = document.getElementById('ice-safety-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    document.body.style.overflow = '';
  }
};

// Make globally available
window.IceSafetyModal = IceSafetyModal;

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    IceSafetyModal.close();
  }
});
