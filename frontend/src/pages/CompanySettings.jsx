import { useEffect, useState } from "react";
import { getCompany, updateCompany } from "../api/endpoints";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import Loading from "../components/Loading";

// Settings page for the single-row company record. All fields are
// editable; the logo is optional and uploaded as multipart/form-data.
export default function CompanySettings() {
    const [form, setForm] = useState({
        company_name: "",
        address: "",
        phone: "",
        email: "",
        k2_recipient_code: "",
        gstin: "",
        pan: "",
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [removeLogo, setRemoveLogo] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = async () => {
        try {
            const res = await getCompany();
            const data = res.data.data;
            setForm({
                company_name: data.company_name ?? "",
                address: data.address ?? "",
                phone: data.phone ?? "",
                email: data.email ?? "",
                k2_recipient_code: data.k2_recipient_code ?? "",
                gstin: data.gstin ?? "",
                pan: data.pan ?? "",
            });
            setLogoUrl(data.logo_url || null);
            setLogoFile(null);
            setRemoveLogo(false);
        } catch (e) {
            setError(
                e?.response?.data?.message || "Failed to load company details.",
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
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;
        setLogoFile(file);
        if (file) setRemoveLogo(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            await updateCompany({
                ...form,
                logo: logoFile,
                removeLogo,
            });
            setSuccess("Company details saved.");
            await load();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Failed to save company details.",
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loading label='Loading company details...' />;

    return (
        <div>
            <h3 className='mb-3'>Company Settings</h3>
            <p className='text-muted'>
                These details (and the logo) appear at the top of every invoice
                and PDF.
            </p>
            <Alert message={error} onClose={() => setError("")} />
            {success && (
                <div className='alert alert-success' role='alert'>
                    {success}
                </div>
            )}
            <form
                onSubmit={handleSubmit}
                className='card card-body shadow-sm'
                style={{ maxWidth: 720 }}
            >
                <FormField
                    label='Company Name'
                    name='company_name'
                    value={form.company_name}
                    onChange={handleChange}
                    required
                />
                <FormField
                    label='Address'
                    name='address'
                    as='textarea'
                    rows={2}
                    value={form.address}
                    onChange={handleChange}
                />
                <div className='row'>
                    <div className='col-md-6'>
                        <FormField
                            label='Phone'
                            name='phone'
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className='col-md-6'>
                        <FormField
                            label='Email'
                            name='email'
                            type='email'
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* ── Tax & Compliance ── */}
                <hr className='my-3' />
                <h6 className='text-muted mb-3'>Tax &amp; Compliance</h6>
                <div className='row'>
                    <div className='col-md-6'>
                        <FormField
                            label='GSTIN'
                            name='gstin'
                            value={form.gstin}
                            onChange={handleChange}
                            placeholder=' 29AAGAS0338G1ZH'
                        />
                    </div>
                    <div className='col-md-6'>
                        <FormField
                            label='PAN'
                            name='pan'
                            value={form.pan}
                            onChange={handleChange}
                            placeholder=' AAGAS0338G'
                        />
                    </div>
                </div>
                <FormField
                    label='K-2 Recipient Code'
                    name='k2_recipient_code'
                    value={form.k2_recipient_code}
                    onChange={handleChange}
                    placeholder=' 2900834547'
                />

                <hr className='my-3' />
                <div className='mb-3'>
                    <label className='form-label'>Logo</label>
                    {logoUrl && !removeLogo && (
                        <div className='mb-2'>
                            <img
                                src={logoUrl}
                                alt='Current logo'
                                style={{
                                    maxHeight: 72,
                                    maxWidth: 180,
                                    border: "1px solid #eee",
                                    padding: 4,
                                }}
                            />
                            <button
                                type='button'
                                className='btn btn-sm btn-link text-danger ms-2'
                                onClick={() => {
                                    setRemoveLogo(true);
                                    setLogoFile(null);
                                }}
                            >
                                Remove logo
                            </button>
                        </div>
                    )}
                    <input
                        type='file'
                        accept='image/*'
                        className='form-control'
                        onChange={handleFileChange}
                    />
                    <div className='form-text'>
                        PNG, JPG, SVG or WebP up to 2 MB.
                    </div>
                </div>
                <div>
                    <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}
