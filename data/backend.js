// Extended spots data with multiple cities
// Used as fallback when backend returns no results
export const spots = [
  // Amravati
  {
    id: 1, name: 'Chikhaldara Hill Station', location: 'Amravati, Maharashtra',
    fee: '50', timing: '9:00AM - 6:00PM', closed: 'Open all days',
    rating: '⭐⭐⭐⭐☆', img: 'pictures/location/chilkharldara.png'
  },
  {
    id: 2, name: 'Gavilgad Fort', location: 'Satpura Range, Amravati',
    fee: 'Free', timing: '8:00AM - 5:30PM', closed: 'Monday',
    rating: '⭐⭐⭐⭐☆', img: 'pictures/location/govilghadport.png'
  },
  {
    id: 3, name: 'Ambadevi Temple', location: 'Amravati City',
    fee: 'Free', timing: '6:00AM - 9:00PM', closed: 'Open all days',
    rating: '⭐⭐⭐⭐⭐', img: 'pictures/location/amravati.png'
  },
  {
    id: 4, name: 'Wan Wildlife Sanctuary', location: 'Amravati District',
    fee: '100', timing: '7:00AM - 5:00PM', closed: 'Tuesday',
    rating: '⭐⭐⭐⭐☆', img: 'pictures/location/chilkharldara.png'
  },
];

// Destination → image map for quick local lookups
export const destinationImages = {
  amravati: 'pictures/location/amravati.png',
  chikhaldara: 'pictures/location/chilkharldara.png',
};