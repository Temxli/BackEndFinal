// teams.js

async function fetchTeams() {
    const options = {
        method: 'GET',
        url: 'https://api-football-v1.p.rapidapi.com/v3/teams',
        params: {
            league: '39', // Premier League ID
            season: '2023', // Season year
            // No search query
        },
        headers: {
            'X-RapidAPI-Key': 'b9f5e56577msh741fd069f34a2ffp1ca5efjsn0ec3bf1ad2dc',
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        displayTeams(response.data.response);
    } catch (error) {
        console.error(error);
    }
}

function displayTeams(teams) {
    const teamsList = document.getElementById('teamsList');

    teams.slice(0, 5).forEach(team => { // Limit to 5 teams
        const teamCard = document.createElement('div');
        teamCard.classList.add('col-md-3', 'mb-4'); // Adjusted grid classes

        const cardBody = document.createElement('div');
        cardBody.classList.add('card', 'h-100');

        const logoImg = document.createElement('img');
        logoImg.classList.add('card-img-top');
        logoImg.src = team.team.logo;

        const cardTitle = document.createElement('h5');
        cardTitle.classList.add('card-title', 'text-center', 'mt-3');
        cardTitle.textContent = team.team.name;

        const venueInfo = document.createElement('div');
        venueInfo.classList.add('text-center', 'mt-3');
        venueInfo.innerHTML = `
      <p><strong>Venue:</strong> ${team.venue.name}</p>
      <p><strong>Address:</strong> ${team.venue.address}, ${team.venue.city}</p>
      <p><strong>Capacity:</strong> ${team.venue.capacity}</p>
    `;

        cardBody.appendChild(logoImg);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(venueInfo);

        teamCard.appendChild(cardBody);
        teamsList.appendChild(teamCard);
    });
}


fetchTeams();
