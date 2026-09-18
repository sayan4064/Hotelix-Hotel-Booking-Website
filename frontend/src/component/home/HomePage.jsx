import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../service/ApiService";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";

const HomePage = () => {
    const [featuredRooms, setFeaturedRooms] = useState([]);
    const [roomSearchResults, setRoomSearchResults] = useState([]);

    useEffect(() => {
        const fetchFeaturedRooms = async () => {
            try {
                const response = await ApiService.getAllRooms();
                if (response.roomList && response.roomList.length > 0) {
                    setFeaturedRooms(response.roomList.slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching featured rooms:", error.message);
            }
        };

        fetchFeaturedRooms();
    }, []);

    const handleSearchResult = (results) => {
        setRoomSearchResults(results);
    };

    const displayRooms = roomSearchResults.length > 0 ? roomSearchResults : featuredRooms;
    const isSearchActive = roomSearchResults.length > 0;

    return (
        <div className="home">
            <section>
                <header className="header-banner">
                    <img src="./assets/images/hotel.webp" alt="Hotelix" className="header-image" />
                    <div className="overlay"></div>
                    <div className="animated-texts overlay-content">
                        <h1>
                            Welcome to <span className="hotelix-color">Hotelix</span>
                        </h1>
                        <br />
                        <h3>Step into a haven of comfort and care</h3>
                    </div>
                </header>
            </section>

            <RoomSearch handleSearchResult={handleSearchResult} />

            <div className="featured-rooms-header">
                <h2>{isSearchActive ? "Search Results" : "Featured Luxury Suites"}</h2>
                <Link to="/rooms" className="view-rooms-home">
                    View All Rooms &rarr;
                </Link>
            </div>

            <RoomResult roomSearchResults={displayRooms} />

            <h2 className="home-services">
                Services at <span className="hotelix-color">Hotelix</span>
            </h2>

            <section className="service-section">
                <div className="service-card">
                    <img src="./assets/images/ac.png" alt="Air Conditioning" />
                    <div className="service-details">
                        <h3 className="service-title">Air Conditioning</h3>
                        <p className="service-description">
                            Stay cool and comfortable throughout your stay with our individually controlled in-room air conditioning.
                        </p>
                    </div>
                </div>

                <div className="service-card">
                    <img src="./assets/images/mini-bar.png" alt="Mini Bar" />
                    <div className="service-details">
                        <h3 className="service-title">Mini Bar</h3>
                        <p className="service-description">
                            Enjoy a convenient selection of beverages and snacks stocked in your room's mini bar with no additional cost.
                        </p>
                    </div>
                </div>

                <div className="service-card">
                    <img src="./assets/images/parking.png" alt="Parking" />
                    <div className="service-details">
                        <h3 className="service-title">Parking</h3>
                        <p className="service-description">
                            We offer on-site parking for your convenience. Please inquire about valet parking options if available.
                        </p>
                    </div>
                </div>

                <div className="service-card">
                    <img src="./assets/images/wifi.png" alt="WiFi" />
                    <div className="service-details">
                        <h3 className="service-title">WiFi</h3>
                        <p className="service-description">
                            Stay connected throughout your stay with complimentary high-speed Wi-Fi access available in all guest rooms and public areas.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;