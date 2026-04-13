//src/shared/components/CityAutocomplete.tsx  
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import { GoogleMapApiKey } from "@/src/utils/Apis";

export default function CityStatePin({
  form,
  setForm,
  setErrors,
  errors = {},
  mode = "add",
}: any) {
  const [query, setQuery] = useState(form.city || "");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isView = mode === "view";
  const enablePin = mode !== "view";

  useEffect(() => {
    if (selected) return;
    if (!isFocused || selected || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {

      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&components=country:in&key=${GoogleMapApiKey}`
        );

        const data = await res.json();
        setResults(data.predictions || []);
      } catch (err) {
        console.log("Autocomplete error:", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchPlaceDetails = async (placeId: string) => {
    setSelected(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GoogleMapApiKey}&fields=address_component`
      );

      const data = await res.json();
      const details = data.result;

      let city = "";
      let state = "";
      let pin = "";

      details.address_components.forEach((comp: any) => {
        const types = comp.types;

        if (types.includes("locality")) city = comp.long_name;

        if (!city && types.includes("administrative_area_level_2"))
          city = comp.long_name;

        if (types.includes("administrative_area_level_1"))
          state = comp.long_name;

        if (types.includes("postal_code")) pin = comp.long_name;
      });

      setForm((prev: any) => ({
        ...prev,
        city,
        state,
        pin,
      }));

      setQuery(city);
      setResults([]);
      setTimeout(() => {
        setResults([]);
      }, 0);
      setErrors((prev: any) => {
        const copy = { ...prev };
        delete copy.city;
        delete copy.state;
        if (pin?.length === 6) delete copy.pin;
        return copy;
      });
    } catch (err) {
      console.log("Place details error:", err);
    }
  };

  return (
    <View style={{ zIndex: 9999 }}>
      <Text style={styles.label}>City <Text style={styles.star}>*</Text></Text>
      <TextInput
        value={query}
        editable={!isView}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        onChangeText={(text) => {
          setSelected(false);
          setQuery(text);
          setForm((p: any) => ({ ...p, city: text }));
        }}
        placeholder="Type city name"
        style={styles.input}
      />

      {errors.city && <Text style={styles.error}>{errors.city}</Text>}

      {isFocused && results.length > 0 && !isView && (
        <View style={styles.dropdown}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {results.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                style={styles.item}
                onPress={() => fetchPlaceDetails(item.place_id)}
              >
                <Text style={styles.text}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <Text style={styles.label}>State <Text style={styles.star}>*</Text></Text>
      <TextInput
        value={form.state}
        editable={false}
        placeholder="Auto-filled"
        style={[
          styles.input,
          { backgroundColor: "#E5E7EB" },
        ]}
      />
      {errors.state && <Text style={styles.error}>{errors.state}</Text>}
      <Text style={styles.label}>PIN Code <Text style={styles.star}>*</Text></Text>
      <TextInput
        value={form.pin}
        editable={enablePin}
        keyboardType="number-pad"
        placeholder="Enter PIN"
        maxLength={6}
        style={[
          styles.input,
          !enablePin && { backgroundColor: "#E5E7EB" },
        ]}
        onChangeText={(text) => {
          const value = text.replace(/[^0-9]/g, "").slice(0, 6);

          setForm((p: any) => ({ ...p, pin: value }));

          if (value.length === 6) {
            setErrors((prev: any) => {
              const copy = { ...prev };
              delete copy.pin;
              return copy;
            });
          }
        }}
      />
      {errors.pin && <Text style={styles.error}>{errors.pin}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 5,
    color: "#334155",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 200,
    elevation: 5,
    zIndex: 9999,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  text: {
    fontSize: 14,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  star: {
    color: "#DC2626",
    fontWeight: "700",
  },
});