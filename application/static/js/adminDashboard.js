Vue.component('venue', {
    template: `
    <div>
    <h2>Venues</h2>
    
    <a :href="/addVenue/" class="btn btn-outline-primary mt-4">Create Venue</a>
    <br><br>
    <div class="venue-row" v-for="venue in venues" :key="venue.id">
      <div class="venue-title">{{ venue.name }}</div>
      <div class="venue-details">
        <p><strong>Address:</strong> {{ venue.place }}</p>
        <p><strong>Capacity:</strong> {{ venue.totalSeats }}</p>
      </div>
      <div class="btn-group">
        <a :href="'/editVenue/' + venue.id"><button class="btn btn-primary">Edit</button></a>
        <button class="btn btn-danger" @click="confirmDeleteVenue(venue.id)">Delete</button>
        <a :href="'/addShow/' + venue.id" class="btn btn-outline-primary">Create Show at {{ venue.name }}</a>
        <!-- <button class="btn btn-outline-primary" @click="getReport(venue.id)">Get Report of Running Shows at {{ venue.name }}</button>  -->
        <div v-if="flashMessage">
        <ul class="flashes">
          <li>{{ flashMessage }}</li>
        </ul>
      </div>
      </div>
      <br> <br>
      <div v-if="shows[venue.id].length > 0">
        <div v-for="show in shows[venue.id]" :key="show.id">
          <div class="show-box">
            <div class="show-title">{{ show.name }}</div>
            <div class="show-details">
              <div class="row">
                <div class="col">
                  <strong>Name:</strong> {{ show.nameOfShow }}
                </div>
                <div class="col">
                  <strong>Tags:</strong> {{ show.tags }}
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <strong>Timing:</strong> {{ show.startTime }} to {{ show.endTime }}
                </div>
                <div class="col">
                  <strong>Ticket Price:</strong> Rs.{{ show.ticketPrice }}
                </div>
              </div>
            </div>
            <div class="btn-group">
              <a :href="'/editShow/' + show.id"><button class="btn btn-primary">Edit</button></a>
              <a href="#" @click.prevent="showAnalytics($event, venue.id, show.id)" class="btn btn-primary"
  :data-ratings="JSON.stringify(ratings[venue.id][show.id])">Analytics</a>
              <a @click="confirmDeleteShow(show.id,venue.id)"><button class="btn btn-danger">Delete</button></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

    `,
    data: function() {
        return {
            venues: [],
            shows: {},
            ratings: {},
            flashMessage: '',
        }
    },
    methods : {
        fetchAdminDashboard :function() {

            fetch("/adminDashboardAPI")
                .then((response) => response.json())
                .then((data) => {
                    this.venues = data.venues;
                    this.shows = data.shows;
                    this.ratings = data.ratings;
                })
                .catch((error) => console.error(error));
        },
        confirmDeleteVenue :function(venueId) {
            if (confirm("Are you sure you want to delete this venue?")) {
                window.location.href = '/deleteVenue/' + venueId;
            }
        },
        confirmDeleteShow :function(showId, venueId) {
            if (confirm("Are you sure you want to delete this show?")) {
                window.location.href = '/deleteShow/' + showId
            }
        },
        getReport :function(venueId) {
          this.flashMessage = 'Your CSV file will be downloaded shortly';
          fetch(`/generateReport/${venueId}`)
                .then((response) => response.json())
                .then((data) => {
                  this.flashMessage = data.message;
                })
                .catch((error) => console.error(error));
        },
        showAnalytics :function(venueId, showId) {
            const button = event.currentTarget;
            const previousChartContainer = document.querySelector('.chart-container');
            if (previousChartContainer) {
                previousChartContainer.remove();
            } else {
                const ratingsJsonStr = button.getAttribute('data-ratings');
                const ratings = JSON.parse(ratingsJsonStr);

                const ratingsData = {
                '1star': ratings[0],
                '2star': ratings[1],
                '3star': ratings[2],
                '4star': ratings[3],
                '5star': ratings[4],
                '6star': ratings[5],
                '7star': ratings[6],
                '8star': ratings[7],
                '9star': ratings[8],
                '10star': ratings[9]
                };

                const chartData = {
                labels: Object.keys(ratingsData),
                datasets: [{
                    label: 'Ratings',
                    backgroundColor: '#007bff',
                    borderColor: '#007bff',
                    borderWidth: 1,
                    data: Object.values(ratingsData)
                }]
                };

                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container mt-4';
                chartContainer.innerHTML = '<canvas id="analyticsChart" height="300"></canvas>';
                const canvas = chartContainer.querySelector('#analyticsChart');

                button.parentNode.insertBefore(chartContainer, button.nextSibling);

                new Chart(canvas, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: false,
                    scales: {
                    yAxes: [{
                        ticks: {
                        beginAtZero: true,
                        stepSize: 1
                        }
                    }]
                    }
                }
                });
            }
        },
    },
    mounted: function() {
        this.fetchAdminDashboard();
    },
    watch: {
      flashMessage(newValue) {
        if(newValue == "Successfully downloaded") {
          setTimeout(() => {
            this.flashMessage = '';
          }, 5000);
        }
        else {
          setTimeout(() => {
            this.flashMessage = '';
          }, 5000);
        }  
      }
  }
})

new Vue({
    el: "#app",
});
