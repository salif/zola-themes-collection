async function setupPeriodicSync() {
    if ('Notification' in window && Notification.permission !== 'granted') await Notification.requestPermission();
    const reg = await navigator.serviceWorker.ready;
    if ('periodicSync' in reg) {
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
        if (status.state === 'granted') {
            await reg.periodicSync.register('check-latest-poem', {
                minInterval: 24 * 1000, // check every once a day
                tag: 'check-latest-poem',
                headers: {
                    'Content-Type': 'text/xml',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            console.log('Periodic sync set up.');
            alert('Periodic background sync is set up. You will receive notifications for new poems.');
        } else {
            console.warn('Periodic background sync permission:', status.state);
            alert('Periodic background sync permission is not granted. You will not receive notifications for new poems.');
        }

    } else console.warn('Periodic background sync not supported.');
}
window.addEventListener('appinstalled', () => Notification.permission == 'default' && setupPeriodicSync());
window.addEventListener('load', async () => (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) && Notification.permission == 'default' && setupPeriodicSync());
