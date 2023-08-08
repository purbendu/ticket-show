Vue.component('bookings', {
    template: `
    <div>
    <h2>My Bookings</h2>
    <br><br>
    <div v-for="booking in bookings" :key="booking.id" class="venue-row">
      <div class="venue-title">{{ booking.venue_name }}</div>
      <div class="row">
        <div class="col">
          <p><strong>Show Name:</strong> {{ booking.show_name }}</p>
          <p><strong>Show Timing:</strong> {{ booking.show_timing }} </p>
          <p><strong>Ticket Count:</strong> {{ booking.ticket_count }}</p>
        </div>
        <div class="col">
          <div class="btn-group">
            <a :href="'/rateShow/' + booking.id"><button class="btn btn-primary">Rate Show</button> </a>
          </div>
        </div>
      </div>
    </div>
  </div>
    `,
    data: function() {
        return {
            bookings: {}
        }
    },
    methods : {
        getBookings:function() {
            fetch(`/bookingsAPI`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
            })
            .then(response => response.json())
            .then(data => {
                this.bookings = data;
            })
            .catch(error => console.error(error));
        },
    },
    mounted: function() {
        this.getBookings();
    },
})

new Vue({
    el: "#app",
});
