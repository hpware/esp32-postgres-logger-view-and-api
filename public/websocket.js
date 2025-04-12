let ws;
function connect() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${wsProtocol}//${window.location.host}/logger/ws`);
    
    ws.onopen = () => console.log('Connected to WebSocket');
    ws.onclose = () => setTimeout(connect, 1000);
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        document.querySelectorAll('[data-value]').forEach(el => {
            const key = el.dataset.value;
            if (data[key]) {
                el.textContent = data[key];
                el.classList.add('updated');
                setTimeout(() => el.classList.remove('updated'), 1000);
            }
        });
    };
}

connect();