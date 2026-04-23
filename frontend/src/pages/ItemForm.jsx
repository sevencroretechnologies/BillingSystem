import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createItem, getItem, updateItem } from "../api/endpoints";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import BackButton from "../components/BackButton";

/**
 * Form for creating/editing an item/product.
 */
export default function ItemForm() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        description: "",
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        setLoading(true);
        getItem(id)
            .then((res) =>
                setForm({
                    name: res.data.data.name ?? "",
                    description: res.data.data.description ?? "",
                }),
            )
            .catch((e) =>
                setError(e?.response?.data?.message || "Failed to load item."),
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
                await updateItem(id, form);
            } else {
                await createItem(form);
            }
            navigate("/items");
        } catch (err) {
            if (err?.response?.status === 422) {
                const backendErrors = err.response.data.errors || {};
                const flat = {};
                Object.keys(backendErrors).forEach((k) => {
                    flat[k] = backendErrors[k][0];
                });
                setErrors(flat);
            } else {
                setError(err?.response?.data?.message || "Failed to save item.");
            }
        } finally {
            setSaving(false);
        }
    };

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
                                <div className="skeleton skeleton-label"></div>
                                <div className="skeleton skeleton-input"></div>
                            </div>
                            <div className="mb-4">
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
                <div className="col-lg-8 col-xl-6">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="m-0 fw-bold">
                            {isEdit ? "Edit Item" : "Add New Item"}
                        </h3>
                        <BackButton />
                    </div>

                    <Alert message={error} onClose={() => setError("")} />

                    <form
                        onSubmit={handleSubmit}
                        className="card card-body shadow-sm border-0 p-4"
                    >
                        <div className="mb-4">
                            <FormField
                                label="Item Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="e.g. Teak Wood, Plywood 12mm"
                                required
                                error={errors.name}
                            />
                        </div>

                        <div className="mb-4">
                            <FormField
                                label="Description"
                                name="description"
                                as="textarea"
                                rows={4}
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Additional details about the product..."
                                error={errors.description}
                            />
                        </div>

                        <div className="d-flex gap-2 mt-4 pt-3 border-top">
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
                                    "Save Item"
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm px-4"
                                onClick={() => navigate("/items")}
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
