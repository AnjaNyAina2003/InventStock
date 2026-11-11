import { useState } from "react";
import toast from "react-hot-toast";

export function useSubmitState() {
  const [submitting, setSubmitting] = useState(false);

  const run = async (action, { successMessage } = {}) => {
    setSubmitting(true);
    try {
      const result = await action();
      if(successMessage) toast.success(successMessage);
      return result;
    } catch (err) {
      const message = 
        err?.response?.data?.detail ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null) ||
        "Une erreur est survenue";
      toast.error(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, run };
}