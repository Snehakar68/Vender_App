import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Home() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      
      {/* HEADER */}
      <View style={{ backgroundColor: "#0f766e", padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600", paddingTop:20 }}>
          VitalFlow
        </Text>

        <View style={{ marginTop: 20, backgroundColor: "#14b8a6", padding: 20, borderRadius: 15 }}>
          <Text style={{ color: "white" }}>Appointments</Text>
          <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>20</Text>
        </View>
      </View>

      {/* STATS */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 15 }}>
        
        <View style={{ flex: 1, backgroundColor: "#d1fae5", padding: 15, borderRadius: 12, marginRight: 10 }}>
          <Text>Patient Care</Text>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>5</Text>
        </View>

        <View style={{ flex: 1, backgroundColor: "#fee2e2", padding: 15, borderRadius: 12 }}>
          <Text>Late Alerts</Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "red" }}>2</Text>
        </View>

      </View>

      {/* CLINICAL TOOLS */}
      <View style={{ paddingHorizontal: 15 }}>
        <Text style={{ fontWeight: "600", marginBottom: 10 }}>CLINICAL TOOLS</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          
          {["Notes", "Vitals", "Medications", "Labs"].map((item, index) => (
            <View key={index} style={{ alignItems: "center" }}>
              <View style={{
                width: 60,
                height: 60,
                backgroundColor: "white",
                borderRadius: 15,
                justifyContent: "center",
                alignItems: "center",
                elevation: 3
              }}>
                <Ionicons name="document-text" size={24} color="#0f766e" />
              </View>
              <Text style={{ marginTop: 5 }}>{item}</Text>
            </View>
          ))}

        </View>
      </View>

      {/* PATIENT LIST */}
      <View style={{ padding: 15 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "600" }}>Patient List</Text>
          <Text style={{ color: "#0f766e" }}>View All</Text>
        </View>

        {[1, 2, 3].map((item, index) => (
          <View key={index} style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            padding: 15,
            borderRadius: 12,
            marginTop: 10
          }}>
            
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#e5e7eb",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <Text>AJ</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontWeight: "600" }}>Alice Johnson</Text>
              <Text style={{ color: "gray" }}>Room 201 - 12:30 PM</Text>
            </View>

            <TouchableOpacity style={{
              backgroundColor: "#e0f2fe",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 8
            }}>
              <Text style={{ color: "#0284c7" }}>Details</Text>
            </TouchableOpacity>

          </View>
        ))}
      </View>

      {/* SHIFT SCHEDULE */}
      <View style={{ padding: 15 }}>
        <Text style={{ fontWeight: "600" }}>Shift Schedule</Text>

        <View style={{
          backgroundColor: "white",
          padding: 15,
          borderRadius: 12,
          marginTop: 10
        }}>
          <Text style={{ color: "gray" }}>UPCOMING SHIFT</Text>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Tomorrow</Text>

          {["Emma Nurse", "Jessica Smith"].map((name, index) => (
            <View key={index} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
              <Text>{name}</Text>
              <Text style={{ color: "#0f766e" }}>View</Text>
            </View>
          ))}

        </View>
      </View>

    </ScrollView>
  );
}