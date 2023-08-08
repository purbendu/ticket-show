Vue.component('login', {
    template: `
    <div class="text-center">
    <main class="form-signin">
        <h1 align="text-center">
            TicketShow
        </h1>
        <br><br>
        <div v-if="flashMessage">
            <ul class="flashes">
                <li>{{ flashMessage }}</li>
            </ul>
        </div>
        <form @submit.prevent="login">
            <h1 class="h3 mb-3 fw-normal">Login</h1>
            <div class="form-floating d-flex justify-content-center align-items-center">
                <div class="form-group">
                    <input type="email" class="form-control" v-model="email" placeholder="Email" required>
                </div>
            </div>
        <br>
            <div class="form-floating d-flex justify-content-center align-items-center">
                <div class="form-group">
                    <input type="password" class="form-control" v-model="password" placeholder="Password" required>
                </div>
            </div>
        <br>

            <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <br><br>
        <a :href="/register/">Don't have an account? Register here</a>
    </main>
</div>

    `,
    data: function() {
        return {
            email: "",
            password: "",
            wrongCredentials: 0,
            flashMessage: "",
        }
    },
    methods: {
        login: function () {
            const data = {
                email: this.email,
                password: this.password,
            };

            fetch("/userloginAPI", {
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
                    this.flashMessage = "Login successful";
                    this.wrongCredentials = 0;
                    window.location.href = "/userDashboard";
                }
            })
            .catch((error) => {
                
            });
        },
    },
    watch: {
        flashMessage(newValue) {
          if (newValue === "Login successful") {
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
