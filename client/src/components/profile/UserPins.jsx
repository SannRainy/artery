// client/src/components/profile/UserPins.jsx
import Masonry from 'react-masonry-css';
import PinCard from '../pins/PinCard';

const UserPins = ({ pins, onPinClick }) => { 
  if (!pins || pins.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>Belum ada pin yang dibuat.</p>
      </div>
    );
  }

  
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="masonry-grid" 
      columnClassName="masonry-grid_column" 
    >
      {pins.map((pin, index) => (
        
        <div key={pin.id} onClick={() => onPinClick(pin)}>
          <PinCard pin={pin} index={index} />
        </div>
      ))}
    </Masonry>
  );
};

export default UserPins;