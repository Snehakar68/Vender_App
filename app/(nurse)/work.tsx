import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Work() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      
      {/* HEADER */}
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: "700" , paddingTop:20}}>Work Details</Text>
        <Text style={{ color: "gray", marginTop: 5 }}>
          Configure professional assignment and shifts
        </Text>
      </View>

      {/* CARD */}
      <View style={{
        backgroundColor: "white",
        margin: 15,
        borderRadius: 15,
        padding: 15,
        elevation: 3
      }}>

        {/* STATUS */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: "gray", fontSize: 12 }}>CURRENT STATUS</Text>

          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 5
          }}>
            <Text style={{ color: "red", fontWeight: "600" }}>● Inactive</Text>

            <TouchableOpacity style={{
              backgroundColor: "#0f766e",
              paddingHorizontal: 15,
              paddingVertical: 6,
              borderRadius: 20
            }}>
              <Text style={{ color: "white" }}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* LINKED DOCTOR */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: "gray", fontSize: 12 }}>IS LINKED DOCTOR*</Text>

          <View style={{
            backgroundColor: "#f1f5f9",
            padding: 12,
            borderRadius: 10,
            marginTop: 5,
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <Text>Yes</Text>
            <Ionicons name="chevron-down" size={18} />
          </View>
        </View>

        {/* DOCTOR */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: "gray", fontSize: 12 }}>DOCTOR*</Text>

          <View style={{
            backgroundColor: "#f1f5f9",
            padding: 12,
            borderRadius: 10,
            marginTop: 5
          }}>
            <Text>Doctor_del, undefined, Mumbai - MH</Text>
          </View>
        </View>

        {/* SHIFT + DAYS */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ color: "gray", fontSize: 12 }}>SHIFT</Text>

            <View style={{
              backgroundColor: "#f1f5f9",
              padding: 12,
              borderRadius: 10,
              marginTop: 5,
              flexDirection: "row",
              justifyContent: "space-between"
            }}>
              <Text>Morning</Text>
              <Ionicons name="sunny" size={18} />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: "gray", fontSize: 12 }}>SHIFT CHANGE DAYS</Text>

            <View style={{
              backgroundColor: "#f1f5f9",
              padding: 12,
              borderRadius: 10,
              marginTop: 5,
              alignItems: "center"
            }}>
              <Text>0</Text>
            </View>
          </View>

        </View>

      </View>

      {/* SAVE BUTTON */}
      <View style={{ padding: 15 }}>
        <TouchableOpacity style={{
          backgroundColor: "#0f766e",
          padding: 15,
          borderRadius: 12,
          alignItems: "center"
        }}>
          <Text style={{ color: "white", fontWeight: "600" }}>
            💾 Save Changes
          </Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", marginTop: 10, color: "gray", fontSize: 12 }}>
          Last modified: Oct 24, 2023
        </Text>
      </View>

    </ScrollView>
  );
}