import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect } from "react";
import { GoogleMapApiKey } from "@/src/utils/Apis";

const defaultRegion = {
    latitude: 22.9734,
    longitude: 78.6569,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

type Props = {
    city: string;
    state: string;
    pin: string;
    address1: string;
    onLocationSelect: (lat: number, lng: number, pin?: string) => void;
    readOnly?: boolean;
};
export default function GoogleMapPicker({
    city,
    state,
    pin,
    address1,
    onLocationSelect,
    readOnly = false,
}: Props) {
    const [region, setRegion] = useState(defaultRegion);
    const [marker, setMarker] = useState({
        latitude: defaultRegion.latitude,
        longitude: defaultRegion.longitude,
    });
    const [userMoved, setUserMoved] = useState(false);

    const fullAddress = [city, state]
  .filter(Boolean)
  .join(", ");
    // ✅ Geocode when address changes
   useEffect(() => {
  if (!fullAddress || fullAddress.length < 3) return;

  const timer = setTimeout(async () => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GoogleMapApiKey}`
      );

      const data = await res.json();

      console.log("📦 ADDRESS:", fullAddress);
      console.log("🌍 GEOCODE RESPONSE:", data);

      if (data.status !== "OK") {
        console.log("❌ GEOCODE FAILED:", data.status);
        return;
      }

      const loc = data.results[0].geometry.location;

      const latitude = loc.lat;
      const longitude = loc.lng;

      setMarker({ latitude, longitude });

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      onLocationSelect(latitude, longitude);

    } catch (err) {
      console.log("Geocode error:", err);
    }
  }, 500);

  return () => clearTimeout(timer);
}, [city, state]);
    // 🔥 Map click
    const handlePress = async (e: any) => {
        if (readOnly) return;

        setUserMoved(true); // ✅ ADD THIS

        const { latitude, longitude } = e.nativeEvent.coordinate;

        setMarker({ latitude, longitude });
        setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
        });

        let pin = "";

        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GoogleMapApiKey}`
            );

            const data = await res.json();

            if (data.results?.length) {
                const components = data.results[0].address_components;

                components.forEach((c: any) => {
                    if (c.types.includes("postal_code")) {
                        pin = c.long_name;
                    }
                });
            }
        } catch (err) {
            console.log("Reverse geocode error:", err);
        }

        onLocationSelect(latitude, longitude, pin);
    };
    // 🔥 Marker drag
    const handleDragEnd = (e: any) => {
        setUserMoved(true); // ❗ YOU MISSED THIS

        const { latitude, longitude } = e.nativeEvent.coordinate;

        setMarker({ latitude, longitude });
        onLocationSelect(latitude, longitude);
    };

    return (
        <View style={styles.container}>
            <MapView
                key={`${region.latitude}-${region.longitude}`} // 🔥 FORCE RERENDER
                style={styles.map}
                region={region}
                onPress={handlePress}
            >
                <Marker
                    coordinate={marker}
                    draggable={!readOnly}
                    onDragEnd={handleDragEnd}
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 250,
        borderRadius: 12,
        overflow: "hidden",
    },
    map: {
        flex: 1,
    },
});