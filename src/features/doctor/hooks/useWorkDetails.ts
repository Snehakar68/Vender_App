import { useEffect, useState } from "react";
import {
  getWorkDetails,
  approveHospital,
  deleteWork,
} from "../services/workDetails.service";

export const useWorkDetails = (doctorId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const res = await getWorkDetails(doctorId);
    setData(res);
    setLoading(false);
  };

  const approve = async (hospId: string) => {
    setApprovingId(hospId);
    await approveHospital(doctorId, hospId);

    setData((prev) =>
      prev.map((w) =>
        w.hosp_Id === hospId ? { ...w, is_approved: "Y" } : w
      )
    );

    setApprovingId(null);
  };

  const remove = async (hospId: string) => {
    await deleteWork(doctorId, hospId);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  return { data, loading, approve, remove, fetchData, approvingId };
};