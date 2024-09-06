export const getLocation = (_) => {
	return new Promise((resolve, reject) => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(err) => {
					reject(err);
				},
				{
					enableHighAccuracy: true,
					maximumAge: 0,
				}
			);
		} else {
			reject("Geolocation is not supported by this browser.");
		}
	});
};
