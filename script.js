const apiKey = '065cbaa6bff1f2075375b29a313f827c';

// 👉 Função para buscar clima digitando cidade
function buscarTempo() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        alert('Por favor, digite uma cidade!');
        return;
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Cidade não encontrada.');
            }
            return response.json();
        })
        .then(data => {
            atualizarClima(data);
        })
        .catch(error => {
            alert('Erro: ' + error.message);
        });
}

// 👉 Função para atualizar o HTML com os dados do tempo
function atualizarClima(data) {
    document.getElementById('cityName').innerText = data.name;
    document.getElementById('temperature').innerText = `${data.main.temp}°C`;
    document.getElementById('description').innerText = data.weather[0].description;
    document.getElementById('feels_like').innerText = `Sensação: ${data.main.feels_like}°C`;
    document.getElementById('wind').innerText = `${data.wind.speed} m/s`;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('pressure').innerText = `${data.main.pressure} hPa`;
    document.getElementById('visibility').innerText = `${(data.visibility / 1000).toFixed(1)} km`;
}

// 👉 Função para usar a localização do usuário
function usarLocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;

                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Não foi possível obter o clima pela localização.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        atualizarClima(data);
                    })
                    .catch(error => {
                        alert('Erro: ' + error.message);
                    });
            },
            (error) => {
                alert('Erro ao obter localização: ' + error.message);
            }
        );
    } else {
        alert('Geolocalização não é suportada no seu navegador.');
    }
}
