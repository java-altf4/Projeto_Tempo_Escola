const apiKey = '065cbaa6bff1f2075375b29a313f827c';

async function buscarTempo() {
    const cidade = document.getElementById('cityInput').value;
    if (!cidade) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            fetch(url),
            fetch(forecastUrl)
        ]);

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        atualizarClima(weatherData);
        atualizarPrevisao(forecastData, weatherData);
    } catch (error) {
        console.error('Erro ao buscar o clima:', error);
    }
}

async function usarLocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=pt_br`;

            try {
                const [weatherResponse, forecastResponse] = await Promise.all([
                    fetch(url),
                    fetch(forecastUrl)
                ]);

                const weatherData = await weatherResponse.json();
                const forecastData = await forecastResponse.json();

                atualizarClima(weatherData);
                atualizarPrevisao(forecastData, weatherData);
            } catch (error) {
                console.error('Erro ao buscar localização:', error);
            }
        });
    } else {
        alert("Geolocalização não é suportada pelo seu navegador.");
    }
}

function atualizarClima(data) {
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feels_like').textContent = `Sensação: ${Math.round(data.main.feels_like)}°C`;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
}

function atualizarPrevisao(forecastData, weatherData) {
    const hourlyDiv = document.getElementById('hourlyForecast');
    const dailyDiv = document.getElementById('dailyForecast');

    hourlyDiv.innerHTML = '';
    dailyDiv.innerHTML = '';

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hoje = new Date();
    const diaAtual = hoje.getDay();

    // Previsão por hora (próximas 24 horas)
    for (let i = 0; i < Math.min(24, forecastData.list.length); i++) {
        const infoHora = forecastData.list[i];
        const hora = new Date(infoHora.dt * 1000).getHours();
        const temperatura = Math.round(infoHora.main.temp);
        const icone = infoHora.weather[0].icon;

        const elementoHora = document.createElement('div');
        elementoHora.className = 'hora';
        
        const img = document.createElement('img');
        img.src = `https://openweathermap.org/img/wn/${icone}@2x.png`;
        img.alt = "Ícone do clima";
        aplicarAnimacaoIcone(img, icone);

        elementoHora.innerHTML = `<p>${hora}h</p>`;
        elementoHora.appendChild(img);
        elementoHora.innerHTML += `<p>${temperatura}°C</p>`;
        
        hourlyDiv.appendChild(elementoHora);
    }

    // Previsão semanal
    const datasEncontradas = {};

    for (let i = 0; i < forecastData.list.length; i++) {
        const item = forecastData.list[i];
        const dataObj = new Date(item.dt * 1000);
        const dia = dataObj.getDate();
        const hora = dataObj.getHours();

        if (!datasEncontradas[dia]) {
            datasEncontradas[dia] = { ideal: null, qualquer: null };
        }

        if (hora >= 11 && hora <= 14 && datasEncontradas[dia].ideal === null) {
            datasEncontradas[dia].ideal = i;
        }

        if (datasEncontradas[dia].qualquer === null) {
            datasEncontradas[dia].qualquer = i;
        }
    }

    const diaIndices = [];
    for (const dia in datasEncontradas) {
        if (datasEncontradas[dia].ideal !== null) {
            diaIndices.push(datasEncontradas[dia].ideal);
        } else if (datasEncontradas[dia].qualquer !== null) {
            diaIndices.push(datasEncontradas[dia].qualquer);
        }
    }

    let tabela = `
    <table class="tabela-previsao">
        <thead>
            <tr>
                <th>Dia</th>
                <th>Tempo</th>
                <th>Temp. Mín</th>
                <th>Temp. Máx</th>
            </tr>
        </thead>
        <tbody>
    `;

    // Hoje
    const nomeHoje = diasSemana[diaAtual];
    const iconeHoje = weatherData.weather[0].icon;
    const tempMinHoje = Math.round(weatherData.main.temp_min || weatherData.main.temp);
    const tempMaxHoje = Math.round(weatherData.main.temp_max || weatherData.main.temp);

    tabela += `
        <tr>
            <td>${nomeHoje} (Hoje)</td>
            <td><img src="https://openweathermap.org/img/wn/${iconeHoje}@2x.png" alt="Ícone do clima" width="40" class="weather-icon"></td>
            <td>${tempMinHoje}°C</td>
            <td>${tempMaxHoje}°C</td>
        </tr>
    `;

    // Próximos dias
    for (let i = 0; i < 5; i++) {
        const index = diaIndices[i];
        const nomeDia = diasSemana[(diaAtual + i + 1) % 7];

        if (index !== undefined) {
            const infoDia = forecastData.list[index];
            const tempMinima = Math.round(infoDia.main.temp_min);
            const tempMaxima = Math.round(infoDia.main.temp_max);
            const icone = infoDia.weather[0].icon;

            tabela += `
            <tr>
                <td>${nomeDia}</td>
                <td><img src="https://openweathermap.org/img/wn/${icone}@2x.png" alt="Ícone do clima" width="40" class="weather-icon"></td>
                <td>${tempMinima}°C</td>
                <td>${tempMaxima}°C</td>
            </tr>
            `;
        } else {
            tabela += `
            <tr>
                <td>${nomeDia}</td>
                <td>--</td>
                <td>--°C</td>
                <td>--°C</td>
            </tr>
            `;
        }
    }

    tabela += `
        </tbody>
    </table>
    `;

    dailyDiv.innerHTML = tabela;

    // Aplicar animação nos ícones da previsão semanal
    document.querySelectorAll('#dailyForecast img').forEach(img => {
        const src = img.src;
        const iconName = src.match(/\/(\w+)\@/)[1];
        aplicarAnimacaoIcone(img, iconName);
    });
}

// Função para aplicar animação baseada no ícone
function aplicarAnimacaoIcone(imgElement, weatherIcon) {
    imgElement.classList.remove('icon-clear-day', 'icon-clouds', 'icon-rain');

    if (weatherIcon.includes('01')) {
        imgElement.classList.add('icon-clear-day');
    } else if (weatherIcon.includes('02') || weatherIcon.includes('03') || weatherIcon.includes('04')) {
        imgElement.classList.add('icon-clouds');
    } else if (weatherIcon.includes('09') || weatherIcon.includes('10')) {
        imgElement.classList.add('icon-rain');
    }
}
