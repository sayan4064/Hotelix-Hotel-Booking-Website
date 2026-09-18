import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const RoomDetailsPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomDetails, setRoomDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getRoomById(roomId);
        setRoomDetails(response.room);
        const userProfile = await ApiService.getUserProfile();
        if (userProfile && userProfile.user) {
          setUserId(userProfile.user.id);
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  const handleConfirmBooking = async () => {
    if (!checkInDate || !checkOutDate) {
      setErrorMessage('Please select check-in and check-out dates.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    if (isNaN(numAdults) || numAdults < 1 || isNaN(numChildren) || numChildren < 0) {
      setErrorMessage('Please enter valid numbers for adults and children.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const totalDays = Math.round(Math.abs((endDate - startDate) / oneDay)) + 1;
    const totalGuests = numAdults + numChildren;
    const roomPricePerNight = roomDetails.roomPrice;
    const totalPrice = roomPricePerNight * totalDays;

    setTotalPrice(totalPrice);
    setTotalGuests(totalGuests);
  };

  const acceptBooking = async () => {
    try {
      const startDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);

      const formattedCheckInDate = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const formattedCheckOutDate = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

      const booking = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formattedCheckOutDate,
        numOfAdults: numAdults,
        numOfChildren: numChildren
      };

      const response = await ApiService.bookRoom(roomId, userId, booking);
      if (response.statusCode === 200) {
        setConfirmationCode(response.bookingConfirmationCode);
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
          navigate('/rooms');
        }, 10000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (isLoading) {
    return <p className='room-detail-loading'>Loading room details...</p>;
  }

  if (error) {
    return <p className='room-detail-loading'>{error}</p>;
  }

  if (!roomDetails) {
    return <p className='room-detail-loading'>Room not found.</p>;
  }

  const { roomType, roomPrice, roomPhotoUrl, roomDescription, description, bookings } = roomDetails;

  return (
    <div className="room-details-booking">
      {showMessage && (
        <p className="booking-success-message">
          Booking successful! Confirmation code: {confirmationCode}. An SMS and email of your booking details have been sent to you.
        </p>
      )}
      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}
      <h2>Room Details</h2>
      <img
        src={roomPhotoUrl}
        alt={roomType}
        className="room-details-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/assets/images/default_room.jpg';
        }}
      />
      <div className="room-details-info">
        <h3>{roomType}</h3>
        <p className="room-price-tag">Price: ${roomPrice} / night</p>
        <p className="room-desc-text">{roomDescription || description}</p>
      </div>

      {bookings && bookings.length > 0 && (
        <div className="existing-bookings-section">
          <h3>Existing Booking Details</h3>
          <ul className="booking-list">
            {bookings.map((booking, index) => (
              <li key={booking.id || index} className="booking-item">
                <span className="booking-number">Booking {index + 1}: </span>
                <span className="booking-text">Check-in: {booking.checkInDate} | </span>
                <span className="booking-text">Out: {booking.checkOutDate}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="booking-info">
        {!showDatePicker ? (
          <div className="booking-action-buttons">
            <button className="book-now-button" onClick={() => setShowDatePicker(true)}>
              Book This Room
            </button>
            <button className="go-back-button" onClick={() => navigate('/rooms')}>
              &larr; Back to Rooms
            </button>
          </div>
        ) : (
          <div className="date-picker-container">
            <h3>Select Reservation Dates &amp; Guests</h3>
            <div className="date-picker-row">
              <div className="date-picker-field">
                <label>Check-in Date</label>
                <DatePicker
                  className="detail-search-field"
                  selected={checkInDate}
                  onChange={(date) => setCheckInDate(date)}
                  selectsStart
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  placeholderText="Check-in Date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="date-picker-field">
                <label>Check-out Date</label>
                <DatePicker
                  className="detail-search-field"
                  selected={checkOutDate}
                  onChange={(date) => setCheckOutDate(date)}
                  selectsEnd
                  startDate={checkInDate}
                  endDate={checkOutDate}
                  minDate={checkInDate}
                  placeholderText="Check-out Date"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            </div>

            <div className='guest-container'>
              <div className="guest-div">
                <label>Adults:</label>
                <input
                  type="number"
                  min="1"
                  value={numAdults}
                  onChange={(e) => setNumAdults(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="guest-div">
                <label>Children:</label>
                <input
                  type="number"
                  min="0"
                  value={numChildren}
                  onChange={(e) => setNumChildren(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="booking-form-buttons">
              <button className="confirm-booking" onClick={handleConfirmBooking}>
                Calculate Total
              </button>
              <button 
                className="go-back-button" 
                onClick={() => {
                  setShowDatePicker(false);
                  setTotalPrice(0);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {totalPrice > 0 && (
          <div className="total-price">
            <p><strong>Total Price:</strong> ${totalPrice}</p>
            <p><strong>Total Guests:</strong> {totalGuests}</p>
            <button onClick={acceptBooking} className="accept-booking">
              Confirm &amp; Finalize Booking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;