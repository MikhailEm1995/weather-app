const userLocation = {
    userLocation: undefined,

    getLocation: function () {
        let self = this;

        if ('geolocation' in navigator) {
            let position = {};

            navigator.geolocation.getCurrentPosition((pos) => {
                let crd = pos.coords;

                position.latitude = crd.latitude.toFixed(2);
                position.longitude = crd.longitude.toFixed(2);

                self.userLocation = position;
                self.fire('location', [[self.userLocation.latitude, self.userLocation.longitude], 'main']);
            }, function () {
                self.fire('rejected', false);
            });
        } else {
            self.fire('no-location', false);
        }
    }
};

export default userLocation;
