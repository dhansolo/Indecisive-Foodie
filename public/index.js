const config = {
    headers: {
        "user-key": ''
    }
};

let lat = null;
let long = null;

Vue.component('form-comp', {
    template: `
        <div>
            <form class="review-form" @submit.prevent="onSubmit">
                <p>
                    <label for="distance">How far are you willing to go?</label>
                    <input id="distance" v-model="distance" required> Miles
                </p>
                <p>
                    <label for="cuisine">Whats on your mind?</label>
                    <input id="cuisine" v-model="cuisine" required>
                </p>
                <p>
                    <input type="submit" value="Submit">  
                </p>    
            </form>
        </div>
    `,
    data() {
        return {
            distance: null,
            cuisine: null,
        }
    },
    mounted () {
        console.log(lat, long);
        axios
        .get('https://developers.zomato.com/api/v2.1/geocode?lat=' + lat + '&lon=' + long, config)
        .then(response => {
            if(response.status == 200) {
                console.log(response)
                app.location = response.data.location.city_name;
            }
        })
        .catch(error => {
            console.log(error)
        });
    },
    methods: {
        onSubmit() {
            app.restaurant_name = null;
            app.address = null;
            app.cuisines = null;
            app.results_found = false;
            app.results_not_found = false;
            let dist = this.distance * 1609.34;
            axios
            .get('https://developers.zomato.com/api/v2.1/search?lat=' + lat + '&lon=' + long + '&radius=' + dist + '&q=' + this.cuisine + '&sort=rating', config)
            .then(response => {
                let results_length = response.data.restaurants.length;
                if(results_length > 0) {
                    // console.log('https://developers.zomato.com/api/v2.1/search?lat=' + lat + '&lon=' + long + '&radius=' + dist + '&q=' + this.cuisine + '&sort=rating');
                    let rand = Math.floor(Math.random() * response.data.restaurants.length);
                    // console.log(rand);
                    // console.log(response.data.restaurants[rand].restaurant);
                    app.restaurant_name = response.data.restaurants[rand].restaurant.name;
                    app.address = response.data.restaurants[rand].restaurant.location.address;
                    app.cuisines = response.data.restaurants[rand].restaurant.cuisines;
                    app.results_found = true;
                } else {
                    app.results_not_found = true;
                }
            })
            .catch(error => {
                console.log(error)
            })
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        location: null,
        restaurant_name: null,
        address: null,
        cuisines: null,
        results_found: false,
        results_not_found : false,
        location_found: false
    },
    mounted () {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            long = position.coords.longitude;
            app.location_found = true;
        }, function(err) {
            if(err.code == err.PERMISSION_DENIED) {
                console.log('please enable location services');
            }
        })
    }
})
