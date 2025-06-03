import PinCard from '../pins/PinCard'; //

const UserPins = ({ pins }) => { //
  if (!pins || pins.length === 0) { //
    return (
      <div className="text-center py-8 text-gray-500">
        No pins found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {pins.map((pin) => ( //
        <PinCard key={pin.id} pin={pin} /> //
      ))}
    </div>
  );
};

export default UserPins;