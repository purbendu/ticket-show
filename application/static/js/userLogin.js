Vue.component('login', {
    template: `
    <div class="text-center">
    
    <div class="jumbotron text-center cyan">
    <h2>User Login</h2>
    <h6>Enter Email: pqr@gmail.com</h6>
    <h6>Enter password: 1234</h6>
    <a class="navbar-brand cyan-link" href="/register"> Don't have a account yet ? Click here to Register !</a>
    </div>
    <br> <br> 
    <div class="container box" style="text-align:center;">
    <form @submit.prevent="login">
        <input type="email" class="form-control" v-model="email" placeholder="Email" required>
    <br>
        <input type="password" class="form-control" v-model="password" placeholder="Password" required>
    <br>
        <button type="submit" class="btn btn-primary">Login</button>
    </form>
    </div>
    <div v-if="flashMessage">
    {{ flashMessage }}
    </div>
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
