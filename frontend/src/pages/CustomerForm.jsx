import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createCustomer,
    getCustomer,
    updateCustomer,
} from "../api/endpoints";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import BackButton from "../components/BackButton";

/**
 * Form for creating/editing a customer.
 */
export default function CustomerForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        setLoading(true);
        getCustomer(id)
            .then((res) => setForm(res.data.data))
            .catch((e) =>
                setError(
                    e?.response?.data?.message || "Failed to load customer.",
                ),
            )
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        setError("");
        try {
            if (isEdit) {
                await updateCustomer(id, form);
            } else {
                await createCustomer(form);
            }
            navigate("/customers");
        } catch (err) {
            if (err?.response?.status === 422) {
                const backendErrors = err.response.data.errors || {};
                const flat = {};
                Object.keys(backendErrors).forEach((k) => {
                    flat[k] = backendErrors[k][0];
                });
                setErrors(flat);
            } else {
                setError(
                    err?.response?.data?.message || "Failed to save customer.",
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-8">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="skeleton" style={{ height: 32, width: 250 }}></div>
                            <div className="skeleton" style={{ height: 32, width: 80 }}></div>
                        </div>

                        <div className="card card-body shadow-sm border-0 p-4">
                            <div className="row g-4">
                                <div className="col-md-6 mb-3">
                                    <div className="skeleton skeleton-label"></div>
                                    <div className="skeleton skeleton-input"></div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="skeleton skeleton-label"></div>
                                    <div className="skeleton skeleton-input"></div>
                                </div>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6 mb-3">
                                    <div className="skeleton skeleton-label"></div>
                                    <div className="skeleton skeleton-input"></div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="skeleton skeleton-label"></div>
                                    <div className="skeleton skeleton-input"></div>
                                </div>
                            </div>
                            <div className="col-12 mb-3">
                                <div className="skeleton skeleton-label"></div>
                                <div className="skeleton skeleton-textarea"></div>
                            </div>
                            <div className="d-flex gap-2 mt-2">
                                <div className="skeleton skeleton-button"></div>
                                <div className="skeleton skeleton-button" style={{ width: 100 }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10 col-xl-8">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="m-0 fw-bold">
                            {isEdit ? "Edit Customer" : "Add New Customer"}
                        </h3>
                        <BackButton />
                    </div>

                    <Alert message={error} onClose={() => setError("")} />

                    <form
                        onSubmit={handleSubmit}
                        className="card card-body shadow-sm border-0 p-4"
                    >
                        <div className="row g-4">
                            <div className="col-md-6">
                                <FormField
                                    label="Customer Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    required
                                    error={errors.name}
                                />
                            </div>
                            <div className="col-md-6">
                                <FormField
                                    label="Phone Number"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Phone number"
                                    maxLength={10}
                                    error={errors.phone}
                                />
                            </div>
                        </div>

                        <div className="row g-4 mt-1">
                            <div className="col-md-6">
                                <FormField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="customer@example.com"
                                    error={errors.email}
                                />
                            </div>
                        </div>

                        <div className="col-12 mt-4">
                            <FormField
                                label="Billing Address"
                                name="address"
                                as="textarea"
                                rows={4}
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Enter complete billing address"
                                error={errors.address}
                            />
                        </div>

                        <div className="d-flex gap-2 mt-4 pt-2 border-top">
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm px-4 fw-bold shadow-sm"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Customer"
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm px-4"
                                onClick={() => navigate("/customers")}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
