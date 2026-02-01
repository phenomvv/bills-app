// Simplified long-press implementation
const attachItemEvents = (root) => {
    let longPressTimer = null;
    let touchStartPos = { x: 0, y: 0 };
    let hasMoved = false;

    root.querySelectorAll('.subscription-item').forEach(item => {
        const subId = parseInt(item.dataset.id);

        // Click to open detail view
        item.addEventListener('click', (e) => {
            if (!hasMoved) {
                openDetailView(subId);
            }
        });

        // Long press for mobile
        item.addEventListener('touchstart', (e) => {
            hasMoved = false;
            touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

            longPressTimer = setTimeout(() => {
                if (!hasMoved) {
                    // Haptic feedback
                    if (navigator.vibrate) navigator.vibrate(50);

                    const sub = state.subscriptions.find(s => s.id === subId);
                    if (sub) {
                        // Show simple confirm dialog
                        const shouldDelete = confirm(`${sub.name}\n\nDo you want to delete this subscription?`);
                        if (shouldDelete) {
                            deleteSubscription(subId);
                        } else {
                            // If they cancel delete, offer to edit
                            const shouldEdit = confirm(`Edit ${sub.name} instead?`);
                            if (shouldEdit) {
                                state.editingId = subId;
                                navigate('edit');
                            }
                        }
                    }
                }
            }, 600);
        }, { passive: true });

        item.addEventListener('touchmove', (e) => {
            const dx = Math.abs(e.touches[0].clientX - touchStartPos.x);
            const dy = Math.abs(e.touches[0].clientY - touchStartPos.y);

            if (dx > 10 || dy > 10) {
                hasMoved = true;
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        }, { passive: true });

        item.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });

        item.addEventListener('touchcancel', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            hasMoved = false;
        }, { passive: true });
    });

    if (window.lucide) window.lucide.createIcons();
};
