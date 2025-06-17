// client/src/components/profile/UserPins.jsx
import Masonry from 'react-masonry-css';
import PinCard from '../pins/PinCard';

const UserPins = ({ pins, onPinClick }) => { // <-- Terima onPinClick
  if (!pins || pins.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>Belum ada pin yang dibuat.</p>
      </div>
    );
  }

  // Konfigurasi breakpoint untuk masonry layout
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="masonry-grid" // Class dari global.css
      columnClassName="masonry-grid_column" // Class dari global.css
    >
      {pins.map((pin, index) => (
        // Bungkus dengan div yang memiliki event onClick
        <div key={pin.id} onClick={() => onPinClick(pin)}>
          <PinCard pin={pin} index={index} />
        </div>
      ))}
    </Masonry>
  );
};

export default UserPins;