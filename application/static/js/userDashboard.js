Vue.component('user_dashboard', {
    template: `
    <div>
    <h2>Available Shows</h2>
    <br>
        <div class="form-floating d-flex justify-content align-items-center">
            <div class="form-group">
                <input type="text" class="form-control" v-model="search" placeholder="Search">
            </div>
        </div>
        <br><br>
        <div v-for="venue in venues" v-if="shows[venue.id] && shows[venue.id].length > 0" class="venue-row">
            <div class="venue-title">{{ venue.name }}</div>
            <div class="venue-details">
                <p><strong>Address:</strong> {{ venue.place }}</p>
            </div>
                <div v-for="show in shows[venue.id]" class="show-box">
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
                                <strong>Ticket Price:</strong> Rs. {{ show.ticketPrice }}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div v-if="venue.totalSeats - show.bookedSeats > 0"> <strong >Seats Left:</strong> {{  venue.totalSeats - show.bookedSeats }} </div>
                                <div v-else><strong>HOUSEFULL!!</strong></div>
                            </div>
                            <div class="col">
                                <strong>User Rating:</strong> {{ ratings[venue.id][show.id] }}
                            </div>
                        </div>
                    </div>
                    <div class="btn-group">
                        <a :href="'/bookShow/' + show.id" >
                            <button class="btn btn-primary" v-if="venue.totalSeats - show.bookedSeats > 0" >Book</button>
                            <button class="btn btn-primary" v-else disabled>Book</button>
                        </a>
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
            search: null,
        }
    },
    methods : {
        fetchUserDashboard :function() {
            fetch("/userDashboardAPI")
                .then((response) => response.json())
                .then((data) => {
                    this.venues = data.venues;
                    this.shows = data.shows;
                    this.ratings = data.ratings;
                })
                .catch((error) => console.error(error));
        }
    },
    mounted: function() {
        this.fetchUserDashboard();
    },
    watch: {
        search(query) {
            if(query == "") {
                this.fetchUserDashboard();
            }
            else {
                fetch(`/search/${query}`)
                .then((response) => response.json())
                .then((data) => {
                    this.venues = data.venues;
                    this.shows = data.shows;
                    this.ratings = data.ratings;
                })
                .catch((error) => console.error(error));
            }
            
        },
    },
})

new Vue({
    el: "#app",
});
