Vue.component('rating', {
    props: ['booking_id', 'name_of_show', 'venue_name', 'user_rating'],
    template: `
    <div class="text-center">
        <h2>Rate for {{ name_of_show }} at {{ venue_name }}</h2>
        <br><br>
        <div v-if="flashMessage">
            <ul class="flashes">
                <li>{{ flashMessage }}</li>
            </ul>
        </div>
        <br>
        <div class="venue-row">
            <form @submit.prevent="rate">
                <div class="form-group">
                    <label for="rating">What would you rate {{ name_of_show }} between 1 and 10</label>
                    <input v-if="rating > 0" type="number" class="form-control" name="rating" v-model="rating" required min="1" max="10" >
                    <input v-else type="number" class="form-control" name="rating" v-model="rating" required min="1" max="10" placeholder="Enter your rating (1-10)" >
                </div>
                <button class="btn btn-primary" type="submit">Rate!</button>
            </form>
        </div>
    </div>

    `,
    data: function() {
        return {
            rating: this.user_rating,
            flashMessage: "",
        }
    },
    methods: {
        rate: function () {
            if(this.rating < 0 || this.rating > 10) {
                this.flashMessage = "Rating must be in between 1 and 10";
                return;
            }
            const data = {
                rating: this.rating,
            };

            fetch(`/rateShowAPI/${this.booking_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if (data.error) {
                    this.flashMessage=data.error;
                } else {
                    this.flashMessage = data.message;
                }
            })
            .catch((error) => {
                
            });
        },
    },
    watch: {
        flashMessage(newValue) {
          if (newValue === "Rating updated successfully. You'll be redirected to dashboard in 5 seconds") {
            setTimeout(() => {
              this.flashMessage = '';
              window.location.href = '/userDashboard'; 
            }, 5000);
          }
        }
    }
});
    
new Vue({
    el: "#app",
});
