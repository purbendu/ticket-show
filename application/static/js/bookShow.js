Vue.component('book', {
    props:['name_of_show','venue_name','ticket_price','user_id','show_id'],
    template: `
    <div>
    <h2>Book Tickets for {{ name_of_show }} at {{ venue_name }}</h2>
    <a :href="/userDashboard/" class="btn btn-link mt-4">See full list of shows here</a>
    <br><br>
    <div class="venue-row">
      <form @submit.prevent="bookShow">
        <div class="form-group">
          <label for="ticketPrice">Ticket Price</label>
          <input type="text" class="form-control" :value="ticket_price" disabled>
        </div>
        <div class="form-group">
          <label for="ticketCount">Number of Ticket</label>
          <input type="number" class="form-control" name="ticketCount" placeholder="Enter number of tickets" v-model="ticketCount" required>
        </div>
        <div class="form-group">
          <label for="totalCost">Total</label>
          <input type="number" class="form-control" :value="total" disabled>
        </div>
        <button class="btn btn-primary" type="submit">Book now</button>
      </form>
    </div>
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
            ticketPrice: this.ticket_price,
            ticketCount: null,
            flashMessage: '',
        }
    },
    computed : {
        total: function() {
            if(this.ticketCount && this.ticketCount > 0) return this.ticketPrice*this.ticketCount;
            else return null;
        }
    },
    methods : {
        bookShow:function() {
            const data = {
                ticketCount: this.ticketCount,
            };
            fetch(`/bookShowAPI/${this.show_id}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
            if (data.message === "Show booked successfully. You'll be redirected to dashboard in 5 seconds") {
                this.flashMessage = data.message;
            } else {
                this.flashMessage = data.error;
            }
            })
            .catch(error => console.error(error));
        },
    },
    watch: {
        flashMessage(newValue) {
          if (newValue === "Show booked successfully. You'll be redirected to dashboard in 5 seconds") {
            setTimeout(() => {
              this.flashMessage = '';
              window.location.href = '/userDashboard'; 
            }, 5000);
          }
        }
    }
})

new Vue({
    el: "#app",
});
