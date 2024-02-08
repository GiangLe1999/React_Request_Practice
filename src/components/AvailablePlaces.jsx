import { useState } from "react";
import Places from "./Places.jsx";
import { useEffect } from "react";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";

export default function AvailablePlaces({ onSelectPlace }) {
  const [isFetching, setIsFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsFetching(true);
      try {
        const places = await fetchAvailablePlaces();

        // Đây là 1 tác vụ tốn thời gian nhưng lại không sử dụng await được
        // Vì vậy ta cần đặt setIsFetching vào trong callback của nó
        // Vì nếu đẻ setIsFetching(false) ở ngoài phạm vi callback, setIsFetching lại được thực thi quá sớm
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude
          );
          setAvailablePlaces(sortedPlaces);
          setIsFetching(false);
        });
      } catch (error) {
        // Failed to fetch places sẽ là message của object error
        setError(error);
        setIsFetching(false);
      }
    };

    fetchPlaces();
  }, []);

  // Error message sẽ là chuỗi throw từ Error: Failed to fetch places
  if (error) return <Error title="An error occured!" message={error.message} />;

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
