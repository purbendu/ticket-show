Vue.component('register', {
    template: `
    <div class="text-center">
      <div class="jumbotron text-center cyan">
      <h2>Register</h2>
      <a class="navbar-brand cyan-link" href="/userLogin">Already have an account? Click here to Login !</a>
      </div>
    <div class="container box" style="text-align:center;">
      <form @submit.prevent="register">
        <div class="form-group">
          <input type="email" class="form-control" v-model="email" placeholder="Email" required />
          <br>
          <input type="text" class="form-control" v-model="name" placeholder="Name" required />
          <br>
          <input type="password" class="form-control" v-model="password" placeholder="Password" required />
          <br>
        </div>
        <button type="submit" class="btn btn-primary">Register</button>
      </form>
      <br /><br />
      <div v-if="flashMessage">
      {{ flashMessage }}
      </div>
    </div>
  </div>
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
