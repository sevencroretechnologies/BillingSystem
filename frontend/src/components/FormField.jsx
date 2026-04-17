// Reusable labelled form control. Renders a textarea when `as="textarea"`,
// otherwise a regular input.
export default function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  as = 'input',
  required = false,
  error,
  ...rest
}) {
  const id = `field-${name}`;
  const Control = as === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <Control
        id={id}
        name={name}
        type={as === 'textarea' ? undefined : type}
        value={value ?? ''}
        onChange={onChange}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        required={required}
        {...rest}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
