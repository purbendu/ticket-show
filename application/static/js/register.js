Vue.component('register', {
    template: `
    <body class="text-center">
    <main class="form-signin">
      <h1 align="text-center">TicketShow</h1>
      <br /><br />
      </div>
      <form @submit.prevent="register">
        <h1 class="h3 mb-3 fw-normal">Register</h1>
        <div class="form-floating d-flex justify-content-center align-items-center">
          <div class="form-group">
            <input type="email" class="form-control" v-model="email" placeholder="Email" required />
          </div>
        </div>
        <br>

        <div class="form-floating d-flex justify-content-center align-items-center">
          <div class="form-group">
            <input type="text" class="form-control" v-model="name" placeholder="Name" required />
          </div>
        </div>
        <br>
        <div class="form-floating d-flex justify-content-center align-items-center">
          <div class="form-group">
            <input type="password" class="form-control" v-model="password" placeholder="Password" required />
          </div>
        </div>
        <br>

        <div class="d-flex justify-content-center align-items-center">
          <button type="submit" class="btn btn-primary">Register</button>
        </div>
      </form>
      <br /><br />
      <div v-if="flashMessage">
        <ul class="flashes">
          <li>{{ flashMessage }}</li>
        </ul>
      </div>
      <a href="#" style="text-align: center;">Already have an account? Login here</a>
    </main>
  </body>
    `,
    data: function() {
        return {
            email: "",
            password: "",
            name: "",
            flashMessage: "",
        }
    },
    methods: {
        register: function () {
            const data = {
                email: this.email,
                password: this.password,
                name: this.name,
            };

            fetch("/registerAPI", {
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
                    this.flashMessage = "Registered successful";
                    this.wrongCredentials = 0;
                    window.location.href = "/userLogin/";
                }
            })
            .catch((error) => {
                
            });
        },
    },
});
    
new Vue({
    el: "#app",
});
