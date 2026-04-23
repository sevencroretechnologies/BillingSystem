import { useEffect, useState } from "react";
import { getTax, updateTax } from "../api/endpoints";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import BackButton from "../components/BackButton";

/**
 * Settings page for the single-row tax configuration used on every
 * invoice. Stores SGST + CGST as separate percentages.
 */
export default function TaxSettings() {
    const [form, setForm] = useState({ sgst: "", cgst: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = async () => {
        try {
            const res = await getTax();
            setForm({
                sgst: res.data.data.sgst,
                cgst: res.data.data.cgst,
            });
        } catch (e) {
            setError(
                e?.response?.data?.message || "Failed to load tax settings.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        setErrors({});

        try {
            await updateTax(form);
            setSuccess("Tax settings updated successfully.");
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setError(
                    err?.response?.data?.message || "Failed to save tax settings.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    const combined = (Number(form.sgst) || 0) + (Number(form.cgst) || 0);

    if (loading) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-xl-6">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="skeleton" style={{ height: 32, width: 200 }}></div>
                            <div className="skeleton" style={{ height: 32, width: 80 }}></div>
                        </div>

                        <div className="card card-body shadow-sm border-0 p-4">
                            <div className="mb-4">
                                <div className="skeleton skeleton-label" style={{ width: '40%' }}></div>
                                <div className="skeleton skeleton-input" style={{ height: 18, width: '70%' }}></div>
                            </div>
                            <div className="row g-4 mb-4">
                                <div className="col-md-6">
                                    <div className="p-4 rounded-4 bg-light">
                                        <div className="skeleton skeleton-label"></div>
                                        <div className="skeleton skeleton-input"></div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-4 rounded-4 bg-light">
                                        <div className="skeleton skeleton-label"></div>
                                        <div className="skeleton skeleton-input"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="skeleton" style={{ height: 24, width: 150 }}></div>
                            </div>
                            <div className="skeleton skeleton-button"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 col-xl-6">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="m-0 fw-bold">Tax Settings</h3>
                        <BackButton />
                    </div>

                    <p className="text-muted mb-4">
                        These rates are applied on every new invoice. Total tax = SGST + CGST.
                    </p>

                    <Alert message={error} onClose={() => setError("")} />
                    
                    {success && (
                        <div className="alert alert-success border-0 shadow-sm mb-4" role="alert">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="card card-body shadow-sm border-0 p-4">
                        <div className="row g-4 mb-4">
                            <div className="col-md-6">
                                <div className="p-4 rounded-4 bg-light h-100">
                                    <FormField
                                        label="SGST (%)"
                                        name="sgst"
                                        type="number"
                                        step="0.01"
                                        value={form.sgst}
                                        onChange={handleChange}
                                        error={errors.sgst?.[0]}
                                        className="form-control-lg border-0 shadow-sm"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-4 rounded-4 bg-light h-100">
                                    <FormField
                                        label="CGST (%)"
                                        name="cgst"
                                        type="number"
                                        step="0.01"
                                        value={form.cgst}
                                        onChange={handleChange}
                                        error={errors.cgst?.[0]}
                                        className="form-control-lg border-0 shadow-sm"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2 border border-primary border-opacity-25">
                                Combined Tax Rate: <span className="fw-bold">{combined.toFixed(2)}%</span>
                            </span>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm px-4 fw-bold shadow-sm"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
