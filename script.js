const apiKey = '065cbaa6bff1f2075375b29a313f827c'; //chave api minha, se for mecher avisa antes se n caga td o site

function buscarTempo() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        alert('Por favor, digite uma cidade!');
        return;
    }

    buscarDados(city);
}

function buscarDados(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Cidade não encontrada');
            }
            return response.json();
        })
        .then(data => atualizarTela(data))
        .catch(error => {
            alert('Erro: ' + error.message);
        });
}

function atualizarTela(data) {
    document.getElementById('cityName').innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').innerText = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('feels_like').innerText = `Sensação: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('wind').innerText = `${data.wind.speed} m/s`;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    document.getElementById('visibility').innerText = `${data.visibility / 1000} km`;
}
// Atualização automática a cada 5 minutos (300000 ms)
setInterval(() => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        buscarDados(city);
    }
}, 300000);

