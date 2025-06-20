import { Link } from 'react-router-dom';

const RideCard = ({ id, from, to, date, time, seats, price, driverName, carModel }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {from} → {to}
            </h3>
            <p className="text-sm text-gray-500">{driverName}</p>
            <p className="text-sm text-gray-500">{carModel}</p>
          </div>
          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {seats} seat{seats !== 1 ? 's' : ''} left
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Date</p>
            <p className="text-gray-900">{date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Time</p>
            <p className="text-gray-900">{time}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900">${price}</span>
          <Link
            to={`/rides/${id}`}
            className="text-primary-600 hover:text-primary-800 font-medium"
          >
            View details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RideCard;