let socket;
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';
recognition.interimResults = false;
recognition.continuous = true;

function connectWebSocket() {
  socket = new WebSocket('ws://localhost:49154/');

  socket.onopen = function(event) {
    console.log('Conectado al servidor WebSocket');
    keepConnectionAlive(); // Iniciar el envío de espacios en blanco
  };

  socket.onmessage = function(event) {
    console.log('Mensaje del servidor:', event.data);
  };

  socket.onclose = function(event) {
    console.log('Conexión cerrada, intentando reconectar...');
    setTimeout(connectWebSocket, 1000); // Intentar reconectar después de 1 segundo
  };

  socket.onerror = function(event) {
    console.error('Error en la conexión WebSocket:', event);
  };
}

function keepConnectionAlive() {
  setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(' '); // Enviar un espacio en blanco
    }
  }, 5000); // Cada 5 segundos
}

recognition.onresult = (event) => {
  const transcript = event.results[event.resultIndex][0].transcript;
  console.log('Reconocido:', transcript);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(transcript);
  } else {
    console.warn('No se pudo enviar el mensaje, WebSocket no está conectado');
  }
};

recognition.onerror = (event) => {
  console.error('Error en el reconocimiento de voz:', event.error);
  recognition.stop();
  setTimeout(() => recognition.start(), 1000); // Reiniciar reconocimiento después de 1 segundo
};

recognition.onend = () => {
  console.log('Reconocimiento de voz finalizado, reiniciando...');
  recognition.start(); // Reiniciar reconocimiento si se cierra
};

recognition.start();
connectWebSocket();
