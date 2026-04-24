import { useEffect, useState } from "react";
import { getCompany, updateCompany } from "../api/endpoints";
import Alert from "../components/Alert";
import FormField from "../components/FormField";
import Loading from "../components/Loading";
import BackButton from "../components/BackButton";

// Settings page for the single-row company record. All fields are
// editable; the logo and signature are optional and uploaded as multipart/form-data.
export default function CompanySettings() {
    const [form, setForm] = useState({
        company_name: "",
        address: "",
        phone: "",
        whatsapp_no: "",
        email: "",
        k2_recipient_code: "",
        gstin: "",
        pan: "",
    });
const baseURL = process.env.REACT_APP_API_URL;
    // Logo state
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState(null);
    const [removeLogo, setRemoveLogo] = useState(false);

    // Signature image state
    const [signatureFile, setSignatureFile] = useState(null);
    const [signatureUrl, setSignatureUrl] = useState(null);
    const [removeSignature, setRemoveSignature] = useState(false);

    const [errors, setErrors] = useState({});
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
                whatsapp_no: data.whatsapp_no ?? "",
                email: data.email ?? "",
                k2_recipient_code: data.k2_recipient_code ?? "",
                gstin: data.gstin ?? "",
                pan: data.pan ?? "",
            });
        setLogoUrl(data.logo ? `${baseURL}/storage/${data.logo}` : null);
        setLogoFile(null);
        setRemoveLogo(false);
        setSignatureUrl(data.signature ? `${baseURL}/storage/${data.signature}` : null);
        setSignatureFile(null);
        setRemoveSignature(false);
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
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0] || null;
        setLogoFile(file);
        if (file) {
            setRemoveLogo(false);
            setLogoUrl(URL.createObjectURL(file));
            if (errors.logo) setErrors({ ...errors, logo: null });
        }
    };

    const handleSignatureChange = (e) => {
        const file = e.target.files?.[0] || null;
        setSignatureFile(file);
        if (file) {
            setRemoveSignature(false);
            setSignatureUrl(URL.createObjectURL(file));
            if (errors.signature) setErrors({ ...errors, signature: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");
        setErrors({});
        try {
            await updateCompany({
                ...form,
                logo: logoFile,
                removeLogo,
                signature: signatureFile,
                removeSignature,
            });
            setSuccess("Company details saved.");
            await load();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setError(
                    err?.response?.data?.message || "Failed to update company.",
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
                            <div className="mb-4">
                                <div className="skeleton skeleton-label"></div>
                                <div className="skeleton skeleton-input" style={{ height: 20, width: '60%' }}></div>
                            </div>

                            <div className="mb-3 pb-2 border-bottom">
                                <div className="skeleton skeleton-label"></div>
                            </div>
                            <div className="row">
                                <div className="col-12 mb-3">
                                    <div className="skeleton skeleton-label"></div>
                                    <div className="skeleton skeleton-input"></div>
                                </div>
                                <div className="col-12 mb-3">
                                    <div className="skeleton skeleton-label"></div>
                                    <div className="skeleton skeleton-textarea"></div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-input"></div></div>
                                <div className="col-md-4 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-input"></div></div>
                                <div className="col-md-4 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-input"></div></div>
                            </div>

                            <div className="mt-4 mb-3 pb-2 border-bottom">
                                <div className="skeleton skeleton-label"></div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-input"></div></div>
                                <div className="col-md-4 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-input"></div></div>
                                <div className="col-md-4 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-input"></div></div>
                            </div>

                            <div className="mt-4 mb-3 pb-2 border-bottom">
                                <div className="skeleton skeleton-label"></div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-image"></div></div>
                                <div className="col-md-6 mb-3"><div className="skeleton skeleton-label"></div><div className="skeleton skeleton-image"></div></div>
                            </div>

                            <div className="mt-4">
                                <div className="skeleton skeleton-button"></div>
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
                    <h3 className="m-0 fw-bold">Company Settings</h3>
                    <BackButton />
                </div>
                
                <p className='text-muted mb-4'>
                    These details (logo and signature) appear on every invoice and PDF document.
                </p>

                <Alert message={error} onClose={() => setError("")} />
                {success && (
                    <div className='alert alert-success border-0 shadow-sm mb-4' role='alert'>
                        {success}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className='card card-body shadow-sm border-0 p-4'
                >
                    <div className="row">
                        <div className="col-12 mb-3">
                            <FormField
                                label='Company Name'
                                name='company_name'
                                value={form.company_name}
                                onChange={handleChange}
                                error={errors.company_name?.[0]}
                                required
                            />
                        </div>
                        <div className="col-12 mb-3">
                            <FormField
                                label='Address'
                                name='address'
                                as='textarea'
                                rows={4}
                                value={form.address}
                                onChange={handleChange}
                                error={errors.address?.[0]}
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-md-4 mb-3'>
                            <FormField
                                label='Phone'
                                name='phone'
                                value={form.phone}
                                onChange={handleChange}
                                error={errors.phone?.[0]}
                                maxLength={10}
                                placeholder="Phone number"
                            />
                        </div>
                        <div className='col-md-4 mb-3'>
                            <FormField
                                label='Email'
                                name='email'
                                type='email'
                                value={form.email}
                                onChange={handleChange}
                                error={errors.email?.[0]}
                            />
                        </div>
                        <div className='col-md-4 mb-3'>
                            <FormField
                                label='WhatsApp No'
                                name='whatsapp_no'
                                value={form.whatsapp_no}
                                onChange={handleChange}
                                error={errors.whatsapp_no?.[0]}
                                maxLength={10}
                                placeholder='WhatsApp number'
                            />
                        </div>
                    </div>

                    {/* ── Tax & Compliance ── */}
                    <div className="mt-4 mb-3 pb-2 border-bottom">
                        <h6 className='fw-bold text-secondary text-uppercase small m-0'>Tax &amp; Compliance</h6>
                    </div>
                    <div className='row'>
                        <div className='col-md-4 mb-3'>
                            <FormField
                                label='GSTIN'
                                name='gstin'
                                value={form.gstin}
                                onChange={handleChange}
                                error={errors.gstin?.[0]}
                                placeholder='29AAGAS0338G1ZH'
                            />
                        </div>
                        <div className='col-md-4 mb-3'>
                            <FormField
                                label='PAN'
                                name='pan'
                                value={form.pan}
                                onChange={handleChange}
                                error={errors.pan?.[0]}
                                placeholder='AAGAS0338G'
                            />
                        </div>
                        <div className='col-md-4 mb-3'>
                            <FormField
                                label='K-2 Recipient Code'
                                name='k2_recipient_code'
                                value={form.k2_recipient_code}
                                onChange={handleChange}
                                error={errors.k2_recipient_code?.[0]}
                                placeholder='2900834547'
                            />
                        </div>
                    </div>

                    {/* ── Branding Assets ── */}
                    <div className="mt-4 mb-3 pb-2 border-bottom">
                        <h6 className='fw-bold text-secondary text-uppercase small m-0'>Branding</h6>
                    </div>
                    
                    <div className="row">
                        {/* ── Logo ── */}
                        <div className='col-md-6 mb-4'>
                            <label className='form-label fw-medium'>Company Logo</label>
                            <div className="bg-light p-3 rounded border text-center mb-3" style={{display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {logoUrl && !removeLogo ? (
                                    <div className='position-relative d-inline-block'>
                                        <img
                                            src={logoUrl}
                                            alt='Current logo'
                                            style={{
                                                maxHeight: 80,
                                                maxWidth: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-danger position-absolute top-0 end-0 m-0 shadow-sm rounded-circle p-1'
                                            style={{ width: 22, height: 22, lineHeight: 1, transform: 'translate(50%, -50%)' }}
                                            onClick={() => {
                                                setRemoveLogo(true);
                                                setLogoFile(null);
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-muted small">No logo selected</span>
                                )}
                            </div>
                            <input
                                type='file'
                                accept='image/*'
                                className='form-control'
                                onChange={handleLogoChange}
                            />
                            <div className='form-text'>
                                PNG, JPG, SVG or WebP up to 2 MB.
                            </div>
                        </div>

                        {/* ── Signature Image ── */}
                        <div className='col-md-6 mb-4'>
                            <label className='form-label fw-medium'>Authorized Signature</label>
                            <div className="bg-light p-3 rounded border text-center mb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {signatureUrl && !removeSignature ? (
                                    <div className='position-relative d-inline-block'>
                                        <img
                                            src={signatureUrl}
                                            alt='Current signature'
                                            style={{
                                                maxHeight: 80,
                                                maxWidth: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <button
                                            type='button'
                                            className='btn btn-sm btn-danger position-absolute top-0 end-0 m-0 shadow-sm rounded-circle p-1'
                                            style={{ width: 22, height: 22, lineHeight: 1, transform: 'translate(50%, -50%)' }}
                                            onClick={() => {
                                                setRemoveSignature(true);
                                                setSignatureFile(null);
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-muted small">No signature selected</span>
                                )}
                            </div>
                            <input
                                type='file'
                                accept='image/*'
                                className='form-control'
                                onChange={handleSignatureChange}
                            />
                            <div className='form-text'>
                                Authorized signatory image up to 2 MB.
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            type='submit'
                            className='btn btn-primary btn-sm fw-bold shadow-sm px-4'
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
