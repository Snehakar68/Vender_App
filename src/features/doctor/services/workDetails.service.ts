const BASE = "https://coreapi-service-111763741518.asia-south1.run.app/api";

export const getWorkDetails = async (doctorId: string) => {
  const doctorRes = await fetch(`${BASE}/Doctor/GetDoctorById/${doctorId}`);
  const doctor = await doctorRes.json();

  const mapRes = await fetch(`${BASE}/Doctor/get_Doctor_Hosp/${doctorId}`);
  const mapping = await mapRes.json();

  const hospitals = mapping.data || [];

  return (doctor.workDetails || []).map((w: any) => {
    const link = hospitals.find((h: any) => h.hosp_Id === w.hosp_Id);

    return {
      ...w,
      is_approved: link?.is_approved || "N",
      linked_by: link?.linked_by || "H",
    };
  });
};

export const approveHospital = (doctorId: string, hospId: string) =>
  fetch(`${BASE}/Doctor/Approve_Doctor_Hosp/${doctorId}/${hospId}`, {
    method: "POST",
    headers: { accept: "*/*" },
  });

export const deleteWork = (doctorId: string, hospId: string) =>
  fetch(
    `${BASE}/Doctor/Delete_Doctor_Linking?vendor_id=${doctorId}&hosp_Id=${hospId}`,
    {
      method: "DELETE",
      headers: { accept: "*/*" },
    }
  );