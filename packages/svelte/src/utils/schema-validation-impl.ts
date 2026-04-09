/**
 * Internal helper to run schema validation for various libraries.
 * Supports Zod, Valibot, Yup, and Superstruct (via common interfaces).
 */
export async function runSchemaValidation(
  schema: any,
  data: any,
): Promise<Record<string, string> | null> {
  if (
    typeof schema.safeParseAsync === "function" ||
    typeof schema.safeParse === "function"
  ) {
    const result = await (schema.safeParseAsync
      ? schema.safeParseAsync(data)
      : schema.safeParse(data));
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue: any) => {
        const path = issue.path.join(".") || "form";
        errors[path] = issue.message;
      });
      return errors;
    }
    return null;
  }

  if (typeof schema.validate === "function") {
    try {
      await schema.validate(data);
      return null;
    } catch (err: any) {
      if (err.inner) {
        const errors: Record<string, string> = {};
        err.inner.forEach((item: any) => {
          errors[item.path] = item.message;
        });
        return errors;
      }
      return { form: err.message };
    }
  }

  return null;
}
