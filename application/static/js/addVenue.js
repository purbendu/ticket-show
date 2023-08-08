Vue.component('venue', {
    template: `
    <div class="container mt-4">
    <h2>Add Venue</h2>
    <form @submit.prevent="saveVenue">
      <div class="form-group">
        <label for="venue">Venue Name</label>
        <input type="text" class="form-control" name="venue" placeholder="Enter venue name" v-model="venue_name" required>
      </div>
      <div class="form-group">
        <label for="location">Location</label>
        <input type="text" class="form-control" name="location" placeholder="Enter location" v-model="venue_location" required>
      </div>
      <div class="form-group">
        <label for="seat_capacity">Seat Capacity</label>
        <input type="number" class="form-control" name="seat_capacity" placeholder="Enter seat capacity" v-model="venue_seat_capacity" required>
      </div>
      <button class="btn btn-primary" type="submit">Save</button>
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
                seat_capacity: this.venue_seat_capacity
            };
        
            fetch("/addVenueAPI", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
            if (data.message === "Venue added successfully. You'll be redirected to dashboard in 5 seconds") {
                this.flashMessage = data.message;
                // this.clearForm();
            } else {
                this.flashMessage = "Duplicate Venue";
            }
            })
            .catch(error => console.error(error));
        },
        clearForm() {
            this.venue_name = '';
            this.venue_location = '';
            this.venue_seat_capacity = '';
        },    
    },
    
    watch: {
        flashMessage(newValue) {
          if (newValue === "Venue added successfully. You'll be redirected to dashboard in 5 seconds") {
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
