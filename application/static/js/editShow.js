Vue.component('show', {
    props: ['showid'],
    template: `
    <div class="container mt-4">
        <h2>Edit Show</h2>
        <form @submit.prevent="saveShow">
            <div class="form-group">
                <label for="show-name">Name of Show</label>
                <input type="text" class="form-control" id="show-name" name="nameOfShow" value="nameOfShow" v-model="nameOfShow" placeholder="Enter name of show" required>
            </div>
            <div class="form-group">
                <label for="ticket-price">Ticket Price</label>
                <input type="number" class="form-control" id="ticket-price" name="ticketPrice" value="ticketPrice" v-model="ticketPrice" placeholder="Enter ticket price" required>
            </div>
            <div class="form-group">
                <label for="start-time">Start Time</label>
                <input type="time" class="form-control" id="start-time" value="startTime" v-model="startTime" name="startTime" required>
            </div>
            <div class="form-group">
                <label for="end-time">End Time</label>
                <input type="time" class="form-control" id="end-time" value="endTime" v-model="endTime" name="endTime" required>
            </div>
            <div class="form-group">
                <label for="tags">Tags[Enter multiple tags, seperated by space]</label>
                <input type="text" class="form-control" id="tags" name="tags" value="tags" v-model="tags" placeholder="Enter tags" >
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
    data: function () {
        return {
            show_id: this.showid,
            nameOfShow: '',
            ticketPrice: '',
            startTime: '',
            endTime: '',
            tags: '',
            flashMessage: '',
        }
    },
    methods: {
        saveShow: function () {
            const data = {
                ticketPrice: this.ticketPrice,
                startTime: this.startTime,
                endTime: this.endTime,
                tags: this.tags,
                name: this.nameOfShow,
            };

            fetch(`/editShowAPI/${this.show_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Show details updated successfully. You'll be redirected to dashboard in 5 seconds") {
                    this.flashMessage = data.message;
                    // this.clearForm();
                }
            })
            .catch(error => console.error(error));
        },
        clearForm: function () {
            this.ticketPrice = '';
            this.startTime = '';
            this.endTime = '';
            this.tags = '';
        },
    },
    mounted: function () {
        fetch(`/editShowAPI/${this.show_id}`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((data) => {
                this.nameOfShow = data.nameOfShow;
                this.ticketPrice = data.ticketPrice;
                this.startTime = data.startTime;
                this.endTime = data.endTime;
                this.tags = data.tags;
            })
            .catch((error) => console.error(error));
    },
    watch: {
        flashMessage(newValue) {
            if (newValue === "Show details updated successfully. You'll be redirected to dashboard in 5 seconds") {
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
