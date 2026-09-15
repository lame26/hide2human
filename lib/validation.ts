import { TRACE_MAX_LENGTH } from "@/lib/traces";

export function validateMessage(value: unknown) {
  if (typeof value !== "string") {
    return { error: "Message must be text." };
  }

  const message = value.trim();
  if (!message) {
    return { error: "Please write a message before leaving a trace." };
  }

  if (message.length > TRACE_MAX_LENGTH) {
    return { error: `Messages must be ${TRACE_MAX_LENGTH} characters or fewer.` };
  }

  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) {
    return { error: "Messages cannot contain control characters." };
  }

  return { message };
}
