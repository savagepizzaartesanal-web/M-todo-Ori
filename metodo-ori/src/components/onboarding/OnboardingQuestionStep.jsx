export default function OnboardingQuestionStep({
  step,
  formData,
  onFieldChange,
  onCheckboxChange,
}) {
  if (step.type === "welcome" || step.type === "success") {
    return (
      <div>
        <h2
          className="ori-type-revelation max-w-[460px] text-[28px] md:text-[36px]"
          style={{
            color: "rgba(242,185,104,0.96)",
            fontWeight: 660,
            letterSpacing: "-0.065em",
            textShadow: "0 0 36px rgba(242,185,104,0.14)",
          }}
        >
          {step.title}
        </h2>

        <p
          className="ori-type-reading-soft mt-2.5 max-w-[440px] text-[13px]"
          style={{ color: "rgba(255,245,235,0.62)" }}
        >
          {step.description}
        </p>

        <div className="mt-5 h-px w-24 bg-gradient-to-r from-[rgba(242,185,104,0.58)] to-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h2
        className="ori-type-revelation max-w-[470px] text-[23px] md:text-[29px]"
        style={{
          color: "rgba(242,185,104,0.96)",
          fontWeight: 660,
          letterSpacing: "-0.065em",
          textShadow: "0 0 34px rgba(242,185,104,0.13)",
        }}
      >
        {step.title}
      </h2>

      <p
        className="ori-type-reading-soft mt-2 max-w-[440px] text-[12.5px]"
        style={{ color: "rgba(255,245,235,0.62)" }}
      >
        {step.description}
      </p>

      <div className="mt-4 space-y-3">
        {step.fields?.map((field) => {
          if (field.showWhen) {
            const dependentValue = formData[field.showWhen.field];
            if (dependentValue !== field.showWhen.equals) return null;
          }

          return (
            <FieldRenderer
              key={field.name}
              field={field}
              value={formData[field.name]}
              onFieldChange={onFieldChange}
              onCheckboxChange={onCheckboxChange}
            />
          );
        })}
      </div>
    </div>
  );
}

function FieldRenderer({ field, value, onFieldChange, onCheckboxChange }) {
  return (
    <div className="relative">
      <label
        className="ori-type-system mb-1.5 block text-[10px]"
        style={{ color: "rgba(242,185,104,0.68)" }}
      >
        {field.label}
      </label>

      {field.type === "text" || field.type === "date" ? (
        <input
          type={field.type}
          value={value || ""}
          onChange={(e) => onFieldChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-[15px] border px-3.5 py-2.5 text-[13px] outline-none transition duration-300 placeholder:text-[rgba(255,245,235,0.30)] focus:border-[rgba(242,185,104,0.38)] focus:bg-[rgba(242,185,104,0.060)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.010))",
            borderColor: "rgba(242,185,104,0.13)",
            color: "rgba(247,234,216,0.92)",
            boxShadow:
              "0 0 18px rgba(242,185,104,0.020), inset 0 0 18px rgba(255,255,255,0.012)",
            caretColor: "rgba(242,185,104,0.96)",
          }}
        />
      ) : null}

      {field.type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={(e) => onFieldChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full resize-none rounded-[15px] border px-3.5 py-2.5 text-[13px] leading-relaxed outline-none transition duration-300 placeholder:text-[rgba(255,245,235,0.30)] focus:border-[rgba(242,185,104,0.38)] focus:bg-[rgba(242,185,104,0.060)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.035), rgba(255,255,255,0.010))",
            borderColor: "rgba(242,185,104,0.13)",
            color: "rgba(247,234,216,0.92)",
            boxShadow:
              "0 0 18px rgba(242,185,104,0.020), inset 0 0 18px rgba(255,255,255,0.012)",
            caretColor: "rgba(242,185,104,0.96)",
          }}
        />
      ) : null}

      {field.type === "radio" ? (
        <div
          className={`grid gap-2 ${
            field.options.length > 4 ? "md:grid-cols-2" : ""
          }`}
        >
          {field.options.map((option) => {
            const active = value === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onFieldChange(field.name, option)}
                className="ori-step group relative flex min-h-[38px] items-center gap-2.5 overflow-hidden rounded-[15px] border px-3 py-2 text-left text-[12.5px] leading-snug transition duration-300 hover:-translate-y-0.5"
                data-state={active ? "active" : "sealed"}
                style={{
                  background: active
                    ? "linear-gradient(135deg, rgba(242,185,104,0.125), rgba(210,135,70,0.050))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.024), rgba(255,255,255,0.008))",
                  borderColor: active
                    ? "rgba(242,185,104,0.34)"
                    : "rgba(242,185,104,0.10)",
                  color: active
                    ? "rgba(247,234,216,0.96)"
                    : "rgba(255,245,235,0.72)",
                  boxShadow: active
                    ? "0 0 28px rgba(242,185,104,0.10), inset 0 0 18px rgba(242,185,104,0.030)"
                    : "inset 0 0 14px rgba(255,255,255,0.008)",
                }}
              >
                <span
                  className="absolute inset-x-4 top-0 h-px"
                  style={{
                    background: active
                      ? "linear-gradient(90deg, transparent, rgba(242,185,104,0.42), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                  }}
                />
                <span
                  className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border transition"
                  style={{
                    borderColor: active
                      ? "rgba(242,185,104,0.76)"
                      : "rgba(255,245,235,0.20)",
                    boxShadow: active
                      ? "0 0 14px rgba(242,185,104,0.24)"
                      : "none",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition"
                    style={{
                      background: active
                        ? "rgba(242,185,104,0.95)"
                        : "transparent",
                    }}
                  />
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {field.type === "checkbox" ? (
        <div
          className={`grid gap-2 ${
            field.options.length > 4 ? "md:grid-cols-2" : ""
          }`}
        >
          {field.options.map((option) => {
            const checked = Array.isArray(value) && value.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onCheckboxChange(field.name, option, field.maxSelections || 2)
                }
                className="ori-step group relative flex min-h-[38px] items-center gap-2.5 overflow-hidden rounded-[15px] border px-3 py-2 text-left text-[12.5px] leading-snug transition duration-300 hover:-translate-y-0.5"
                data-state={checked ? "active" : "sealed"}
                style={{
                  background: checked
                    ? "linear-gradient(135deg, rgba(242,185,104,0.125), rgba(210,135,70,0.050))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.024), rgba(255,255,255,0.008))",
                  borderColor: checked
                    ? "rgba(242,185,104,0.34)"
                    : "rgba(242,185,104,0.10)",
                  color: checked
                    ? "rgba(247,234,216,0.96)"
                    : "rgba(255,245,235,0.72)",
                  boxShadow: checked
                    ? "0 0 28px rgba(242,185,104,0.10), inset 0 0 18px rgba(242,185,104,0.030)"
                    : "inset 0 0 14px rgba(255,255,255,0.008)",
                }}
              >
                <span
                  className="absolute inset-x-4 top-0 h-px"
                  style={{
                    background: checked
                      ? "linear-gradient(90deg, transparent, rgba(242,185,104,0.42), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)",
                  }}
                />
                <span
                  className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border transition"
                  style={{
                    borderColor: checked
                      ? "rgba(242,185,104,0.76)"
                      : "rgba(255,245,235,0.20)",
                    background: checked
                      ? "rgba(242,185,104,0.16)"
                      : "transparent",
                    boxShadow: checked
                      ? "0 0 14px rgba(242,185,104,0.24)"
                      : "none",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition"
                    style={{
                      background: checked
                        ? "rgba(242,185,104,0.95)"
                        : "transparent",
                    }}
                  />
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
