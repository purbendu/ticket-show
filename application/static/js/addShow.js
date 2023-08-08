Vue.component('show', {
    props: ['venueid'],
    template: `
    <div class="container mt-4">
            <h2>Add Show</h2>
            <form @submit.prevent="saveShow">
                <div class="form-group">
                    <label for="show-name">Name of Show</label>
                    <input type="text" class="form-control" id="show-name" v-model="show_name" placeholder="Enter name of show" required>
                </div>
                <div class="form-group">
                    <label for="ticket-price">Ticket Price</label>
                    <input type="number" class="form-control" id="ticket-price" v-model="ticket_price" placeholder="Enter ticket price" required>
                </div>
                <div class="form-group">
                    <label for="start-time">Start Time</label>
                    <input type="time" class="form-control" id="start-time" v-model="start_time" required>
                </div>
                <div class="form-group">
                    <label for="end-time">End Time</label>
                    <input type="time" class="form-control" id="end-time" v-model="end_time" required>
                </div>
                <div class="form-group">
                    <label for="tags">Tags [Enter multiple tags, separated by space]</label>
                    <input type="text" class="form-control" id="tags" v-model="tags" placeholder="Enter tags">
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
    data :function() {
      return {
        venue_id: this.venueid,
        show_name: '',
        ticket_price: null,
        start_time: '',
        end_time: '',
        tags: '',
        flashMessage: ''
      };
    },
    methods: {
        saveShow :function() {
            const data = {
                nameOfShow: this.show_name,
                ticketPrice: this.ticket_price,
                startTime: this.start_time,
                endTime: this.end_time,
                tags: this.tags
            };
    
            fetch(`/addShowAPI/${this.venue_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Show added successfully. You'll be redirected to dashboard in 5 seconds") {
                    this.flashMessage = data.message;
                    // this.show_name = '';
                    // this.ticket_price = null;
                    // this.start_time = '';
                    // this.end_time = '';
                    // this.tags = '';
                } 
                else {
                    this.flashMessage = "Duplicate Show";
                }
            })
            .catch(error => console.error(error));
        },
    },
    watch: {
        flashMessage(newValue) {
          if (newValue === "Show added successfully. You'll be redirected to dashboard in 5 seconds") {
            setTimeout(() => {
              this.flashMessage = '';
              window.location.href = '/adminDashboard'; 
            }, 5000);
          }
        }
    },
});
  
  new Vue({
    el: "#app",
  });
  