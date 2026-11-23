import { createFormHook } from "@tanstack/react-form";

import { FormError } from "./FormError";
import { fieldContext, formContext } from "./form-context";
import { NumberInput } from "./NumberInput";
import { SelectInput } from "./SelectInput";
import { SubmitButton } from "./SubmitButton";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextInput, TextArea, NumberInput, SelectInput },
  formComponents: { SubmitButton, FormError },
});
