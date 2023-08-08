Vue.component('venue', {
    props: ['venueid'],
    template: `
    <div class="container mt-4">
        <h2>Edit Venue</h2>
        <form @submit.prevent="saveVenue">
            <div class="form-group">
                <label for="venue">Venue Name</label>
                <input type="text" class="form-control" name="venue" placeholder="Enter venue name" v-model="venue_name" value="venue_name">
            </div>
            <div class="form-group">
                <label for="location">Location</label>
                <input type="text" class="form-control" name="location" placeholder="Enter location" v-model="venue_location" value="venue_location" required>
            </div>
            <div class="form-group">
                <label for="seat_capacity">Seat Capacity</label>
                <input type="number" class="form-control" name="seat_capacity" placeholder="Enter seat capacity" v-model="venue_seat_capacity" value="venue_seat_capacity" required>
            </div>
            <button type="submit" class="btn btn-primary">Save</button>
        </form>
        <br><br><br>
      <div v-if="flashMessage">
        <ul class="flashes">
          <li>{{ flashMessage }}</li>
        </ul>
      </div>
    </div>
    `,
    data: function() {
        return {
            venue_id: this.venueid,
            venue_name: '',
            venue_location: '',
            venue_seat_capacity: '',
            flashMessage: '',
        }
    },
    methods : {
        saveVenue :function() {
            const data = {
                venue: this.venue_name,
                location: this.venue_location,
                seat_capacity: this.venue_seat_capacity,
                venue_name: this.venue_name
            };
        
            fetch(`/editVenueAPI/${this.venue_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
            if (data.message === "Venue updated successfully. You'll be redirected to dashboard in 5 seconds") {
                this.flashMessage = data.message;
                // this.clearForm();
            }
            })
            .catch(error => console.error(error));
        },
        clearForm :function() {
          this.venue_location = '';
          this.venue_seat_capacity = '';
      }, 
    },
    mounted: function() {
      fetch(`/editVenueAPI/${this.venue_id}`, {
        method: "GET"
      })
      .then((response) => response.json())
      .then((data) => {
          this.venue_name = data.venue_name;
          this.venue_location = data.location;
          this.venue_seat_capacity = data.seat_capacity;
      })
      .catch((error) => console.error(error));
    },
    watch: {
        flashMessage(newValue) {
          if (newValue === "Venue updated successfully. You'll be redirected to dashboard in 5 seconds") {
            setTimeout(() => {
              this.flashMessage = '';
              window.location.href = '/adminDashboard'; 
            }, 5000);
          }
        }
    }
});
    
new Vue({
    el: "#app",
});
